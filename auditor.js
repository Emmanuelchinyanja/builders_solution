// Auditor Dashboard JavaScript

let currentUser = null;
let orders = [];
let products = [];

// Check if user is logged in
window.addEventListener('load', function() {
    const userData = sessionStorage.getItem('currentUser');
    if (!userData) {
        window.location.href = 'index.html';
        return;
    }
    
    currentUser = JSON.parse(userData);
    if (currentUser.role !== 'auditor') {
        window.location.href = 'index.html';
        return;
    }
    
    initializeData();
    loadAuditorDashboard();
});

// Initialize Data
function initializeData() {
    const savedOrders = localStorage.getItem('orders');
    if (savedOrders) {
        orders = JSON.parse(savedOrders);
    }

    const savedProducts = localStorage.getItem('products');
    if (savedProducts) {
        products = JSON.parse(savedProducts);
    }
}

// Screen Management
function showSection(sectionId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');

    switch(sectionId) {
        case 'salesAnalytics':
            loadSalesAnalytics();
            break;
    }
}

function loadAuditorDashboard() {
    document.getElementById('auditorName').textContent = currentUser.name;
}

// Daily Report
function generateDailyReport() {
    const reportDate = document.getElementById('dailyReportDate').value;
    const output = document.getElementById('dailyReportOutput');
    
    if (!reportDate) {
        showToast('Please select a date', 'warning');
        return;
    }

    const filteredOrders = orders.filter(o => {
        const orderDate = new Date(o.date).toDateString();
        const selectedDate = new Date(reportDate).toDateString();
        return orderDate === selectedDate;
    });

    if (filteredOrders.length === 0) {
        output.innerHTML = '<p style="text-align:center; padding:40px; color:#6b7280;">No transactions found for this date</p>';
        return;
    }

    // Group by payment method
    const paymentBreakdown = {};
    filteredOrders.forEach(order => {
        const method = order.paymentMethod || 'cash';
        if (!paymentBreakdown[method]) {
            paymentBreakdown[method] = { count: 0, total: 0 };
        }
        paymentBreakdown[method].count++;
        paymentBreakdown[method].total += order.total;
    });

    output.innerHTML = `
        <h3>DAILY SALES REPORT</h3>
        <p style="color:var(--text-secondary); margin-bottom:20px;">Date: ${new Date(reportDate).toLocaleDateString()}</p>
        
        <div class="stats-grid" style="margin-bottom:20px;">
            <div class="stat-card">
                <i class="fas fa-shopping-bag"></i>
                <h4>Total Orders</h4>
                <p>${filteredOrders.length}</p>
            </div>
            <div class="stat-card">
                <i class="fas fa-dollar-sign"></i>
                <h4>Total Revenue</h4>
                <p>MWK ${filteredOrders.reduce((sum, o) => sum + o.total, 0).toLocaleString()}</p>
            </div>
            <div class="stat-card">
                <i class="fas fa-chart-line"></i>
                <h4>Avg Order</h4>
                <p>MWK ${Math.round(filteredOrders.reduce((sum, o) => sum + o.total, 0) / filteredOrders.length).toLocaleString()}</p>
            </div>
        </div>

        <h4 style="margin-bottom:10px;">Payment Method Breakdown</h4>
        <table class="report-table" style="margin-bottom:20px;">
            <thead>
                <tr>
                    <th>Method</th>
                    <th>Orders</th>
                    <th>Total Amount</th>
                </tr>
            </thead>
            <tbody>
                ${Object.entries(paymentBreakdown).map(([method, data]) => `
                    <tr>
                        <td style="text-transform:capitalize;">${method}</td>
                        <td>${data.count}</td>
                        <td>MWK ${data.total.toLocaleString()}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>

        <h4 style="margin-bottom:10px;">Transaction Details</h4>
        <table class="report-table">
            <thead>
                <tr>
                    <th>Order ID</th>
                    <th>Time</th>
                    <th>Customer/Staff</th>
                    <th>Amount</th>
                    <th>Payment</th>
                </tr>
            </thead>
            <tbody>
                ${filteredOrders.map(order => `
                    <tr>
                        <td>${order.id}</td>
                        <td>${new Date(order.date).toLocaleTimeString()}</td>
                        <td>${order.customerName || order.staffName || 'N/A'}</td>
                        <td>MWK ${order.total.toLocaleString()}</td>
                        <td style="text-transform:capitalize;">${order.paymentMethod || 'cash'}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>

        <button class="btn btn-primary" style="margin-top:20px;" onclick="exportDailyReport()">
            <i class="fas fa-download"></i> Export to PDF
        </button>
    `;
}

function exportDailyReport() {
    showToast('Daily report exported successfully', 'success');
}

// Sales Analytics
function loadSalesAnalytics() {
    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    const totalOrdersCount = orders.length;
    
    // Count unique customers (simplified)
    const uniqueCustomers = new Set(orders.map(o => o.customerId || o.customerName)).size;

    document.getElementById('totalRevenue').textContent = `MWK ${totalRevenue.toLocaleString()}`;
    document.getElementById('totalOrdersCount').textContent = totalOrdersCount;
    document.getElementById('totalCustomers').textContent = uniqueCustomers;

    // Calculate sales by category
    const categoryBreakdown = {};
    orders.forEach(order => {
        order.items.forEach(item => {
            const product = products.find(p => p.id === item.productId);
            const category = product ? product.category : 'other';
            
            if (!categoryBreakdown[category]) {
                categoryBreakdown[category] = 0;
            }
            categoryBreakdown[category] += item.price * item.quantity;
        });
    });

    const chartDiv = document.getElementById('analyticsChart');
    chartDiv.innerHTML = `
        <table class="report-table">
            <thead>
                <tr>
                    <th>Category</th>
                    <th>Sales Amount</th>
                    <th>Percentage</th>
                </tr>
            </thead>
            <tbody>
                ${Object.entries(categoryBreakdown).map(([category, amount]) => {
                    const percentage = ((amount / totalRevenue) * 100).toFixed(1);
                    return `
                        <tr>
                            <td style="text-transform:capitalize;">${category}</td>
                            <td>MWK ${amount.toLocaleString()}</td>
                            <td>
                                <div style="display:flex; align-items:center; gap:10px;">
                                    <div style="flex:1; background:#e5e7eb; height:8px; border-radius:4px;">
                                        <div style="width:${percentage}%; background:var(--primary-color); height:100%; border-radius:4px;"></div>
                                    </div>
                                    <span>${percentage}%</span>
                                </div>
                            </td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>

        <div style="margin-top:30px;">
            <h4 style="margin-bottom:15px;">Top Selling Products</h4>
            ${getTopProducts()}
        </div>

        <div style="margin-top:30px;">
            <h4 style="margin-bottom:15px;">Sales Trends</h4>
            ${getSalesTrends()}
        </div>
    `;
}

function getTopProducts() {
    const productSales = {};
    
    orders.forEach(order => {
        order.items.forEach(item => {
            if (!productSales[item.productId]) {
                productSales[item.productId] = {
                    name: item.name,
                    quantity: 0,
                    revenue: 0
                };
            }
            productSales[item.productId].quantity += item.quantity;
            productSales[item.productId].revenue += item.price * item.quantity;
        });
    });

    const sorted = Object.values(productSales).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

    return `
        <table class="report-table">
            <thead>
                <tr>
                    <th>Product</th>
                    <th>Units Sold</th>
                    <th>Revenue</th>
                </tr>
            </thead>
            <tbody>
                ${sorted.map(product => `
                    <tr>
                        <td>${product.name}</td>
                        <td>${product.quantity}</td>
                        <td>MWK ${product.revenue.toLocaleString()}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function getSalesTrends() {
    // Group sales by date (last 7 days)
    const last7Days = {};
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toLocaleDateString();
        last7Days[dateStr] = 0;
    }

    orders.forEach(order => {
        const orderDate = new Date(order.date).toLocaleDateString();
        if (last7Days.hasOwnProperty(orderDate)) {
            last7Days[orderDate] += order.total;
        }
    });

    const maxValue = Math.max(...Object.values(last7Days));

    return `
        <table class="report-table">
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Sales</th>
                    <th>Trend</th>
                </tr>
            </thead>
            <tbody>
                ${Object.entries(last7Days).map(([date, amount]) => {
                    const barWidth = maxValue > 0 ? (amount / maxValue) * 100 : 0;
                    return `
                        <tr>
                            <td>${date}</td>
                            <td>MWK ${amount.toLocaleString()}</td>
                            <td>
                                <div style="background:#e5e7eb; height:8px; border-radius:4px;">
                                    <div style="width:${barWidth}%; background:var(--success-color); height:100%; border-radius:4px;"></div>
                                </div>
                            </td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
}

// Audit Trail
function generateAuditTrail() {
    const filter = document.getElementById('auditFilter').value;
    const startDate = document.getElementById('auditStartDate').value;
    const endDate = document.getElementById('auditEndDate').value;
    const output = document.getElementById('auditTrailOutput');

    let filteredOrders = [...orders];

    // Filter by date range
    if (startDate && endDate) {
        filteredOrders = filteredOrders.filter(o => {
            const orderDate = new Date(o.date);
            return orderDate >= new Date(startDate) && orderDate <= new Date(endDate);
        });
    }

    // Filter by type
    if (filter !== 'all') {
        if (filter === 'sales') {
            // All orders are sales
        } else if (filter === 'inventory') {
            // Would filter inventory-specific changes
        } else if (filter === 'users') {
            // Would filter user activities
        }
    }

    if (filteredOrders.length === 0) {
        output.innerHTML = '<p style="text-align:center; padding:40px; color:#6b7280;">No activities found</p>';
        return;
    }

    output.innerHTML = `
        <h3>AUDIT TRAIL</h3>
        <p style="color:var(--text-secondary); margin-bottom:20px;">
            ${startDate && endDate ? `Period: ${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}` : 'All Activities'}
        </p>

        <table class="report-table">
            <thead>
                <tr>
                    <th>Date & Time</th>
                    <th>Activity</th>
                    <th>User</th>
                    <th>Details</th>
                    <th>Amount</th>
                </tr>
            </thead>
            <tbody>
                ${filteredOrders.map(order => `
                    <tr>
                        <td>${new Date(order.date).toLocaleString()}</td>
                        <td>
                            <i class="fas fa-shopping-cart"></i> 
                            ${order.type === 'in-store' ? 'In-Store Sale' : 'Online Purchase'}
                        </td>
                        <td>${order.staffName || order.customerName || 'System'}</td>
                        <td>${order.id} - ${order.items.length} items</td>
                        <td>MWK ${order.total.toLocaleString()}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>

        <div style="margin-top:20px; padding-top:20px; border-top:2px solid var(--border);">
            <div style="display:flex; justify-content:space-between;">
                <span><strong>Total Activities:</strong></span>
                <span>${filteredOrders.length}</span>
            </div>
            <div style="display:flex; justify-content:space-between; margin-top:10px;">
                <span><strong>Total Value:</strong></span>
                <span class="text-success">MWK ${filteredOrders.reduce((sum, o) => sum + o.total, 0).toLocaleString()}</span>
            </div>
        </div>

        <button class="btn btn-primary" style="margin-top:20px;" onclick="exportAuditTrail()">
            <i class="fas fa-download"></i> Export Audit Trail
        </button>
    `;
}

function exportAuditTrail() {
    showToast('Audit trail exported successfully', 'success');
}

// Set default date to today
window.addEventListener('load', function() {
    const today = new Date().toISOString().split('T')[0];
    if (document.getElementById('dailyReportDate')) {
        document.getElementById('dailyReportDate').value = today;
    }
    if (document.getElementById('auditStartDate')) {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        document.getElementById('auditStartDate').value = weekAgo.toISOString().split('T')[0];
        document.getElementById('auditEndDate').value = today;
    }
});

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