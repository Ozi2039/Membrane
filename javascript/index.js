import { initTasks } from './index_function/quickTaps.js';
import { auth, db, currentUserUid } from './firebase_init.js'; // Import Firebase

auth.onAuthStateChanged(user => {
    if (user) {
        // User is signed in.
        initTasks(user.uid); // Pass UID to initTasks
    } else {
        // User is signed out.
        // No need to call initTasks if not logged in.
    }
});