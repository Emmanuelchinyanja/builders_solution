// Customer Dashboard JavaScript

let currentUser = null;
let cart = [];
let products = [];
let orders = [];

// Check if user is logged in
window.addEventListener('load', function() {
    const userData = sessionStorage.getItem('currentUser');
    if (!userData) {
        window.location.href = 'index.html';
        return;
    }
    
    currentUser = JSON.parse(userData);
    if (currentUser.role !== 'customer') {
        window.location.href = 'index.html';
        return;
    }
    
    initializeData();
    loadCustomerDashboard();
});

// Initialize Sample Data
function initializeData() {
    // Load from localStorage or use default
    const savedProducts = localStorage.getItem('products');
    if (savedProducts) {
        products = JSON.parse(savedProducts);
    } else {
        products = [
            { id: 1, name: 'Cement 50kg', category: 'cement', price: 45000, stock: 200, lowStock: 50, icon: '🏗️' },
            { id: 2, name: 'Red Bricks', category: 'bricks', price: 350, stock: 5000, lowStock: 1000, icon: '🧱' },
            { id: 3, name: 'Roofing Sheets', category: 'roofing', price: 25000, stock: 150, lowStock: 30, icon: '🏠' },
            { id: 4, name: 'Timber 4x2', category: 'timber', price: 8000, stock: 80, lowStock: 20, icon: '🪵' },
            { id: 5, name: 'White Paint 20L', category: 'paint', price: 35000, stock: 45, lowStock: 10, icon: '🎨' },
            { id: 6, name: 'Hammer', category: 'tools', price: 15000, stock: 30, lowStock: 5, icon: '🔨' },
            { id: 7, name: 'Nails 1kg', category: 'tools', price: 5000, stock: 100, lowStock: 20, icon: '📌' },
            { id: 8, name: 'Sand per trip', category: 'cement', price: 80000, stock: 25, lowStock: 5, icon: '⛱️' }
        ];
        localStorage.setItem('products', JSON.stringify(products));
    }

    // Load orders
    const savedOrders = localStorage.getItem('orders');
    if (savedOrders) {
        orders = JSON.parse(savedOrders);
    }

    // Load cart for current user
    const savedCart = localStorage.getItem(`cart_${currentUser.id}`);
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
}

// Screen Management
function showSection(sectionId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');

    // Load section-specific data
    switch(sectionId) {
        case 'browseProducts':
            loadProducts();
            break;
        case 'myCart':
            loadCart();
            break;
        case 'myOrders':
            loadOrders();
            break;
    }
}

function loadCustomerDashboard() {
    document.getElementById('customerName').textContent = currentUser.name;
    updateCartCount();
}

function loadProducts() {
    const grid = document.getElementById('productsGrid');
    grid.innerHTML = '';

    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="product-image">${product.icon}</div>
            <div class="product-info">
                <div class="product-name">${product.name}</div>
                <div class="product-price">MWK ${product.price.toLocaleString()}</div>
                <div class="product-stock">${product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}</div>
                <button class="btn-add-cart" onclick="addToCart(${product.id})" ${product.stock === 0 ? 'disabled' : ''}>
                    <i class="fas fa-cart-plus"></i> Add to Cart
                </button>
            </div>
        `;
        grid.appendChild(card);
    });
}

// Search Products
document.getElementById('searchProducts').addEventListener('input', function(e) {
    const searchTerm = e.target.value.toLowerCase();
    const filtered = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm) || 
        p.category.toLowerCase().includes(searchTerm)
    );

    const grid = document.getElementById('productsGrid');
    grid.innerHTML = '';

    filtered.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="product-image">${product.icon}</div>
            <div class="product-info">
                <div class="product-name">${product.name}</div>
                <div class="product-price">MWK ${product.price.toLocaleString()}</div>
                <div class="product-stock">${product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}</div>
                <button class="btn-add-cart" onclick="addToCart(${product.id})" ${product.stock === 0 ? 'disabled' : ''}>
                    <i class="fas fa-cart-plus"></i> Add to Cart
                </button>
            </div>
        `;
        grid.appendChild(card);
    });
});

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const existingItem = cart.find(item => item.productId === productId);

    if (existingItem) {
        if (existingItem.quantity < product.stock) {
            existingItem.quantity++;
            showToast('Quantity updated', 'success');
        } else {
            showToast('Not enough stock', 'warning');
            return;
        }
    } else {
        cart.push({
            productId: productId,
            name: product.name,
            price: product.price,
            quantity: 1,
            icon: product.icon
        });
        showToast('Added to cart', 'success');
    }

    localStorage.setItem(`cart_${currentUser.id}`, JSON.stringify(cart));
    updateCartCount();
}

