document.addEventListener('DOMContentLoaded', function() {
    const userSection = document.getElementById('userSection');
    const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
    const userEmail = sessionStorage.getItem('userEmail');

    if (isLoggedIn && userEmail) {
        // User is logged in
        userSection.innerHTML = `
            <div class="user-info">
                <span>${userEmail}</span>
                <a href="dashboard.html" class="btn dashboard-btn">Dashboard</a>
                <button id="logoutBtn" class="btn logout-btn">Logout</button>
            </div>
        `;

        // Add event listener for logout button
        document.getElementById('logoutBtn').addEventListener('click', function() {
            sessionStorage.removeItem('isLoggedIn');
            sessionStorage.removeItem('userEmail');
            window.location.reload();
        });
    } else {
        // User is not logged in
        userSection.innerHTML = `
            <button id="loginBtn" class="btn login__btn">Login</button>
        `;

        document.getElementById('loginBtn').addEventListener('click', function () {
            window.location.href = 'auth.html';
        });
    }

    // Get Started button event listener
    const getStartedBtn = document.getElementById('getstartedBtn');
    if (getStartedBtn) {
        getStartedBtn.addEventListener('click', function () {
            if (isLoggedIn) {
                window.location.href = 'dashboard.html';
            } else {
                window.location.href = 'auth.html';
            }
        });
    }
});