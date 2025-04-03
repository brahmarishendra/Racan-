// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyBtpcOzOo6H4xPTYji-QIvT94lX2Opt1Ac",
    authDomain: "techmate-e5a8a.firebaseapp.com",
    projectId: "techmate-e5a8a",
    storageBucket: "techmate-e5a8a.firebasestorage.app",
    messagingSenderId: "1041870371777",
    appId: "1:1041870371777:web:be5f03c92dbc86d5708d40",
    measurementId: "G-4T29QHVS4M"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Firebase Services
const auth = firebase.auth();
const db = firebase.firestore();
const rtdb = firebase.database();

// Global Variables
let currentUser = null;
let userLocation = null;
let nearbyUsers = [];
let maxDistance = 10; // Default 10km
let chat = null;

// DOM Elements
const loginContainer = document.getElementById('login-container');
const registerContainer = document.getElementById('register-container');
const appContainer = document.getElementById('app-container');
const loadingIndicator = document.getElementById('loading-indicator');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const showRegisterLink = document.getElementById('show-register');
const showLoginLink = document.getElementById('show-login');
const loginError = document.getElementById('login-error');
const registerError = document.getElementById('register-error');
const logoutButton = document.getElementById('logout-button');
const userNameElement = document.getElementById('user-name');
const userAvatarElement = document.getElementById('user-avatar');
const userList = document.getElementById('user-list');
const refreshUsersButton = document.getElementById('refresh-users');
const distanceRange = document.getElementById('distance-range');
const rangeValue = document.getElementById('range-value');

// Initialize Chat module
document.addEventListener('DOMContentLoaded', () => {
    chat = new Chat(db, rtdb, currentUser);
});

// Auth UI Navigation
showRegisterLink.addEventListener('click', () => {
    loginContainer.style.display = 'none';
    registerContainer.style.display = 'block';
});

showLoginLink.addEventListener('click', () => {
    registerContainer.style.display = 'none';
    loginContainer.style.display = 'block';
});

// Auth Form Submissions
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    showLoading();
    try {
        await auth.signInWithEmailAndPassword(email, password);
        // Auth state change listener will handle UI updates
    } catch (error) {
        hideLoading();
        loginError.textContent = error.message;
        loginError.style.display = 'block';
    }
});

registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    showLoading();
    try {
        // Create user account
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        
        // Add user to database with default location
        await db.collection('users').doc(userCredential.user.uid).set({
            name: name,
            email: email,
            location: { latitude: 0, longitude: 0 },
            lastSeen: firebase.firestore.FieldValue.serverTimestamp(),
            isOnline: true
        });
        
        // Update display name
        await userCredential.user.updateProfile({
            displayName: name
        });
        
        // Auth state change listener will handle UI updates
    } catch (error) {
        hideLoading();
        registerError.textContent = error.message;
        registerError.style.display = 'block';
    }
});

// Logout
logoutButton.addEventListener('click', async () => {
    try {
        // Update user status to offline
        if (currentUser) {
            await db.collection('users').doc(currentUser.uid).update({
                isOnline: false,
                lastSeen: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
        await auth.signOut();
    } catch (error) {
        console.error("Error during logout:", error);
    }
});

// Auth State Change Listener
auth.onAuthStateChanged(async (user) => {
    hideLoading();
    
    if (user) {
        currentUser = user;
        // Show app container, hide auth containers
        loginContainer.style.display = 'none';
        registerContainer.style.display = 'none';
        appContainer.style.display = 'flex';
        
        // Update UI with user info
        userNameElement.textContent = user.displayName || user.email;
        const initials = getInitials(user.displayName || user.email);
        userAvatarElement.textContent = initials;
        
        // Update chat module with current user
        if (chat) {
            chat.setCurrentUser(user);
        }
        
        // Get user's location
        await getUserLocation();
        
        // Load nearby users
        loadNearbyUsers();
        
    } else {
        currentUser = null;
        // Show login container, hide app container
        loginContainer.style.display = 'block';
        registerContainer.style.display = 'none';
        appContainer.style.display = 'none';
        
        // Clear any existing chat session
        if (chat) {
            chat.clearChatSession();
        }
    }
});

// Helper Functions
function showLoading() {
    loadingIndicator.style.display = 'flex';
}

function hideLoading() {
    loadingIndicator.style.display = 'none';
}

function getInitials(name) {
    if (!name) return "?";
    return name.split(' ')
        .map(part => part.charAt(0))
        .join('')
        .toUpperCase()
        .substring(0, 2);
}

// Get and update user location
async function getUserLocation() {
    return new Promise((resolve) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    userLocation = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    };
                    
                    // Update user location in database
                    if (currentUser) {
                        try {
                            await db.collection('users').doc(currentUser.uid).update({
                                location: userLocation,
                                lastSeen: firebase.firestore.FieldValue.serverTimestamp(),
                                isOnline: true
                            });
                        } catch (error) {
                            console.error("Error updating user location:", error);
                        }
                    }
                    
                    resolve(userLocation);
                },
                (error) => {
                    console.error("Error getting location:", error);
                    // Use a default location
                    userLocation = { latitude: 0, longitude: 0 };
                    resolve(userLocation);
                }
            );
        } else {
            console.error("Geolocation is not supported by this browser.");
            userLocation = { latitude: 0, longitude: 0 };
            resolve(userLocation);
        }
    });
}

