console.log('🔄 FreshMart app initialized');

// API Configuration
const API_BASE = 'http://localhost:3001/api';

// Main application logic
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the application
    initApp();
});

async function initApp() {
    console.log('🚀 Initializing FreshMart application...');
    
    try {
        // Load products from the backend
        await loadProducts();
        
        // Set up event listeners
        setupEventListeners();
        
        // Load cart from localStorage
        loadCartFromStorage();
        
        // Check authentication status
        checkAuthStatus();
        
        // Show welcome notification
        setTimeout(() => {
            showNotification('Welcome to FreshMart! Enjoy your shopping experience.', 'info', 4000);
        }, 1000);
        
        console.log('✅ Application initialized successfully');
    } catch (error) {
        console.error('❌ Error initializing application:', error);
        showNotification('Error initializing application. Please refresh the page.', 'error');
    }
}

async function loadProducts() {
    console.log('📦 Loading products...');
    
    try {
        const response = await fetch(`${API_BASE}/products`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const products = await response.json();
        console.log('✅ Products loaded successfully:', products.length);
        
        displayProducts(products);
    } catch (error) {
        console.error('❌ Error loading products from backend:', error);
        console.log('🔄 Using sample products as fallback...');
        
        // Fallback to sample data if backend is not available
        const sampleProducts = getSampleProducts();
        displayProducts(sampleProducts);
        
        showNotification('Using demo products. Backend connection failed.', 'warning');
    }
}

function getSampleProducts() {
    console.log('🎭 Generating sample products...');
    
    const placeholderImage = "https://via.placeholder.com/300x200/2ecc71/ffffff?text=FreshMart";
    
    return [
        {
            id: 1,
            name: "Munchee Super Cream Cracker 490g",
            description: "Delicious cream crackers perfect for snacks with tea or coffee. Made with high-quality ingredients.",
            price: 230.00,
            stock: 10,
            category: "Food & Refreshment",
            image: "images/bis.png",
            hasOffer: true,
            offerText: "10% OFF"
        },
        {
            id: 2,
            name: "Sunlight Matic Liquid 1L",
            description: "Advanced laundry liquid specifically designed for washing machines. Removes tough stains effectively.",
            price: 480.00,
            stock: 5,
            category: "Home Care",
            image: "images/sun.png",
            hasOffer: false
        },
        {
            id: 3,
            name: "Vim Anti-Bacterial Dishwash Liquid 500mL",
            description: "Powerful anti-bacterial dishwashing liquid that kills 99.9% germs. Gentle on hands.",
            price: 575.00,
            stock: 0,
            category: "Home Care",
            image: "images/vim.png",
            hasOffer: true,
            offerText: "Buy 1 Get 1 Free"
        },
        {
            id: 4,
            name: "Kist Mixed Fruit Jam 450g",
            description: "Delicious mixed fruit jam made from fresh fruits. Perfect for breakfast with bread or toast.",
            price: 320.00,
            stock: 8,
            category: "Food & Refreshment",
            image: "images/jam.png",
            hasOffer: false
        },
        {
            id: 5,
            name: "Elephant House Cream Soda 500mL",
            description: "Refreshing cream soda beverage with a unique flavor. Perfect for hot days.",
            price: 120.00,
            stock: 15,
            category: "Food & Refreshment",
            image: "images/soda.png",
            hasOffer: true,
            offerText: "15% OFF"
        },
        {
            id: 6,
            name: "Anchor Full Cream Milk Powder 400g",
            description: "High-quality full cream milk powder rich in calcium and vitamins. Great for cooking and drinking.",
            price: 420.00,
            stock: 12,
            category: "Food & Refreshment",
            image: "images/anc.png",
            hasOffer: false
        },
        {
            id: 7,
            name: "Maggi Chicken Noodles 70g",
            description: "Instant noodles with delicious chicken flavor. Ready in just 2 minutes.",
            price: 85.00,
            stock: 20,
            category: "Food & Refreshment",
            image: "images/mag.png",
            hasOffer: true,
            offerText: "Bundle Offer"
        },
        {
            id: 8,
            name: "Dettol Original Soap 125g",
            description: "Antibacterial protection soap that kills germs and keeps you fresh all day.",
            price: 180.00,
            stock: 8,
            category: "Beauty & Personal Care",
            image: "images/det.png",
            hasOffer: false
        }
    ];
}

function displayProducts(products) {
    console.log('🖼️ Displaying products:', products.length);
    
    const productsGrid = document.getElementById('productsGrid');
    
    if (!productsGrid) {
        console.error('❌ Products grid element not found');
        return;
    }
    
    productsGrid.innerHTML = '';
    
    if (products.length === 0) {
        productsGrid.innerHTML = `
            <div class="no-products">
                <h3>No products found</h3>
                <p>Try adjusting your search or filter criteria</p>
            </div>
        `;
        return;
    }
    
    products.forEach(product => {
        const productCard = createProductCard(product);
        productsGrid.appendChild(productCard);
    });
    
    console.log('✅ Products displayed successfully');
}

function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    const inStock = product.stock > 0;
    const buttonText = inStock ? 'Add To Cart' : 'Out Of Stock';
    const buttonClass = inStock ? 'add-to-cart' : 'out-of-stock';
    
    // Use placeholder if image fails to load
    const placeholder = "https://via.placeholder.com/300x200/ecf0f1/7f8c8d?text=Product+Image";
    
    card.innerHTML = `
        ${product.hasOffer ? `<div class="product-badge">${product.offerText}</div>` : ''}
        <img src="${product.image}" alt="${product.name}" class="product-image" 
             onerror="this.src='${placeholder}'">
        <h3>${product.name}</h3>
        <p>${product.description}</p>
        <div class="product-meta">
            <div class="product-price">Rs. ${product.price.toFixed(2)}</div>
            <div class="product-category">${product.category}</div>
        </div>
        <div class="product-actions">
            <button class="${buttonClass}" data-id="${product.id}" ${!inStock ? 'disabled' : ''}>
                ${buttonText}
            </button>
            <button class="view-details" data-id="${product.id}">
                View Details
            </button>
        </div>
    `;
    
    return card;
}

