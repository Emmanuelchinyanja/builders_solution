// Global Variables
let currentUser = null;
let cart = [];
let products = [];
let orders = [];
let suppliers = [];
let saleItems = [];

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        document.getElementById('loadingScreen').style.display = 'none';
        showScreen('loginScreen');
    }, 1500);

    initializeData();
    setupEventListeners();
});

// Initialize Sample Data
function initializeData() {
    // Sample Products
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

    // Sample Suppliers
    suppliers = [
        { id: 1, name: 'ABC Building Supplies', contact: 'John Banda', phone: '+265 888 123 456', email: 'abc@suppliers.com', products: 'Cement, Bricks' },
        { id: 2, name: 'Quality Roofing Ltd', contact: 'Mary Phiri', phone: '+265 999 234 567', email: 'quality@roofing.com', products: 'Roofing Sheets' },
        { id: 3, name: 'Timber Traders', contact: 'Peter Mwale', phone: '+265 888 345 678', email: 'timber@traders.com', products: 'Timber, Wood' }
    ];

    // Sample Orders (past)
    orders = [
        { id: 'ORD001', customerId: 1, items: [{ productId: 1, quantity: 2 }], total: 90000, status: 'completed', token: 'ABC12345', date: new Date().toISOString() }
    ];
}

// Setup Event Listeners
function setupEventListeners() {
    // Login Form
    document.getElementById('loginForm').addEventListener('submit', handleLogin);

    // Register Form
    document.getElementById('registerForm').addEventListener('submit', handleRegister);

    // Show Register Screen
    document.getElementById('showRegister').addEventListener('click', (e) => {
        e.preventDefault();
        showScreen('registerScreen');
    });

    // Back to Login
    document.getElementById('backToLogin').addEventListener('click', () => {
        showScreen('loginScreen');
    });

    // Add Product Form
    document.getElementById('addProductForm').addEventListener('submit', handleAddProduct);

    // Search Products
    document.getElementById('searchProducts')?.addEventListener('input', searchProducts);
    document.getElementById('searchSaleProducts')?.addEventListener('input', searchSaleProducts);
}

// Screen Management
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');

    // Load screen-specific data
    switch(screenId) {
        case 'customerDashboard':
            loadCustomerDashboard();
            break;
        case 'browseProducts':
            loadProducts();
            break;
        case 'myCart':
            loadCart();
            break;
        case 'myOrders':
            loadCustomerOrders();
            break;
        case 'staffDashboard':
            loadStaffDashboard();
            break;
        case 'processSale':
            loadSaleProducts();
            break;
        case 'managerDashboard':
            loadManagerDashboard();
            break;
        case 'inventoryManagement':
            loadInventory();
            break;
        case 'suppliers':
            loadSuppliers();
            break;
        case 'auditorDashboard':
            loadAuditorDashboard();
            break;
    }
}

// Authentication
function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    const role = document.getElementById('loginRole').value;

    // Simple validation (in production, this would be server-side)
    if (username && password && role) {
        currentUser = {
            id: Date.now(),
            username: username,
            role: role,
            name: username.charAt(0).toUpperCase() + username.slice(1)
        };

        showToast('Login successful!', 'success');

        // Redirect based on role
        switch(role) {
            case 'customer':
                showScreen('customerDashboard');
                break;
            case 'staff':
                showScreen('staffDashboard');
                break;
            case 'manager':
                showScreen('managerDashboard');
                break;
            case 'auditor':
                showScreen('auditorDashboard');
                break;
        }

        document.getElementById('loginForm').reset();
    } else {
        showToast('Please fill all fields', 'error');
    }
}

function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const phone = document.getElementById('regPhone').value;
    const username = document.getElementById('regUsername').value;
    const password = document.getElementById('regPassword').value;

    // In production, this would save to database
    showToast('Registration successful! Please login.', 'success');
    showScreen('loginScreen');
    document.getElementById('registerForm').reset();
}

