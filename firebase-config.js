// =========================================
// REPLACE WITH YOUR FIREBASE PROJECT CONFIG
// Firebase Console -> Project Settings -> General -> Your apps -> Web app
// =========================================
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT-default-rtdb.firebaseio.com",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase (compat SDK loaded via CDN in HTML files)
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
