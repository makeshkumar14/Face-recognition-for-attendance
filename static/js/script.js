/* ========================================
   AI Face Recognition Attendance System
   Main JavaScript File
   ======================================== */

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function () {
    initializeAnimations();
    initializeFormValidation();
    initializeDashboard();
});

/* ========================================
   Page Load Animations
   ======================================== */
function initializeAnimations() {
    // Add fade-in animation to main elements
    const animatedElements = document.querySelectorAll('.fade-in, .slide-up');

    animatedElements.forEach((el, index) => {
        el.style.opacity = '0';
        setTimeout(() => {
            el.style.opacity = '1';
        }, 100 * (index + 1));
    });

    // Animate cards on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.card, .stat-card, .panel-section').forEach(el => {
        observer.observe(el);
    });
}

/* ========================================
   Form Validation
   ======================================== */
function initializeFormValidation() {
    const forms = document.querySelectorAll('form');

    forms.forEach(form => {
        const inputs = form.querySelectorAll('.form-input');

        // Add focus animations
        inputs.forEach(input => {
            input.addEventListener('focus', function () {
                this.parentElement.classList.add('focused');
            });

            input.addEventListener('blur', function () {
                this.parentElement.classList.remove('focused');
                validateInput(this);
            });

            input.addEventListener('input', function () {
                if (this.classList.contains('error')) {
                    validateInput(this);
                }
            });
        });

        // Form submission
        form.addEventListener('submit', function (e) {
            let isValid = true;

            inputs.forEach(input => {
                if (!validateInput(input)) {
                    isValid = false;
                }
            });

            if (!isValid) {
                e.preventDefault();
                showNotification('Please fill in all required fields', 'error');
            }
        });
    });
}

function validateInput(input) {
    const value = input.value.trim();
    const isRequired = input.hasAttribute('required');

    if (isRequired && !value) {
        input.classList.add('error');
        return false;
    }

    input.classList.remove('error');
    return true;
}

/* ========================================
   Dashboard Functions
   ======================================== */
let isAttendanceRunning = false;

function initializeDashboard() {
    // Check if we're on the faculty dashboard
    const startBtn = document.getElementById('startAttendance');
    const stopBtn = document.getElementById('stopAttendance');

    if (startBtn && stopBtn) {
        startBtn.addEventListener('click', startAttendance);
        stopBtn.addEventListener('click', stopAttendance);
    }

    // Initialize attendance table if exists
    loadAttendanceData();

    // Update current time
    updateCurrentTime();
    setInterval(updateCurrentTime, 1000);
}

/* ========================================
   Attendance Control Functions
   ======================================== */
function startAttendance() {
    const startBtn = document.getElementById('startAttendance');
    const stopBtn = document.getElementById('stopAttendance');
    const statusDot = document.querySelector('.status-dot');
    const statusTitle = document.querySelector('.status-text h4');
    const statusDesc = document.querySelector('.status-text p');
    const webcamContainer = document.querySelector('.webcam-container');

    // Show loading state
    startBtn.disabled = true;
    startBtn.innerHTML = '<span class="btn-icon">⏳</span> Starting...';

    // API call to start attendance (placeholder)
    fetch('/start', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            // For demo purposes, simulate success
            return { success: true };
        })
        .then(data => {
            isAttendanceRunning = true;

            // Update UI
            statusDot.classList.remove('stopped');
            statusDot.classList.add('running');
            statusTitle.textContent = 'Attendance Running';
            statusDesc.textContent = 'Face recognition is actively scanning...';

            startBtn.disabled = true;
            startBtn.innerHTML = '<span class="btn-icon">▶️</span> Start Attendance';
            stopBtn.disabled = false;

            webcamContainer.classList.add('active');

            showNotification('Attendance started successfully!', 'success');
        })
        .catch(error => {
            startBtn.disabled = false;
            startBtn.innerHTML = '<span class="btn-icon">▶️</span> Start Attendance';
            showNotification('Failed to start attendance. Please try again.', 'error');
        });
}

function stopAttendance() {
    const startBtn = document.getElementById('startAttendance');
    const stopBtn = document.getElementById('stopAttendance');
    const statusDot = document.querySelector('.status-dot');
    const statusTitle = document.querySelector('.status-text h4');
    const statusDesc = document.querySelector('.status-text p');
    const webcamContainer = document.querySelector('.webcam-container');

    // Show loading state
    stopBtn.disabled = true;
    stopBtn.innerHTML = '<span class="btn-icon">⏳</span> Stopping...';

    // API call to stop attendance (placeholder)
    fetch('/stop', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            // For demo purposes, simulate success
            return { success: true };
        })
        .then(data => {
            isAttendanceRunning = false;

            // Update UI
            statusDot.classList.remove('running');
            statusDot.classList.add('stopped');
            statusTitle.textContent = 'Attendance Stopped';
            statusDesc.textContent = 'Click "Start Attendance" to begin face recognition';

            stopBtn.disabled = true;
            stopBtn.innerHTML = '<span class="btn-icon">⏹️</span> Stop Attendance';
            startBtn.disabled = false;

            webcamContainer.classList.remove('active');

            showNotification('Attendance stopped successfully!', 'info');
        })
        .catch(error => {
            stopBtn.disabled = false;
            stopBtn.innerHTML = '<span class="btn-icon">⏹️</span> Stop Attendance';
            showNotification('Failed to stop attendance. Please try again.', 'error');
        });
}

/* ========================================
   Attendance Data Functions
   ======================================== */