function logout() {
    currentUser = null;
    cart = [];
    saleItems = [];
    showToast('Logged out successfully', 'success');
    showScreen('loginScreen');
}

// Customer Functions
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

function searchProducts(e) {
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
}

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
    loadCart();
    updateCartCount();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    loadCart();
    updateCartCount();
    showToast('Item removed', 'success');
}

function proceedToCheckout() {
    if (cart.length === 0) {
        showToast('Cart is empty', 'warning');
        return;
    }
    showScreen('checkout');
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
        items: [...cart],
        total: total,
        status: 'paid',
        token: token,
        paymentMethod: selectedPaymentMethod,
        phone: phone,
        date: new Date().toISOString()
    };

    orders.push(order);

    // Update stock
    cart.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (product) {
            product.stock -= item.quantity;
        }
    });

    // Clear cart
    cart = [];
    updateCartCount();

    // Show success
    showToast(`Payment successful! Your token is: ${token}`, 'success');
    
    // Show token details
    alert(`Payment Successful!\n\nYour Payment Token: ${token}\n\nPlease present this token at the shop to collect your items.\n\nToken expires in 14 days.\n\nAn SMS has been sent to ${phone}`);

    showScreen('customerDashboard');
}

function generateToken() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let token = '';
    for (let i = 0; i < 8; i++) {
        token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
}

function loadCustomerOrders() {
    // This would load customer's order history
    showToast('Order history loaded', 'success');
}

// Staff Functions
function loadStaffDashboard() {
    document.getElementById('staffName').textContent = currentUser.name;
}

function verifyTokenCode() {
    const tokenInput = document.getElementById('tokenInput').value.trim().toUpperCase();
    
    if (tokenInput.length !== 8) {
        showToast('Token must be 8 characters', 'warning');
        return;
    }

    const order = orders.find(o => o.token === tokenInput);
    const resultDiv = document.getElementById('tokenResult');

    if (order) {
        resultDiv.className = 'token-result token-success';
        resultDiv.innerHTML = `
            <h3 style="color: var(--success-color); margin-bottom:15px;">
                <i class="fas fa-check-circle"></i> Valid Token
            </h3>
            <div class="order-details">
                <div class="order-detail-item">
                    <strong>Order ID:</strong>
                    <span>${order.id}</span>
                </div>
                <div class="order-detail-item">
                    <strong>Total Amount:</strong>
                    <span>MWK ${order.total.toLocaleString()}</span>
                </div>
                <div class="order-detail-item">
                    <strong>Status:</strong>
                    <span class="text-success">${order.status}</span>
                </div>
                <div class="order-detail-item">
                    <strong>Payment Method:</strong>
                    <span>${order.paymentMethod}</span>
                </div>
            </div>
            <h4 style="margin-top:15px; margin-bottom:10px;">Items:</h4>
            ${order.items.map(item => `
                <div class="order-detail-item">
                    <span>${item.name} × ${item.quantity}</span>
                    <span>MWK ${(item.price * item.quantity).toLocaleString()}</span>
                </div>
            `).join('')}
            <button class="btn btn-primary btn-block btn-release" onclick="releaseOrder('${order.id}')">
                <i class="fas fa-check"></i> Release Goods
            </button>
        `;
    } else {
        resultDiv.className = 'token-result token-error';
        resultDiv.innerHTML = `
            <h3 style="color: var(--danger-color);">
                <i class="fas fa-times-circle"></i> Invalid Token
            </h3>
            <p style="margin-top:10px; color:var(--text-secondary);">
                Token not found or already used. Please check and try again.
            </p>
        `;
    }
}

function releaseOrder(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (order) {
        order.status = 'completed';
        showToast('Goods released successfully', 'success');
        document.getElementById('tokenInput').value = '';
        document.getElementById('tokenResult').innerHTML = '';
    }
}

