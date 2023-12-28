from datetime import datetime, timedelta
from flask import Flask, jsonify, send_from_directory, render_template

app = Flask(__name__, static_folder='../src/assets', static_url_path='')

def generate_calendar_data(start_year, end_year):
    calendar_data = []
    for year in range(start_year, end_year + 1):
        for week in range(1, 53):
            week_start_date = datetime(year, 1, 1) + timedelta(weeks=week-1)
            calendar_data.append({
                "year": year,
                "week": week,
                "start_date": week_start_date.strftime('%Y-%m-%d')
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
    # Pass the generated calendar data to the calendar.html template
    return render_template('calendar.html', calendar_data=generate_calendar_data(1890, 2123))

if __name__ == '__main__':
    app.run(debug=True)
