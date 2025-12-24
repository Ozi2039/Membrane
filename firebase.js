// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore, doc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Your web app's Firebase configuration
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
const firestore = getFirestore(app);
const provider = new GoogleAuthProvider();

async function googleSignIn() {
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error("Error during Google Sign-In:", error);
    return null;
  }
}

async function googleSignOut() {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error during Google Sign-Out:", error);
    }
  }
  
  async function saveData(userId, data) {
    try {
      const userDocRef = doc(firestore, "users", userId);
      await setDoc(userDocRef, data, { merge: true });
    } catch (error) {
      console.error("Error saving data:", error);
    }
  }
  
  function onDataChange(userId, callback) {
    const userDocRef = doc(firestore, "users", userId);
    return onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        callback(docSnap.data());
      } else {
        callback(null);
      }
    });
  }
  
  export { auth, googleSignIn, googleSignOut, saveData, onDataChange };
