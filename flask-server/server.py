from flask import Flask, jsonify, request
import mysql.connector
from mysql.connector.pooling import MySQLConnectionPool

app = Flask(__name__)

pool = MySQLConnectionPool(
    pool_name="sakila_pool",
    pool_size=5,
    host="127.0.0.1",
    user="root",
    password="password",
    database="sakila",
    port=3306,
    autocommit=True,
    ssl_disabled=True,
)

###############
#Landing Page
###############

@app.route("/sql/getTop5Films", methods=["GET"])
def get_topFilms():
    cnx = pool.get_connection()
    cursor = cnx.cursor()
    try:
        query = """
            SELECT film.title, COUNT(film.film_id) AS rented
            FROM rental
            JOIN inventory ON rental.inventory_id = inventory.inventory_id
            JOIN film ON inventory.film_id = film.film_id
            GROUP BY film.film_id
            ORDER BY rented DESC
            LIMIT 5;
        """
        cursor.execute(query)
        films = cursor.fetchall()
        film_names = [film[0] for film in films]
        return jsonify({"tables": film_names}), 200
    finally:
        cursor.close()
        cnx.close()  # returns connection to pool


@app.route("/sql/getTop5Actors", methods=["GET"])
def get_topActors():
    cnx = pool.get_connection()
    cursor = cnx.cursor()
    try:
        query = """
            SELECT a.actor_id,
                   CONCAT(a.first_name,' ',a.last_name) AS actor_name,
                   COUNT(r.rental_id) AS total_rentals,
                   COUNT(DISTINCT fa.film_id) AS film_count,
                   COUNT(r.rental_id) / COUNT(DISTINCT fa.film_id) AS rentals_per_film
            FROM actor a
            JOIN film_actor fa ON a.actor_id = fa.actor_id
            JOIN inventory i ON fa.film_id = i.film_id
            JOIN rental r ON i.inventory_id = r.inventory_id
            GROUP BY a.actor_id, actor_name
            HAVING film_count > 0
            ORDER BY rentals_per_film DESC, total_rentals DESC
            LIMIT 5;
        """
        cursor.execute(query)
        rows = cursor.fetchall()

        # return as a simple list like films
        actor_names = [row[1] for row in rows]
        return jsonify({"tables": actor_names}), 200
    finally:
        cursor.close()
        cnx.close()


###############
#Customer Page
###############

@app.route("/sql/getAllCustomers", methods=["GET"])
def get_allCustomers():
    cnx = pool.get_connection()
    cursor = cnx.cursor()
    try:
        query = """
            SELECT c.customer_id, c.first_name, c.last_name, c.email
            FROM customer c;
        """
        cursor.execute(query)
        customers = cursor.fetchall()
        return jsonify({"tables": customers}), 200  # keep one consistent key
    finally:
        cursor.close()
        cnx.close()


@app.route("/sql/getCustomerRentals/<int:customer_id>", methods=["GET"])
def get_customer_rentals(customer_id):
    cnx = pool.get_connection()
    cursor = cnx.cursor()
    try:
        query = """
            SELECT f.title, r.rental_date, r.return_date
            FROM rental r
            JOIN inventory i ON r.inventory_id = i.inventory_id
            JOIN film f ON i.film_id = f.film_id
            WHERE r.customer_id = %s
            ORDER BY r.rental_date DESC;
        """
        cursor.execute(query, (customer_id,))
        rows = cursor.fetchall()
        return jsonify({"tables": rows}), 200
    finally:
        cursor.close()
        cnx.close()

@app.route("/sql/deleteCustomer/<int:customer_id>", methods=["DELETE"])
def delete_customer(customer_id):
    cnx = pool.get_connection()
    cursor = cnx.cursor()
    try:
        cnx.autocommit = False
        cnx.start_transaction()

        # Block if any active (unreturned) rentals exist
        cursor.execute(
            "SELECT COUNT(*) FROM rental WHERE customer_id = %s AND return_date IS NULL",
            (customer_id,),
        )
        open_count = cursor.fetchone()[0]
        if open_count > 0:
            cnx.rollback()
            return jsonify({"error": "Cannot delete customer: active rentals exist."}), 409

        # Grab address_id
        cursor.execute("SELECT address_id FROM customer WHERE customer_id = %s", (customer_id,))
        row = cursor.fetchone()
        address_id = row[0]

        # Delete everything
        cursor.execute("DELETE FROM payment WHERE customer_id = %s", (customer_id,))
        cursor.execute("DELETE FROM rental WHERE customer_id = %s", (customer_id,))
        cursor.execute("DELETE FROM customer WHERE customer_id = %s", (customer_id,))

        # Try deleting address too
        if address_id is not None:
            cursor.execute("SELECT COUNT(*) FROM customer WHERE address_id = %s", (address_id,))
            customer_refs = cursor.fetchone()[0]

            cursor.execute("SELECT COUNT(*) FROM staff WHERE address_id = %s", (address_id,))
            staff_refs = cursor.fetchone()[0]

            cursor.execute("SELECT COUNT(*) FROM store WHERE address_id = %s", (address_id,))
            store_refs = cursor.fetchone()[0]

            #check if any other objects reference address id
            if customer_refs == 0 and staff_refs == 0 and store_refs == 0:
                cursor.execute("DELETE FROM address WHERE address_id = %s", (address_id,))

        cnx.commit()
        return jsonify({"ok": True}), 200
    finally:
        cnx.autocommit = True
        cursor.close()
        cnx.close()


if __name__ == "__main__":
    app.run(debug=True)
