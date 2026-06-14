# CF Parents — Project Context Prompt for AI

Use this prompt to give any AI assistant full context about this project before asking for changes or help.

---

## Project Overview

**CF Parents** is a hostel student tracking web app built with plain HTML, CSS, and JavaScript. No frameworks, no build tools. It uses Firebase Realtime Database for live data sync and Leaflet.js + OpenStreetMap for maps.

**Live use case:** Foundation staff (admin) monitors hostel students traveling home. Students share their live GPS location. Admin tracks them on a map in real time.

---

## File Structure

```
CF-parent/
  index.html           - Login & Registration page (role-based)
  admin.html           - Admin dashboard
  parent.html          - Student dashboard
  setup.html           - One-time admin account creation page
  js/
    firebase-config.js - Firebase project config + db initialization
    auth.js            - Custom auth (SHA-256 hashed passwords, localStorage sessions)
```

> All HTML files load scripts as:
> `<script src="js/firebase-config.js"></script>`
> `<script src="js/auth.js"></script>`

---

## Firebase Setup

- **Project ID:** `cf-parent`
- **Database URL:** `https://cf-parent-default-rtdb.asia-southeast1.firebasedatabase.app`
- **Region:** asia-southeast1
- **SDK:** Firebase compat SDK v10.7.1 loaded via CDN script tags (NOT npm/modules)
- **Auth:** Custom (no Firebase Auth) — passwords hashed with SHA-256 via Web Crypto API, stored in `/users/{id}`
- **Database Rules:** Currently open (`.read: true, .write: true`) — development mode

### Firebase Data Structure

```
/users/{id}
  id, passwordHash, role ("admin" or "parent"), studentName, batchId, createdAt

/students/{id}
  id, name, batchId, parentUserId, status ("in_hostel"|"on_way"|"reached"),
  destination: { lat, lng, address },
  currentLocation: { lat, lng, timestamp },
  journeyStartTime, journeyEndTime, lastUpdated

/batches/{id}
  id, status ("active"|"completed"), createdAt, completedAt
```

---

## js/auth.js

Custom auth utility. No changes from original. Provides:
- `hashPassword(password)` — SHA-256 via Web Crypto API
- `registerUser(uniqueId, password, extraData)` — writes to `/users/{id}`
- `loginUser(uniqueId, password)` — verifies hash, saves session to localStorage as `cfp_session`
- `getSession()` — reads `cfp_session` from localStorage
- `logoutUser()` — clears localStorage, redirects to `index.html`
- `requireRole(requiredRole)` — route guard, redirects to `index.html` if role doesn't match

---

## js/firebase-config.js

Initializes Firebase compat SDK and exports `db` as a global:
```js
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
```
Real credentials are configured. All HTML files rely on `db` as a global variable.

---

## index.html — Login & Registration Page

### What changed from original:
- **Before:** Single card with Login + Register tabs — both admin and student used the same form
- **After:** Role selection screen with two big buttons first:
  - 🛡️ **Admin** button → reveals Admin panel
  - 🎒 **Student / Parent** button → reveals Student panel
- Each panel has **Login** and **Register** tabs
- **← Back** button on both panels returns to role selection

### Admin Panel:
- Login tab: ID + Password → validates `role === "admin"`, redirects to `admin.html`
- Register tab: ID + Password + Confirm → creates admin account with `role: "admin"`

### Student Panel:
- Login tab: ID + Password → validates `role === "parent"`, redirects to `parent.html`
- Register tab:
  - Unique ID (text input)
  - Student Name (text input)
  - **Batch (dropdown)** — loads active batches from `/batches` in Firebase on page load via `loadBatches()`. Only batches with `status === "active"` appear. Shows "No batches available" if none exist.
  - Password + Confirm Password
  - On register: creates `/users/{id}` + `/students/{id}` records simultaneously

### Key functions:
- `loadBatches()` — called on DOMContentLoaded, fetches `/batches` once and populates `#regBatchId` select
- `selectRole(role)` — hides role selection, shows correct panel
- `goBack()` — hides panels, shows role selection
- `handleAdminLogin()`, `handleAdminRegister()`, `handleStudentLogin()`, `handleRegister()`

---

## parent.html — Student Dashboard

### What changed from original:
- **Before:** Very minimal — just a status line, destination input, and a hidden map
- **After:** Full dashboard with multiple sections

### Sections (top to bottom):

**1. Header**
- Gradient blue header with "CF Parents" brand, logged-in ID, Logout button

**2. Profile Card** (blue gradient card)
- Avatar circle showing first letter of student name
- Student full name (large)
- Batch ID and Login ID in meta row

**3. Status Card** (color changes based on status)
- 🏠 Green border → `in_hostel` — "In Hostel / You are currently at the hostel"
- 🚶 Yellow border → `on_way` — "On the Way / Your live location is being shared"
- ✅ Blue border → `reached` — "Reached Destination / You have arrived at your destination"
- Status badge on the right side

