from flask import Flask, jsonify, request
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
        cnx.close()


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
        return jsonify({"tables": customers}), 200
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
            "SELECT COUNT(*) FROM rental WHERE customer_id = %s AND return_date IS NULL", (customer_id,),
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


@app.route("/sql/addCustomer", methods=["POST"])
def add_customer():
    data = request.get_json(force=True)
    cnx = pool.get_connection()
    cursor = cnx.cursor()
    try:
        cnx.autocommit = False
        cnx.start_transaction()

        # 1) check if country exists in the database already
        cursor.execute("SELECT country_id FROM country WHERE country = %s", (data["country"],))
        row = cursor.fetchone()
        if row:
            country_id = row[0]
        else:
            #If country is new, insert into country database
            cursor.execute(
                "INSERT INTO country (country, last_update) VALUES (%s, NOW())", (data["country"],),
            )
            country_id = cursor.lastrowid

        # 2) city_id get or create, must belong to country_id
        cursor.execute(
            "SELECT city_id FROM city WHERE city = %s AND country_id = %s", (data["city"], country_id),
        )
        row = cursor.fetchone()
        if row:
            city_id = row[0]
        else:
            cursor.execute(
                "INSERT INTO city (city, country_id, last_update) VALUES (%s, %s, NOW())", (data["city"], country_id),
            )
            city_id = cursor.lastrowid

        # 3) insert address  (location is required in sakila)
        cursor.execute(
            """
            INSERT INTO address
              (address, address2, district, city_id, postal_code, phone, location, last_update)
            VALUES
              (%s, %s, %s, %s, %s, %s, ST_GeomFromText('POINT(0 0)'), NOW())
            """,
            (
                data["address"],
                data["address2"],
                data["district"],
                city_id,
                data["postal_code"],
                data["phone"],
            ),
        )
        address_id = cursor.lastrowid


        # 4) insert customer
        # store_id is required in Sakila; since you removed it from the form,
        # pick a default store (usually 1).
        cursor.execute(
            """
            INSERT INTO customer
              (store_id, first_name, last_name, email, address_id, active, create_date, last_update)
            VALUES
              (1, %s, %s, %s, %s, 1, NOW(), NOW())
            """,
            (
                data["first_name"],
                data["last_name"],
                data["email"],
                address_id,
            ),
        )
        customer_id = cursor.lastrowid

        cnx.commit()
        return jsonify({"ok": True, "customer_id": customer_id}), 201

    finally:
        cnx.autocommit = True
        cursor.close()
        cnx.close()

@app.route("/sql/updateCustomer/<int:customer_id>", methods=["PUT"])
def update_customer(customer_id):
    data = request.get_json(force=True)
    cnx = pool.get_connection()
    cursor = cnx.cursor()
    try:
        cnx.autocommit = False
        cnx.start_transaction()

        # 0) Find address_id for this customer
        cursor.execute("SELECT address_id FROM customer WHERE customer_id = %s", (customer_id,))
        row = cursor.fetchone()
        address_id = row[0]

        # 1) country_id (get or create)
        cursor.execute("SELECT country_id FROM country WHERE country = %s", (data["country"],))
        row = cursor.fetchone()
        if row:
            country_id = row[0]
        else:
            cursor.execute(
                "INSERT INTO country (country, last_update) VALUES (%s, NOW())",
                (data["country"],),
            )
            country_id = cursor.lastrowid

        # 2) city_id (get or create) within that country
        cursor.execute(
            "SELECT city_id FROM city WHERE city = %s AND country_id = %s",
            (data["city"], country_id),
        )
        row = cursor.fetchone()
        if row:
            city_id = row[0]
        else:
            cursor.execute(
                "INSERT INTO city (city, country_id, last_update) VALUES (%s, %s, NOW())", (data["city"], country_id),
            )
            city_id = cursor.lastrowid

        # 3) Update address
        cursor.execute(
            """
            UPDATE address
            SET address=%s,
                address2=%s,
                district=%s,
                city_id=%s,
                postal_code=%s,
                phone=%s,
                last_update=NOW()
            WHERE address_id=%s
            """,
            (
                data["address"],
                data["address2"],
                data["district"],
                city_id,
                data["postal_code"],
                data["phone"],
                address_id,
            ),
        )

        # 4) Update customer
        cursor.execute(
            """
            UPDATE customer
            SET first_name=%s,
                last_name=%s,
                email=%s,
                last_update=NOW()
            WHERE customer_id=%s
            """,
            (
                data["first_name"],
                data["last_name"],
                data["email"],
                customer_id,
            ),
        )

        cnx.commit()
        return jsonify({"ok": True}), 200

    finally:
        cnx.autocommit = True
        cursor.close()
        cnx.close()


@app.route("/sql/getCustomerDetails/<int:customer_id>", methods=["GET"])
def get_customer_details(customer_id):
    cnx = pool.get_connection()
    cursor = cnx.cursor(dictionary=True)
    try:
        query = """
                SELECT
                    c.customer_id, c.first_name, c.last_name, c.email, c.address_id,
                    c.create_date, c.last_update,
                    a.address, a.address2, a.district, a.postal_code, a.phone,
                    ci.city, co.country
                FROM customer c
                JOIN address a ON c.address_id = a.address_id
                JOIN city ci ON a.city_id = ci.city_id
                JOIN country co ON ci.country_id = co.country_id
                WHERE c.customer_id = %s;
                """
        cursor.execute(query, (customer_id,))
        row = cursor.fetchone()

        # JSON-safe datetime conversion
        if row and row.get("create_date"):
            row["create_date"] = row["create_date"].replace(microsecond=0).isoformat()
        if row and row.get("last_update"):
            row["last_update"] = row["last_update"].replace(microsecond=0).isoformat()

        return jsonify({"customer": row}), 200
    finally:
        cursor.close()
        cnx.close()



if __name__ == "__main__":
    app.run(debug=True)