function setupEventListeners() {
    console.log('🔗 Setting up event listeners...');
    
    // Product filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            console.log('🔍 Filtering products:', this.dataset.filter);
            
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            filterProducts(this.dataset.filter);
        });
    });
    
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', function(e) {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                const searchTerm = e.target.value.toLowerCase().trim();
                console.log('🔎 Searching for:', searchTerm);
                searchProducts(searchTerm);
            }, 300);
        });
    }
    
    // Add to cart buttons (delegated event handling)
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('add-to-cart')) {
            const productId = parseInt(e.target.dataset.id);
            console.log('🛒 Adding to cart:', productId);
            addToCart(productId);
        }
        
        if (e.target.classList.contains('view-details')) {
            const productId = parseInt(e.target.dataset.id);
            console.log('🔍 Viewing details:', productId);
            showProductDetails(productId);
        }
        
        // Handle logout
        if (e.target.id === 'loginBtn' && e.target.textContent === 'Logout') {
            console.log('🚪 Logging out...');
            handleLogout();
        }
    });
    
    // Modal functionality
    setupModalEvents();
    
    // Form submissions
    setupFormHandlers();
    
    // Other event listeners
    setupAdditionalEvents();
    
    console.log('✅ Event listeners setup complete');
}

function setupModalEvents() {
    // Modal open buttons
    document.getElementById('loginBtn').addEventListener('click', function() {
        if (this.textContent === 'Login') {
            openModal('loginModal');
        }
    });
    
    document.getElementById('registerBtn').addEventListener('click', function() {
        openModal('registerModal');
    });
    
    document.getElementById('cartBtn').addEventListener('click', function() {
        updateCartDisplay();
        openModal('cartModal');
    });
    
    // Modal close buttons
    const closeButtons = document.querySelectorAll('.close');
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            closeModal(modal.id);
        });
    });
    
    // Modal background close
    window.addEventListener('click', function(e) {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (e.target === modal) {
                closeModal(modal.id);
            }
        });
    });
    
    // Login/Register modal switches
    document.getElementById('switchToRegister').addEventListener('click', function(e) {
        e.preventDefault();
        switchModal('loginModal', 'registerModal');
    });
    
    document.getElementById('switchToLogin').addEventListener('click', function(e) {
        e.preventDefault();
        switchModal('registerModal', 'loginModal');
    });
}

