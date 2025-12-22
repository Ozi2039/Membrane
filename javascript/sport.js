import { Main } from "./sport_function/Main.js";
import { auth, db, currentUserUid } from '../firebase_init.js'; // Import Firebase

auth.onAuthStateChanged(user => {
    if (user) {
        // User is signed in.
        Main(user.uid); // Pass UID to Main
    } else {
        // User is signed out.
        // No need to call Main if not logged in.
    }
});