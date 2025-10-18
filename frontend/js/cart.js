// Shopping cart functionality
class CartManager {
    constructor() {
        this.cart = [];
        this.init();
    }

    init() {
        console.log('🛒 Initializing Cart Manager...');
        this.loadCartFromStorage();
        this.setupEventListeners();
        this.updateCartUI();
    }

    setupEventListeners() {
        // Cart modal button
        const cartBtn = document.getElementById('cartBtn');
        if (cartBtn) {
            cartBtn.addEventListener('click', () => this.openCartModal());
        }
        
        // Checkout button
        const checkoutBtn = document.getElementById('checkoutBtn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => this.handleCheckout());
        }
        
        // Close cart modal events
        this.setupCartModalEvents();
    }

    setupCartModalEvents() {
        const cartModal = document.getElementById('cartModal');
        if (!cartModal) return;
        
        // Close button
        const closeBtn = cartModal.querySelector('.close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeCartModal());
        }
        
        // Close on background click
        cartModal.addEventListener('click', (e) => {
            if (e.target === cartModal) {
                this.closeCartModal();
            }
        });
        
        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && cartModal.style.display === 'block') {
                this.closeCartModal();
            }
        });
    }

    loadCartFromStorage() {
        try {
            const savedCart = localStorage.getItem('freshmart_cart');
            if (savedCart) {
                this.cart = JSON.parse(savedCart);
                console.log('📦 Cart loaded from storage:', this.cart.length, 'items');
            }
        } catch (error) {
            console.error('❌ Error loading cart from storage:', error);
            this.cart = [];
        }
    }

    saveCartToStorage() {
        try {
            localStorage.setItem('freshmart_cart', JSON.stringify(this.cart));
        } catch (error) {
            console.error('❌ Error saving cart to storage:', error);
        }
    }

    async addToCart(productId, quantity = 1) {
        console.log('➕ Adding to cart:', productId, 'Quantity:', quantity);
        
        try {
            // Try to get product from backend
            const product = await this.fetchProduct(productId);
            
            if (!product) {
                showNotification('Product not found', 'error');
                return false;
            }

            if (product.stock === 0) {
                showNotification('Sorry, this product is out of stock', 'warning');
                return false;
            }

            const existingItem = this.cart.find(item => item.id === productId);
            const currentQuantity = existingItem ? existingItem.quantity : 0;
            const newQuantity = currentQuantity + quantity;

            // Check stock availability
            if (newQuantity > product.stock) {
                showNotification(`Sorry, only ${product.stock} items available in stock`, 'warning');
                return false;
            }

            if (existingItem) {
                existingItem.quantity = newQuantity;
            } else {
                this.cart.push({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    quantity: quantity,
                    image: product.image,
                    stock: product.stock,
                    category: product.category
                });
            }

            this.saveCartToStorage();
            this.updateCartUI();
            
            showNotification(`${product.name} added to cart! 🛒`, 'success');
            this.animateAddToCart(productId);
            
            return true;

        } catch (error) {
            console.error('❌ Error adding to cart:', error);
            return this.addToCartFallback(productId, quantity);
        }
    }

    async fetchProduct(productId) {
        try {
            const response = await fetch(`http://localhost:3001/api/products/${productId}`);
            if (!response.ok) throw new Error('Product not found');
            return await response.json();
        } catch (error) {
            console.log('🔄 Using fallback product data...');
            return this.getSampleProduct(productId);
        }
    }

    getSampleProduct(productId) {
        const sampleProducts = this.getSampleProducts();
        return sampleProducts.find(p => p.id === productId);
    }

    getSampleProducts() {
        return [
            {
                id: 1,
                name: "Organic Bananas",
                price: 250.00,
                stock: 10,
                image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=880&q=80",
                category: "Food & Refreshment"
            },
            {
                id: 2,
                name: "Fresh Milk",
                price: 320.00,
                stock: 15,
                image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=715&q=80",
                category: "Food & Refreshment"
            },
            {
                id: 3,
                name: "Whole Wheat Bread",
                price: 180.00,
                stock: 0,
                image: "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80",
                category: "Food & Refreshment"
            },
            {
                id: 4,
                name: "Free Range Eggs",
                price: 420.00,
                stock: 8,
                image: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80",
                category: "Food & Refreshment"
            },
            {
                id: 5,
                name: "Organic Tomatoes",
                price: 180.00,
                stock: 12,
                image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80",
                category: "Food & Refreshment"
            },
            {
                id: 6,
                name: "Greek Yogurt",
                price: 380.00,
                stock: 6,
                image: "images/greek.jpg",
                category: "Food & Refreshment"
            }
        ];
    }

    addToCartFallback(productId, quantity) {
        const product = this.getSampleProduct(productId);
        
        if (!product) {
            showNotification('Product not found', 'error');
            return false;
        }

        if (product.stock === 0) {
            showNotification('Sorry, this product is out of stock', 'warning');
            return false;
        }

        const existingItem = this.cart.find(item => item.id === productId);
        const currentQuantity = existingItem ? existingItem.quantity : 0;
        const newQuantity = currentQuantity + quantity;

        if (newQuantity > product.stock) {
            showNotification(`Sorry, only ${product.stock} items available in stock`, 'warning');
            return false;
        }

        if (existingItem) {
            existingItem.quantity = newQuantity;
        } else {
            this.cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                quantity: quantity,
                image: product.image,
                stock: product.stock,
                category: product.category
            });
        }

        this.saveCartToStorage();
        this.updateCartUI();
        
        showNotification(`${product.name} added to cart! 🛒`, 'success');
        this.animateAddToCart(productId);
        
        return true;
    }

    removeFromCart(productId) {
        console.log('🗑️ Removing from cart:', productId);
        
        const item = this.cart.find(item => item.id === productId);
        if (item) {
            this.cart = this.cart.filter(item => item.id !== productId);
            this.saveCartToStorage();
            this.updateCartUI();
            
            showNotification(`${item.name} removed from cart`, 'info');
        }
    }

    updateQuantity(productId, newQuantity) {
        if (newQuantity < 1) {
            this.removeFromCart(productId);
            return;
        }

        const item = this.cart.find(item => item.id === productId);
        if (item) {
            // Check stock limit
            if (newQuantity > item.stock) {
                showNotification(`Sorry, only ${item.stock} items available in stock`, 'warning');
                return;
            }

            item.quantity = newQuantity;
            this.saveCartToStorage();
            this.updateCartUI();
        }
    }

    clearCart() {
        this.cart = [];
        this.saveCartToStorage();
        this.updateCartUI();
        showNotification('Cart cleared', 'info');
    }

    getCartTotal() {
        return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    getTotalItems() {
        return this.cart.reduce((total, item) => total + item.quantity, 0);
    }

    updateCartUI() {
        console.log('🎨 Updating cart UI');
        this.updateCartCount();
        this.updateCartModal();
    }

    updateCartCount() {
        const cartCount = document.getElementById('cartCount');
        if (cartCount) {
            const totalItems = this.getTotalItems();
            cartCount.textContent = totalItems;
            
            // Add animation if items changed
            if (totalItems > 0) {
                cartCount.classList.add('pulse');
                setTimeout(() => cartCount.classList.remove('pulse'), 300);
            }
        }
    }

    updateCartModal() {
        const cartItems = document.getElementById('cartItems');
        const cartTotal = document.getElementById('cartTotal');
        
        if (!cartItems || !cartTotal) return;

        if (this.cart.length === 0) {
            cartItems.innerHTML = this.getEmptyCartHTML();
            cartTotal.textContent = '0.00';
            return;
        }

        cartItems.innerHTML = this.generateCartItemsHTML();
        cartTotal.textContent = this.getCartTotal().toFixed(2);

        this.attachCartItemEventListeners();
    }

    getEmptyCartHTML() {
        return `
            <div class="empty-cart">
                <div class="empty-cart-icon">🛒</div>
                <h3>Your cart is empty</h3>
                <p>Add some products to get started!</p>
                <button class="continue-shopping-btn" onclick="cartManager.closeCartModal()">
                    Continue Shopping
                </button>
            </div>
        `;
    }

    generateCartItemsHTML() {
        return this.cart.map(item => {
            const itemTotal = item.price * item.quantity;
            const placeholder = "https://via.placeholder.com/80x80/ecf0f1/7f8c8d?text=Product";
            
            return `
                <div class="cart-item" data-product-id="${item.id}">
                    <div class="cart-item-image">
                        <img src="${item.image}" alt="${item.name}" onerror="this.src='${placeholder}'">
                    </div>
                    <div class="cart-item-details">
                        <h4 class="cart-item-name">${item.name}</h4>
                        <p class="cart-item-category">${item.category}</p>
                        <div class="cart-item-price">Rs. ${item.price.toFixed(2)}</div>
                        <div class="cart-item-stock">${item.stock} available</div>
                    </div>
                    <div class="cart-item-controls">
                        <div class="quantity-controls">
                            <button class="quantity-btn minus" data-action="decrease" title="Decrease quantity">
                                −
                            </button>
                            <span class="quantity-display">${item.quantity}</span>
                            <button class="quantity-btn plus" data-action="increase" title="Increase quantity">
                                +
                            </button>
                        </div>
                        <div class="cart-item-total">
                            Rs. ${itemTotal.toFixed(2)}
                        </div>
                        <button class="remove-btn" data-action="remove" title="Remove from cart">
                            🗑️ Remove
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    attachCartItemEventListeners() {
        document.querySelectorAll('.cart-item').forEach(itemElement => {
            const productId = parseInt(itemElement.dataset.productId);
            
            // Quantity decrease
            const decreaseBtn = itemElement.querySelector('[data-action="decrease"]');
            if (decreaseBtn) {
                decreaseBtn.addEventListener('click', () => {
                    const item = this.cart.find(item => item.id === productId);
                    if (item) {
                        this.updateQuantity(productId, item.quantity - 1);
                    }
                });
            }
            
            // Quantity increase
            const increaseBtn = itemElement.querySelector('[data-action="increase"]');
            if (increaseBtn) {
                increaseBtn.addEventListener('click', () => {
                    const item = this.cart.find(item => item.id === productId);
                    if (item) {
                        this.updateQuantity(productId, item.quantity + 1);
                    }
                });
            }
            
            // Remove item
            const removeBtn = itemElement.querySelector('[data-action="remove"]');
            if (removeBtn) {
                removeBtn.addEventListener('click', () => {
                    this.removeFromCart(productId);
                });
            }
        });
    }

    openCartModal() {
        this.updateCartModal();
        const cartModal = document.getElementById('cartModal');
        if (cartModal) {
            cartModal.style.display = 'block';
            console.log('📱 Cart modal opened');
        }
    }

    closeCartModal() {
        const cartModal = document.getElementById('cartModal');
        if (cartModal) {
            cartModal.style.display = 'none';
            console.log('📱 Cart modal closed');
        }
    }

    async handleCheckout() {
        console.log('💳 Processing checkout...');
        
        if (this.cart.length === 0) {
            showNotification('Your cart is empty', 'warning');
            return;
        }

        // Check authentication
        if (!window.authManager || !window.authManager.isLoggedIn()) {
            showNotification('Please login to proceed with checkout', 'warning');
            this.closeCartModal();
            if (window.authManager && window.authManager.openLoginModal) {
                window.authManager.openLoginModal();
            }
            return;
        }

        try {
            // Show loading state
            this.setCheckoutLoading(true);

            const orderData = {
                items: this.cart,
                totalAmount: this.getCartTotal(),
                userId: JSON.parse(localStorage.getItem('user')).id,
                timestamp: new Date().toISOString()
            };

            // Simulate API call
            await this.processOrder(orderData);
            
            showNotification('Order placed successfully! 🎉 Thank you for your purchase.', 'success');
            this.clearCart();
            this.closeCartModal();

        } catch (error) {
            console.error('❌ Checkout error:', error);
            showNotification('Checkout failed. Please try again.', 'error');
        } finally {
            this.setCheckoutLoading(false);
        }
    }

    async processOrder(orderData) {
        // Simulate API call delay
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('📦 Order processed:', orderData);
                resolve({ success: true, orderId: 'ORD_' + Date.now() });
            }, 2000);
        });
    }

    setCheckoutLoading(isLoading) {
        const checkoutBtn = document.getElementById('checkoutBtn');
        if (!checkoutBtn) return;

        if (isLoading) {
            checkoutBtn.disabled = true;
            checkoutBtn.innerHTML = '<div class="loading-spinner"></div> Processing...';
        } else {
            checkoutBtn.disabled = false;
            checkoutBtn.textContent = 'Proceed to Checkout';
        }
    }

    animateAddToCart(productId) {
        // Add visual feedback for add to cart action
        const addButton = document.querySelector(`.add-to-cart[data-id="${productId}"]`);
        if (addButton) {
            addButton.classList.add('added');
            setTimeout(() => addButton.classList.remove('added'), 500);
        }
    }

    // Public methods
    getCart() {
        return [...this.cart]; // Return copy to prevent direct mutation
    }

    isEmpty() {
        return this.cart.length === 0;
    }

    getItemCount() {
        return this.getTotalItems();
    }

    getTotalAmount() {
        return this.getCartTotal();
    }
}

// Initialize Cart Manager when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.cartManager = new CartManager();
    console.log('🚀 Cart Manager initialized');
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CartManager;
}