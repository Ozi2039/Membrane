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
export const auth = firebase.auth();
export const db = firebase.firestore();

// ===== DOM Elements =====
const loginButton = document.getElementById('loginButton');
const logoutButton = document.getElementById('logoutButton');
const appBody = document.getElementById('app'); // Changed from appDiv to appBody
export const userNameSpan = document.getElementById('userName');

export let currentUserUid = null;

// ===== Login =====
if (loginButton) {
    loginButton.addEventListener('click', () => {
        const provider = new firebase.auth.GoogleAuthProvider();
        auth.signInWithPopup(provider)
            .then(result => {
                const user = result.user;
                currentUserUid = user.uid;
                userNameSpan.textContent = user.displayName;
                if (loginButton) loginButton.style.display = 'none';
                if (logoutButton) logoutButton.style.display = 'block';
                if (appBody) appBody.classList.remove('logged-out');
                if (appBody) appBody.classList.add('logged-in');
            })
            .catch(console.error);
    });
}


// ===== Logout =====
if (logoutButton) {
    logoutButton.addEventListener('click', () => {
        auth.signOut().then(() => {
            if (loginButton) loginButton.style.display = 'block';
            if (logoutButton) logoutButton.style.display = 'none';
            if (appBody) appBody.classList.remove('logged-in');
            if (appBody) appBody.classList.add('logged-out');
            currentUserUid = null;
            userNameSpan.textContent = 'Guest';
        });
    });
}

// ===== Check Auth State on Page Load =====
auth.onAuthStateChanged(user => {
    if (user) {
        currentUserUid = user.uid;
        userNameSpan.textContent = user.displayName;
        if (loginButton) loginButton.style.display = 'none';
        if (logoutButton) logoutButton.style.display = 'block';
        if (appBody) appBody.classList.remove('logged-out');
        if (appBody) appBody.classList.add('logged-in');
    } else {
        currentUserUid = null;
        userNameSpan.textContent = 'Guest';
        if (loginButton) loginButton.style.display = 'block';
        if (logoutButton) logoutButton.style.display = 'none';
        if (appBody) appBody.classList.remove('logged-in');
        if (appBody) appBody.classList.add('logged-out');
    }
});
