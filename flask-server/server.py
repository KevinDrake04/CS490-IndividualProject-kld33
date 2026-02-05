from flask import Flask, jsonify
import mysql.connector

app = Flask(__name__)

#SQL connection to sakila database
con=mysql.connector.connect(
    host='localhost',
    user='root',
    password='password',
    database='sakila'
)

@app.route("/getTable",methods=['GET'])
def get_tables():
    cursor=con.cursor()
    cursor.execute("SHOW TABLES;")
    tables=cursor.fetchall()
    cursor.close()
    table_names=[table[0] for table in tables]
    return jsonify({"tables":table_names}),200



###############
#Landing Page
###############

#Top 5 rented films of all time
@app.route("/getTop5Films",methods=['GET'])
def get_topFilms():
    cursor=con.cursor()
    query=  ("""
            SELECT film.title, count(film.film_id) AS rented FROM rental
            JOIN inventory ON rental.inventory_id = inventory.inventory_id
            JOIN film ON inventory.film_id = film.film_id
            group by film.film_id
            order by rented desc limit 5;
            """)
    
    cursor.execute(query)
    films=cursor.fetchall()
    cursor.close()
    film_names=[film[0] for film in films]
    return jsonify({"tables":film_names}),200

#Top 5 actors that are part of films available in store
@app.route("/getTop5Actors",methods=['GET'])
def get_topActors():
    cursor=con.cursor()
    query=  ("""

            """)
    
    cursor.execute(query)
    temps=cursor.fetchall()
    cursor.close()
    temp_list=[temp[0] for temp in temps]
    return jsonify({"tables":temps_list}),200

###############
#Films Page
###############



###############
#Customer Page
###############

#list of all customers
@app.route("/getAllCustomers",methods=['GET'])
def get_allCustomers():
    cursor=con.cursor()
    query=  ("""
            SELECT c.customer_id, c.first_name, c.last_name, c.email FROM customer c;
            """)
    
    cursor.execute(query)
    temps=cursor.fetchall()
    cursor.close()
    temp_list=[temp for temp in temps]
    return jsonify({"tables":temp_list}),200

#view customer details and see their past and present rental history
@app.route("/getCustomerDetails",methods=['GET'])
def get_customerDetails():
    cursor=con.cursor()
    query=  ("""
            
            """)
    
    cursor.execute(query)
    temps=cursor.fetchall()
    cursor.close()
    temp_list=[temp[0] for temp in temps]
    return jsonify({"tables":temps_list}),200

###############

if __name__ == "__main__":
    app.run(debug=True)