**4. Info Grid** (2x2 grid of white boxes)
- Last Updated (timestamp)
- Journey Started (timestamp)
- Destination (address text)
- Journey Ended (timestamp)

**5. Journey Controls section**
- Destination Address text input
- Blue confirmation bar (`#destSetMsg`) shows currently saved destination
- "📍 Pin My Location as Destination" button (btn-pin, dark blue)
- "🚶 Start Journey" button (btn-start, yellow) — hidden when status is `on_way`
- "✅ I've Reached" button (btn-stop, green) — visible only when status is `on_way`
- "🔄 Reset / Go Back to Hostel" button (btn-reset, red) — visible only when status is `reached`

**6. Live Location Map section**
- Always visible at bottom
- Leaflet map, 300px height
- Shows current location marker + destination marker + dashed polyline between them

### Key logic:
- `db.ref("students/" + studentId).on("value", ...)` — real-time listener updates entire dashboard
- `renderDashboard(data)` — updates all UI elements from student data
- `startLocationSharing()` — uses `navigator.geolocation.watchPosition()`, pushes to Firebase every update
- `stopLocationSharing()` — clears watchPosition
- `resetJourney()` — sets status back to `in_hostel`, clears destination/location/times
- On page load: if status is already `on_way`, resumes location sharing automatically
- On page unload: stops location sharing

---

## admin.html — Admin Dashboard

### What changed from original:
- **Before:** Map always shown at top of page for all students
- **After:** Map is hidden by default, shown only when admin clicks Track on a specific student

### Sections (top to bottom):

**1. Header**
- Dark blue header, "CF Parents — Admin Dashboard", logged-in admin ID, Logout

**2. Stats Bar** (4 cards)
- Total Students, In Hostel, On the Way, Reached — all update in real time

**3. Map Panel** (`#mapSection`) — hidden by default (`display:none`)
- Shows when admin clicks 📍 Track on a student row
- Header shows: "📍 Tracking: [Student Name] ([Batch])"
- "✕ Close Map" button (red) closes the panel and clears markers
- Map initialized lazily (only on first Track click) via `initMap()`
- Shows: student marker (colored circle with name initial), destination marker (🏠), dashed polyline
- Popup on student marker shows: name, batch, status, last updated time
- `map.fitBounds()` auto-zooms to fit student + destination
- `map.invalidateSize()` called after 200ms to fix rendering in hidden→shown div

**4. Manage Batches section**
- Text input + "+ Create Batch" button
- Table: Batch ID | Status (badge) | Student count | Action
- Active batches show "Mark Completed & Remove Students" button (red)
- `completeBatch(batchId)` — deletes all students + user accounts in that batch, marks batch as completed

**5. Students section**
- Filter by Batch (dropdown, auto-populated from student data)
- Filter by Status (All / In Hostel / On the Way / Reached)
- Table: ID | Name | Batch | Status (badge) | Destination | Last Updated | Actions
- **Actions per row:**
  - "📍 Track" button (green) — only shown if `s.currentLocation && s.currentLocation.lat` is truthy
  - "Reset to In Hostel" button (dark blue)
  - "Remove" button (red) — deletes student + user account

### Key functions:
- `initMap()` — lazily initializes Leaflet map (only once)
- `trackStudent(studentId)` — shows map panel, clears old markers, adds student + destination markers, fits bounds, scrolls to map
- `closeMap()` — hides map panel, removes all markers
- `updateMap()` — intentionally empty no-op (map only updates on Track click, not on data change)
- Real-time listeners: `db.ref("students").on(...)` and `db.ref("batches").on(...)`

---

## setup.html — One-Time Admin Setup

No changes from original. Simple form to create an admin account by calling `registerUser()` with `role: "admin"`. Should be deleted or restricted after use.

---

## Important Notes for AI

1. **No npm, no bundler** — everything is plain HTML/CSS/JS with CDN scripts
2. **`db` is a global** — initialized in `firebase-config.js`, available in all pages
3. **`auth.js` functions are globals** — `requireRole`, `loginUser`, `registerUser`, `getSession`, `logoutUser` are all available globally in every page
4. **Script load order matters** — firebase SDKs must load before `firebase-config.js`, which must load before `auth.js`, which must load before inline scripts
5. **Role values:** admin = `"admin"`, student/parent = `"parent"` (legacy naming — the role is stored as "parent" for students)
6. **Session storage key:** `cfp_session` in localStorage
7. **Student ID = User ID** — when a student registers, their login ID becomes their student record ID in `/students/`
8. **Batch dropdown on register** — only shows active batches. Admin must create a batch first before students can register
9. **Map library:** Leaflet.js v1.9.4 with OpenStreetMap tiles
10. **Firebase SDK version:** 10.7.1 compat (not modular)
