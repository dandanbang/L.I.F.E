from datetime import datetime, timedelta
from flask import Flask, jsonify, send_from_directory, render_template, request
from flask_cors import CORS  
import sqlite3

app = Flask(__name__, static_folder='static')
CORS(app)  # Enable CORS on the Flask app

@app.route('/')
def home():
    return render_template('index.html')

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
