import { auth, setupAuthListener, saveUserData, getUserData, getUserCollection, deleteUserData } from './firebase-init.js';
import { collection, query, where, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

function main() {
    const list = document.getElementById("sports_list");
    const input = document.getElementById("sports_input");
    const addBtn = document.getElementById("sports_button");
    const resetBtn = document.getElementById("sports_reset");
    const dueDateHeader = document.getElementById("dateEcheance_sport");

    const DUE_DATE_DOC_ID = "_metadata"; // Document ID for storing due date
    const ITEMS_COLLECTION_NAME = "sports";

    let currentUser = null;

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

    /* ---------- AUTH LISTENER ---------- */
    setupAuthListener(user => {
        currentUser = user;
        if (currentUser) {
            list.innerHTML = ''; // Clear list before loading new data
            loadDueDate(currentUser.uid);
            loadItems(currentUser.uid);
        } else {
            list.innerHTML = '';
            dueDateHeader.textContent = "Date d'échéance : Not logged in";
        }
    });

    /* ---------- DUE DATE LOGIC ---------- */
    async function loadDueDate(uid) {
        let storedData = await getUserData(uid, ITEMS_COLLECTION_NAME, DUE_DATE_DOC_ID);
        let dueDate;

        if (storedData && storedData.dueDate) {
            dueDate = new Date(storedData.dueDate);
        } else {
            dueDate = todayPlus14();
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // If due date is today or in the past → +14 days
        if (dueDate <= today) {
            dueDate = new Date(dueDate);
            dueDate.setDate(dueDate.getDate() + 14);
            await uncheckAll(uid); // Uncheck all and save to Firestore
        }
        await saveDueDate(uid, dueDate);
        renderDueDate(dueDate);
    }

    async function saveDueDate(uid, date) {
        await saveUserData(uid, ITEMS_COLLECTION_NAME, DUE_DATE_DOC_ID, { dueDate: date.toISOString() });
    }

    function renderDueDate(date) {
        dueDateHeader.textContent = "Date d'échéance : " + formatDate(date);
    }

    /* ---------- ITEMS ---------- */
    function createListItem(itemData, itemId) {
        const li = document.createElement("li");
        li.dataset.itemId = itemId;

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = itemData.checked;
        checkbox.addEventListener("change", async () => {
            if (!currentUser) return;
            await saveUserData(currentUser.uid, ITEMS_COLLECTION_NAME, itemId, { checked: checkbox.checked });
        });

        const span = document.createElement("span");
        span.textContent = itemData.text;

        const deleteBtn = document.createElement("span");
        deleteBtn.textContent = "✕";
        deleteBtn.className = "delete-btn";

        deleteBtn.addEventListener("click", async () => {
            if (!currentUser) return;
            const confirmed = confirm("Delete this item?");
            if (!confirmed) return;

            await deleteUserData(currentUser.uid, ITEMS_COLLECTION_NAME, itemId);
            li.remove();
            // No need to re-load all, just remove the element
        });

        li.appendChild(checkbox);
        li.appendChild(span);
        li.appendChild(deleteBtn);
        return li;
    }

    async function saveItemToFirestore(uid, text, checked = false) {
        // Use a unique ID for each item, Firebase can generate one or we can use Date.now()
        await saveUserData(uid, ITEMS_COLLECTION_NAME, Date.now().toString(), { text, checked });
    }

    async function loadItems(uid) {
        list.innerHTML = '';
        const items = await getUserCollection(uid, ITEMS_COLLECTION_NAME);
        items.forEach(item => {
            if (item.id !== DUE_DATE_DOC_ID) { // Exclude metadata document
                list.appendChild(createListItem(item, item.id));
            }
        });
    }

    async function uncheckAll(uid) {
        const items = await getUserCollection(uid, ITEMS_COLLECTION_NAME);
        for (const item of items) {
            if (item.id !== DUE_DATE_DOC_ID && item.checked) {
                await saveUserData(uid, ITEMS_COLLECTION_NAME, item.id, { checked: false });
            }
        }
        // Visually update the checkboxes
        list.querySelectorAll("input[type='checkbox']").forEach(cb => {
            cb.checked = false;
        });
    }

    /* ---------- EVENTS ---------- */
    addBtn.addEventListener("click", async () => {
        if (!currentUser) {
            alert("Please sign in to add sports activities.");
            return;
        }
        const value = input.value.trim();
        if (!value) return;

        await saveItemToFirestore(currentUser.uid, value, false);
        input.value = "";
        list.innerHTML = ''; // Clear and reload to show new item
        await loadItems(currentUser.uid);
    });

    resetBtn.addEventListener("click", async () => {
        if (!currentUser) {
            alert("Please sign in to reset sports activities.");
            return;
        }
        const confirmed = confirm("Reset due date and uncheck all items?");
        if (!confirmed) return;

        const newDueDate = todayPlus14();
        await saveDueDate(currentUser.uid, newDueDate);
        renderDueDate(newDueDate);
        await uncheckAll(currentUser.uid);
        // Reload items to reflect unchecked state
        list.innerHTML = '';
        await loadItems(currentUser.uid);
    });
}

document.addEventListener("DOMContentLoaded", main);

function setVh() {
  let vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}
window.addEventListener('resize', setVh);
window.addEventListener('load', setVh);