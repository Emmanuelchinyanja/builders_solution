// Staff Dashboard JavaScript

let currentUser = null;
let products = [];
let orders = [];
let saleItems = [];

// Check if user is logged in
window.addEventListener('load', function() {
    const userData = sessionStorage.getItem('currentUser');
    if (!userData) {
        window.location.href = 'index.html';
        return;
    }
    
    currentUser = JSON.parse(userData);
    if (currentUser.role !== 'staff') {
        window.location.href = 'index.html';
        return;
    }
    
    initializeData();
    loadStaffDashboard();
});

// Initialize Data
function initializeData() {
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

    const savedOrders = localStorage.getItem('orders');
    if (savedOrders) {
        orders = JSON.parse(savedOrders);
    }
}

// Screen Management
function showSection(sectionId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');

    switch(sectionId) {
        case 'processSale':
            loadSaleProducts();
            break;
        case 'stockCheck':
            filterStock('all');
            break;
    }
}

function loadStaffDashboard() {
    document.getElementById('staffName').textContent = currentUser.name;
    
    // Calculate today's stats
    const today = new Date().toDateString();
    const todaySales = orders.filter(o => {
        return o.staffId === currentUser.id && 
               new Date(o.date).toDateString() === today;
    });
    
    const todayAmount = todaySales.reduce((sum, o) => sum + o.total, 0);
    const verifiedCount = orders.filter(o => o.releasedBy === currentUser.name).length;
    
    document.getElementById('todaySalesCount').textContent = todaySales.length;
    document.getElementById('todaySalesAmount').textContent = `MWK ${todayAmount.toLocaleString()}`;
    document.getElementById('verifiedTokens').textContent = verifiedCount;
}

// Token Verification
function verifyTokenCode() {
    const tokenInput = document.getElementById('tokenInput').value.trim().toUpperCase();
    
    if (tokenInput.length !== 8) {
        showToast('Token must be 8 characters', 'warning');
        return;
    }

    const order = orders.find(o => o.token === tokenInput && o.status !== 'completed');
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
                    <strong>Customer:</strong>
                    <span>${order.customerName || 'Customer'}</span>
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
                Token not found, already used, or order completed. Please check and try again.
            </p>
        `;
    }
}

function releaseOrder(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (order) {
        order.status = 'completed';
        order.releasedBy = currentUser.name;
        order.releasedAt = new Date().toISOString();
        localStorage.setItem('orders', JSON.stringify(orders));
        
        showToast('Goods released successfully', 'success');
        document.getElementById('tokenInput').value = '';
        document.getElementById('tokenResult').innerHTML = '';
    }
}

// Process Sale
function loadSaleProducts() {
    const list = document.getElementById('saleProductsList');
    list.innerHTML = '';

    products.forEach(product => {
        if (product.stock > 0) {
            const item = document.createElement('div');
            item.className = 'product-list-item';
            item.innerHTML = `
                <div>
                    <div style="font-size:14px; font-weight:600;">${product.icon} ${product.name}</div>
                    <div style="font-size:12px; color:var(--text-secondary);">MWK ${product.price.toLocaleString()} | Stock: ${product.stock}</div>
                </div>
                <button class="btn-add-cart" onclick="addToSale(${product.id})">
                    <i class="fas fa-plus"></i>
                </button>
            `;
            list.appendChild(item);
        }
    });
}

document.getElementById('searchSaleProducts').addEventListener('input', function(e) {
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
                <div style="font-size:14px; font-weight:600;">${product.icon} ${product.name}</div>
                <div style="font-size:12px; color:var(--text-secondary);">MWK ${product.price.toLocaleString()} | Stock: ${product.stock}</div>
            </div>
            <button class="btn-add-cart" onclick="addToSale(${product.id})">
                <i class="fas fa-plus"></i>
            </button>
        `;
        list.appendChild(item);
    });
});

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
            quantity: 1,
            icon: product.icon
        });
    }

    loadSaleItems();
}

