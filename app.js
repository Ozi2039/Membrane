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

// ===== Login =====
loginButton.addEventListener('click', () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
        .then(result => {
            const user = result.user;
            currentUserUid = user.uid;
            userNameSpan.textContent = user.displayName;
            loginButton.style.display = 'none';
            appDiv.style.display = 'block';
            loadCounter();
        })
        .catch(console.error);
});

// ===== Logout =====
logoutButton.addEventListener('click', () => {
    auth.signOut().then(() => {
        loginButton.style.display = 'block';
        appDiv.style.display = 'none';
        currentUserUid = null;
        currentCount = 0;
        countSpan.textContent = '0';
    });
});

// ===== Load Counter =====
async function loadCounter() {
    if (!currentUserUid) return;
    const docRef = db.collection('counters').doc(currentUserUid);
    const doc = await docRef.get();
    currentCount = doc.exists ? doc.data().count : 0;
    countSpan.textContent = currentCount;
}

// ===== Increment Counter =====
countButton.addEventListener('click', async () => {
    if (!currentUserUid) return;
    currentCount++;
    countSpan.textContent = currentCount;
    await db.collection('counters').doc(currentUserUid).set({ count: currentCount });
});

// ===== Check Auth State on Page Load =====
auth.onAuthStateChanged(user => {
    if (user) {
        currentUserUid = user.uid;
        userNameSpan.textContent = user.displayName;
        loginButton.style.display = 'none';
        appDiv.style.display = 'block';
        loadCounter();
    } else {
        loginButton.style.display = 'block';
        appDiv.style.display = 'none';
    }
});
