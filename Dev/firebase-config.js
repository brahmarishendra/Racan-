// Firebase configuration
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

// Get references to Firebase services
const auth = firebase.auth();
const db = firebase.firestore();
const rtdb = firebase.database();

// Live message API key
const LIVE_MESSAGE_API = "gby65n65fpn76tus5qmh7ufkny7rn74yf6j6ugcd7kp7ew8tvqja4fvru4gtkna7";

// App State Variables
let currentUser = null;
let userLocation = null;
let nearbyUsers = [];
let currentChatUserId = null;
let messagesListener = null;
let maxDistance = 10; // Default 10km

// DOM elements for loading indicator
const loadingIndicator = document.getElementById('loading-indicator');

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

// Setup real-time database reference with the API key
const liveMessagesRef = rtdb.ref(`messages/${gby65n65fpn76tus5qmh7ufkny7rn74yf6j6ugcd7kp7ew8tvqja4fvru4gtkna7}`);
