from flask import Flask, abort, request, session, jsonify
from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash, check_password_hash
from flask_wtf.csrf import CSRFProtect, generate_csrf
import json
import random
import sqlite3

app = Flask(__name__)
app.config.update(
    SECRET_KEY="615f67ca5569578e1b85ab64f4d14c38",
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE="Lax", 
    SESSION_COOKIE_SECURE=True,   
    WTF_CSRF_TIME_LIMIT=None,
)
csrf = CSRFProtect(app)

DEMO_USERNAME = "__demo__"
DEMO_DISPLAY_NAME = "Demo"
DEMO_GOAL = 2200

def require_user():
    uid = session.get("user_id")
    if not uid:
        abort(401)
    return uid

def get_or_create_demo_user():
    conn = sqlite3.connect("users.db")
    c = conn.cursor()
    c.execute("SELECT user_id FROM users WHERE username = ?", (DEMO_USERNAME,))
    row = c.fetchone()
    if row:
        user_id = row[0]
    else:
        hashed_password = generate_password_hash("demo")
        c.execute(
            "INSERT INTO users (username, password, goal) VALUES (?, ?, ?)",
            (DEMO_USERNAME, hashed_password, DEMO_GOAL),
        )
        conn.commit()
        user_id = c.lastrowid
    conn.close()
    return user_id

@app.get("/api/csrf-token")
def get_csrf_token():
    token = generate_csrf()
    resp = jsonify({"csrfToken": token})
    resp.set_cookie("csrf_token", token, httponly=True, samesite="Lax", secure=True)
    return resp

@app.get("/api/me")
def api_me():
    user_id = session.get("user_id")
    username = session.get("username")
    if not user_id:
        return jsonify({"error": "Not logged in"}), 401
    return jsonify({"userId": user_id, "username": username})

@app.post("/api/login")
def api_login():
    payload = request.get_json()
    username = payload.get("username")
    password = payload.get("password")
    # look up user in users.db
    conn = sqlite3.connect('users.db')
    c = conn.cursor()
    c.execute('SELECT user_id, password FROM users WHERE username = ?', (username,))
    row = c.fetchone()
    if row is None:
        conn.close()
        return jsonify({"error": "User not found"}), 404
    user_id = row[0]
    stored_password = row[1]
    # validate password
    if not check_password_hash(stored_password, password):
        conn.close()
        return jsonify({"error": "Invalid password"}), 401
    session.permanent = True
    session["user_id"] = user_id
    session["username"] = username
    return jsonify({"ok": True})


@app.post("/api/signup")
def api_signup():
    payload = request.get_json()
    username = payload.get("username")
    password = payload.get("password")
    goal = payload.get("goal")
    hashed_password = generate_password_hash(password)
    # check if user already exists
    conn = sqlite3.connect('users.db')
    c = conn.cursor()
    c.execute('SELECT user_id FROM users WHERE username = ?', (username,))
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
    # create new user
    c.execute('INSERT INTO users (username, password, goal) VALUES (?, ?, ?)', (username, hashed_password, goal))
    conn.commit()
    user_id = c.lastrowid
    conn.close()
    session.permanent = True
    session["user_id"] = user_id
    session["username"] = username
    return jsonify({"ok": True})

@app.post("/api/logout")
def api_logout():
    session.clear()
    return jsonify({"ok": True})

@app.post("/api/demo-login")
def api_demo_login():
    user_id = get_or_create_demo_user()
    seed_demo_meals(user_id)
    session.permanent = True
    session["user_id"] = user_id
    session["username"] = DEMO_DISPLAY_NAME
    return jsonify({"ok": True})

@app.get("/api/goal")
def api_get_goal():
    user_id = require_user()
    conn = sqlite3.connect("users.db")
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute("SELECT goal FROM users WHERE user_id = ?", (user_id,))
    row = c.fetchone()
    conn.close()

    if row is None:
        return jsonify({"error": "User not found"}), 404
    
    return jsonify({"goal": row["goal"]})

@app.post("/api/goal")
def api_post_goal():
    payload = request.get_json()
    userId = require_user()
    goal = payload.get("goal")
    conn = sqlite3.connect('users.db')
    c = conn.cursor()
    c.execute('UPDATE users SET goal = ? WHERE user_id = ?', (goal, userId))
    conn.commit()
    conn.close()
    return jsonify({"ok": True}), 201

