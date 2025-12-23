document.addEventListener('DOMContentLoaded', () => {
    const signInButton = document.getElementById('signInButton');
    const signOutButton = document.getElementById('signOutButton');
    const userDisplay = document.getElementById('userDisplay');

    if (signInButton) {
        signInButton.addEventListener('click', () => {
            firebase.auth().signInWithPopup(provider)
                .then((result) => {
                    console.log('Google Sign-In successful:', result.user);
                }).catch((error) => {
                    console.error('Google Sign-In error:', error.message);
                });
        });
    }

    if (signOutButton) {
        signOutButton.addEventListener('click', () => {
            firebase.auth().signOut().then(() => {
                console.log('User signed out successfully.');
            }).catch((error) => {
                console.error('Error signing out:', error.message);
            });
        });
    }

    // Observe auth state changes
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            // User is signed in.
            console.log('User signed in:', user.displayName, user.uid);
            if (signInButton) {
                signInButton.style.display = 'none'; // Hide sign-in button
            }
            if (signOutButton) {
                signOutButton.style.display = 'inline-block'; // Show sign-out button
            }
            if (userDisplay) {
                userDisplay.textContent = `Welcome, ${user.displayName}`; // Display user name
            }
        } else {
            // User is signed out.
            console.log('User signed out');
            if (signInButton) {
                signInButton.style.display = 'inline-block'; // Show sign-in button
            }
            if (signOutButton) {
                signOutButton.style.display = 'none'; // Hide sign-out button
            }
            if (userDisplay) {
                userDisplay.textContent = 'Please sign in.'; // Prompt to sign in
            }
        }
    });
});
