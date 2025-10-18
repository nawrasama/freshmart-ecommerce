// Sample products data
const products = [
    {
        id: 1,
        name: "Organic Bananas",
        price: 250,
        image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=880&q=80",
        description: "Fresh organic bananas from local farms",
        inStock: true,
        hasOffer: true,
        stock: 10,
        category: "Food & Refreshment"
    },
    {
        id: 2,
        name: "Fresh Milk",
        price: 320,
        image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=715&q=80",
        description: "Pure fresh milk from grass-fed cows",
        inStock: true,
        hasOffer: false,
        stock: 15,
        category: "Food & Refreshment"
    },
    {
        id: 3,
        name: "Whole Wheat Bread",
        price: 180,
        image: "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80",
        description: "Healthy whole wheat bread baked daily",
        inStock: false,
        hasOffer: true,
        stock: 0,
        category: "Food & Refreshment"
    },
    {
        id: 4,
        name: "Free Range Eggs",
        price: 420,
        image: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80",
        description: "Farm fresh free range eggs",
        inStock: true,
        hasOffer: false,
        stock: 8,
        category: "Food & Refreshment"
    },
    {
        id: 5,
        name: "Organic Tomatoes",
        price: 180,
        image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80",
        description: "Fresh organic tomatoes, rich in flavor",
        inStock: true,
        hasOffer: true,
        stock: 12,
        category: "Food & Refreshment"
    },
    {
        id: 6,
        name: "Greek Yogurt",
        price: 380,
        image: "images/greek.jpg",
        description: "Creamy Greek yogurt, high in protein",
        inStock: true,
        hasOffer: false,
        stock: 6,
        category: "Food & Refreshment"
    }
];

// Initialize products when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('🛍️ Initializing products...');
    renderProducts(products);
    setupFilters();
    setupModalEvents();
});

// Render products
function renderProducts(productsToRender) {
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) {
        console.error('❌ Products grid element not found!');
        return;
    }
    
    productsGrid.innerHTML = '';
    
    if (productsToRender.length === 0) {
        productsGrid.innerHTML = `
            <div class="no-products">
                <h3>No products found</h3>
                <p>Try adjusting your filters or search terms</p>
            </div>
        `;
        return;
    }
    
    productsToRender.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <img src="${product.image}" alt="${product.name}" class="product-image" onerror="this.src='https://via.placeholder.com/280x200/ecf0f1/7f8c8d?text=Product+Image'">
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <div class="product-price">Rs. ${product.price}</div>
            <div class="product-stock ${product.inStock ? 'in-stock' : 'out-of-stock'}">
                ${product.inStock ? `${product.stock} in stock` : 'Out of stock'}
            </div>
            <div class="product-actions">
                ${product.inStock ? 
                    `<button class="add-to-cart" data-id="${product.id}">Add to Cart</button>` : 
                    `<button class="out-of-stock" disabled>Out of Stock</button>`
                }
                <button class="view-details" data-id="${product.id}">View Details</button>
            </div>
        `;
        productsGrid.appendChild(productCard);
    });
    
    // Add event listeners for product actions
    attachProductEventListeners();
}

// Setup filter functionality
function setupFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            
            const filter = this.getAttribute('data-filter');
            filterProducts(filter);
        });
    });
}

// Filter products based on selection
function filterProducts(filter) {
    let filteredProducts = [];
    
    switch(filter) {
        case 'all':
            filteredProducts = products;
            break;
        case 'in-stock':
            filteredProducts = products.filter(product => product.inStock);
            break;
        case 'offers':
            filteredProducts = products.filter(product => product.hasOffer);
            break;
        default:
            filteredProducts = products;
    }
    
    renderProducts(filteredProducts);
}

// Attach event listeners to product buttons
function attachProductEventListeners() {
    // Add to cart buttons
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-id'));
            addToCart(productId);
        });
    });
    
    // View details buttons
    document.querySelectorAll('.view-details').forEach(button => {
        button.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-id'));
            const product = products.find(p => p.id === productId);
            if (product) {
                showProductDetails(product);
            }
        });
    });
}

// Add to cart function that works with CartManager
function addToCart(productId) {
    console.log('🛒 Adding product to cart:', productId);
    
    if (window.cartManager) {
        window.cartManager.addToCart(productId, 1);
    } else {
        console.error('❌ CartManager not found!');
        showNotification('Cart system not available', 'error');
    }
}

// Show product details
function showProductDetails(product) {
    const productDetails = document.getElementById('productDetails');
    if (!productDetails) {
        console.error('❌ Product details element not found!');
        return;
    }
    
    productDetails.innerHTML = `
        <div class="product-details">
            <img src="${product.image}" alt="${product.name}" class="product-details-image" onerror="this.src='https://via.placeholder.com/350x250/ecf0f1/7f8c8d?text=Product+Image'">
            <h2>${product.name}</h2>
            <div class="price">Rs. ${product.price}</div>
            <p class="description">${product.description}</p>
            <div class="stock ${product.inStock ? 'in-stock' : 'out-of-stock'}">
                ${product.inStock ? `${product.stock} in stock` : 'Out of Stock'}
            </div>
            ${product.inStock ? 
                `<button class="add-to-cart-details" data-id="${product.id}" style="padding: 1rem 2rem; font-size: 1.2rem; margin-top: 1rem;">Add to Cart</button>` : 
                `<button class="out-of-stock" style="padding: 1rem 2rem; font-size: 1.2rem; margin-top: 1rem;" disabled>Out of Stock</button>`
            }
        </div>
    `;
    
    // Add event listener for add to cart button in product details
    const addToCartBtn = productDetails.querySelector('.add-to-cart-details');
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', function() {
            addToCart(product.id);
            closeModal('productModal');
        });
    }
    
    openModal('productModal');
}

// Modal functions
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// Setup modal events
function setupModalEvents() {
    // Close modal when clicking on close button or outside
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this || e.target.classList.contains('close')) {
                this.style.display = 'none';
            }
        });
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.style.display = 'none';
            });
        }
    });
}

// Search functionality
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            if (searchTerm.length > 2) {
                const filteredProducts = products.filter(product => 
                    product.name.toLowerCase().includes(searchTerm) ||
                    product.description.toLowerCase().includes(searchTerm) ||
                    product.category.toLowerCase().includes(searchTerm)
                );
                renderProducts(filteredProducts);
            } else if (searchTerm.length === 0) {
                renderProducts(products);
            }
        });
    }
});