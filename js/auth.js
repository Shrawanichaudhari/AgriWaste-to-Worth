// Authentication Module
// =======================

document.addEventListener('DOMContentLoaded', function() {
    initializeAuth();
});

function initializeAuth() {
    const loginBtn = document.getElementById('loginBtn');
    const signupBtn = document.getElementById('signupBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const authModal = document.getElementById('authModal');
    const showSignupLink = document.getElementById('showSignup');
    const showLoginLink = document.getElementById('showLogin');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    
    // Show login modal
    loginBtn?.addEventListener('click', () => {
        authModal.classList.add('active');
        loginForm.classList.remove('hidden');
        signupForm.classList.add('hidden');
    });
    
    // Show signup modal
    signupBtn?.addEventListener('click', () => {
        authModal.classList.add('active');
        signupForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
    });
    
    // Switch between forms
    showSignupLink?.addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.classList.add('hidden');
        signupForm.classList.remove('hidden');
    });
    
    showLoginLink?.addEventListener('click', (e) => {
        e.preventDefault();
        signupForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
    });
    
    // Handle login
    loginForm?.querySelector('form').addEventListener('submit', handleLogin);
    
    // Handle signup
    signupForm?.querySelector('form').addEventListener('submit', handleSignup);

    // Logout
    logoutBtn?.addEventListener('click', logout);
}

function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Find user
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        // Save current user (without password)
        const { password, ...userWithoutPassword } = user;
        AppState.saveUser(userWithoutPassword);
        
        // Close modal
        document.getElementById('authModal').classList.remove('active');
        
        // Update UI
        window.location.reload();
        
        showNotification('Login successful!', 'success');
    } else {
        showNotification('Invalid email or password', 'error');
    }
}

function handleSignup(e) {
    e.preventDefault();
    
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const userType = document.getElementById('userType').value;
    
    // Get existing users
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Check if user already exists
    if (users.some(u => u.email === email)) {
        showNotification('Email already registered', 'error');
        return;
    }
    
    // Create new user
    const newUser = {
        id: Date.now().toString(),
        name,
        email,
        password,
        userType,
        createdAt: new Date(),
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=2ecc71&color=fff`
    };
    
    // Save user
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Login user
    const { password: _, ...userWithoutPassword } = newUser;
    AppState.saveUser(userWithoutPassword);
    
    // Close modal
    document.getElementById('authModal').classList.remove('active');
    
    // Update UI
    window.location.reload();
    
    showNotification('Account created successfully!', 'success');
}

// Logout function
function logout() {
    localStorage.removeItem('currentUser');
    AppState.currentUser = null;
    window.location.href = 'index.html';
}

window.logout = logout;
