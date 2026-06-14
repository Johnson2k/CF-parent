import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { app } from "./firebase.js";
import { writeData, readDataOnce } from "./db.js";

const auth = getAuth(app);

// Helper to map simple IDs to email format for Firebase Auth
const idToEmail = (id) => `${id.trim().toLowerCase()}@cfparents.local`;

/**
 * Email/Password Login
 */
export const loginUser = async (id, password) => {
  try {
    const email = idToEmail(id);
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const userData = await readDataOnce(`users/${id.toLowerCase()}`);
    const session = {
      id: id.toLowerCase(),
      role: userData?.role || "parent",
      studentName: userData?.studentName || ""
    };

    localStorage.setItem("cfp_session", JSON.stringify(session));
    return session;
  } catch (error) {
    console.error("Login Error:", error.code);
    throw error;
  }
};

/**
 * Email/Password Registration
 */
export const registerUser = async (id, password, extraData = {}) => {
  try {
    const email = idToEmail(id);
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    // Save metadata to RTDB
    await writeData(`users/${id.toLowerCase()}`, {
      id: id.toLowerCase(),
      role: extraData.role || "parent",
      studentName: extraData.studentName || "",
      batchId: extraData.batchId || "",
      createdAt: Date.now()
    });

    return userCredential.user;
  } catch (error) {
    console.error("Registration Error:", error.code);
    throw error;
  }
};

/**
 * Get current session
 */
export const getSession = () => {
  const raw = localStorage.getItem("cfp_session");
  return raw ? JSON.parse(raw) : null;
};

// Logout
export const logoutUser = () => signOut(auth).then(() => {
  localStorage.removeItem("cfp_session");
  window.location.href = "index.html";
});

// Make functions globally available for existing HTML onclick attributes
window.loginUser = loginUser;
window.registerUser = registerUser;
window.logoutUser = logoutUser;
window.getSession = getSession;

export { auth, onAuthStateChanged };