function loadSaleProducts() {
    const list = document.getElementById('saleProductsList');
    list.innerHTML = '';

    products.forEach(product => {
        if (product.stock > 0) {
            const item = document.createElement('div');
            item.className = 'product-list-item';
            item.innerHTML = `
                <div>
                    <div style="font-size:14px; font-weight:600;">${product.name}</div>
                    <div style="font-size:12px; color:var(--text-secondary);">MWK ${product.price.toLocaleString()}</div>
                </div>
                <button class="btn-add-cart" onclick="addToSale(${product.id})">
                    <i class="fas fa-plus"></i>
                </button>
            `;
            list.appendChild(item);
        }
    });
}

function searchSaleProducts(e) {
    const searchTerm = e.target.value.toLowerCase();
    const filtered = products.filter(p => 
        (p.name.toLowerCase().includes(searchTerm) || 
        p.category.toLowerCase().includes(searchTerm)) &&
        p.stock > 0
    );

    const list = document.getElementById('saleProductsList');
    list.innerHTML = '';

    filtered.forEach(product => {
        const item = document.createElement('div');
        item.className = 'product-list-item';
        item.innerHTML = `
            <div>
                <div style="font-size:14px; font-weight:600;">${product.name}</div>
                <div style="font-size:12px; color:var(--text-secondary);">MWK ${product.price.toLocaleString()}</div>
            </div>
            <button class="btn-add-cart" onclick="addToSale(${product.id})">
                <i class="fas fa-plus"></i>
            </button>
        `;
        list.appendChild(item);
    });
}

function addToSale(productId) {
    const product = products.find(p => p.id === productId);
    const existingItem = saleItems.find(item => item.productId === productId);

    if (existingItem) {
        if (existingItem.quantity < product.stock) {
            existingItem.quantity++;
        } else {
            showToast('Not enough stock', 'warning');
            return;
        }
    } else {
        saleItems.push({
            productId: productId,
            name: product.name,
            price: product.price,
            quantity: 1
        });
    }

    loadSaleItems();
}