function setupFormHandlers() {
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Register form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    // Cookie acceptance
    const acceptCookies = document.getElementById('acceptCookies');
    if (acceptCookies) {
        acceptCookies.addEventListener('click', function() {
            localStorage.setItem('cookiesAccepted', 'true');
            showNotification('Thank you for accepting our cookies!', 'success');
            this.style.display = 'none';
        });
    }
}

function setupAdditionalEvents() {
    // CTA button
    const ctaButton = document.querySelector('.cta-button');
    if (ctaButton) {
        ctaButton.addEventListener('click', function() {
            document.querySelector('.products').scrollIntoView({ 
                behavior: 'smooth' 
            });
            showNotification('Exploring our products...', 'info');
        });
    }
    
    // Checkout button
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', handleCheckout);
    }
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
        console.log('📱 Opened modal:', modalId);
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        console.log('📱 Closed modal:', modalId);
    }
}

function switchModal(fromModalId, toModalId) {
    closeModal(fromModalId);
    openModal(toModalId);
}

function filterProducts(filter) {
    console.log('🔧 Filtering products by:', filter);
    
    // Get all products (in a real app, this would come from the backend)
    const products = getSampleProducts();
    let filteredProducts = products;
    
    switch(filter) {
        case 'in-stock':
            filteredProducts = products.filter(product => product.stock > 0);
            break;
        case 'offers':
            filteredProducts = products.filter(product => product.hasOffer);
            break;
        case 'all':
        default:
            // Show all products
            break;
    }
    
    displayProducts(filteredProducts);
    showNotification(`Showing ${filteredProducts.length} products`, 'info');
}

function searchProducts(searchTerm) {
    const products = getSampleProducts();
    
    if (!searchTerm) {
        displayProducts(products);
        return;
    }
    
    const filteredProducts = products.filter(product => 
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm) ||
        product.category.toLowerCase().includes(searchTerm)
    );
    
    displayProducts(filteredProducts);
    
    if (filteredProducts.length === 0) {
        showNotification('No products found matching your search', 'info');
    }
}

async function showProductDetails(productId) {
    console.log('🔍 Loading product details for:', productId);
    
    try {
        // Try to fetch from backend first
        const response = await fetch(`${API_BASE}/products/${productId}`);
        
        let product;
        if (response.ok) {
            product = await response.json();
        } else {
            // Fallback to sample data
            const sampleProducts = getSampleProducts();
            product = sampleProducts.find(p => p.id === productId);
        }
        
        if (!product) {
            throw new Error('Product not found');
        }
        
        displayProductModal(product);
        
    } catch (error) {
        console.error('❌ Error loading product details:', error);
        
        // Fallback to sample data
        const sampleProducts = getSampleProducts();
        const product = sampleProducts.find(p => p.id === productId);
        
        if (product) {
            displayProductModal(product);
        } else {
            showNotification('Error loading product details', 'error');
        }
    }
}

