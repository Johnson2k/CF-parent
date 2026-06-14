console.log("JS Loaded");

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
firebase.initializeApp(firebaseConfig);

function loginUser() {
    console.log("loginUser called");

    const adminId = document.getElementById("loginAdminId").value;
    const password = document.getElementById("loginPassword").value;

    if (!adminId || !password) {
        alert("Enter all fields");
        return;
    }

    firebase.database().ref("admins/" + adminId).once("value")
        .then(snapshot => {
            if (!snapshot.exists()) {
                alert("Admin not found ❌");
                return;
            }

            const data = snapshot.val();
            console.log("Fetched Data:", data);

            if (data.password === password) {
                alert("Login successful ✅");
                // Save session for the dashboard route guard
                localStorage.setItem("cfp_session", JSON.stringify({ id: adminId, role: "admin" }));
                window.location.href = "dashboard.html";
            } else {
                alert("Wrong password ❌");
            }
        })
        .catch(error => {
            console.error(error);
            alert(error.message);
        });
}

function registerUser() {
    console.log("registerUser called");

    const adminId = document.getElementById("adminId").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (!adminId || !password || !confirmPassword) {
        alert("All fields required");
        return;
    }

    if (password !== confirmPassword) {
        alert("Passwords do not match");
        return;
    }

    firebase.database().ref("admins/" + adminId).set({
        password: password
    })
        .then(() => {
            alert("Registered successfully");
        })
        .catch(err => alert(err.message));
}

// Ensure function is globally accessible
window.registerUser = registerUser;
window.loginUser = loginUser;

document.addEventListener("DOMContentLoaded", () => {
    const registerBtn = document.getElementById("registerBtn");
    if (registerBtn) {
        registerBtn.addEventListener("click", registerUser);
    }

    const loginBtn = document.getElementById("loginBtn");
    if (loginBtn) {
        loginBtn.addEventListener("click", loginUser);
    }
});