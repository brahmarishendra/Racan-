// DOM Elements for Auth
const loginContainer = document.getElementById('login-container');
const registerContainer = document.getElementById('register-container');
const appContainer = document.getElementById('app-container');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const showRegisterLink = document.getElementById('show-register');
const showLoginLink = document.getElementById('show-login');
const loginError = document.getElementById('login-error');
const registerError = document.getElementById('register-error');
const logoutButton = document.getElementById('logout-button');
const userNameElement = document.getElementById('user-name');
const userAvatarElement = document.getElementById('user-avatar');

const auth = firebase.auth();
const db = firebase.firestore();
let currentUser = null;

// Check Auth State on Page Load
window.addEventListener("DOMContentLoaded", () => {
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            // User is logged in, show the app container
            currentUser = user;
            showAppUI(user);
        } else {
            // No user is logged in, show login page
            showLoginUI();
        }
    });
});

// Show App UI
async function showAppUI(user) {
    loginContainer.style.display = 'none';
    registerContainer.style.display = 'none';
    appContainer.style.display = 'flex';

    // Fetch user info from Firestore
    const userDoc = await db.collection('users').doc(user.uid).get();
    if (userDoc.exists) {
        const userData = userDoc.data();
        userNameElement.textContent = userData.name;
        userAvatarElement.textContent = getInitials(userData.name);
    } else {
        userNameElement.textContent = user.displayName || user.email;
        userAvatarElement.textContent = getInitials(user.displayName || user.email);
    }
}

// Show Login UI
function showLoginUI() {
    loginContainer.style.display = 'block';
    registerContainer.style.display = 'none';
    appContainer.style.display = 'none';
}

// Handle User Registration
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;

        await db.collection('users').doc(user.uid).set({
            name: name,
            email: email,
            location: { latitude: 0, longitude: 0 },
            lastSeen: firebase.firestore.FieldValue.serverTimestamp(),
            isOnline: true
        });

        await user.updateProfile({ displayName: name });

        showAppUI(user);
    } catch (error) {
        registerError.textContent = error.message;
        registerError.style.display = 'block';
    }
});

// Handle User Login
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        await auth.signInWithEmailAndPassword(email, password);
        // The auth state listener will handle UI updates
    } catch (error) {
        loginError.textContent = error.message;
        loginError.style.display = 'block';
    }
});

// Handle Logout
logoutButton.addEventListener('click', async () => {
    try {
        if (currentUser) {
            await db.collection('users').doc(currentUser.uid).update({
                isOnline: false,
                lastSeen: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
        await auth.signOut();
        showLoginUI(); // Redirect to login page after logout
    } catch (error) {
        console.error("Error during logout:", error);
    }
});

// Get Initials for Avatar
function getInitials(name) {
    if (!name) return "?";
    return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase();
}