function displayProductModal(product) {
    const modal = document.getElementById('productModal');
    const details = document.getElementById('productDetails');
    
    if (!modal || !details) {
        console.error('❌ Product modal elements not found');
        return;
    }
    
    const inStock = product.stock > 0;
    const placeholder = "https://via.placeholder.com/400x300/ecf0f1/7f8c8d?text=Product+Image";
    
    details.innerHTML = `
        <div class="product-details">
            ${product.hasOffer ? `<div class="product-badge large">${product.offerText}</div>` : ''}
            <img src="${product.image}" alt="${product.name}" class="product-details-image" 
                 onerror="this.src='${placeholder}'">
            <h2>${product.name}</h2>
            <div class="price">Rs. ${product.price.toFixed(2)}</div>
            <p class="description">${product.description}</p>
            <div class="product-info">
                <p><strong>Category:</strong> ${product.category}</p>
                <p><strong>Stock:</strong> 
                    <span class="${inStock ? 'in-stock' : 'out-of-stock'}">
                        ${inStock ? `${product.stock} available` : 'Out of Stock'}
                    </span>
                </p>
            </div>
            <div class="product-actions">
                <button class="${inStock ? 'add-to-cart large' : 'out-of-stock large'}" 
                        data-id="${product.id}" 
                        ${!inStock ? 'disabled' : ''}>
                    ${inStock ? 'Add To Cart' : 'Out Of Stock'}
                </button>
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
    
    // Add event listener for the add to cart button in the modal
    const addToCartBtn = details.querySelector('.add-to-cart');
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', function() {
            addToCart(product.id);
            closeModal('productModal');
        });
    }
}

// Authentication functions
function checkAuthStatus() {
    const token = localStorage.getItem('authToken');
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    
    if (!loginBtn) return;
    
    if (token) {
        // User is logged in
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        loginBtn.textContent = `Logout (${user.name || 'User'})`;
        loginBtn.title = 'Click to logout';
        
        if (registerBtn) {
            registerBtn.style.display = 'none';
        }
        
        console.log('🔐 User is logged in:', user.name);
    } else {
        // User is not logged in
        loginBtn.textContent = 'Login';
        loginBtn.title = 'Click to login';
        
        if (registerBtn) {
            registerBtn.style.display = 'block';
        }
        
        console.log('🔓 User is not logged in');
    }
}

function handleLogout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    showNotification('Logged out successfully', 'success');
    checkAuthStatus();
}

// Handle login form submission
async function handleLogin(e) {
    e.preventDefault();
    console.log('🔑 Login form submitted');
    
    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');
    
    // Basic validation
    if (!email || !password) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    if (!isValidEmail(email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }
    
    try {
        console.log('📡 Sending login request...');
        
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        console.log('📨 Login response:', data);
        
        if (data.success) {
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            showNotification(`Welcome back, ${data.user.name}!`, 'success');
            closeModal('loginModal');
            checkAuthStatus();
            e.target.reset();
        } else {
            showNotification(data.message || 'Login failed. Please check your credentials.', 'error');
        }
    } catch (error) {
        console.error('❌ Login error:', error);
        showNotification('Login failed. Please check your connection and try again.', 'error');
    }
}

// Handle register form submission
async function handleRegister(e) {
    e.preventDefault();
    console.log('📝 Register form submitted');
    
    const formData = new FormData(e.target);
    const name = formData.get('name');
    const email = formData.get('email');
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');
    
    console.log('📋 Form data:', { name, email, password, confirmPassword });
    
    // Validation
    if (!name || !email || !password || !confirmPassword) {
        console.log('❌ Missing fields');
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        console.log('❌ Passwords do not match');
        showNotification('Passwords do not match', 'error');
        return;
    }
    
    if (password.length < 6) {
        console.log('❌ Password too short');
        showNotification('Password must be at least 6 characters long', 'error');
        return;
    }
    
    try {
        console.log('🔄 Sending registration request...');
        const response = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password })
        });
        
        console.log('📨 Response status:', response.status);
        const data = await response.json();
        console.log('📨 Response data:', data);
        
        if (data.success) {
            showNotification(data.message, 'success');
            document.getElementById('registerModal').style.display = 'none';
            document.getElementById('loginModal').style.display = 'block';
            e.target.reset();
        } else {
            showNotification(data.message || 'Registration failed', 'error');
        }
    } catch (error) {
        console.error('❌ Registration error:', error);
        showNotification('Registration failed. Please check your connection.', 'error');
    }
}

// Utility functions
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Cart functions (to be implemented in cart.js)
function loadCartFromStorage() {
    // This will be implemented in cart.js
    console.log('🛒 Loading cart from storage...');
}

function addToCart(productId) {
    // This will be implemented in cart.js
    console.log('🛒 Adding product to cart:', productId);
    showNotification('Product added to cart!', 'success');
}

function updateCartDisplay() {
    // This will be implemented in cart.js
    console.log('🛒 Updating cart display...');
}

function handleCheckout() {
    console.log('💳 Handling checkout...');
    
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    if (cart.length === 0) {
        showNotification('Your cart is empty', 'warning');
        return;
    }
    
    // Check if user is logged in
    const token = localStorage.getItem('authToken');
    if (!token) {
        showNotification('Please login to proceed with checkout', 'warning');
        openModal('loginModal');
        return;
    }
    
    showNotification('Proceeding to checkout...', 'info');
    
    // Simulate checkout process
    setTimeout(() => {
        showNotification('Order placed successfully! Thank you for your purchase.', 'success');
        closeModal('cartModal');
        
        // Clear cart after successful checkout
        localStorage.removeItem('cart');
        updateCartDisplay();
    }, 2000);
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

// Error handling
window.addEventListener('error', function(e) {
    console.error('🚨 Global error:', e.error);
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('🚨 Unhandled promise rejection:', e.reason);
});

console.log('✅ app.js loaded successfully');