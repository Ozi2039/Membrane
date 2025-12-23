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
const appDiv = document.getElementById('app');
const countButton = document.getElementById('countButton');
const countSpan = document.getElementById('count');
const userNameSpan = document.getElementById('userName');

let currentUserUid = null;
let currentCount = 0;
let unsubscribe = null; // to hold real-time listener

// ===== Functions =====
function listenCounter(uid) {
    const docRef = db.collection('counters').doc(uid);

    // Detach previous listener if any
    if (unsubscribe) unsubscribe();

    // Real-time listener
    unsubscribe = docRef.onSnapshot(doc => {
        currentCount = doc.exists ? doc.data().count : 0;
        countSpan.textContent = currentCount;
    });
}

async function showApp(user) {
    currentUserUid = user.uid;
    userNameSpan.textContent = user.displayName;
    loginButton.style.display = 'none';
    appDiv.style.display = 'block';
    listenCounter(currentUserUid); // start real-time updates
}

// ===== Login =====
loginButton.addEventListener('click', async () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    try {
        const result = await auth.signInWithPopup(provider);
        const user = result.user;
        await showApp(user); // immediately show app after login
    } catch (error) {
        console.error(error);
    }
});

// ===== Logout =====
logoutButton.addEventListener('click', () => {
    auth.signOut();
    if (unsubscribe) unsubscribe(); // detach listener
});

// ===== Increment Counter =====
countButton.addEventListener('click', async () => {
    if (!currentUserUid) return;
    currentCount++;
    await db.collection('counters').doc(currentUserUid).set({ count: currentCount });
});

// ===== Detect Auth State on Page Load =====
auth.onAuthStateChanged(user => {
    if (user) {
        showApp(user);
    } else {
        currentUserUid = null;
        currentCount = 0;
        countSpan.textContent = '0';
        loginButton.style.display = 'block';
        appDiv.style.display = 'none';
        if (unsubscribe) unsubscribe();
    }
});
