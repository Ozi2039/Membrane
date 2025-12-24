import { auth, googleSignIn, googleSignOut, saveData, loadData } from './firebase.js';

function main() {
    const connectButton = document.getElementById("connect-button");
    const list = document.getElementById("objectifs_list");
    const input = document.getElementById("objectifs_input");
    const addBtn = document.getElementById("objectifs_button");
    const resetBtn = document.getElementById("objectifs_reset");
    const dueDateHeader = document.getElementById("dateEcheance_objectif");

    let currentUser = null;

    /* ---------- AUTHENTICATION ---------- */
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            currentUser = user;
            connectButton.textContent = "Disconnect";
            connectButton.classList.add("connected");
            await loadAll();
        } else {
            currentUser = null;
            connectButton.textContent = "Connect";
            connectButton.classList.remove("connected");
            list.innerHTML = "";
            dueDateHeader.textContent = "Date d'échéance";
        }
    });

    connectButton.addEventListener("click", async () => {
        if (currentUser) {
            await googleSignOut();
        } else {
            await googleSignIn();
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
    async function handleDueDate(savedData) {
        let dueDate = savedData && savedData.dueDate ? new Date(savedData.dueDate) : todayPlus14();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (dueDate <= today) {
            dueDate = new Date(dueDate);
            dueDate.setDate(dueDate.getDate() + 14);
            uncheckAll();
            // Items will be saved with the new due date in saveAll
        }

        renderDueDate(dueDate);
        return dueDate;
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
        checkbox.addEventListener("change", saveAll);

        const span = document.createElement("span");
        span.textContent = text;

        const deleteBtn = document.createElement("span");
        deleteBtn.textContent = "✕";
        deleteBtn.className = "delete-btn";

        deleteBtn.addEventListener("click", async () => {
            const confirmed = confirm("Delete this item?");
            if (!confirmed) return;

            li.remove();
            await saveAll();
        });

        li.appendChild(checkbox);
        li.appendChild(span);
        li.appendChild(deleteBtn);
        list.appendChild(li);
    }

    function uncheckAll() {
        list.querySelectorAll("input[type='checkbox']").forEach(cb => {
            cb.checked = false;
        });
    }

    /* ---------- DATA ---------- */
    async function saveAll() {
        if (!currentUser) return;

        const items = [];
        list.querySelectorAll("li").forEach(li => {
            items.push({
                text: li.querySelector("span").textContent,
                checked: li.querySelector("input").checked
            });
        });

        // Extract date from header
        const dateString = dueDateHeader.textContent.replace("Date d'échéance : ", "");
        const dueDate = new Date(dateString).toISOString();

        await saveData(currentUser.uid, { objectifs: { items: items, dueDate: dueDate } });
    }


    async function loadAll() {
        if (!currentUser) return;

        const data = await loadData(currentUser.uid);
        const objectifsData = data ? data.objectifs : null;

        list.innerHTML = "";
        const dueDate = await handleDueDate(objectifsData);

        if (objectifsData && objectifsData.items) {
            objectifsData.items.forEach(item => addItem(item.text, item.checked));
        }

        // Save updated due date if it was changed
        const dateString = dueDateHeader.textContent.replace("Date d'échéance : ", "");
        const currentDueDate = new Date(dateString).toISOString();
        if (!objectifsData || objectifsData.dueDate !== currentDueDate) {
            await saveAll();
        }
    }


    /* ---------- EVENTS ---------- */
    addBtn.addEventListener("click", async () => {
        if (!currentUser) {
            alert("Please connect to your Google account first.");
            return;
        }

        const value = input.value.trim();
        if (!value) return;

        addItem(value, false);
        input.value = "";
        await saveAll();
    });

    resetBtn.addEventListener("click", async () => {
        if (!currentUser) {
            alert("Please connect to your Google account first.");
            return;
        }
        const confirmed = confirm("Reset due date and uncheck all items?");
        if (!confirmed) return;

        const newDueDate = todayPlus14();
        renderDueDate(newDueDate);
        uncheckAll();
        await saveAll();
    });

    /* ---------- INIT ---------- */
    // Initial load is triggered by onAuthStateChanged
}

document.addEventListener("DOMContentLoaded", main);

function setVh() {
  let vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}
window.addEventListener('resize', setVh);
window.addEventListener('load', setVh);