function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cartCount').textContent = count;
    document.getElementById('cartCountHeader').textContent = count;
}

function loadCart() {
    const container = document.getElementById('cartItems');
    container.innerHTML = '';

    if (cart.length === 0) {
        container.innerHTML = '<p style="text-align:center; padding:40px; color:#6b7280;">Your cart is empty</p>';
        document.getElementById('cartSubtotal').textContent = 'MWK 0';
        document.getElementById('cartTotal').textContent = 'MWK 0';
        return;
    }

    cart.forEach((item, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'cart-item';
        itemDiv.innerHTML = `
            <div style="display:flex; align-items:center; gap:15px;">
                <div style="font-size:30px;">${item.icon}</div>
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p>MWK ${item.price.toLocaleString()} × ${item.quantity}</p>
                </div>
            </div>
            <div class="cart-item-controls">
                <div class="qty-control">
                    <button class="qty-btn" onclick="updateCartQty(${index}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button class="qty-btn" onclick="updateCartQty(${index}, 1)">+</button>
                </div>
                <button class="btn-remove" onclick="removeFromCart(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        container.appendChild(itemDiv);
    });

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    document.getElementById('cartSubtotal').textContent = `MWK ${total.toLocaleString()}`;
    document.getElementById('cartTotal').textContent = `MWK ${total.toLocaleString()}`;
}

function updateCartQty(index, change) {
    const item = cart[index];
    const product = products.find(p => p.id === item.productId);
    
    const newQty = item.quantity + change;
    
    if (newQty <= 0) {
        removeFromCart(index);
        return;
    }
    
    if (newQty > product.stock) {
        showToast('Not enough stock', 'warning');
        return;
    }
    
    cart[index].quantity = newQty;
    localStorage.setItem(`cart_${currentUser.id}`, JSON.stringify(cart));
    loadCart();
    updateCartCount();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    localStorage.setItem(`cart_${currentUser.id}`, JSON.stringify(cart));
    loadCart();
    updateCartCount();
    showToast('Item removed', 'success');
}

function proceedToCheckout() {
    if (cart.length === 0) {
        showToast('Cart is empty', 'warning');
        return;
    }
    showSection('checkout');
    loadCheckout();
}

function loadCheckout() {
    const summary = document.getElementById('checkoutSummary');
    summary.innerHTML = '';

    cart.forEach(item => {
        const div = document.createElement('div');
        div.className = 'order-item';
        div.innerHTML = `
            <span>${item.name} × ${item.quantity}</span>
            <span>MWK ${(item.price * item.quantity).toLocaleString()}</span>
        `;
        summary.appendChild(div);
    });

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    document.getElementById('checkoutTotal').textContent = `MWK ${total.toLocaleString()}`;
}

let selectedPaymentMethod = null;

function selectPayment(method) {
    selectedPaymentMethod = method;
    document.querySelectorAll('.payment-option').forEach(opt => opt.classList.remove('selected'));
    event.target.closest('.payment-option').classList.add('selected');
    document.getElementById('paymentDetails').style.display = 'block';
}

function completePayment() {
    if (!selectedPaymentMethod) {
        showToast('Please select payment method', 'warning');
        return;
    }

    const phone = document.getElementById('paymentPhone').value;
    if (!phone) {
        showToast('Please enter phone number', 'warning');
        return;
    }

    // Generate unique token
    const token = generateToken();
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Create order
    const order = {
        id: 'ORD' + Date.now(),
        customerId: currentUser.id,
        customerName: currentUser.name,
        items: [...cart],
        total: total,
        status: 'paid',
        token: token,
        paymentMethod: selectedPaymentMethod,
        phone: phone,
        date: new Date().toISOString()
    };

    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));

    // Update stock
    cart.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (product) {
            product.stock -= item.quantity;
        }
    });
    localStorage.setItem('products', JSON.stringify(products));

    // Clear cart
    cart = [];
    localStorage.setItem(`cart_${currentUser.id}`, JSON.stringify(cart));
    updateCartCount();

    // Show success
    alert(`Payment Successful!\n\nYour Payment Token: ${token}\n\nPlease present this token at the shop to collect your items.\n\nToken expires in 14 days.\n\nAn SMS has been sent to ${phone}`);

    showToast(`Payment successful! Your token is: ${token}`, 'success');
    showSection('customerDashboard');
}

function generateToken() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let token = '';
    for (let i = 0; i < 8; i++) {
        token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
}

function loadOrders() {
    const container = document.getElementById('ordersList');
    const userOrders = orders.filter(o => o.customerId === currentUser.id);
    
    if (userOrders.length === 0) {
        container.innerHTML = '<div class="welcome-card"><p style="text-align:center;">No orders yet</p></div>';
        return;
    }

    container.innerHTML = '';
    userOrders.reverse().forEach(order => {
        const card = document.createElement('div');
        card.className = 'welcome-card';
        card.innerHTML = `
            <h4>${order.id}</h4>
            <p><strong>Token:</strong> ${order.token}</p>
            <p><strong>Total:</strong> MWK ${order.total.toLocaleString()}</p>
            <p><strong>Status:</strong> <span class="text-success">${order.status}</span></p>
            <p><strong>Date:</strong> ${new Date(order.date).toLocaleString()}</p>
        `;
        container.appendChild(card);
    });
}

// Quotation Form
document.getElementById('quotationForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const quotation = {
        id: 'QT' + Date.now(),
        customerId: currentUser.id,
        customerName: currentUser.name,
        description: document.getElementById('quotationDescription').value,
        budget: document.getElementById('quotationBudget').value,
        phone: document.getElementById('quotationPhone').value,
        status: 'pending',
        date: new Date().toISOString()
    };
    
    let quotations = localStorage.getItem('quotations');
    quotations = quotations ? JSON.parse(quotations) : [];
    quotations.push(quotation);
    localStorage.setItem('quotations', JSON.stringify(quotations));
    
    showToast('Quotation request submitted successfully!', 'success');
    this.reset();
    loadQuotations();
});

function loadQuotations() {
    const container = document.getElementById('quotationsList');
    let quotations = localStorage.getItem('quotations');
    quotations = quotations ? JSON.parse(quotations) : [];
    
    const userQuotations = quotations.filter(q => q.customerId === currentUser.id);
    
    if (userQuotations.length === 0) {
        container.innerHTML = '';
        return;
    }
    
    container.innerHTML = '<h3 style="margin-bottom:15px;">My Quotation Requests</h3>';
    userQuotations.reverse().forEach(quotation => {
        const card = document.createElement('div');
        card.className = 'welcome-card';
        card.innerHTML = `
            <h4>${quotation.id}</h4>
            <p><strong>Status:</strong> <span class="text-${quotation.status === 'pending' ? 'warning' : 'success'}">${quotation.status}</span></p>
            <p><strong>Budget:</strong> MWK ${parseInt(quotation.budget).toLocaleString()}</p>
            <p><strong>Date:</strong> ${new Date(quotation.date).toLocaleDateString()}</p>
        `;
        container.appendChild(card);
    });
}

// Feedback Form
document.getElementById('feedbackForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const feedback = {
        id: 'FB' + Date.now(),
        customerId: currentUser.id,
        customerName: currentUser.name,
        rating: document.getElementById('feedbackRating').value,
        comment: document.getElementById('feedbackComment').value,
        date: new Date().toISOString()
    };
    
    let feedbacks = localStorage.getItem('feedbacks');
    feedbacks = feedbacks ? JSON.parse(feedbacks) : [];
    feedbacks.push(feedback);
    localStorage.setItem('feedbacks', JSON.stringify(feedbacks));
    
    showToast('Feedback submitted successfully!', 'success');
    this.reset();
    loadFeedbackHistory();
});

function loadFeedbackHistory() {
    const container = document.getElementById('feedbackHistory');
    let feedbacks = localStorage.getItem('feedbacks');
    feedbacks = feedbacks ? JSON.parse(feedbacks) : [];
    
    const userFeedbacks = feedbacks.filter(f => f.customerId === currentUser.id);
    
    if (userFeedbacks.length === 0) {
        container.innerHTML = '';
        return;
    }
    
    container.innerHTML = '<h3 style="margin-bottom:15px;">My Previous Feedback</h3>';
    userFeedbacks.reverse().forEach(feedback => {
        const card = document.createElement('div');
        card.className = 'welcome-card';
        const stars = '⭐'.repeat(parseInt(feedback.rating));
        card.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <span>${stars}</span>
                <span style="font-size:12px; color:var(--text-secondary);">${new Date(feedback.date).toLocaleDateString()}</span>
            </div>
            <p style="margin-top:10px;">${feedback.comment}</p>
        `;
        container.appendChild(card);
    });
}

function logout() {
    sessionStorage.removeItem('currentUser');
    showToast('Logged out successfully', 'success');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}