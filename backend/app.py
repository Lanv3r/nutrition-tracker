from flask import Flask, request, redirect, url_for, render_template, jsonify
import json
import sqlite3

app = Flask(__name__)
@app.route('/')
def default_page():
    return render_template('login.html')

@app.route('/api/profile')
def api_profile():
    return render_template('index.html')

@app.post("/api/meals")
def api_meals():
    payload = request.get_json()
    userId = payload.get("userId")
    barcode = payload.get("barcode")
    servingSizeGrams = payload.get("servingSizeGrams")
    productName = payload.get("productName")
    nutriments = payload.get("nutriments")
    nutriments_json = json.dumps(nutriments or {})
    # Store meal in a database
    conn = sqlite3.connect('meals.db')
    c = conn.cursor()
    c.execute('INSERT INTO meals (user_id, barcode, serving_size_grams, product_name, nutriments) VALUES (?, ?, ?, ?, ?)', (userId, barcode, servingSizeGrams, productName, nutriments_json))
    conn.commit()
    conn.close()

@app.post("/api/login")
def api_login():
    payload = request.get_json()
    username = payload.get("username")
    password = payload.get("password")
    # look up user in users.db
    conn = sqlite3.connect('users.db')
    c = conn.cursor()
    c.execute('SELECT id, password FROM users WHERE username = ?', (username,))
    row = c.fetchone()
    if row is None:
        conn.close()
        return jsonify({"error": "User not found"}), 404
    user_id = row[0]
    stored_password = row[1]
    # validate password
    if stored_password != password:
        conn.close()
        return jsonify({"error": "Invalid password"}), 401
    return jsonify({"ok": True, "userId": user_id})


@app.post("/api/signup")
def api_signup():
    payload = request.get_json()
    username = payload.get("username")
    password = payload.get("password")
    birthday = payload.get("birthday")
    sex = payload.get("sex")
    # check if user already exists
    conn = sqlite3.connect('users.db')
    c = conn.cursor()
    c.execute('SELECT id FROM users WHERE username = ?', (username,))
    row = c.fetchone()
    if row is not None:
        conn.close()
        return jsonify({"error": "User already registered"}), 404
    # check if username is valid
    if not username:
        conn.close()
        return jsonify({"error": "Invalid username"}), 400
    # check if password is strong enough
    if len(password) < 8:
        conn.close()
        return jsonify({"error": "Password too weak"}), 400
    # check if birthday is provided
    if not birthday:
        conn.close()
        return jsonify({"error": "Birthday is required"}), 400
    # check if sex is provided
    if not sex:
        conn.close()
        return jsonify({"error": "Sex is required"}), 400
    # create new user
    c.execute('INSERT INTO users (username, password, birthday, sex) VALUES (?, ?, ?, ?)', (username, password, birthday, sex))
    conn.commit()
    user_id = c.lastrowid
    conn.close()
    return jsonify({"ok": True, "userId": user_id})

def init_users_db():
    conn = sqlite3.connect('users.db')
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            password TEXT NOT NULL,
            birthday TEXT NOT NULL,
            sex TEXT NOT NULL
        )
    ''')
    conn.commit()
    conn.close()

def init_meals_db():
    conn = sqlite3.connect('meals.db')
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS meals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            barcode TEXT NOT NULL,
            serving_size_grams REAL NOT NULL,
            product_name TEXT NOT NULL,
            nutriments TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    conn.commit()
    conn.close()

init_meals_db()
init_users_db()

if __name__ == '__main__':
    app.run(debug=True)
