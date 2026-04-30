// Main JavaScript - Core Functionality
// =======================

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    initializeNavigation();
    initializeNotifications();
    updateCartBadge();
});

// Global state management
const AppState = {
    currentUser: null,
    cart: [],
    notifications: [],
    
    init() {
        // Load from localStorage
        this.currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
        this.cart = JSON.parse(localStorage.getItem('cart')) || [];
        this.notifications = JSON.parse(localStorage.getItem('notifications')) || [];
        this.logisticsQueue = JSON.parse(localStorage.getItem('logisticsQueue')) || [];
    },
    
    saveUser(user) {
        this.currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
    },
    
    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
    },
    
    saveLogistics() {
        localStorage.setItem('logisticsQueue', JSON.stringify(this.logisticsQueue));
    },
    
    saveNotifications() {
        localStorage.setItem('notifications', JSON.stringify(this.notifications));
    }
};

// Initialize app
function initializeApp() {
    AppState.init();
    updateUserUI();
    
    // Animate stats on homepage
    animateStats();
}

// Navigation functionality
function initializeNavigation() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
    }
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.navbar')) {
            navMenu?.classList.remove('active');
        }
    });
}

// Update user interface based on auth status
function updateUserUI() {
    const loginBtn = document.getElementById('loginBtn');
    const signupBtn = document.getElementById('signupBtn');
    const userMenu = document.getElementById('userMenu');
    const userRoleBadge = document.getElementById('userRoleBadge');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (AppState.currentUser) {
        // User is logged in
        if (loginBtn) loginBtn.style.display = 'none';
        if (signupBtn) signupBtn.style.display = 'none';
        if (userMenu) {
            userMenu.style.display = 'flex';
            const userName = userMenu.querySelector('.user-name');
            if (userName) userName.textContent = AppState.currentUser.name;
            if (userRoleBadge) userRoleBadge.textContent = (AppState.currentUser.userType || '').toUpperCase();
        }
        logoutBtn?.addEventListener('click', () => window.logout && window.logout());
    } else {
        // User is not logged in
        if (loginBtn) loginBtn.style.display = 'inline-block';
        if (signupBtn) signupBtn.style.display = 'inline-block';
        if (userMenu) userMenu.style.display = 'none';
    }
}

// Cart functionality
function updateCartBadge() {
    const cartBadge = document.getElementById('cartBadge');
    if (cartBadge) {
        const itemCount = AppState.cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        cartBadge.textContent = itemCount;
        cartBadge.style.display = itemCount > 0 ? 'block' : 'none';
    }
}

function addToCart(item) {
    const existingItem = AppState.cart.find(i => i.id === item.id);
    
    if (existingItem) {
        existingItem.quantity = (existingItem.quantity || 1) + 1;
    } else {
        AppState.cart.push({ ...item, quantity: 1 });
    }
    
    AppState.saveCart();
    updateCartBadge();
    showNotification('Item added to cart successfully!', 'success');
}

function removeFromCart(itemId) {
    AppState.cart = AppState.cart.filter(item => item.id !== itemId);
    AppState.saveCart();
    updateCartBadge();
    loadCartItems();
}

function loadCartItems() {
    const cartContent = document.getElementById('cartContent');
    const cartTotal = document.getElementById('cartTotal');
    
    if (!cartContent) return;
    
    if (AppState.cart.length === 0) {
        cartContent.innerHTML = '<p style="text-align:center;color:#999;">Your cart is empty</p>';
        if (cartTotal) cartTotal.textContent = '₹0';
        return;
    }
    
    let total = 0;
    cartContent.innerHTML = '';
    
    AppState.cart.forEach(item => {
        const itemTotal = item.price * (item.quantity || 1);
        total += itemTotal;
        
        const cartItemHTML = `
            <div class="cart-item">
                <div class="cart-item-image">
                    <i class="fas fa-seedling"></i>
                </div>
                <div class="cart-item-details">
                    <div class="cart-item-title">${item.name}</div>
                    <div class="cart-item-price">₹${item.price.toLocaleString()}/ton × ${item.quantity}</div>
                    <button class="cart-item-remove" onclick="removeFromCart('${item.id}')">Remove</button>
                </div>
            </div>
        `;
        cartContent.innerHTML += cartItemHTML;
    });
    
    if (cartTotal) cartTotal.textContent = `₹${total.toLocaleString()}`;

    // Add Checkout Button
    const checkoutBtn = document.createElement('button');
    checkoutBtn.className = 'btn-primary btn-block';
    checkoutBtn.style.marginTop = '20px';
    checkoutBtn.innerHTML = '<i class="fas fa-truck-loading"></i> Place Pickup Order';
    checkoutBtn.onclick = () => window.checkout();
    cartContent.appendChild(checkoutBtn);
}

