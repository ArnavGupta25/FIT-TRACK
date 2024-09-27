document.addEventListener('DOMContentLoaded', initializeUserInterface);

// Main function tothe user interface
function initializeUserInterface() {
    const userSection = document.getElementById('userSection');
    const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
    const userEmail = sessionStorage.getItem('userEmail');

    updateUserSection(userSection, isLoggedIn, userEmail);
    setupGetStartedButton(isLoggedIn);
}

// Update the user section based on login status
function updateUserSection(userSection, isLoggedIn, userEmail) {
    if (isLoggedIn && userEmail) {
        renderLoggedInUI(userSection, userEmail);
    } else {
        renderLoggedOutUI(userSection);
    }
}

// Render UI for logged-in users
function renderLoggedInUI(userSection, userEmail) {
    userSection.innerHTML = `
        <div class="user-info">
            <span>${userEmail}</span>
            <a href="dashboard.html" class="btn dashboard-btn">Dashboard</a>
            <button id="logoutBtn" class="btn logout-btn">Logout</button>
        </div>
    `;
    setupLogoutButton();
}

// Render UI for logged-out users
function renderLoggedOutUI(userSection) {
    userSection.innerHTML = `
        <button id="loginBtn" class="btn login__btn">Login</button>
    `;
    setupLoginButton();
}

//Event listener for logout button
function setupLogoutButton() {
    document.getElementById('logoutBtn').addEventListener('click', function() {
        sessionStorage.removeItem('isLoggedIn');
        sessionStorage.removeItem('userEmail');
        window.location.reload();
    });
}

//Event listener for login button
function setupLoginButton() {
    document.getElementById('loginBtn').addEventListener('click', function () {
        window.location.href = 'auth.html';
    });
}

//Event listener for "Get Started" button
function setupGetStartedButton(isLoggedIn) {
    const getStartedBtn = document.getElementById('getstartedBtn');
    if (getStartedBtn) {
        getStartedBtn.addEventListener('click', function () {
            window.location.href = isLoggedIn ? 'dashboard.html' : 'auth.html';
        });
    }
}