function loadSaleItems() {
    const container = document.getElementById('saleItems');
    container.innerHTML = '';

    saleItems.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'order-detail-item';
        div.innerHTML = `
            <div>
                <div>${item.name}</div>
                <div style="font-size:12px; color:var(--text-secondary);">Qty: ${item.quantity}</div>
            </div>
            <div>
                <div>MWK ${(item.price * item.quantity).toLocaleString()}</div>
                <button class="btn-remove" style="font-size:12px; padding:4px 8px; margin-top:5px;" onclick="removeSaleItem(${index})">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        container.appendChild(div);
    });

    const total = saleItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    document.getElementById('saleTotal').textContent = `MWK ${total.toLocaleString()}`;
}

function removeSaleItem(index) {
    saleItems.splice(index, 1);
    loadSaleItems();
}

function completeSale() {
    if (saleItems.length === 0) {
        showToast('No items in sale', 'warning');
        return;
    }

    const paymentMethod = document.getElementById('salePaymentMethod').value;
    const total = saleItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Update stock
    saleItems.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (product) {
            product.stock -= item.quantity;
        }
    });

    // Create sale record
    const sale = {
        id: 'SALE' + Date.now(),
        staffId: currentUser.id,
        items: [...saleItems],
        total: total,
        paymentMethod: paymentMethod,
        date: new Date().toISOString()
    };

    showToast(`Sale completed! Total: MWK ${total.toLocaleString()}`, 'success');
    
    // Reset sale
    saleItems = [];
    loadSaleItems();
    loadSaleProducts();
}

function showScreen(screen) {
    document.getElementById('stockCheck').addEventListener('click', () => {
        loadInventory();
        showScreen('inventoryManagement');
    });
}

// Manager Functions
function loadManagerDashboard() {
    document.getElementById('managerName').textContent = currentUser.name;

    // Calculate stats
    const todayOrders = orders.filter(o => {
        const orderDate = new Date(o.date);
        const today = new Date();
        return orderDate.toDateString() === today.toDateString();
    });

    const todaySales = todayOrders.reduce((sum, o) => sum + o.total, 0);
    document.getElementById('todaySales').textContent = `MWK ${todaySales.toLocaleString()}`;
    document.getElementById('totalOrders').textContent = todayOrders.length;

    const lowStockCount = products.filter(p => p.stock <= p.lowStock).length;
    document.getElementById('lowStock').textContent = lowStockCount;
}

function loadInventory() {
    filterInventory('all');
}

function filterInventory(filter) {
    const list = document.getElementById('inventoryList');
    list.innerHTML = '';

    // Update active tab
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    event?.target?.classList.add('active');

    let filtered = products;
    if (filter === 'low') {
        filtered = products.filter(p => p.stock <= p.lowStock && p.stock > 0);
    } else if (filter === 'out') {
        filtered = products.filter(p => p.stock === 0);
    }

    filtered.forEach(product => {
        const item = document.createElement('div');
        item.className = 'inventory-item';
        
        let stockClass = 'good';
        let stockText = 'Good Stock';
        if (product.stock === 0) {
            stockClass = 'out';
            stockText = 'Out of Stock';
        } else if (product.stock <= product.lowStock) {
            stockClass = 'low';
            stockText = 'Low Stock';
        }

        item.innerHTML = `
            <div class="inventory-item-header">
                <h4>${product.icon} ${product.name}</h4>
                <span class="stock-badge ${stockClass}">${stockText}</span>
            </div>
            <div class="inventory-item-details">
                <div><strong>Category:</strong> ${product.category}</div>
                <div><strong>Price:</strong> MWK ${product.price.toLocaleString()}</div>
                <div><strong>Stock:</strong> ${product.stock} units</div>
                <div><strong>Low Alert:</strong> ${product.lowStock} units</div>
            </div>
            <button class="btn-update-stock" onclick="updateStock(${product.id})">
                <i class="fas fa-edit"></i> Update Stock
            </button>
        `;
        list.appendChild(item);
    });

    if (filtered.length === 0) {
        list.innerHTML = '<p style="text-align:center; padding:40px; color:#6b7280;">No items found</p>';
    }
}

function updateStock(productId) {
    const product = products.find(p => p.id === productId);
    const newStock = prompt(`Update stock for ${product.name}\nCurrent: ${product.stock}`, product.stock);
    
    if (newStock !== null && !isNaN(newStock) && newStock >= 0) {
        product.stock = parseInt(newStock);
        showToast('Stock updated successfully', 'success');
        loadInventory();
    }
}

function showAddProduct() {
    document.getElementById('addProductModal').classList.add('active');
}

function handleAddProduct(e) {
    e.preventDefault();
    
    const newProduct = {
        id: products.length + 1,
        name: document.getElementById('productName').value,
        category: document.getElementById('productCategory').value,
        price: parseInt(document.getElementById('productPrice').value),
        stock: parseInt(document.getElementById('productStock').value),
        lowStock: parseInt(document.getElementById('productLowStock').value),
        icon: '📦'
    };

    products.push(newProduct);
    showToast('Product added successfully', 'success');
    closeModal('addProductModal');
    document.getElementById('addProductForm').reset();
    loadInventory();
}

function loadSuppliers() {
    const list = document.getElementById('suppliersList');
    list.innerHTML = '';

    suppliers.forEach(supplier => {
        const card = document.createElement('div');
        card.className = 'supplier-card';
        card.innerHTML = `
            <h3><i class="fas fa-truck"></i> ${supplier.name}</h3>
            <div class="supplier-info">
                <div class="supplier-info-item">
                    <i class="fas fa-user"></i>
                    <span>${supplier.contact}</span>
                </div>
                <div class="supplier-info-item">
                    <i class="fas fa-phone"></i>
                    <span>${supplier.phone}</span>
                </div>
                <div class="supplier-info-item">
                    <i class="fas fa-envelope"></i>
                    <span>${supplier.email}</span>
                </div>
                <div class="supplier-info-item">
                    <i class="fas fa-box"></i>
                    <span>${supplier.products}</span>
                </div>
            </div>
            <div class="supplier-actions">
                <button class="btn-call" onclick="callSupplier('${supplier.phone}')">
                    <i class="fas fa-phone"></i> Call
                </button>
                <button class="btn-sms" onclick="smsSupplier('${supplier.phone}')">
                    <i class="fas fa-sms"></i> SMS
                </button>
            </div>
        `;
        list.appendChild(card);
    });
}

function showAddSupplier() {
    const name = prompt('Supplier Name:');
    if (!name) return;
    
    const contact = prompt('Contact Person:');
    if (!contact) return;
    
    const phone = prompt('Phone Number:');
    if (!phone) return;
    
    const email = prompt('Email:');
    if (!email) return;
    
    const productsSupplied = prompt('Products Supplied:');
    if (!productsSupplied) return;

    suppliers.push({
        id: suppliers.length + 1,
        name: name,
        contact: contact,
        phone: phone,
        email: email,
        products: productsSupplied
    });

    showToast('Supplier added successfully', 'success');
    loadSuppliers();
}

function callSupplier(phone) {
    showToast(`Calling ${phone}...`, 'success');
    // In production: window.location.href = `tel:${phone}`;
}

function smsSupplier(phone) {
    const message = prompt('Enter message to send:');
    if (message) {
        showToast(`SMS sent to ${phone}`, 'success');
        // In production: window.location.href = `sms:${phone}?body=${encodeURIComponent(message)}`;
    }
}

// Auditor Functions
function loadAuditorDashboard() {
    document.getElementById('auditorName').textContent = currentUser.name;
}

function generateReport() {
    const reportType = document.getElementById('reportType').value;
    const reportDate = document.getElementById('reportDate').value;
    const output = document.getElementById('reportOutput');

    output.innerHTML = `
        <h3>${reportType.toUpperCase()} REPORT</h3>
        <p style="color:var(--text-secondary); margin-bottom:20px;">Date: ${reportDate || 'All Time'}</p>
        <table class="report-table">
            <thead>
                <tr>
                    <th>Order ID</th>
                    <th>Date</th>
                    <th>Payment Method</th>
                    <th>Amount</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                ${orders.map(order => `
                    <tr>
                        <td>${order.id}</td>
                        <td>${new Date(order.date).toLocaleDateString()}</td>
                        <td>${order.paymentMethod || 'Cash'}</td>
                        <td>MWK ${order.total.toLocaleString()}</td>
                        <td><span class="text-success">${order.status}</span></td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        <div style="margin-top:20px; padding-top:20px; border-top:2px solid var(--border);">
            <div style="display:flex; justify-content:space-between; font-size:18px; font-weight:bold;">
                <span>TOTAL SALES:</span>
                <span class="text-success">MWK ${orders.reduce((sum, o) => sum + o.total, 0).toLocaleString()}</span>
            </div>
        </div>
        <button class="btn btn-primary" style="margin-top:20px;" onclick="exportReport()">
            <i class="fas fa-download"></i> Export to PDF
        </button>
    `;
}

function exportReport() {
    showToast('Report exported successfully', 'success');
    // In production, this would generate actual PDF
}

// Modal Functions
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// Close modal when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('active');
    }
}

// Toast Notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Utility Functions
function formatCurrency(amount) {
    return `MWK ${amount.toLocaleString()}`;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-MW', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Initialize sample data on load
console.log('Builder\'s Solution System Initialized');
console.log('Sample Credentials:');
console.log('Customer: username=customer, password=test123, role=customer');
console.log('Staff: username=staff, password=test123, role=staff');
console.log('Manager: username=manager, password=test123, role=manager');
console.log('Auditor: username=auditor, password=test123, role=auditor');