// Checkout Functionality
window.checkout = function() {
    if (AppState.cart.length === 0) return;

    if (!AppState.currentUser) {
        showNotification(' Please login to place an order', 'warning');
        document.getElementById('loginBtn')?.click();
        return;
    }

    // Move cart items to logistics queue
    const newPickups = AppState.cart.map(item => ({
        id: `PK-${Math.floor(Math.random() * 900) + 100}`,
        name: `${AppState.currentUser.name}'s ${item.name}`,
        lat: 30.85 + (Math.random() * 0.1), // Random-ish location in Ludhiana
        lng: 75.80 + (Math.random() * 0.1),
        volume: `${item.quantity} tons`,
        decay: Math.random() > 0.5 ? 'High' : 'Medium',
        price: item.price * item.quantity,
        color: Math.random() > 0.5 ? 'bg-red' : 'bg-yellow',
        riskClass: Math.random() > 0.5 ? 'high-risk' : 'medium-risk',
        timestamp: new Date().toISOString()
    }));

    AppState.logisticsQueue = [...AppState.logisticsQueue, ...newPickups];
    AppState.saveLogistics();

    // Clear cart
    AppState.cart = [];
    AppState.saveCart();
    updateCartBadge();
    loadCartItems();

    showNotification('Order placed! Pickup scheduled in Logistics.', 'success');
    
    // Optional: Redirect to logistics
    // setTimeout(() => location.href = 'logistics.html', 1500);
}

// Cart sidebar toggle
document.getElementById('cartBtn')?.addEventListener('click', () => {
    const cartSidebar = document.getElementById('cartSidebar');
    if (cartSidebar) {
        cartSidebar.classList.toggle('active');
        loadCartItems();
    }
});

document.querySelector('.close-sidebar')?.addEventListener('click', () => {
    document.getElementById('cartSidebar')?.classList.remove('active');
});

// Notification system
function initializeNotifications() {
    const notifBtn = document.getElementById('notificationBtn');
    const notifBadge = document.getElementById('notifBadge');
    
    // Load initial notifications
    if (AppState.notifications.length === 0) {
        AppState.notifications = [
            {
                id: Date.now(),
                title: 'Welcome!',
                message: 'Start exploring the marketplace',
                type: 'info',
                read: false,
                timestamp: new Date()
            }
        ];
        AppState.saveNotifications();
    }
    
    updateNotificationBadge();
    
    notifBtn?.addEventListener('click', showNotifications);
}

function updateNotificationBadge() {
    const notifBadge = document.getElementById('notifBadge');
    if (notifBadge) {
        const unreadCount = AppState.notifications.filter(n => !n.read).length;
        notifBadge.textContent = unreadCount;
        notifBadge.style.display = unreadCount > 0 ? 'block' : 'none';
    }
}

function addNotification(title, message, type = 'info') {
    const notification = {
        id: Date.now(),
        title,
        message,
        type,
        read: false,
        timestamp: new Date()
    };
    
    AppState.notifications.unshift(notification);
    AppState.saveNotifications();
    updateNotificationBadge();
}

