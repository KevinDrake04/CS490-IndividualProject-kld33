from flask import Flask
import mysql.connector

app = Flask(__name__)

con=mysql.connector.connect(
    host='localhost',
    user='root',
    password='password',
    database='sakila'
)

#Members API route
@app.route("/members")
def members():
    return {"members": ["Member1", "Member2", "Member3"]} 

if __name__ == "__main__":
    app.run(debug=True)
