function main() {
    const list = document.getElementById("sports_list");
    const input = document.getElementById("sports_input");
    const addBtn = document.getElementById("sports_button");
    const resetBtn = document.getElementById("sports_reset");
    const dueDateHeader = document.getElementById("dateEcheance_sport");

    let currentUser = null; // To store the current authenticated user

    // Listen for authentication state changes
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            currentUser = user;
            console.log("User signed in, loading data for Sports:", user.uid);
            list.innerHTML = ""; // Clear existing list before loading
            loadItems(user.uid);
            loadDueDate(user.uid);
        } else {
            currentUser = null;
            console.log("User signed out, clearing Sports data.");
            list.innerHTML = ""; // Clear list if user signs out
            dueDateHeader.textContent = "Date d'échéance : --/--/----"; // Reset due date display
        }
    });

    /* ---------- DATE HELPERS ---------- */
    function todayPlus14() {
        const d = new Date();
        d.setDate(d.getDate() + 14);
        d.setHours(0, 0, 0, 0);
        return d;
    }

    function formatDate(date) {
        return date.toISOString().split("T")[0];
    }

    /* ---------- DUE DATE LOGIC ---------- */
    async function loadDueDate(uid) {
        const doc = await db.collection("users").doc(uid).collection("sports").doc("dueDate").get();
        let dueDate;
        if (doc.exists) {
            dueDate = new Date(doc.data().date);
        } else {
            dueDate = todayPlus14();
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // If due date is today or in the past → +14 days
        if (dueDate <= today) {
            dueDate = new Date(dueDate);
            dueDate.setDate(dueDate.getDate() + 14);
            uncheckAll();
            saveItems(uid);
        }

        saveDueDate(uid, dueDate);
        renderDueDate(dueDate);
    }

    function saveDueDate(uid, date) {
        db.collection("users").doc(uid).collection("sports").doc("dueDate").set({ date: date.toISOString() })
            .then(() => console.log("Due Date saved to Firestore!"))
            .catch((error) => console.error("Error writing due date: ", error));
    }

    function renderDueDate(date) {
        dueDateHeader.textContent = "Date d'échéance : " + formatDate(date);
    }

    /* ---------- ITEMS ---------- */
    function addItem(text, checked = false) {
        const li = document.createElement("li");

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = checked;
        checkbox.addEventListener("change", () => saveItems(currentUser.uid));

        const span = document.createElement("span");
        span.textContent = text;

        const deleteBtn = document.createElement("span");
        deleteBtn.textContent = "✕";
        deleteBtn.className = "delete-btn";

        deleteBtn.addEventListener("click", () => {
            const confirmed = confirm("Delete this item?");
            if (!confirmed) return;

            li.remove();
            saveItems(currentUser.uid);
        });

        li.appendChild(checkbox);
        li.appendChild(span);
        li.appendChild(deleteBtn);
        list.appendChild(li);
    }

    function saveItems(uid) {
        const items = [];
        list.querySelectorAll("li").forEach(li => {
            items.push({
                text: li.querySelector("span").textContent,
                checked: li.querySelector("input").checked
            });
        });
        db.collection("users").doc(uid).collection("sports").doc("items").set({ items: items })
            .then(() => console.log("Sports items saved to Firestore!"))
            .catch((error) => console.error("Error writing items: ", error));
    }

    async function loadItems(uid) {
        const doc = await db.collection("users").doc(uid).collection("sports").doc("items").get();
        if (doc.exists) {
            const data = doc.data();
            data.items.forEach(item =>
                addItem(item.text, item.checked)
            );
            console.log("Sports items loaded from Firestore.");
        } else {
            console.log("No sports items data found for this user.");
        }
    }

    function uncheckAll() {
        list.querySelectorAll("input[type='checkbox']").forEach(cb => {
            cb.checked = false;
        });
    }

    /* ---------- EVENTS ---------- */
    addBtn.addEventListener("click", () => {
        if (!currentUser) {
            alert("Please sign in to save your sports activities.");
            return;
        }
        const value = input.value.trim();
        if (!value) return;

        addItem(value, false);
        input.value = "";
        saveItems(currentUser.uid);
    });

    resetBtn.addEventListener("click", () => {
        if (!currentUser) {
            alert("Please sign in to reset your sports activities.");
            return;
        }
        const confirmed = confirm("Reset due date and uncheck all items?");
        if (!confirmed) return;

        const newDueDate = todayPlus14();
        saveDueDate(currentUser.uid, newDueDate);
        renderDueDate(newDueDate);
        uncheckAll();
        saveItems(currentUser.uid);
    });

    /* ---------- INIT ---------- */
    // Initial load will be handled by onAuthStateChanged
}

document.addEventListener("DOMContentLoaded", main);

function setVh() {
  let vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}
window.addEventListener('resize', setVh);
window.addEventListener('load', setVh);
