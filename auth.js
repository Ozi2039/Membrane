document.addEventListener('DOMContentLoaded', () => {
    const signInButton = document.getElementById('signInButton');
    const userDisplay = document.getElementById('userDisplay'); // Assuming an element to display user info

    if (signInButton) {
        signInButton.addEventListener('click', () => {
            firebase.auth().signInWithPopup(provider)
                .then((result) => {
                    // This gives you a Google Access Token. You can use it to access the Google API.
                    const credential = result.credential;
                    const token = credential.accessToken;
                    // The signed-in user info.
                    const user = result.user;
                    console.log('Google Sign-In successful:', user);
                    // Update UI or redirect
                }).catch((error) => {
                    // Handle Errors here.
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    // The email of the user's account used.
                    const email = error.email;
                    // The firebase.auth.AuthCredential type that was used.
                    const credential = error.credential;
                    console.error('Google Sign-In error:', errorMessage);
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
            if (userDisplay) {
                userDisplay.textContent = `Welcome, ${user.displayName}`; // Display user name
            }
            // You might want to trigger data loading here
        } else {
            // User is signed out.
            console.log('User signed out');
            if (signInButton) {
                signInButton.style.display = 'block'; // Show sign-in button
            }
            if (userDisplay) {
                userDisplay.textContent = ''; // Clear user display
            }
            // You might want to clear data or redirect to a login page
        }
    });
});
