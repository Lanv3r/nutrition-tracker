from flask import Flask, request, redirect, url_for, render_template
import sqlite3

app = Flask(__name__)
@app.route('/')
def default_page():
    return render_template('login.html')

@app.route('/profile')
def profile():
    return render_template('index.html')

@app.route('/userdata', methods=['POST'])
def userdata():
    fname = request.form['fname']
    lname = request.form['lname']
    birthday = request.form['birthday']
    sex = request.form['sex']
    condition = request.form['condition']
    email = ''  # Placeholder for email, should be retrieved from session or form
    conn = sqlite3.connect('userdata.db')
    c = conn.cursor()
    c.execute('INSERT INTO users (user_id, first_name, second_name, ' \
    'birthday, sex, condition) VALUES (?, ?, ?, ?, ?, ?)',
    (email, fname, lname, birthday, sex, condition))
    conn.commit()
    conn.close()
    return redirect(url_for('nutrition'))

@app.route('/nutrition')
def thank_you():
    return "Thank you for submitting your data!"

@app.route('/signup_page')
def signup_page():
    return render_template('signup.html')

@app.route('/login_page')
def login_page():
    return render_template('login.html')

@app.route('/signup')
def signup():
    email = request.form['email']
    password = request.form['password']
    conn = sqlite3.connect('users.db')
    c = conn.cursor()
    c.execute('SELECT id FROM users WHERE email = ?', (email))
    if c.fetchone():
        conn.close()
        return "Email already registered!"
    else:
        c.execute('INSERT INTO users (email, password) VALUES (?, ?)', (email, password))
        conn.commit()
        conn.close()
        return redirect(url_for('profile'))

@app.route('/login')
def login():
    email = request.form['email']
    password = request.form['password']
    conn = sqlite3.connect('users.db')
    c = conn.cursor()
    c.execute('SELECT id FROM users WHERE email = ?', (email))
    if c.fetchone():
        conn.close()
        return "Email already registered!"
    else:
        c.execute('INSERT INTO users (email, password) VALUES (?, ?)', (email, password))
        conn.commit()
        conn.close()
        return redirect(url_for('profile'))

def init_userdata_db():
    conn = sqlite3.connect('userdata.db')
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS userdata (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            first_name TEXT NOT NULL,
            second_name TEXT NOT NULL,
            birthday TEXT NOT NULL,
            sex TEXT NOT NULL,
            condition TEXT NOT NULL,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )
    ''')
    conn.commit()
    conn.close()

def init_users_db():
    conn = sqlite3.connect('users.db')
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL
        )
    ''')
    conn.commit()
    conn.close()

init_userdata_db()
init_users_db()

if __name__ == '__main__':
    app.run(debug=True)