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
            SELECT film.film_id, film.title, COUNT(*) AS rented
            FROM rental
            JOIN inventory ON rental.inventory_id = inventory.inventory_id
            JOIN film ON inventory.film_id = film.film_id
            GROUP BY film.film_id, film.title
            ORDER BY rented DESC
            LIMIT 5;
        """
        cursor.execute(query)
        rows = cursor.fetchall()

        films = [{"film_id": r[0], "title": r[1], "rented": int(r[2])} for r in rows]
        return jsonify({"tables": films}), 200
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

        actors = [{
            "actor_id": r[0],
            "name": r[1],
            "total_rentals": int(r[2]),
            "film_count": int(r[3]),
            "rentals_per_film": float(r[4]) if r[4] is not None else 0.0
        } for r in rows]

        return jsonify({"tables": actors}), 200
    finally:
        cursor.close()
        cnx.close()

@app.route("/sql/getFilmDetails/<int:film_id>", methods=["GET"])
def get_film_details(film_id):
    cnx = pool.get_connection()
    cursor = cnx.cursor()
    try:
        query = """
            SELECT
              f.film_id,
              f.title,
              f.description,
              c.name AS category,
              f.rating,
              f.length,
              f.release_year,
              f.rental_rate,
              f.replacement_cost,
              CAST(f.special_features AS CHAR) AS special_features
            FROM film f
            JOIN film_category fc ON fc.film_id = f.film_id
            JOIN category c ON c.category_id = fc.category_id
            WHERE f.film_id = %s
            LIMIT 1;
        """
        cursor.execute(query, (film_id,))
        row = cursor.fetchone()
        if not row:
            return jsonify({"error": "Film not found"}), 404

        film = {
            "film_id": row[0],
            "title": row[1],
            "description": row[2],
            "category": row[3],
            "rating": row[4],
            "length": row[5],
            "release_year": row[6],
            "rental_rate": float(row[7]) if row[7] is not None else None,
            "replacement_cost": float(row[8]) if row[8] is not None else None,
            "special_features": row[9],  # now a normal string
        }

        cursor.execute(
            """
            SELECT a.actor_id, CONCAT(a.first_name, ' ', a.last_name) AS name
            FROM film_actor fa
            JOIN actor a ON a.actor_id = fa.actor_id
            WHERE fa.film_id = %s
            ORDER BY a.last_name, a.first_name;
            """,
            (film_id,),
        )
        actors_rows = cursor.fetchall()
        actors = [{"actor_id": r[0], "name": r[1]} for r in actors_rows]

        return jsonify({"film": film, "actors": actors}), 200

    except Exception as e:
        # makes debugging MUCH easier
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        cnx.close()

@app.route("/sql/getActorDetails/<int:actor_id>", methods=["GET"])
def get_actor_details(actor_id):
    cnx = pool.get_connection()
    cursor = cnx.cursor()
    try:
        cursor.execute(
            """
            SELECT actor_id, first_name, last_name, last_update
            FROM actor
            WHERE actor_id = %s
            LIMIT 1;
            """,
            (actor_id,),
        )
        row = cursor.fetchone()
        if not row:
            return jsonify({"error": "Actor not found"}), 404

        # last_update comes back as datetime; jsonify can handle it sometimes,
        # but converting is safer:
        last_update = row[3].replace(microsecond=0).isoformat() if row[3] else None

        actor = {
            "actor_id": row[0],
            "first_name": row[1],
            "last_name": row[2],
            "name": f"{row[1]} {row[2]}",
            "last_update": last_update,
        }

        return jsonify({"actor": actor}), 200
    finally:
        cursor.close()
        cnx.close()

@app.route("/sql/getActorTop5Films/<int:actor_id>", methods=["GET"])
def get_actor_top5_films(actor_id):
    cnx = pool.get_connection()
    cursor = cnx.cursor()
    try:
        query = """
            SELECT f.film_id, f.title, COUNT(r.rental_id) AS rented
            FROM actor a
            JOIN film_actor fa ON a.actor_id = fa.actor_id
            JOIN film f ON f.film_id = fa.film_id
            JOIN inventory i ON i.film_id = f.film_id
            JOIN rental r ON r.inventory_id = i.inventory_id
            WHERE a.actor_id = %s
            GROUP BY f.film_id, f.title
            ORDER BY rented DESC
            LIMIT 5;
        """
        cursor.execute(query, (actor_id,))
        rows = cursor.fetchall()

        films = [{"film_id": r[0], "title": r[1], "rented": int(r[2])} for r in rows]
        return jsonify({"tables": films}), 200
    finally:
        cursor.close()
        cnx.close()

###############
#Films Page
###############
@app.route("/sql/getFilms", methods=["GET"])
def get_films():
    cnx = pool.get_connection()
    cursor = cnx.cursor()
    try:
        query = """
            SELECT
              f.film_id,                                
              f.title,                                              
              c.name AS category,                                   
              f.rating,                                             
              f.length,                                             
              f.release_year,                                       
              f.rental_rate,                                        

              GROUP_CONCAT(DISTINCT CONCAT(a.first_name, ' ', a.last_name)
                           ORDER BY a.last_name, a.first_name SEPARATOR ', ') AS actor_names

            FROM film f
            JOIN film_category fc ON fc.film_id = f.film_id
            JOIN category c ON c.category_id = fc.category_id
            LEFT JOIN film_actor fa ON fa.film_id = f.film_id
            LEFT JOIN actor a ON a.actor_id = fa.actor_id

            GROUP BY
              f.film_id, f.title, c.name, f.rating, f.length, f.release_year, f.rental_rate;
        """
        cursor.execute(query)
        rows = cursor.fetchall()
        return jsonify({"tables": rows}), 200
    finally:
        cursor.close()
        cnx.close()

@app.route("/sql/getFilmActors/<int:film_id>", methods=["GET"])
def get_film_actors(film_id):
    cnx = pool.get_connection()
    cursor = cnx.cursor()
    try:
        query = """
            SELECT
              a.actor_id,
              CONCAT(a.first_name, ' ', a.last_name) AS name
            FROM film_actor fa
            JOIN actor a ON a.actor_id = fa.actor_id
            WHERE fa.film_id = %s
            ORDER BY a.last_name, a.first_name;
        """
        cursor.execute(query, (film_id,))
        rows = cursor.fetchall()

        actors = [{"actor_id": r[0], "name": r[1]} for r in rows]
        return jsonify({"actors": actors}), 200
    finally:
        cursor.close()
        cnx.close()

@app.route("/sql/rentFilm", methods=["POST"])
def rent_film():
    data = request.get_json(force=True)
    film_id = data.get("film_id")
    customer_id = data.get("customer_id")

    cnx = pool.get_connection()
    cursor = cnx.cursor()
    try:
        cnx.autocommit = False
        cnx.start_transaction()

        # 1) Ensure customer exists
        cursor.execute("SELECT 1 FROM customer WHERE customer_id = %s LIMIT 1;", (customer_id,))
        if cursor.fetchone() is None:
            cnx.rollback()
            return "Customer not found.", 404

        # 2) Find an available copy (any store)
        cursor.execute(
            """
            SELECT i.inventory_id
            FROM inventory i
            LEFT JOIN rental r
              ON r.inventory_id = i.inventory_id
             AND r.return_date IS NULL
            WHERE i.film_id = %s
              AND r.rental_id IS NULL
            LIMIT 1;
            """,
            (film_id,),
        )
        inv = cursor.fetchone()
        if not inv:
            cnx.rollback()
            return "No available copies for this film.", 409

        inventory_id = inv[0]

        # 3) Default staff_id
        staff_id = 1

        # 4) Create rental
        cursor.execute(
            """
            INSERT INTO rental
              (rental_date, inventory_id, customer_id, return_date, staff_id, last_update)
            VALUES
              (NOW(), %s, %s, NULL, %s, NOW());
            """,
            (inventory_id, customer_id, staff_id),
        )

        cnx.commit()
        return jsonify({"ok": True, "rental_id": cursor.lastrowid}), 201

    finally:
        cnx.autocommit = True
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
            SELECT
              r.rental_id,
              f.film_id,
              f.title,
              r.rental_date,
              r.return_date
            FROM rental r
            JOIN inventory i ON r.inventory_id = i.inventory_id
            JOIN film f ON i.film_id = f.film_id
            WHERE r.customer_id = %s
            ORDER BY r.rental_date DESC;
        """
        cursor.execute(query, (customer_id,))
        rows = cursor.fetchall()

        rentals = [{
            "rental_id": row[0],
            "film_id": row[1],
            "title": row[2],
            "rental_date": row[3].replace(microsecond=0).isoformat() if row[3] else None,
            "return_date": row[4].replace(microsecond=0).isoformat() if row[4] else None,
        } for row in rows]

        return jsonify({"rentals": rentals}), 200
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

@app.route("/sql/returnRental", methods=["POST"])
def return_rental():
    data = request.get_json(force=True)
    rental_id = data.get("rental_id")

    if not rental_id:
        return jsonify({"ok": False}), 400

    cnx = pool.get_connection()
    cursor = cnx.cursor()
    try:
        cnx.autocommit = False
        cnx.start_transaction()

        # Mark returned (only affects rows not already returned)
        cursor.execute(
            """
            UPDATE rental
            SET return_date = NOW(),
                last_update = NOW()
            WHERE rental_id = %s
              AND return_date IS NULL;
            """,
            (rental_id,),
        )

        # If nothing updated, treat as failure (rental missing or already returned)
        if cursor.rowcount != 1:
            cnx.rollback()
            return jsonify({"ok": False}), 409

        cnx.commit()
        return jsonify({"ok": True, "rental_id": rental_id}), 200

    except Exception:
        cnx.rollback()
        return jsonify({"ok": False}), 500

    finally:
        cnx.autocommit = True
        cursor.close()
        cnx.close()
#################################

if __name__ == "__main__":
    app.run(debug=True)
