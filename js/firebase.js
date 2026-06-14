import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

const firebaseConfig = {
    apiKey: "AIzaSyAEYLb-12Sy1IJt-Sw-1IG3tnmiNsKyFAg",
    authDomain: "cf-parent.firebaseapp.com",
    databaseURL: "https://cf-parent-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "cf-parent",
    storageBucket: "cf-parent.firebasestorage.app",
    messagingSenderId: "496223135941",
    appId: "1:496223135941:web:da8c92a5b928aac28828ac",
    measurementId: "G-TNLFJGT1PK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export { app, firebaseConfig };