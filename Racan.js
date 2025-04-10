// Firebase configuration and initialization
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD5Cnc7pSiBkVj1urKxQNlTVkHKvUzAFo8",
  authDomain: "fashion-ai-9a90d.firebaseapp.com",
  projectId: "fashion-ai-9a90d",
  storageBucket: "fashion-ai-9a90d.appspot.com",
  messagingSenderId: "323896131179",
  appId: "1:323896131179:web:2c96102ebef89da1153b2e",
  measurementId: "G-TDLGEJWJHC",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Wait for DOM to be fully loaded
document.addEventListener("DOMContentLoaded", function () {
  // Find the signup button
  const signupBtn = document.querySelector('.signup-btn');
  
  if (signupBtn) {
    signupBtn.addEventListener('click', function () {
      // Show loading state (optional)
      signupBtn.classList.add('loading');
      signupBtn.disabled = true;
      
      // Trigger Google sign-in popup
      signInWithPopup(auth, provider)
        .then((result) => {
          // Get the user info from the result
          const user = result.user;
          
          // Find the user-info div to update with success message
          const userInfoDiv = document.getElementById('user-info');
          if (userInfoDiv) {
            userInfoDiv.innerHTML = `
              <p>Thank you, ${user.displayName}! We will update you soon.</p>
            `;
          } else {
            // Fallback to alert if user-info div doesn't exist
            alert(`Thank you, ${user.displayName}! We will update you soon.`);
          }
          
          // You could redirect the user here if needed
          // window.location.href = '/dashboard.html';
          
          // Store user info in localStorage (optional)
          localStorage.setItem('user', JSON.stringify({
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            uid: user.uid
          }));
        })
        .catch((error) => {
          // Handle any errors
          console.error("Authentication Error:", error);
          alert("An error occurred during registration. Please try again.");
        })
        .finally(() => {
          // Remove loading state
          signupBtn.classList.remove('loading');
          signupBtn.disabled = false;
        });
    });
  } else {
    console.error("Signup button not found in the DOM");
  }
  
  // Check if user is already logged in (optional)
  auth.onAuthStateChanged((user) => {
    if (user) {
      console.log("User is already signed in:", user.displayName);
      // You can update the UI here if needed
    }
  });
});
