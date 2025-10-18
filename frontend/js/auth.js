// frontend/js/auth-frontend.js
// Authentication functionality - FRONTEND ONLY

const API_BASE = 'http://localhost:3001/api';

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        console.log('🔐 Initializing Auth Manager...');
        this.setupEventListeners();
        this.checkAuthStatus();
        this.setupAutoLogout();
    }

    setupEventListeners() {
        // Login/Register modal buttons
        document.getElementById('loginBtn').addEventListener('click', () => this.handleAuthButtonClick());
        document.getElementById('registerBtn').addEventListener('click', () => this.openRegisterModal());
        
        // Modal switches
        document.getElementById('switchToRegister').addEventListener('click', (e) => {
            e.preventDefault();
            this.switchToRegister();
        });
        
        document.getElementById('switchToLogin').addEventListener('click', (e) => {
            e.preventDefault();
            this.switchToLogin();
        });

        // Form submissions
        document.getElementById('loginForm').addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('registerForm').addEventListener('submit', (e) => this.handleRegister(e));

        // Modal close events
        this.setupModalCloseEvents();
    }

    setupModalCloseEvents() {
        // Close buttons
        document.querySelectorAll('.modal .close').forEach(button => {
            button.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                this.closeModal(modal.id);
            });
        });

        // Close on background click
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal(e.target.id);
            }
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
    }

    handleAuthButtonClick() {
        const token = localStorage.getItem('authToken');
        
        if (token && this.isTokenValid()) {
            this.showLogoutConfirmation();
        } else {
            this.openLoginModal();
        }
    }

    showLogoutConfirmation() {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const userName = user.name || 'User';
        
        // Create custom confirmation modal
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'block';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 400px;">
                <h3>Confirm Logout</h3>
                <p>Are you sure you want to logout, ${userName}?</p>
                <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
                    <button id="confirmLogout" style="flex: 1; background: #e74c3c;">Yes, Logout</button>
                    <button id="cancelLogout" style="flex: 1; background: #95a5a6;">Cancel</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Add event listeners
        document.getElementById('confirmLogout').addEventListener('click', () => {
            this.logout();
            document.body.removeChild(modal);
        });

        document.getElementById('cancelLogout').addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        // Close on background click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }

    openLoginModal() {
        this.closeAllModals();
        document.getElementById('loginModal').style.display = 'block';
        document.getElementById('loginForm').reset();
        
        // Focus on first input
        setTimeout(() => {
            const firstInput = document.querySelector('#loginForm input');
            if (firstInput) firstInput.focus();
        }, 100);
    }

    openRegisterModal() {
        this.closeAllModals();
        document.getElementById('registerModal').style.display = 'block';
        document.getElementById('registerForm').reset();
        
        // Focus on first input
        setTimeout(() => {
            const firstInput = document.querySelector('#registerForm input');
            if (firstInput) firstInput.focus();
        }, 100);
    }

    switchToRegister() {
        document.getElementById('loginModal').style.display = 'none';
        this.openRegisterModal();
    }

    switchToLogin() {
        document.getElementById('registerModal').style.display = 'none';
        this.openLoginModal();
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
        }
    }

    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
    }

    async handleLogin(e) {
        e.preventDefault();
        console.log('🔑 Processing login...');

        const formData = new FormData(e.target);
        const email = formData.get('email');
        const password = formData.get('password');

        console.log('📋 Login form values:', { email, password: password ? '***' : null });

        // FIX: Add null checks
        if (!email || !password) {
            showNotification('Please fill in all fields', 'error');
            return;
        }

        // Validation
        if (!this.validateLoginForm(email, password)) {
            return;
        }

        try {
            // Show loading state
            this.setFormLoadingState(e.target, true);

            const response = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    email: email, 
                    password 
                })
            });

            const data = await response.json();
            console.log('📨 Login response:', data);

            if (data.success) {
                this.loginSuccess(data);
                e.target.reset();
            } else {
                this.loginFailure(data.message);
            }
        } catch (error) {
            console.error('❌ Login error:', error);
            this.loginFailure('Network error. Please check your connection.');
        } finally {
            this.setFormLoadingState(e.target, false);
        }
    }

    validateLoginForm(email, password) {
        if (!email || !password) {
            showNotification('Please fill in all fields', 'error');
            return false;
        }

        if (!this.isValidEmail(email)) {
            showNotification('Please enter a valid email address', 'error');
            return false;
        }

        return true;
    }

    async handleRegister(e) {
        e.preventDefault();
        console.log('📝 Processing registration...');

        const formData = new FormData(e.target);
        const name = formData.get('name');
        const email = formData.get('email');
        const password = formData.get('password');
        const confirmPassword = formData.get('confirmPassword');

        console.log('📋 Form values:', { name, email, password: password ? '***' : null, confirmPassword: confirmPassword ? '***' : null });

        // FIX: Simple validation without trim()
        if (!name || !email || !password || !confirmPassword) {
            showNotification('Please fill in all fields', 'error');
            return;
        }

        if (name.length < 2) {
            showNotification('Name must be at least 2 characters long', 'error');
            return;
        }

        if (!this.isValidEmail(email)) {
            showNotification('Please enter a valid email address', 'error');
            return;
        }

        if (password.length < 6) {
            showNotification('Password must be at least 6 characters long', 'error');
            return;
        }

        if (password !== confirmPassword) {
            showNotification('Passwords do not match', 'error');
            return;
        }

        try {
            // Show loading state
            this.setFormLoadingState(e.target, true);

            const response = await fetch(`${API_BASE}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email, password })
            });

            const data = await response.json();
            console.log('📨 Registration response:', data);

            if (data.success) {
                this.registrationSuccess(data);
                e.target.reset();
            } else {
                this.registrationFailure(data.message);
            }
        } catch (error) {
            console.error('❌ Registration error:', error);
            this.registrationFailure('Network error. Please check your connection.');
        } finally {
            this.setFormLoadingState(e.target, false);
        }
    }

    setFormLoadingState(form, isLoading) {
        const submitButton = form.querySelector('button[type="submit"]');
        const inputs = form.querySelectorAll('input');
        
        if (isLoading) {
            submitButton.disabled = true;
            submitButton.innerHTML = '<div class="loading-spinner"></div> Processing...';
            inputs.forEach(input => input.disabled = true);
        } else {
            submitButton.disabled = false;
            submitButton.textContent = form.id === 'loginForm' ? 'Login' : 'Register';
            inputs.forEach(input => input.disabled = false);
        }
    }

    loginSuccess(data) {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('loginTime', new Date().toISOString());
        
        this.currentUser = data.user;
        this.updateUI();
        this.closeAllModals();
        
        showNotification(`Welcome back, ${data.user.name}! 🎉`, 'success');
        console.log('✅ Login successful:', data.user.name);
        
        // Trigger any login-related callbacks
        this.onLoginSuccess();
    }

    loginFailure(message) {
        showNotification(message || 'Login failed. Please check your credentials.', 'error');
        
        // Shake animation for error
        const loginForm = document.getElementById('loginForm');
        loginForm.classList.add('shake');
        setTimeout(() => loginForm.classList.remove('shake'), 500);
    }

    registrationSuccess(data) {
        showNotification('Account created successfully! Please login.', 'success');
        this.switchToLogin();
        console.log('✅ Registration successful');
    }

    registrationFailure(message) {
        showNotification(message || 'Registration failed. Please try again.', 'error');
    }

    logout() {
        const user = this.currentUser;
        
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        localStorage.removeItem('loginTime');
        this.currentUser = null;
        
        this.updateUI();
        showNotification('Logged out successfully. See you soon! 👋', 'info');
        console.log('✅ Logout successful');
        
        // Trigger any logout-related callbacks
        this.onLogoutSuccess();
    }

    updateUI() {
        const loginBtn = document.getElementById('loginBtn');
        const registerBtn = document.getElementById('registerBtn');
        const user = this.currentUser || JSON.parse(localStorage.getItem('user') || '{}');

        if (this.isLoggedIn()) {
            loginBtn.textContent = `Logout (${user.name || 'User'})`;
            loginBtn.title = 'Click to logout';
            loginBtn.classList.add('logged-in');
            
            if (registerBtn) {
                registerBtn.style.display = 'none';
            }
        } else {
            loginBtn.textContent = 'Login';
            loginBtn.title = 'Click to login';
            loginBtn.classList.remove('logged-in');
            
            if (registerBtn) {
                registerBtn.style.display = 'block';
            }
        }
    }

    checkAuthStatus() {
        const token = localStorage.getItem('authToken');
        
        if (token && this.isTokenValid()) {
            this.currentUser = JSON.parse(localStorage.getItem('user') || '{}');
            this.updateUI();
            console.log('✅ User is authenticated:', this.currentUser.name);
        } else {
            this.clearInvalidSession();
            console.log('❌ No valid session found');
        }
    }

    isTokenValid() {
        const loginTime = localStorage.getItem('loginTime');
        if (!loginTime) return false;

        const loginDate = new Date(loginTime);
        const now = new Date();
        const hoursDiff = (now - loginDate) / (1000 * 60 * 60);

        // Token expires after 24 hours
        return hoursDiff < 24;
    }

    clearInvalidSession() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        localStorage.removeItem('loginTime');
        this.currentUser = null;
        this.updateUI();
    }

    setupAutoLogout() {
        // Check token validity every minute
        setInterval(() => {
            if (this.isLoggedIn() && !this.isTokenValid()) {
                console.log('🕒 Session expired, auto-logging out...');
                this.logout();
                showNotification('Your session has expired. Please login again.', 'warning');
            }
        }, 60000); // Check every minute
    }

    isLoggedIn() {
        return !!(localStorage.getItem('authToken') && this.isTokenValid());
    }

    getCurrentUser() {
        return this.currentUser;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Event callbacks (can be overridden)
    onLoginSuccess() {
        // Override this method to add custom login success behavior
        console.log('🔔 Login success callback triggered');
    }

    onLogoutSuccess() {
        // Override this method to add custom logout success behavior
        console.log('🔔 Logout success callback triggered');
    }
}

// Enhanced notification system
function showNotification(message, type = 'info', duration = 4000) {
    // Remove existing notifications of the same type if needed
    const existingNotifications = document.querySelectorAll('.custom-notification');
    if (existingNotifications.length > 2) {
        existingNotifications[0].remove();
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `custom-notification ${type}`;
    
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };

    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${icons[type] || icons.info}</span>
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;

    document.body.appendChild(notification);

    // Animate in
    requestAnimationFrame(() => {
        notification.classList.add('show');
    });

    // Auto remove after duration
    if (duration > 0) {
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, duration);
    }

    return notification;
}

// Initialize Auth Manager when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.authManager = new AuthManager();
    console.log('🚀 Auth Manager initialized');
});