function loadSaleItems() {
    const container = document.getElementById('saleItems');
    container.innerHTML = '';

    if (saleItems.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#6b7280; padding:20px;">No items added</p>';
        document.getElementById('saleTotal').textContent = 'MWK 0';
        return;
    }

    saleItems.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'order-detail-item';
        div.innerHTML = `
            <div>
                <div>${item.icon} ${item.name}</div>
                <div style="font-size:12px; color:var(--text-secondary);">MWK ${item.price.toLocaleString()} × ${item.quantity}</div>
            </div>
            <div style="text-align:right;">
                <div style="font-weight:600;">MWK ${(item.price * item.quantity).toLocaleString()}</div>
                <button class="btn-remove" style="font-size:11px; padding:4px 8px; margin-top:5px;" onclick="removeSaleItem(${index})">
                    <i class="fas fa-times"></i> Remove
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
    const customerName = document.getElementById('saleCustomerName').value || 'Walk-in Customer';
    const total = saleItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Update stock
    saleItems.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (product) {
            product.stock -= item.quantity;
        }
    });
    localStorage.setItem('products', JSON.stringify(products));

    // Create sale record
    const sale = {
        id: 'SALE' + Date.now(),
        staffId: currentUser.id,
        staffName: currentUser.name,
        customerName: customerName,
        items: [...saleItems],
        total: total,
        paymentMethod: paymentMethod,
        date: new Date().toISOString(),
        type: 'in-store',
        status: 'completed'
    };

    // Save to orders
    const allOrders = localStorage.getItem('orders');
    const ordersList = allOrders ? JSON.parse(allOrders) : [];
    ordersList.push(sale);
    localStorage.setItem('orders', JSON.stringify(ordersList));

    showToast(`Sale completed! Total: MWK ${total.toLocaleString()}`, 'success');
    
    // Print receipt (simulation)
    alert(`RECEIPT\n\n` +
          `Order: ${sale.id}\n` +
          `Staff: ${currentUser.name}\n` +
          `Customer: ${customerName}\n` +
          `Date: ${new Date().toLocaleString()}\n\n` +
          `Items:\n${saleItems.map(i => `${i.name} x${i.quantity} - MWK ${(i.price * i.quantity).toLocaleString()}`).join('\n')}\n\n` +
          `Total: MWK ${total.toLocaleString()}\n` +
          `Payment: ${paymentMethod}\n\n` +
          `Thank you for your business!`);
    
    // Reset sale
    saleItems = [];
    document.getElementById('saleCustomerName').value = '';
    loadSaleItems();
    loadSaleProducts();
    loadStaffDashboard(); // Refresh stats
}

// Sales History Functions
function filterSalesHistory(period) {
    const list = document.getElementById('salesHistoryList');
    list.innerHTML = '';

    document.querySelectorAll('#salesHistory .tab').forEach(tab => tab.classList.remove('active'));
    event?.target?.classList.add('active');

    let filtered = orders.filter(o => o.staffId === currentUser.id);
    
    const now = new Date();
    if (period === 'today') {
        filtered = filtered.filter(o => new Date(o.date).toDateString() === now.toDateString());
    } else if (period === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(o => new Date(o.date) >= weekAgo);
    }

    if (filtered.length === 0) {
        list.innerHTML = '<div class="welcome-card"><p style="text-align:center;">No sales found for this period</p></div>';
        return;
    }

    filtered.reverse().forEach(sale => {
        const card = document.createElement('div');
        card.className = 'welcome-card';
        card.innerHTML = `
            <h4>${sale.id}</h4>
            <p><strong>Customer:</strong> ${sale.customerName || 'Walk-in'}</p>
            <p><strong>Items:</strong> ${sale.items.length}</p>
            <p><strong>Total:</strong> MWK ${sale.total.toLocaleString()}</p>
            <p><strong>Payment:</strong> ${sale.paymentMethod}</p>
            <p><strong>Date:</strong> ${new Date(sale.date).toLocaleString()}</p>
        `;
        list.appendChild(card);
    });
}

// Stock Check
function filterStock(filter) {
    const list = document.getElementById('stockList');
    list.innerHTML = '';

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
        `;
        list.appendChild(item);
    });

    if (filtered.length === 0) {
        list.innerHTML = '<p style="text-align:center; padding:40px; color:#6b7280;">No items found</p>';
    }
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