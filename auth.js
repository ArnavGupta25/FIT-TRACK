const authTitle = document.getElementById('authTitle');
const authForm = document.getElementById('authForm');
const authBtn = document.getElementById('authBtn');
const switchAuth = document.getElementById('switchAuth');
const confirmPasswordGroup = document.getElementById('confirmPasswordGroup');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirmPassword');

let isLogin = true;

const savedEmail = localStorage.getItem('userEmail');
if (savedEmail) {
    emailInput.value = savedEmail;
}

const isSignedUp = localStorage.getItem('isSignedUp') === 'true';
const savedPassword = localStorage.getItem('userPassword');

switchAuth.addEventListener('click', (e) => {
    e.preventDefault();
    toggleAuth();
});

authForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = emailInput.value;
    const password = passwordInput.value;

    if (isLogin) {
        if (!isSignedUp || !savedEmail) {
            alert("You must sign up before logging in.");
            resetFields();
            toggleAuth(false);
            return;
        }

        if (email === savedEmail && password !== savedPassword) {
            alert("Password doesn't match! Please try again.");
            resetFields();
            return;
        }

        if (email !== savedEmail) {
            alert("No account found with this email. Please sign up.");
            resetFields();
            toggleAuth(false);
            return;
        }

        sessionStorage.setItem('isLoggedIn', 'true');
        sessionStorage.setItem('userEmail', email);
        alert('Login successful!');
        resetFields();
        window.location.href = 'dashboard.html';
    } else {
        const confirmPassword = confirmPasswordInput.value;

        if (!isStrongPassword(password)) {
            alert("Password must be at least 8 characters long, with at least one uppercase letter, one digit, and one special character.");
            resetFields();
            return;
        }

        if (password !== confirmPassword) {
            alert("Passwords don't match!");
            resetFields();
            return;
        }

        localStorage.setItem('isSignedUp', 'true');
        localStorage.setItem('userEmail', email);
        localStorage.setItem('userPassword', password);

        alert('Sign Up successful!');
        resetFields();
        window.location.reload();
    }
});

function isStrongPassword(password) {
    const strongPasswordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return strongPasswordRegex.test(password);
}

function toggleAuth(toLogin = !isLogin) {
    isLogin = toLogin;
    authTitle.textContent = isLogin ? 'Login' : 'Sign Up';
    authBtn.textContent = isLogin ? 'Login' : 'Sign Up';
    switchAuth.textContent = isLogin ? 'Sign Up' : 'Login';
    confirmPasswordGroup.style.display = isLogin ? 'none' : 'block';
    authForm.reset();

    if (isLogin && savedEmail) {
        emailInput.value = savedEmail;
    }
}

function resetFields() {
    emailInput.value = '';
    passwordInput.value = '';
    confirmPasswordInput.value = '';
}
