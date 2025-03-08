import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
} from "https://www.gstatic.com/firebasejs/9.17.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyD5Cnc7pSiBkVj1urKxQNlTVkHKvUzAFo8",
  authDomain: "fashion-ai-9a90d.firebaseapp.com",
  projectId: "fashion-ai-9a90d",
  storageBucket: "fashion-ai-9a90d.appspot.com",
  messagingSenderId: "323896131179",
  appId: "1:323896131179:web:2c96102ebef89da1153b2e",
  measurementId: "G-TDLGEJWJHC",
};

// Initialize Firebase and Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

document.addEventListener("DOMContentLoaded", () => {
  const subscribeButton = document.querySelector(".subscribe");
  const emailInput = document.querySelector(".mail");

  if (subscribeButton.getAttribute("type") === "submit") {
    subscribeButton.setAttribute("type", "button");
  }

  subscribeButton.addEventListener("click", async (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();
    if (!email) {
      alert("Please enter a valid email address.");
      return;
    }

    try {
      await addDoc(collection(db, "subscriptions"), {
        email: email,
        timestamp: new Date(),
      });
      alert("Thank you for subscribing Racan Update You Soon !");
      emailInput.value = "";
      // Redirect the user back to the specified URL
      window.location.href = "https://q65zy9-5000.csb.app/";
    } catch (error) {
      console.error("Error saving subscription:", error);
      alert("An error occurred. Please try again later.");
    }
  });
});
