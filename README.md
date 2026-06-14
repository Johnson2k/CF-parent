# CF Parents — Hostel Student Tracking System

A web app for foundation staff (Admin) and parents to track hostel students' status and live location when traveling home.

## 📁 Files
```
index.html      - Login & Registration page
admin.html      - Admin dashboard (manage students, batches, live map)
parent.html     - Parent/student view (set destination, share live location)
setup.html      - One-time page to create the first Admin account
js/firebase-config.js  - Firebase project configuration (EDIT THIS)
js/auth.js              - Custom ID/password authentication logic
```

## 🔧 Setup Steps

### 1. Create a Firebase Project
1. Go to https://console.firebase.google.com
2. Click "Add Project" → name it (e.g. "CF-Parents") → create it
3. In the project, go to **Build → Realtime Database** → click "Create Database" → choose a region → start in **test mode** (we'll secure it later)

### 2. Get Your Firebase Config
1. In Firebase Console, click the gear icon → **Project Settings**
2. Scroll to "Your apps" → click the **Web icon (`</>`)**
3. Register the app (any nickname) → Firebase Hosting NOT required
4. Copy the `firebaseConfig` object shown

### 3. Add Config to Your Project
Open `js/firebase-config.js` and replace the placeholder values:
```js
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  databaseURL: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};
```

### 4. Set Database Rules (Important!)
In Firebase Console → Realtime Database → Rules tab, use these rules for now:
```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```
⚠️ This is OPEN for development/testing only. Before going live, tighten these rules (e.g. restrict writes to authenticated sessions, validate data structure).

### 5. Create Your Admin Account
1. Open `setup.html` in your browser (or visit `yourdomain.com/setup.html` after deploying)
2. Create your admin ID + password
3. **Delete or restrict `setup.html`** after creating your admin account(s) — anyone with access can create admins!

### 6. Deploy to GitHub Pages
1. Push all these files to a GitHub repo
2. Go to repo **Settings → Pages**
3. Set source to your main branch (root folder)
4. Your site will be live at `https://yourusername.github.io/reponame/`

## 👥 How It Works

### Parents/Students (Self-Registration)
- Go to `index.html` → "Register" tab
- Choose a unique ID, enter student name, batch ID, and password
- This creates both a login account AND a student record

### Login
- Same `index.html` → "Login" tab
- Enter ID + password → redirects to Admin or Parent dashboard based on role

### Student Going Home
1. Parent/student logs in → `parent.html`
2. Sets destination (text address + optional GPS pin)
3. Clicks "Start Journey" → status changes to "On the Way", live GPS sharing begins
4. Admin sees live location on map in real-time
5. Student clicks "I've Reached Destination" → status changes to "Reached", sharing stops

### Admin Dashboard
- View all students, filter by batch/status
- See live map with all active journeys
- Create new batches
- When a batch completes, click "Mark Completed & Remove Students" — this deletes all student records + their login accounts for that batch

## 📌 Notes
- **Notifications (FCM)**: Not yet implemented in this version. Can be added later using Firebase Cloud Messaging + a service worker for push notifications when status changes.
- **Location sharing**: Uses browser's `navigator.geolocation.watchPosition()` — requires the student to keep the `parent.html` tab/page open and grant location permission. For best results, students should use this on their phone browser while traveling.
- **Security**: Current auth is custom (ID/password hashed with SHA-256, stored in Realtime DB). This is simpler but less secure than Firebase Auth. Suitable for internal/small-scale use.
