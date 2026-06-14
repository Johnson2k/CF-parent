// =========================================
// AUTH UTILITIES - Custom ID/Password system
// Stored in Realtime Database under /users/{uniqueId}
// =========================================

// Simple hash function (SHA-256 via Web Crypto API)
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

// Register new user (parent/student self-registration)
// role: "parent" or "admin"
async function registerUser(uniqueId, password, extraData = {}) {
  uniqueId = uniqueId.trim().toLowerCase();

  if (!uniqueId || !password) {
    throw new Error("ID and password are required.");
  }
  if (password.length < 4) {
    throw new Error("Password must be at least 4 characters.");
  }

  // Check if ID already exists
  const snapshot = await db.ref("users/" + uniqueId).once("value");
  if (snapshot.exists()) {
    throw new Error("This ID is already taken. Please choose another.");
  }

  const passwordHash = await hashPassword(password);

  await db.ref("users/" + uniqueId).set({
    id: uniqueId,
    passwordHash: passwordHash,
    role: extraData.role || "parent",
    studentName: extraData.studentName || "",
    batchId: extraData.batchId || "",
    createdAt: Date.now()
  });

  return uniqueId;
}

// Login existing user
async function loginUser(uniqueId, password) {
  uniqueId = uniqueId.trim().toLowerCase();

  const snapshot = await db.ref("users/" + uniqueId).once("value");
  if (!snapshot.exists()) {
    throw new Error("Account not found. Please check your ID.");
  }

  const userData = snapshot.val();
  const passwordHash = await hashPassword(password);

  if (userData.passwordHash !== passwordHash) {
    throw new Error("Incorrect password.");
  }

  // Save session in localStorage
  localStorage.setItem("cfp_session", JSON.stringify({
    id: userData.id,
    role: userData.role,
    studentName: userData.studentName || ""
  }));

  return userData;
}

// Get current logged-in session
function getSession() {
  const raw = localStorage.getItem("cfp_session");
  return raw ? JSON.parse(raw) : null;
}

// Logout
function logoutUser() {
  localStorage.removeItem("cfp_session");
  window.location.href = "index.html";
}

// Route guard - call at top of admin.html / parent.html
function requireRole(requiredRole) {
  const session = getSession();
  if (!session || session.role !== requiredRole) {
    window.location.href = "index.html";
    return null;
  }
  return session;
}
