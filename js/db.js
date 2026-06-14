import { getDatabase, ref, set, onValue, get, child, update, remove } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { app } from "./firebase.js";

const db = getDatabase(app);

/**
 * Example: Write data to database
 * @param {string} path - The path to write to (e.g., 'students/id123')
 * @param {object} data - The data object to save
 */
export const writeData = async (path, data) => {
    try {
        await set(ref(db, path), data);
        console.log(`Success: Data saved to ${path}`);
    } catch (error) {
        console.error("Firebase Write Error:", error.message);
        throw error;
    }
};

/**
 * Example: Read data from database once
 * @param {string} path - The path to read
 */
export const readDataOnce = async (path) => {
    try {
        const snapshot = await get(child(ref(db), path));
        if (snapshot.exists()) {
            return snapshot.val();
        }
        return null;
    } catch (error) {
        console.error("Firebase Read Error:", error.message);
        throw error;
    }
};

// Compatibility Bridge: This allows your existing dashboard.html code 
// to use db.ref() even though we are using the new Modular SDK.
let activeListeners = new Map();

window.db = {
    ref: (path) => {
        const r = ref(db, path);
        return {
            on: (type, callback) => {
                const unsub = onValue(r, (snapshot) => callback(snapshot));
                activeListeners.set(path, unsub);
            },
            off: () => {
                const unsub = activeListeners.get(path);
                if (unsub) { unsub(); activeListeners.delete(path); }
            },
            once: (type) => get(r),
            set: (data) => set(r, data),
            update: (data) => update(r, data),
            remove: () => remove(r)
        };
    }
};

export { db, ref, onValue };