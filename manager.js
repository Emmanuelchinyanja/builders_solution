// Manager Dashboard JavaScript

let currentUser = null;
let products = [];
let orders = [];
let suppliers = [];

// Check if user is logged in
window.addEventListener('load', function() {
    const userData = sessionStorage.getItem('currentUser');
    if (!userData) {
        window.location.href = 'index.html';
        return;
    }
    
    currentUser = JSON.parse(userData);
    if (currentUser.role !== 'manager') {
        window.location.href = 'index.html';
        return;
    }
    
    initializeData();
    loadManagerDashboard();
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

    const savedSuppliers = localStorage.getItem('suppliers');
    if (savedSuppliers) {
        suppliers = JSON.parse(savedSuppliers);
    } else {
        suppliers = [
            { id: 1, name: 'ABC Building Supplies', contact: 'John Banda', phone: '+265 888 123 456', email: 'abc@suppliers.com', products: 'Cement, Bricks' },
            { id: 2, name: 'Quality Roofing Ltd', contact: 'Mary Phiri', phone: '+265 999 234 567', email: 'quality@roofing.com', products: 'Roofing Sheets' },
            { id: 3, name: 'Timber Traders', contact: 'Peter Mwale', phone: '+265 888 345 678', email: 'timber@traders.com', products: 'Timber, Wood' }
        ];
        localStorage.setItem('suppliers', JSON.stringify(suppliers));
    }
}

// Screen Management
function showSection(sectionId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');

    switch(sectionId) {
        case 'inventoryManagement':
            loadInventory();
            break;
        case 'suppliers':
            loadSuppliers();
            break;
        case 'staffPerformance':
            loadStaffPerformance();
            break;
        case 'customerFeedback':
            loadCustomerFeedback();
            break;
    }
}

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

// Inventory Management
function loadInventory() {
    filterInventory('all');
}

function filterInventory(filter) {
    const list = document.getElementById('inventoryList');
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
    showEditProduct(product);
}

function showEditProduct(product) {
    document.getElementById('editProductModal').classList.add('active');
    document.getElementById('editProductId').value = product.id;
    document.getElementById('editProductName').value = product.name;
    document.getElementById('editProductPrice').value = product.price;
    document.getElementById('editProductStock').value = product.stock;
    document.getElementById('editProductLowStock').value = product.lowStock;
}

document.getElementById('editProductForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const productId = parseInt(document.getElementById('editProductId').value);
    const product = products.find(p => p.id === productId);
    
    if (product) {
        product.name = document.getElementById('editProductName').value;
        product.price = parseInt(document.getElementById('editProductPrice').value);
        product.stock = parseInt(document.getElementById('editProductStock').value);
        product.lowStock = parseInt(document.getElementById('editProductLowStock').value);
        
        localStorage.setItem('products', JSON.stringify(products));
        showToast('Product updated successfully', 'success');
        closeModal('editProductModal');
        loadInventory();
        loadManagerDashboard();
    }
});

function showAddProduct() {
    document.getElementById('addProductModal').classList.add('active');
}

document.getElementById('addProductForm').addEventListener('submit', function(e) {
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
    localStorage.setItem('products', JSON.stringify(products));
    showToast('Product added successfully', 'success');
    closeModal('addProductModal');
    this.reset();
    loadInventory();
});

// Suppliers Management
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
                <button class="btn-call" onclick="callSupplier('${supplier.phone}', '${supplier.name}')">
                    <i class="fas fa-phone"></i> Call
                </button>
                <button class="btn-sms" onclick="smsSupplier('${supplier.phone}', '${supplier.name}')">
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

    localStorage.setItem('suppliers', JSON.stringify(suppliers));
    showToast('Supplier added successfully', 'success');
    loadSuppliers();
}

function callSupplier(phone, name) {
    showToast(`Calling ${name} at ${phone}...`, 'success');
    // In production: window.location.href = `tel:${phone}`;
}

function smsSupplier(phone, name) {
    const message = prompt(`Send SMS to ${name}:`, 'Hello, we need to reorder stock. Please contact us.');
    if (message) {
        showToast(`SMS sent to ${name}`, 'success');
        // In production: window.location.href = `sms:${phone}?body=${encodeURIComponent(message)}`;
    }
}

