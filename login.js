// Login and Registration JavaScript

// Hide loading screen after page loads
window.addEventListener('load', function() {
    setTimeout(() => {
        document.getElementById('loadingScreen').style.display = 'none';
    }, 1500);
});

// Login Form Handler
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    const role = document.getElementById('loginRole').value;

    // Simple validation (in production, this would be server-side)
    if (username && password && role) {
        // Store user data in sessionStorage
        const userData = {
            id: Date.now(),
            username: username,
            role: role,
            name: username.charAt(0).toUpperCase() + username.slice(1),
            loginTime: new Date().toISOString()
        };
        
        sessionStorage.setItem('currentUser', JSON.stringify(userData));
        
        showToast('Login successful!', 'success');

        // Redirect based on role
        setTimeout(() => {
            switch(role) {
                case 'customer':
                    window.location.href = 'customer_dashboard.html';
                    break;
                case 'staff':
                    window.location.href = 'staff_dashboard.html';
                    break;
                case 'manager':
                    window.location.href = 'manager_dashboard.html';
                    break;
                case 'auditor':
                    window.location.href = 'auditor_dashboard.html';
                    break;
            }
        }, 1000);
    } else {
        showToast('Please fill all fields', 'error');
    }
});

// Show Register Screen
document.getElementById('showRegister').addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById('loginScreen').classList.remove('active');
    document.getElementById('registerScreen').classList.add('active');
});

// Back to Login
document.getElementById('backToLogin').addEventListener('click', function() {
    document.getElementById('registerScreen').classList.remove('active');
    document.getElementById('loginScreen').classList.add('active');
});

// Register Form Handler
document.getElementById('registerForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const phone = document.getElementById('regPhone').value;
    const username = document.getElementById('regUsername').value;
    const password = document.getElementById('regPassword').value;

    // In production, this would save to database
    showToast('Registration successful! Please login.', 'success');
    
    setTimeout(() => {
        document.getElementById('registerScreen').classList.remove('active');
        document.getElementById('loginScreen').classList.add('active');
        document.getElementById('registerForm').reset();
    }, 1500);
});

// Toast Notification Function
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    
    setTimeout(() => {
        toast.classList.remove('show');
 }, 3000);
}