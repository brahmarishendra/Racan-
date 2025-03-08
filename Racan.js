import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyD5Cnc7pSiBkVj1urKxQNlTVkHKvUzAFo8",
  authDomain: "fashion-ai-9a90d.firebaseapp.com",
  projectId: "fashion-ai-9a90d",
  storageBucket: "fashion-ai-9a90d.appspot.com",
  messagingSenderId: "323896131179",
  appId: "1:323896131179:web:2c96102ebef89da1153b2e",
  measurementId: "G-TDLGEJWJHC",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

document.addEventListener("DOMContentLoaded", function () {
  const registerBtn = document.querySelector('.signup-btn');
  if (registerBtn) {
    registerBtn.addEventListener('click', function () {
      signInWithPopup(auth, provider)
        .then((result) => {
          const user = result.user;
          const userInfoDiv = document.getElementById('user-info');
          if (userInfoDiv) {
            userInfoDiv.innerHTML = `
              <p>Thank you, ${user.displayName}! We will update you soon.</p>
            `;
          } else {
            alert(`Thank you, ${user.displayName}! We will update you soon.`);
          }
        })
        .catch((error) => {
          alert("An error occurred during registration. Please try again.");
        });
    });
  }
});
