// firebase-init.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { getFirestore, collection, doc, setDoc, getDoc, updateDoc, deleteDoc, getDocs } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDOM5iffowATc0tkAeGyV6SjfmLZNJ3Vig",
    authDomain: "test-app-count-256dc.firebaseapp.com",
    projectId: "test-app-count-256dc",
    storageBucket: "test-app-count-256dc.firebasestorage.app",
    messagingSenderId: "149262369206",
    appId: "1:149262369206:web:4c648db5824e0f62624117"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Google Auth Provider
const provider = new GoogleAuthProvider();

// Sign in with Google
export async function signInWithGoogle() {
    try {
        await signInWithPopup(auth, provider);
        // User signed in successfully. onAuthStateChanged listener will handle UI updates.
    } catch (error) {
        console.error("Error during Google Sign-in:", error);
    }
}

// Sign out
export async function signOutUser() {
    try {
        await signOut(auth);
        // User signed out successfully. onAuthStateChanged listener will handle UI updates.
    } catch (error) {
        console.error("Error during Sign-out:", error);
    }
}

// Listen for auth state changes
export function setupAuthListener(callback) {
    onAuthStateChanged(auth, callback);
}

// Firestore operations
export async function saveUserData(uid, collectionName, docId, data) {
    const userDocRef = doc(db, `users/${uid}/${collectionName}`, docId);
    await setDoc(userDocRef, data, { merge: true });
}

export async function getUserData(uid, collectionName, docId) {
    const userDocRef = doc(db, `users/${uid}/${collectionName}`, docId);
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
        return docSnap.data();
    } else {
        return null;
    }
}

export async function updateUserData(uid, collectionName, docId, data) {
    const userDocRef = doc(db, `users/${uid}/${collectionName}`, docId);
    await updateDoc(userDocRef, data);
}

export async function deleteUserData(uid, collectionName, docId) {
    const userDocRef = doc(db, `users/${uid}/${collectionName}`, docId);
    await deleteDoc(userDocRef);
}

// Utility to get all documents from a subcollection for a user
export async function getUserCollection(uid, collectionName) {
    const colRef = collection(db, `users/${uid}/${collectionName}`);
    const snapshot = await getDocs(colRef);
    const items = [];
    snapshot.forEach(doc => {
        items.push({ id: doc.id, ...doc.data() });
    });
    return items;
}