function showNotifications() {
    // Create modal for notifications
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <h2>Notifications</h2>
            <div id="notificationsList" style="max-height:400px;overflow-y:auto;">
                ${AppState.notifications.map(n => `
                    <div class="notification-item" style="padding:1rem;border-bottom:1px solid #ddd;${n.read ? '' : 'background:#f0f8ff;'}">
                        <h4>${n.title}</h4>
                        <p>${n.message}</p>
                        <small>${new Date(n.timestamp).toLocaleString()}</small>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.querySelector('.close').addEventListener('click', () => {
        modal.remove();
    });
    
    // Mark all as read
    AppState.notifications.forEach(n => n.read = true);
    AppState.saveNotifications();
    updateNotificationBadge();
}

// Toast notifications
function showNotification(message, type = 'success') {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3498db'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Animate stats on homepage
function animateStats() {
    // Derive from real data
    const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    const users = JSON.parse(localStorage.getItem('users')) || [];

    // Waste processed = sum of quantities in completed transactions
    let totalWasteTons = 0;
    transactions.forEach(t => {
        if (t.status === 'completed' && Array.isArray(t.items)) {
            totalWasteTons += t.items.reduce((s, i) => s + (i.quantity || 1), 0);
        }
    });

    const activeUsersCount = users.length;
    const co2FactorPerTon = 2.5; // conservative estimate tons CO2 avoided per ton biomass
    const co2SavedTons = Math.round(totalWasteTons * co2FactorPerTon);

    const statElements = [
        { id: 'wasteProcessed', target: Math.max(0, Math.floor(totalWasteTons)) },
        { id: 'activeUsers', target: Math.max(0, activeUsersCount) },
        { id: 'co2Saved', target: Math.max(0, co2SavedTons) }
    ];
    
    statElements.forEach(({ id, target }) => {
        const element = document.getElementById(id);
        if (!element) return;
        
        let current = 0;
        const increment = target / 50;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                element.textContent = target.toLocaleString() + '+';
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current).toLocaleString() + '+';
            }
        }, 30);
    });
}

// Modal handlers
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
    }
    
    if (e.target.classList.contains('close')) {
        e.target.closest('.modal')?.classList.remove('active');
    }
});

// Get started button
document.getElementById('getStartedBtn')?.addEventListener('click', () => {
    if (AppState.currentUser) {
        window.location.href = 'marketplace.html';
    } else {
        document.getElementById('loginBtn')?.click();
    }
});

// Checkout handler (escrow-enabled)
document.getElementById('checkoutBtn')?.addEventListener('click', () => {
    if (AppState.cart.length === 0) {
        showNotification('Your cart is empty!', 'error');
        return;
    }
    
    if (!AppState.currentUser) {
        showNotification('Please login to continue', 'error');
        document.getElementById('cartSidebar')?.classList.remove('active');
        setTimeout(() => document.getElementById('loginBtn')?.click(), 500);
        return;
    }
    
    // Process checkout
    const total = AppState.cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
    
    // Simulate transaction (escrow)
    const transaction = {
        id: 'TXN' + Date.now(),
        items: [...AppState.cart],
        total: total,
        date: new Date(),
        status: 'in_escrow'
    };
    
    // Save transaction
    const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    transactions.unshift(transaction);
    localStorage.setItem('transactions', JSON.stringify(transactions));
    
    // Clear cart
    AppState.cart = [];
    AppState.saveCart();
    updateCartBadge();
    
    // Close cart
    document.getElementById('cartSidebar')?.classList.remove('active');
    
    // Show success
    showNotification('Order placed in escrow!', 'success');
    addNotification('Order in Escrow', `Order ₹${total.toLocaleString()} awaits delivery & QC`, 'info');
    
    // Redirect to dashboard
    setTimeout(() => window.location.href = 'dashboard.html', 2000);
});

// Utility functions
function formatDate(date) {
    return new Date(date).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0
    }).format(amount);
}

// Export for use in other modules
window.AppState = AppState;
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.showNotification = showNotification;
window.addNotification = addNotification;
window.formatDate = formatDate;
window.formatCurrency = formatCurrency;

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }
`;
document.head.appendChild(style);
