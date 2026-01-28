"""
AI-Powered Face Recognition Attendance System
Flask Backend Application
"""

from flask import Flask, render_template, request, redirect, url_for, jsonify, session
from datetime import datetime

app = Flask(__name__)
app.secret_key = 'your-secret-key-change-in-production'

# ========================================
# Route Definitions
# ========================================

@app.route('/')
def role_select():
    """Landing page - Role selection"""
    return render_template('role_select.html')


@app.route('/faculty_login', methods=['GET', 'POST'])
def faculty_login():
    """Faculty login page"""
    if request.method == 'POST':
        faculty_id = request.form.get('faculty_id')
        password = request.form.get('password')
        
        # TODO: Add actual authentication logic here
        # For demo purposes, accept any credentials
        if faculty_id and password:
            session['user_type'] = 'faculty'
            session['user_id'] = faculty_id
            return redirect(url_for('faculty_dashboard'))
        
    return render_template('faculty_login.html')


@app.route('/student_login', methods=['GET', 'POST'])
def student_login():
    """Student login page"""
    if request.method == 'POST':
        roll_number = request.form.get('roll_number')
        password = request.form.get('password')
        
        # TODO: Add actual authentication logic here
        # For demo purposes, accept any credentials
        if roll_number and password:
            session['user_type'] = 'student'
            session['user_id'] = roll_number
            return redirect(url_for('student_dashboard'))
        
    return render_template('student_login.html')


@app.route('/faculty_dashboard')
def faculty_dashboard():
    """Faculty dashboard - Main control panel"""
    # TODO: Add authentication check
    return render_template('faculty_dashboard.html')


@app.route('/student_dashboard')
def student_dashboard():
    """Student dashboard - View attendance"""
    # TODO: Add authentication check
    return render_template('student_dashboard.html')


# ========================================
# API Endpoints for Attendance Control
# ========================================

@app.route('/start', methods=['POST'])
def start_attendance():
    """Start the attendance recognition system"""
    # TODO: Implement actual face recognition start logic
    return jsonify({
        'success': True,
        'message': 'Attendance system started'
    })


@app.route('/stop', methods=['POST'])
def stop_attendance():
    """Stop the attendance recognition system"""
    # TODO: Implement actual face recognition stop logic
    return jsonify({
        'success': True,
        'message': 'Attendance system stopped'
    })


@app.route('/attendance', methods=['GET'])
def get_attendance():
    """Get attendance records"""
    # TODO: Fetch actual attendance data from database
    # Sample data for demo
    attendance_data = [
        {
            'id': 'CSE001',
            'name': 'Rahul Kumar',
            'date': datetime.now().strftime('%Y-%m-%d'),
            'time': '09:15 AM',
            'status': 'present'
        },
        {
            'id': 'CSE002',
            'name': 'Priya Sharma',
            'date': datetime.now().strftime('%Y-%m-%d'),
            'time': '09:18 AM',
            'status': 'present'
        },
        {
            'id': 'CSE003',
            'name': 'Amit Singh',
            'date': datetime.now().strftime('%Y-%m-%d'),
            'time': '09:22 AM',
            'status': 'present'
        }
    ]
    
    return jsonify(attendance_data)


@app.route('/logout')
def logout():
    """Logout and clear session"""
    session.clear()
    return redirect(url_for('role_select'))


# ========================================
# Run Application
# ========================================

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
