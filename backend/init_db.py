import sqlite3

def init_users_db():
    conn = sqlite3.connect('users.db')
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS users (
            user_id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            password TEXT NOT NULL,
            goal INTEGER DEFAULT 0
              
        )
    ''')
    conn.commit()
    conn.close()

def init_meals_db():
    conn = sqlite3.connect('meals.db')
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS meals (
            meal_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            barcode TEXT NOT NULL,
            serving_size_grams REAL NOT NULL,
            product_name TEXT NOT NULL,
            nutriments TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (user_id)
        )
    ''')
    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_meals_db()
    init_users_db()