@app.get("/api/meals/recent")
def api_get_meals_recent():
    user_id = require_user()
    conn = sqlite3.connect("meals.db")
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute(
        # Use calendar days: from the start of today minus 30 days up to now
        "SELECT meal_id, user_id, serving_size_grams, product_name, nutriments, "
        "date(created_at, 'localtime') AS meal_date "
        "FROM meals "
        "WHERE user_id = ? "
        "AND date(created_at, 'localtime') >= date('now', 'localtime', '-29 days') "
        "ORDER BY created_at",
        (user_id,),
    )
    rows = c.fetchall()
    conn.close()

    # Group meals by calendar day
    grouped = {}
    for row in rows:
        nutriments = json.loads(row["nutriments"]) if row["nutriments"] else {}
        meal_date_iso = row["meal_date"]
        meal_label = datetime.fromisoformat(meal_date_iso).strftime("%d %b")
        meal = {
            "mealId": row["meal_id"],
            "servingSizeGrams": row["serving_size_grams"],
            "date": meal_label,
            "nutriments": nutriments,
        }
        grouped.setdefault(meal_label, []).append(meal)

    # Build a 30-day array, each with a label and meals list
    today = datetime.now()
    days = []
    for i in range(29, -1, -1):
        day = (today - timedelta(days=i)).date()
        day_label = day.strftime("%d %b")
        days.append({
            "date": day_label,
            "meals": grouped.get(day_label, []),
        })

    return jsonify(days)

@app.get("/api/meals")
def api_get_meals():
    user_id = require_user()
    conn = sqlite3.connect("meals.db")
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute(
        "SELECT meal_id, user_id, barcode, serving_size_grams, product_name, nutriments, created_at "
        "FROM meals WHERE user_id = ? ORDER BY created_at DESC",
        (user_id,),
    )
    rows = c.fetchall()
    conn.close()

    meals = []
    for row in rows:
        nutriments = json.loads(row["nutriments"]) if row["nutriments"] else {}
        meals.append({
            "mealId": row["meal_id"],
            "servingSizeGrams": row["serving_size_grams"],
            "productName": row["product_name"],
            "nutriments": nutriments,
            "createdAt": row["created_at"],
        })
    return jsonify(meals)


@app.post("/api/meals")
def api_meals():
    payload = request.get_json()
    userId = require_user()
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
    meal_id = c.lastrowid
    conn.close()
    return jsonify({"ok": True, "meal_id": meal_id}), 201

@app.patch("/api/meals/serving")
def api_update_meal_serving():
    payload = request.get_json() or {}
    user_id = require_user()
    meal_ids = payload.get("mealIds") or []
    serving_size_grams = payload.get("servingSizeGrams")
    if not meal_ids or serving_size_grams is None:
        return jsonify({"error": "mealIds and servingSizeGrams are required"}), 400

    placeholders = ",".join("?" for _ in meal_ids)
    params = [serving_size_grams, user_id, *meal_ids]
    conn = sqlite3.connect("meals.db")
    c = conn.cursor()
    c.execute(
        f"UPDATE meals SET serving_size_grams = ? WHERE user_id = ? AND meal_id IN ({placeholders})",
        params,
    )
    conn.commit()
    conn.close()
    return jsonify({"ok": True})

@app.delete("/api/meals")
def api_delete_meals():
    payload = request.get_json() or {}
    user_id = require_user()
    meal_ids = payload.get("mealIds") or []
    if not meal_ids:
        return jsonify({"error": "mealIds are required"}), 400

    placeholders = ",".join("?" for _ in meal_ids)
    params = [user_id, *meal_ids]
    conn = sqlite3.connect("meals.db")
    c = conn.cursor()
    c.execute(
        f"DELETE FROM meals WHERE user_id = ? AND meal_id IN ({placeholders})",
        params,
    )
    conn.commit()
    conn.close()
    return jsonify({"ok": True})

