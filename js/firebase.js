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
var db = firebase.database();
window.db = db;

// --- Session Management (Required for Dashboards) ---
window.getSession = () => JSON.parse(localStorage.getItem("cfp_session"));
window.logoutUser = () => {
    console.log("Logging out...");
    localStorage.removeItem("cfp_session");
    window.location.href = "index.html";
};
window.requireRole = (requiredRole) => {
    const session = window.getSession();
    if (!session || session.role !== requiredRole) {
        window.location.href = "index.html";
        return null;
    }
    return session;
};

// --- Simple Hash Helper ---
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

// --- Unified Login Function ---
window.loginUser = async (id, password) => {
    console.log("loginUser called for:", id);

    if (!id || !password) {
        throw new Error("Please enter both ID and password.");
    }

    const cleanId = id.trim().toLowerCase();
    const hashedInput = await hashPassword(password);

    // 1. Try Admin path
    let snapshot = await db.ref("admins/" + cleanId).once("value");
    if (snapshot.exists()) {
        const data = snapshot.val();
        if (data.password === password || data.password === hashedInput) {
            const session = { id: cleanId, role: "admin" };
            localStorage.setItem("cfp_session", JSON.stringify(session));
            return session;
        } else {
            throw new Error("Incorrect Admin password.");
        }
    }

    // 2. Try User (Student) path
    snapshot = await db.ref("users/" + cleanId).once("value");
    if (snapshot.exists()) {
        const data = snapshot.val();
        if (data.password === password || data.password === hashedInput || data.passwordHash === hashedInput) {
            const session = {
                id: cleanId,
                role: data.role || "parent",
                studentName: data.studentName || ""
            };
            localStorage.setItem("cfp_session", JSON.stringify(session));
            return session;
        } else {
            throw new Error("Incorrect Student password.");
        }
    }

    throw new Error("Account not found. Please check your ID.");
};

// --- Unified Register Function ---
window.registerUser = async (id, password, extraData = {}) => {
    console.log("registerUser called for:", id);
    const cleanId = id.trim().toLowerCase();

    if (!cleanId || !password) {
        throw new Error("ID and password are required.");
    }

    // Determine path based on role
    const path = extraData.role === "admin" ? "admins/" : "users/";

    const snapshot = await db.ref(path + cleanId).once("value");
    if (snapshot.exists()) {
        throw new Error("This ID is already taken.");
    }

    const userData = {
        id: cleanId,
        password: await hashPassword(password),
        role: extraData.role || "parent",
        studentName: extraData.studentName || "",
        batchId: extraData.batchId || "",
        createdAt: Date.now()
    };

    await db.ref(path + cleanId).set(userData);
    return userData;
};

// --- Event Listeners for HTML Buttons ---
document.addEventListener("DOMContentLoaded", () => {
    // Admin Login
    const loginBtn = document.getElementById("loginBtn");
    if (loginBtn) {
        loginBtn.onclick = null; // Clear any old handlers
        loginBtn.addEventListener("click", async () => {
            const id = document.getElementById("loginAdminId")?.value;
            const pass = document.getElementById("loginPassword")?.value;
            try {
                const session = await window.loginUser(id, pass);
                window.location.href = session.role === "admin" ? "admin.html" : "dashboard.html";
            } catch (err) {
                alert(err.message);
            }
        });
    }

    // Admin Register
    const registerBtn = document.getElementById("registerBtn");
    if (registerBtn) {
        registerBtn.addEventListener("click", async () => {
            const id = document.getElementById("adminId").value;
            const pass = document.getElementById("password").value;
            const conf = document.getElementById("confirmPassword").value;
            if (pass !== conf) return alert("Passwords do not match");
            try {
                await window.registerUser(id, pass, { role: "admin" });
                alert("Admin Registered Successfully ✅");
                location.reload();
            } catch (err) {
                alert(err.message);
            }
        });
    }
});