function loadAttendanceData() {
    const tableBody = document.getElementById('attendanceData');

    if (!tableBody) return;

    // Sample data for demo
    const sampleData = [
        { id: 'CSE001', name: 'Rahul Kumar', date: '2026-01-28', time: '09:15 AM', status: 'present' },
        { id: 'CSE002', name: 'Priya Sharma', date: '2026-01-28', time: '09:18 AM', status: 'present' },
        { id: 'CSE003', name: 'Amit Singh', date: '2026-01-28', time: '09:22 AM', status: 'present' },
        { id: 'CSE004', name: 'Sneha Patel', date: '2026-01-28', time: '--:-- --', status: 'absent' },
        { id: 'CSE005', name: 'Vikram Reddy', date: '2026-01-28', time: '09:30 AM', status: 'present' },
    ];

    // Fetch from API (placeholder)
    // In production, replace with actual API call:
    // fetch('/attendance')
    //     .then(response => response.json())
    //     .then(data => renderAttendanceTable(data));

    renderAttendanceTable(sampleData);
}

function renderAttendanceTable(data) {
    const tableBody = document.getElementById('attendanceData');

    if (!tableBody) return;

    tableBody.innerHTML = '';

    data.forEach((student, index) => {
        const row = document.createElement('tr');
        row.style.animationDelay = `${index * 0.1}s`;
        row.classList.add('fade-in');

        const initials = student.name.split(' ').map(n => n[0]).join('');

        row.innerHTML = `
            <td>
                <div class="student-info">
                    <div class="student-avatar">${initials}</div>
                    <div>
                        <div class="student-name">${student.name}</div>
                        <div class="student-id">${student.id}</div>
                    </div>
                </div>
            </td>
            <td>${formatDate(student.date)}</td>
            <td>${student.time}</td>
            <td>
                <span class="status-badge ${student.status}">
                    ${student.status === 'present' ? '✓' : '✗'} ${capitalizeFirst(student.status)}
                </span>
            </td>
        `;

        tableBody.appendChild(row);
    });
}

/* ========================================
   Utility Functions
   ======================================== */
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

function capitalizeFirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function updateCurrentTime() {
    const timeElement = document.getElementById('currentTime');
    if (timeElement) {
        const now = new Date();
        timeElement.textContent = now.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    }

    const dateElement = document.getElementById('currentDate');
    if (dateElement) {
        const now = new Date();
        dateElement.textContent = now.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
}

/* ========================================
   Notification System
   ======================================== */
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;

    const icons = {
        success: '✓',
        error: '✗',
        warning: '⚠',
        info: 'ℹ'
    };

    notification.innerHTML = `
        <span class="notification-icon">${icons[type]}</span>
        <span class="notification-message">${message}</span>
        <button class="notification-close" onclick="this.parentElement.remove()">×</button>
    `;

    // Add styles dynamically
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        gap: 12px;
        z-index: 9999;
        animation: slideInRight 0.3s ease forwards;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        font-weight: 500;
    `;

    // Type-specific colors
    const colors = {
        success: { bg: 'rgba(72, 187, 120, 0.95)', color: '#fff' },
        error: { bg: 'rgba(252, 129, 129, 0.95)', color: '#fff' },
        warning: { bg: 'rgba(246, 173, 85, 0.95)', color: '#1a1a2e' },
        info: { bg: 'rgba(99, 179, 237, 0.95)', color: '#fff' }
    };

    notification.style.background = colors[type].bg;
    notification.style.color = colors[type].color;

    // Add animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        .notification-close {
            background: none;
            border: none;
            color: inherit;
            font-size: 1.5rem;
            cursor: pointer;
            opacity: 0.7;
            transition: opacity 0.2s;
        }
        .notification-close:hover {
            opacity: 1;
        }
    `;
    document.head.appendChild(style);

    document.body.appendChild(notification);

    // Auto-remove after 4 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideInRight 0.3s ease reverse forwards';
            setTimeout(() => notification.remove(), 300);
        }
    }, 4000);
}

/* ========================================
   Navigation Functions
   ======================================== */
function navigateTo(url) {
    window.location.href = url;
}

function logout() {
    // Show confirmation
    if (confirm('Are you sure you want to logout?')) {
        // Clear any session data
        showNotification('Logging out...', 'info');

        setTimeout(() => {
            window.location.href = '/';
        }, 1000);
    }
}

/* ========================================
   Demo Mode Functions (For Testing)
   ======================================== */
function simulateRecognition() {
    if (!isAttendanceRunning) {
        showNotification('Please start attendance first', 'warning');
        return;
    }

    const names = ['John Doe', 'Jane Smith', 'Mike Johnson', 'Emily Davis'];
    const randomName = names[Math.floor(Math.random() * names.length)];
    const initials = randomName.split(' ').map(n => n[0]).join('');

    showNotification(`Face recognized: ${randomName}`, 'success');

    // Add to attendance table
    const tableBody = document.getElementById('attendanceData');
    if (tableBody) {
        const now = new Date();
        const row = document.createElement('tr');
        row.classList.add('fade-in');
        row.innerHTML = `
            <td>
                <div class="student-info">
                    <div class="student-avatar">${initials}</div>
                    <div>
                        <div class="student-name">${randomName}</div>
                        <div class="student-id">CSE00${Math.floor(Math.random() * 100)}</div>
                    </div>
                </div>
            </td>
            <td>${formatDate(now.toISOString().split('T')[0])}</td>
            <td>${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</td>
            <td>
                <span class="status-badge present">
                    ✓ Present
                </span>
            </td>
        `;
        tableBody.insertBefore(row, tableBody.firstChild);
    }
}
