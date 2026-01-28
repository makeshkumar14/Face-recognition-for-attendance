/**
 * FaceAttend - Face Recognition Attendance System
 * Main JavaScript file for handling UI interactions
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize button event listeners
    initializeButtons();
    
    // Add parallax effect to orbs
    initializeParallax();
    
    // Add intersection observer for scroll animations
    initializeScrollAnimations();
});

/**
 * Initialize button click handlers
 */
function initializeButtons() {
    const btnRegister = document.getElementById('btn-register');
    const btnAttendance = document.getElementById('btn-attendance');
    const btnView = document.getElementById('btn-view');
    
    if (btnRegister) {
        btnRegister.addEventListener('click', () => {
            handleButtonClick('register', 'Navigating to student registration...');
        });
    }
    
    if (btnAttendance) {
        btnAttendance.addEventListener('click', () => {
            handleButtonClick('attendance', 'Starting attendance capture...');
        });
    }
    
    if (btnView) {
        btnView.addEventListener('click', () => {
            handleButtonClick('view', 'Loading attendance records...');
        });
    }
}

/**
 * Handle button click with visual feedback
 * @param {string} action - The action type
 * @param {string} message - Feedback message
 */
function handleButtonClick(action, message) {
    // Create ripple effect
    const button = document.getElementById(`btn-${action}`);
    createRipple(button);
    
    // Show feedback notification
    showNotification(message);
    
    // Log action (can be replaced with actual navigation/functionality)
    console.log(`Action triggered: ${action}`);
    
    // Placeholder for future navigation
    // window.location.href = `/${action}.html`;
}

/**
 * Create ripple effect on button click
 * @param {HTMLElement} button - The clicked button
 */
function createRipple(button) {
    const ripple = document.createElement('span');
    ripple.classList.add('ripple');
    
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${event.clientY - rect.top - size / 2}px`;
    
    button.appendChild(ripple);
    
    ripple.addEventListener('animationend', () => {
        ripple.remove();
    });
}

/**
 * Show notification toast
 * @param {string} message - The message to display
 */
function showNotification(message) {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.classList.add('notification');
    notification.innerHTML = `
        <div class="notification-content">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.709 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.7649 14.1003 1.98232 16.07 2.85999" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M22 4L12 14.01L9 11.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Trigger animation
    requestAnimationFrame(() => {
        notification.classList.add('show');
    });
    
    // Remove after delay
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

/**
 * Initialize parallax effect for background orbs
 */
function initializeParallax() {
    const orbs = document.querySelectorAll('.orb');
    
    document.addEventListener('mousemove', (e) => {
        const mouseX = e.clientX / window.innerWidth - 0.5;
        const mouseY = e.clientY / window.innerHeight - 0.5;
        
        orbs.forEach((orb, index) => {
            const speed = (index + 1) * 20;
            const x = mouseX * speed;
            const y = mouseY * speed;
            
            orb.style.transform = `translate(${x}px, ${y}px)`;
        });
    });
}

/**
 * Initialize scroll-based animations using Intersection Observer
 */
function initializeScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe elements that should animate on scroll
    const animateElements = document.querySelectorAll('.card, .stat-item');
    animateElements.forEach(el => observer.observe(el));
}

// Add dynamic CSS for notifications and ripple effect
const dynamicStyles = document.createElement('style');
dynamicStyles.textContent = `
    .notification {
        position: fixed;
        bottom: 30px;
        right: 30px;
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 16px;
        padding: 16px 24px;
        z-index: 1000;
        transform: translateX(120%);
        transition: transform 0.3s ease;
    }
    
    .notification.show {
        transform: translateX(0);
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 12px;
        color: white;
        font-weight: 500;
    }
    
    .notification-content svg {
        width: 24px;
        height: 24px;
        color: #4facfe;
    }
    
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        transform: scale(0);
        animation: ripple-effect 0.6s linear;
        pointer-events: none;
    }
    
    @keyframes ripple-effect {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    .animate-in {
        animation: fadeInUp 0.6s ease forwards;
    }
`;
document.head.appendChild(dynamicStyles);
