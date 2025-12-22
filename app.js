document.addEventListener("DOMContentLoaded", function() {
    const menuToggle = document.querySelector(".menu-toggle");
    const navMenu = document.getElementById("nav-menu");

    if (menuToggle && navMenu) {
        menuToggle.addEventListener("click", function() {
            navMenu.classList.toggle("open");
            menuToggle.classList.toggle("open");
        });

        // Close menu when a nav link is clicked (for single-page feel or smooth navigation)
        navMenu.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", function() {
                if (navMenu.classList.contains("open")) {
                    navMenu.classList.remove("open");
                    menuToggle.classList.remove("open");
                }
            });
        });
    }

    // Set active class for current page
    const currentPath = window.location.pathname.split("/").pop();
    if (navMenu) {
        navMenu.querySelectorAll("a").forEach(link => {
            if (link.getAttribute("href") === currentPath) {
                link.classList.add("active");
            } else {
                link.classList.remove("active"); // Remove from others if active was set dynamically
            }
        });
    }
});