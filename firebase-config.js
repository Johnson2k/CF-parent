const firebaseConfig = {
  apiKey: "AIzaSyAEYLb-12Sy1IJt-Sw-1IG3tnmiNsKyFAg",
  authDomain: "cf-parent.firebaseapp.com",
  databaseURL: "https://cf-parent-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "cf-parent",
  storageBucket: "cf-parent.firebasestorage.app",
  messagingSenderId: "496223135941",
  appId: "1:496223135941:web:da8c92a5b928aac28828ac"
};

try {
  if (typeof firebase !== 'undefined') {
    firebase.initializeApp(firebaseConfig);
    // Attach db to window to make it globally accessible across all scripts
    var db = firebase.database();
    window.db = db;
    console.log("Firebase initialized successfully.");
  } else {
    throw new Error("Firebase SDK (firebase-app-compat.js) is not loaded.");
  }
} catch (e) {
  console.error("Firebase Initialization Error:", e.message);
  alert("Critical Error: The tracking system could not connect to Google Services. Please check your internet connection.");
}
