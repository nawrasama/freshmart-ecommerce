// Notification system
class NotificationSystem {
    constructor() {
        this.notification = document.getElementById('notification');
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Close button event
        if (this.notification) {
            const closeBtn = this.notification.querySelector('.close-btn');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => this.hide());
            }
        }
    }

    show(message, type = 'info', duration = 5000) {
        if (!this.notification) {
            console.error('Notification element not found');
            return;
        }

        // Set message and type
        const messageEl = this.notification.querySelector('.message');
        const iconEl = this.notification.querySelector('.icon');
        
        if (messageEl) messageEl.textContent = message;
        
        // Set icon based on type
        let icon = 'ℹ️';
        switch(type) {
            case 'success':
                icon = '✅';
                break;
            case 'error':
                icon = '❌';
                break;
            case 'warning':
                icon = '⚠️';
                break;
            case 'info':
            default:
                icon = 'ℹ️';
        }
        if (iconEl) iconEl.textContent = icon;

        // Set type class
        this.notification.className = 'notification';
        this.notification.classList.add(type, 'show');

        // Auto hide after duration
        if (duration > 0) {
            setTimeout(() => this.hide(), duration);
        }
    }

    hide() {
        if (this.notification) {
            this.notification.classList.remove('show');
        }
    }
}

// Global notification function
function showNotification(message, type = 'info', duration = 5000) {
    if (!window.notificationSystem) {
        window.notificationSystem = new NotificationSystem();
    }
    window.notificationSystem.show(message, type, duration);
}

// Initialize notification system when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.notificationSystem = new NotificationSystem();
    console.log('🔔 Notification system initialized');
});