// ===== Firebase Configuration =====
const firebaseConfig = {
    apiKey: "AIzaSyDOM5iffowATc0tkAeGyV6SjfmLZNJ3Vig",
    authDomain: "test-app-count-256dc.firebaseapp.com",
    projectId: "test-app-count-256dc",
    storageBucket: "test-app-count-256dc.firebasestorage.app",
    messagingSenderId: "149262369206",
    appId: "1:149262369206:web:4c648db5824e0f62624117"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// ===== DOM Elements =====
const loginButton = document.getElementById('loginButton');
const logoutButton = document.getElementById('logoutButton');
const userInfo = document.getElementById('user-info');
const userNameSpan = document.getElementById('userName');

let currentUserUid = null;

// ===== Authentication =====
loginButton.addEventListener('click', async () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    try {
        await auth.signInWithRedirect(provider);
    } catch (error) {
        console.error("Error during sign-in:", error);
    }
});

logoutButton.addEventListener('click', () => {
    auth.signOut();
});

function handleAuthStateChanged(user) {
    if (user) {
        // User is signed in
        currentUserUid = user.uid;
        userNameSpan.textContent = user.displayName;
        loginButton.style.display = 'none';
        userInfo.style.display = 'flex';

        // Dispatch a custom event to notify other scripts
        document.dispatchEvent(new CustomEvent('user-signed-in', { detail: { uid: user.uid } }));

    } else {
        // User is signed out
        currentUserUid = null;
        loginButton.style.display = 'block';
        userInfo.style.display = 'none';

        // Dispatch a custom event to notify other scripts
        document.dispatchEvent(new Event('user-signed-out'));
    }
}

auth.onAuthStateChanged(handleAuthStateChanged);

// Handle redirect result
auth.getRedirectResult()
    .then((result) => {
        if (result.user) {
            handleAuthStateChanged(result.user);
        }
    })
    .catch((error) => {
        console.error("Error getting redirect result:", error);
    });



// ===== Firestore Data Management =====
async function saveData(collection, data) {
    if (!currentUserUid) return;
    try {
        await db.collection(collection).doc(currentUserUid).set({ data: JSON.stringify(data) });
    } catch (error) {
        console.error("Error saving data:", error);
    }
}

async function loadData(collection) {
    if (!currentUserUid) return null;
    try {
        const doc = await db.collection(collection).doc(currentUserUid).get();
        if (doc.exists) {
            return JSON.parse(doc.data().data);
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error loading data:", error);
        return null;
    }
}
