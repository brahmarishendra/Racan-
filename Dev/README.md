# Devfdate - Dating App for Tech Professionals

A modern dating application specifically designed for tech professionals to connect, share, and build meaningful relationships.

## Features

- 🔐 Authentication with Email, Google, and GitHub
- 👤 User Profiles with Tech Stack and Experience Level
- 💬 Real-time Messaging
- 🔍 Advanced Search by Tech Stack and Experience
- 📱 Responsive Design
- 🖼️ Profile Image Upload
- 💻 Tech-focused Matching

## Setup Instructions

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)

2. Enable Authentication with Email/Password, Google, and GitHub providers

3. Create a Firestore database and enable Storage

4. Update the Firebase configuration in `js/firebase-config.js` with your project details:
```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

5. Set up GitHub OAuth:
   - Go to GitHub Developer Settings
   - Create a new OAuth App
   - Add the callback URL from Firebase
   - Update the GitHub provider in Firebase Console

6. Set up Google OAuth:
   - Go to Google Cloud Console
   - Create a new project
   - Enable Google Sign-In API
   - Add authorized domains in Firebase Console

7. Run the application:
   - Open `index.html` in a web browser
   - Or use a local server (recommended)

## Project Structure

```
devfdate/
├── index.html          # Main HTML file
├── css/
│   └── style.css      # Styles
├── js/
│   ├── firebase-config.js  # Firebase configuration
│   ├── auth.js        # Authentication logic
│   └── app.js         # Main application logic
└── images/
    └── default-avatar.png  # Default profile image
```

## Security Rules

Set up the following Firestore rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    match /messages/{messageId} {
      allow read, write: if request.auth != null && 
        (request.auth.uid == resource.data.senderId || 
         request.auth.uid == resource.data.receiverId);
    }
  }
}
```

## Contributing

Feel free to submit issues and enhancement requests! 