// Reports
function generateReport() {
    const reportType = document.getElementById('reportType').value;
    const reportDate = document.getElementById('reportDate').value;
    const output = document.getElementById('reportOutput');

    let reportOrders = orders;
    if (reportDate) {
        reportOrders = orders.filter(o => {
            const orderDate = new Date(o.date).toDateString();
            const selectedDate = new Date(reportDate).toDateString();
            return orderDate === selectedDate;
        });
    }

    output.innerHTML = `
        <h3>${reportType.toUpperCase()} REPORT</h3>
        <p style="color:var(--text-secondary); margin-bottom:20px;">Date: ${reportDate || 'All Time'}</p>
        <table class="report-table">
            <thead>
                <tr>
                    <th>Order ID</th>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                ${reportOrders.map(order => `
                    <tr>
                        <td>${order.id}</td>
                        <td>${new Date(order.date).toLocaleDateString()}</td>
                        <td>${order.type || 'online'}</td>
                        <td>MWK ${order.total.toLocaleString()}</td>
                        <td><span class="text-success">${order.status || 'completed'}</span></td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        <div style="margin-top:20px; padding-top:20px; border-top:2px solid var(--border);">
            <div style="display:flex; justify-content:space-between; font-size:18px; font-weight:bold;">
                <span>TOTAL SALES:</span>
                <span class="text-success">MWK ${reportOrders.reduce((sum, o) => sum + o.total, 0).toLocaleString()}</span>
            </div>
            <div style="display:flex; justify-content:space-between; margin-top:10px;">
                <span>Total Orders:</span>
                <span>${reportOrders.length}</span>
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

// Staff Performance
function loadStaffPerformance() {
    const list = document.getElementById('staffPerformanceList');
    list.innerHTML = '';
    
    const staffSales = {};
    orders.forEach(order => {
        if (order.staffId && order.staffName) {
            if (!staffSales[order.staffId]) {
                staffSales[order.staffId] = {
                    name: order.staffName,
                    sales: 0,
                    revenue: 0
                };
            }
            staffSales[order.staffId].sales++;
            staffSales[order.staffId].revenue += order.total;
        }
    });
    
    if (Object.keys(staffSales).length === 0) {
        list.innerHTML = '<div class="welcome-card"><p style="text-align:center;">No staff sales recorded yet</p></div>';
        return;
    }
    
    Object.values(staffSales).forEach(staff => {
        const card = document.createElement('div');
        card.className = 'welcome-card';
        card.innerHTML = `
            <h4><i class="fas fa-user"></i> ${staff.name}</h4>
            <div class="inventory-item-details">
                <div><strong>Total Sales:</strong> ${staff.sales}</div>
                <div><strong>Revenue:</strong> MWK ${staff.revenue.toLocaleString()}</div>
                <div><strong>Avg Sale:</strong> MWK ${Math.round(staff.revenue / staff.sales).toLocaleString()}</div>
            </div>
        `;
        list.appendChild(card);
    });
}

// Customer Feedback
function loadCustomerFeedback() {
    const list = document.getElementById('feedbackList');
    let feedbacks = localStorage.getItem('feedbacks');
    feedbacks = feedbacks ? JSON.parse(feedbacks) : [];
    
    if (feedbacks.length === 0) {
        list.innerHTML = '<div class="welcome-card"><p style="text-align:center;">No feedback received yet</p></div>';
        document.getElementById('avgRating').textContent = '0.0';
        document.getElementById('totalReviews').textContent = '0';
        return;
    }
    
    // Calculate average rating
    const avgRating = feedbacks.reduce((sum, f) => sum + parseInt(f.rating), 0) / feedbacks.length;
    document.getElementById('avgRating').textContent = avgRating.toFixed(1);
    document.getElementById('totalReviews').textContent = feedbacks.length;
    
    list.innerHTML = '';
    feedbacks.reverse().forEach(feedback => {
        const card = document.createElement('div');
        card.className = 'welcome-card';
        const stars = '⭐'.repeat(parseInt(feedback.rating));
        card.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                <div>
                    <strong>${feedback.customerName}</strong>
                    <div>${stars} (${feedback.rating}/5)</div>
                </div>
                <span style="font-size:12px; color:var(--text-secondary);">${new Date(feedback.date).toLocaleDateString()}</span>
            </div>
            <p style="color:var(--text-secondary);">${feedback.comment}</p>
        `;
        list.appendChild(card);
    });
}

// Modal Functions
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('active');
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