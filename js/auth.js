import { getDatabase, ref, set, get, child } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { app } from "./firebase.js";

const db = getDatabase(app);

// --- Register Admin Function ---
export const registerUser = async () => {
  const adminId = document.getElementById("adminRegId").value.trim();
  const password = document.getElementById("adminRegPassword").value;
  const confirmPassword = document.getElementById("adminRegConfirmPassword").value;
  const msgEl = document.getElementById("adminRegMsg");

  if (!adminId || !password || !confirmPassword) {
    alert("Please fill all fields.");
    return;
  }

  if (password !== confirmPassword) {
    alert("Passwords do not match!");
    return;
  }

  try {
    const dbRef = ref(db);
    const snapshot = await get(child(dbRef, `admins/${adminId}`));

    if (snapshot.exists()) {
      alert("Admin ID already taken!");
      return;
    }

    await set(ref(db, `admins/${adminId}`), { password: password });
    alert("Admin account created successfully!");
    location.reload(); // Refresh to clear forms
  } catch (error) {
    console.error(error);
    alert("Error creating account: " + error.message);
  }
};

// --- Login Admin Function ---
export const loginUser = async () => {
  const adminId = document.getElementById("adminLoginId").value.trim();
  const password = document.getElementById("adminLoginPassword").value;

  if (!adminId || !password) {
    alert("Please enter ID and password.");
    return;
  }

  try {
    const dbRef = ref(db);
    const snapshot = await get(child(dbRef, `admins/${adminId}`));

    if (snapshot.exists() && snapshot.val().password === password) {
      // Store session
      localStorage.setItem("cfp_session", JSON.stringify({ id: adminId, role: "admin" }));
      alert("Login Successful!");
      window.location.href = "dashboard.html";
    } else {
      alert("Invalid ID or Password.");
    }
  } catch (error) {
    console.error(error);
    alert("Login failed: " + error.message);
  }
};

// Attach to window so HTML onclick can find them
window.loginUser = loginUser;
window.registerUser = registerUser;
window.logoutUser = () => { localStorage.removeItem("cfp_session"); location.href = "index.html"; };
window.getSession = () => JSON.parse(localStorage.getItem("cfp_session"));