def seed_demo_meals(user_id: int):
    demo_products = [
        {
            "name": "Greek Yogurt",
            "nutriments": {
                "energy-kcal_100g": 59,
                "proteins_100g": 10,
                "fat_100g": 0.4,
                "carbohydrates_100g": 3.6,
            },
        },
        {
            "name": "Chicken Breast",
            "nutriments": {
                "energy-kcal_100g": 165,
                "proteins_100g": 31,
                "fat_100g": 3.6,
                "carbohydrates_100g": 0,
            },
        },
        {
            "name": "Oatmeal",
            "nutriments": {
                "energy-kcal_100g": 389,
                "proteins_100g": 17,
                "fat_100g": 7,
                "carbohydrates_100g": 66,
            },
        },
        {
            "name": "Banana",
            "nutriments": {
                "energy-kcal_100g": 89,
                "proteins_100g": 1.1,
                "fat_100g": 0.3,
                "carbohydrates_100g": 23,
            },
        },
        {
            "name": "Avocado",
            "nutriments": {
                "energy-kcal_100g": 160,
                "proteins_100g": 2,
                "fat_100g": 14.7,
                "carbohydrates_100g": 8.5,
            },
        },
        {
            "name": "Salmon",
            "nutriments": {
                "energy-kcal_100g": 208,
                "proteins_100g": 20,
                "fat_100g": 13,
                "carbohydrates_100g": 0,
            },
        },
        {
            "name": "Brown Rice",
            "nutriments": {
                "energy-kcal_100g": 111,
                "proteins_100g": 2.6,
                "fat_100g": 0.9,
                "carbohydrates_100g": 23,
            },
        },
        {
            "name": "Almonds",
            "nutriments": {
                "energy-kcal_100g": 579,
                "proteins_100g": 21,
                "fat_100g": 50,
                "carbohydrates_100g": 22,
            },
        },
        {
            "name": "Egg Whites",
            "nutriments": {
                "energy-kcal_100g": 52,
                "proteins_100g": 11,
                "fat_100g": 0.2,
                "carbohydrates_100g": 0.7
            }
        },
        {
            "name": "Tuna (Canned in water, drained)",
            "nutriments": {
                "energy-kcal_100g": 116,
                "proteins_100g": 26,
                "fat_100g": 1,
                "carbohydrates_100g": 0
            }
        },
        {
            "name": "Sweet Potato (baked)",
            "nutriments": {
                "energy-kcal_100g": 90,
                "proteins_100g": 2,
                "fat_100g": 0.1,
                "carbohydrates_100g": 21
            }
        },
        {
            "name": "Black Beans (cooked)",
            "nutriments": {
                "energy-kcal_100g": 132,
                "proteins_100g": 8.9,
                "fat_100g": 0.5,
                "carbohydrates_100g": 23.7
            }
        },
        {
            "name": "Tofu (firm)",
            "nutriments": {
                "energy-kcal_100g": 144,
                "proteins_100g": 15.7,
                "fat_100g": 8.7,
                "carbohydrates_100g": 2.3
            }
        },
        {
            "name": "Cottage Cheese (low-fat 1%)",
            "nutriments": {
                "energy-kcal_100g": 72,
                "proteins_100g": 12.4,
                "fat_100g": 1,
                "carbohydrates_100g": 3.4
            }
        },
        {
            "name": "Turkey Breast (skinless, roasted)",
            "nutriments": {
                "energy-kcal_100g": 135,
                "proteins_100g": 29,
                "fat_100g": 1.6,
                "carbohydrates_100g": 0
            }
        },
        {
            "name": "Ground Beef (93% lean, cooked)",
            "nutriments": {
                "energy-kcal_100g": 176,
                "proteins_100g": 26,
                "fat_100g": 8,
                "carbohydrates_100g": 0
            }
        },
        {
            "name": "Cod (baked)",
            "nutriments": {
                "energy-kcal_100g": 105,
                "proteins_100g": 23,
                "fat_100g": 1,
                "carbohydrates_100g": 0
            }
        },
        {
            "name": "Quinoa (cooked)",
            "nutriments": {
                "energy-kcal_100g": 120,
                "proteins_100g": 4.4,
                "fat_100g": 1.9,
                "carbohydrates_100g": 21.3
            }
        },
        {
            "name": "Whole Wheat Bread",
            "nutriments": {
                "energy-kcal_100g": 247,
                "proteins_100g": 13,
                "fat_100g": 4.2,
                "carbohydrates_100g": 41
            }
        },
        {
            "name": "Pasta (cooked)",
            "nutriments": {
                "energy-kcal_100g": 158,
                "proteins_100g": 5.8,
                "fat_100g": 0.9,
                "carbohydrates_100g": 31
            }
        },
        {
            "name": "Peanut Butter (natural)",
            "nutriments": {
                "energy-kcal_100g": 588,
                "proteins_100g": 25,
                "fat_100g": 50,
                "carbohydrates_100g": 20
            }
        },
        {
            "name": "Cheddar Cheese",
            "nutriments": {
                "energy-kcal_100g": 403,
                "proteins_100g": 25,
                "fat_100g": 33,
                "carbohydrates_100g": 1.3
            }
        },
    ]

    conn = sqlite3.connect("meals.db")
    c = conn.cursor()
    c.execute("DELETE FROM meals WHERE user_id = ?", (user_id,))

    now = datetime.now()
    for _ in range(100):
        product = random.choice(demo_products)
        serving = random.choice([80, 100, 120, 150, 180, 200, 250, 300])
        days_ago = random.randint(0, 29)
        hours = random.randint(6, 20)
        minutes = random.randint(0, 59)
        created_at = (now - timedelta(days=days_ago)).replace(
            hour=hours, minute=minutes, second=0, microsecond=0
        )
        c.execute(
            "INSERT INTO meals (user_id, barcode, serving_size_grams, product_name, nutriments, created_at) "
            "VALUES (?, ?, ?, ?, ?, ?)",
            (
                user_id,
                "demo",
                serving,
                product["name"],
                json.dumps(product["nutriments"]),
                created_at.strftime("%Y-%m-%d %H:%M:%S"),
            ),
        )

    conn.commit()
    conn.close()




if __name__ == '__main__':
    app.run(host="127.0.0.1", port=5000, debug=False, use_reloader=False)
