from datetime import datetime, timedelta
from flask import Flask, jsonify, send_from_directory, render_template, request, redirect, url_for, flash, session
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import CORS  
from flask_mail import Mail, Message
from itsdangerous import URLSafeTimedSerializer, SignatureExpired
import sqlite3
from authlib.integrations.flask_client import OAuth
import os

app = Flask(__name__, static_folder='static')
app.secret_key = os.environ.get('SECRET_KEY') or 'default_secret_key'
CORS(app)  # Enable CORS on the Flask app

oauth = OAuth(app)
google = oauth.register(
    name='google',
    client_id='716986116788-g70jd1qb64c2ctpigelu5gsil2cc633m.apps.googleusercontent.com',
    client_secret='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',
    access_token_url='https://accounts.google.com/o/oauth2/token',
    access_token_params=None,
    authorize_url='https://accounts.google.com/o/oauth2/auth',
    authorize_params=None,
    api_base_url='https://www.googleapis.com/oauth2/v1/',
    userinfo_endpoint='https://openidconnect.googleapis.com/v1/userinfo',  # This is the fixed endpoint for getting user info
    client_kwargs={'scope': 'openid email profile'},
    jwks_uri='https://www.googleapis.com/oauth2/v3/certs'
)

def get_db_connection():
    conn = sqlite3.connect('MyLifeDB');
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/')
def home():
    # Renders the index.html page   
    account_created = request.args.get('account_created') == 'True'
    logout_success = request.args.get('logout_success') == 'True'
    return render_template('index.html', account_created=account_created, logout_success=logout_success)

@app.route('/toSignup')
def toSignup():
    # Renders the signup.html page
    return render_template('signup.html')

@app.route('/create_account', methods=['POST'])
def create_account():

    email = request.form.get('email')
    password = request.form.get('password')
    hashed_password = generate_password_hash(password, method='scrypt')
    
    conn = get_db_connection()
    cursor = conn.cursor()
        
    # Check if email already exists
    cursor.execute('SELECT * FROM users WHERE email = ?', (email,))
    user = cursor.fetchone()
    
    if user:
        if user['password'] is None:
            # User exists but registered via Google
            flash('It looks like you have already registered with Google. Please sign in using Google.', 'info')
            return redirect(url_for('toLogin'))
        else:
            # User exists with a password (normal email registration)
            flash('Email already exists. Please sign in.', 'warning')
            return redirect(url_for('toLogin'))
    
    cursor.execute('INSERT INTO users (email, password) VALUES (?, ?)', (email, hashed_password))
    conn.commit()
    conn.close()
    
    return redirect(url_for('index', account_created=True))

@app.route('/toLogin')
def toLogin():
    # Renders the login.html page
    return render_template('login.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM users WHERE email = ?', (email,))
        user = cursor.fetchone()
        
        if user:
            if user['password'] is None:
                # User registered via Google, no password set
                flash('It looks like you registered with Google. Please use Google to sign in.', 'info')
                return redirect(url_for('login'))
            elif check_password_hash(user['password'], password):
                # User exists and password is correct
                session['user_id'] = user['id']
                return redirect(url_for('index'))
            else:
                # Password is incorrect
                flash('Invalid email or password. Please try again.', 'error')
        
        else:
            # User does not exist
            flash('No account found with that email. Please sign up.', 'error')
        
    return render_template('login.html')

@app.route('/google-login')
def google_login():
    # Redirects to Google's OAuth service
    redirect_uri = url_for('login_callback', _external=True)
    return google.authorize_redirect(redirect_uri)

@app.route('/login/callback')
def login_callback():
    # Handles the callback from Google's OAuth service
    token = google.authorize_access_token()
    resp = google.get('userinfo')  # This endpoint fetches user details
    user_info = resp.json()
    print('Token:', token)
    print('User Info:', user_info);

    if not user_info:
        # User info could not be retrieved
        flash('Could not retrieve user information from Google.', 'error')
        return redirect(url_for('login'))

    # Connect to the database
    conn = get_db_connection()
    cursor = conn.cursor()

    # Check if the user already exists
    cursor.execute('SELECT * FROM users WHERE email = ?', (user_info['email'],))
    existing_user = cursor.fetchone()

    if existing_user:
        # User already exists, update the user record
        user_id = existing_user['id']
    else:
        # User does not exist, create a new user record
        name = user_info.get('name', None)  # Provide a default name if 'name' is not present
        picture = user_info.get('picture', None)  # Use None if 'picture' is not present
        cursor.execute('INSERT INTO users (email, name, picture) VALUES (?, ?, ?)', 
                       (user_info['email'], name, picture))
        user_id = cursor.lastrowid  # Get the id of the newly created user record

    conn.commit()
    conn.close()

    # Set up user session
    session['user_id'] = user_id
    session['user_email'] = user_info['email']

    flash('Successfully logged in!', 'success')
    return redirect(url_for('index'))

@app.route('/logout')
def logout():
    session.pop('user_id', None)
    print('logout')
    return redirect(url_for('index', logout_success=True))

def generate_calendar_data(start_year, end_year):
    calendar_data = []
    for year in range(start_year, end_year + 1):
        for week in range(1, 53):
            week_start_date = datetime(year, 1, 1) + timedelta(weeks=week-1)
            week_days = []

            for day in range(7):  # Iterate through each day of the week
                day_date = week_start_date + timedelta(days=day)
                week_days.append(day_date.strftime('%Y-%m-%d'))  # Add each day to the week_days list

            calendar_data.append({
                "year": year,
                "week": week,
                "start_date": week_start_date.strftime('%Y-%m-%d'),  # Start date of the week
                "days": week_days  # List of all days in the week
            })

    return calendar_data

@app.route('/')
def index():
    # Assuming index.html is directly in the templates folder
    return render_template('index.html')

@app.route('/<path:path>')
def static_files(path):
    return send_from_directory('../src', path)

@app.route('/calendar')
def calendar():
    if request.accept_mimetypes.best_match(['application/json', 'text/html']) == 'application/json':
        # Client requested JSON
        data = generate_calendar_data(1890, 2123)
        return jsonify(data)
    else:
        # Default to HTML if not JSON
        return render_template('calendar.html', calendar_data=generate_calendar_data(1890, 2123))

def fetch_milestones():
    connection = sqlite3.connect('MyLifeDB')
    cursor = connection.cursor()
    cursor.execute("SELECT * FROM milestones")
    milestones = cursor.fetchall()

    cursor.close()
    connection.close()
    return milestones

@app.route('/milestones', methods=['GET'])
def get_milestones():
    milestones = fetch_milestones()
    return jsonify(milestones)

if __name__ == '__main__':
    app.run(debug=True)