// Calculate distance between two coordinates in km
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const d = R * c; // Distance in km
    return d;
}

function deg2rad(deg) {
    return deg * (Math.PI/180);
}

// Load nearby users based on distance
async function loadNearbyUsers() {
    if (!userLocation) {
        console.error("User location not available");
        return;
    }

    showLoading();
    
    try {
        // Get all users
        const usersSnapshot = await db.collection('users').get();
        const users = [];
        
        usersSnapshot.forEach(doc => {
            // Skip current user
            if (doc.id === currentUser.uid) return;
            
            const userData = doc.data();
            
            // Calculate distance
            const distance = calculateDistance(
                userLocation.latitude, 
                userLocation.longitude,
                userData.location.latitude, 
                userData.location.longitude
            );
            
            // Only include users within the set range
            if (distance <= maxDistance) {
                users.push({
                    id: doc.id,
                    name: userData.name || userData.email || "Unknown User",
                    distance: distance,
                    isOnline: userData.isOnline || false,
                    lastSeen: userData.lastSeen
                });
            }
        });
        
        // Sort by distance
        nearbyUsers = users.sort((a, b) => a.distance - b.distance);
        
        // Update UI
        renderUserList();
        
    } catch (error) {
        console.error("Error loading nearby users:", error);
    } finally {
        hideLoading();
    }
}

// Render the user list in the sidebar
function renderUserList() {
    userList.innerHTML = '';
    
    if (nearbyUsers.length === 0) {
        const noUsers = document.createElement('div');
        noUsers.style.padding = '1rem';
        noUsers.style.color = 'var(--gray)';
        noUsers.style.textAlign = 'center';
        noUsers.textContent = 'No users found nearby. Try increasing the range.';
        userList.appendChild(noUsers);
        return;
    }
    
    nearbyUsers.forEach(user => {
        const userItem = document.createElement('div');
        userItem.className = 'user-item';
        userItem.innerHTML = `
            <div class="user-item-avatar">${getInitials(user.name)}</div>
            <div class="user-item-info">
                <div class="user-item-name">${user.name}</div>
                <div class="user-item-distance">${user.distance.toFixed(1)} km away</div>
            </div>
            <div class="user-item-status" style="background-color: ${user.isOnline ? 'var(--secondary)' : 'var(--gray)'}"></div>
        `;
        
        // Add click event to start chat
        userItem.addEventListener('click', () => {
            // Remove active class from all user items
            userList.querySelectorAll('.user-item').forEach(item => {
                item.classList.remove('active');
            });
            
            // Add active class to clicked user item
            userItem.classList.add('active');
            
            // Start chat with selected user
            if (chat) {
                chat.startChat(user.id, user.name, user.distance);
            }
        });
        
        userList.appendChild(userItem);
    });
}

// Update range value display
distanceRange.addEventListener('input', () => {
    maxDistance = parseInt(distanceRange.value);
    rangeValue.textContent = `${maxDistance}km`;
});

// Update user list when range changes
distanceRange.addEventListener('change', () => {
    loadNearbyUsers();
});

// Refresh nearby users
refreshUsersButton.addEventListener('click', async () => {
    await getUserLocation();
    loadNearbyUsers();
});

// Update online status when page visibility changes
document.addEventListener('visibilitychange', async () => {
    if (currentUser) {
        const isOnline = !document.hidden;
        
        try {
            await db.collection('users').doc(currentUser.uid).update({
                isOnline: isOnline,
                lastSeen: firebase.firestore.FieldValue.serverTimestamp()
            });
        } catch (error) {
            console.error("Error updating online status:", error);
        }
    }
});

// Update user status before unload
window.addEventListener('beforeunload', async () => {
    if (currentUser) {
        try {
            // This may not always complete before the page unloads
            await db.collection('users').doc(currentUser.uid).update({
                isOnline: false,
                lastSeen: firebase.firestore.FieldValue.serverTimestamp()
            });
        } catch (error) {
            console.error("Error updating online status:", error);
        }
    }
});
