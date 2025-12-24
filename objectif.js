import { auth, googleSignIn, googleSignOut, saveData, onDataChange } from './firebase.js';

function main() {
    const connectButton = document.getElementById("connect-button");
    const list = document.getElementById("objectifs_list");
    const input = document.getElementById("objectifs_input");
    const addBtn = document.getElementById("objectifs_button");
    const resetBtn = document.getElementById("objectifs_reset");
    const dueDateHeader = document.getElementById("dateEcheance_objectif");

    let currentUser = null;
    let unsubscribe = null;
    let isSaving = false; // Flag to prevent re-rendering loops

    /* ---------- AUTHENTICATION ---------- */
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            currentUser = user;
            connectButton.textContent = "Disconnect";
            connectButton.classList.add("connected");
            
            if (unsubscribe) unsubscribe();
            unsubscribe = onDataChange(currentUser.uid, (data) => {
                if (!isSaving) {
                    renderAll(data);
                }
            });

        } else {
            currentUser = null;
            if (unsubscribe) unsubscribe();
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

    /* ---------- RENDER LOGIC ---------- */
    function renderDueDate(date) {
        dueDateHeader.textContent = "Date d'échéance : " + formatDate(date);
    }
    
    async function renderAll(data) {
        const objectifsData = data ? data.objectifs : null;
        
        list.innerHTML = "";
        
        let dueDate = objectifsData && objectifsData.dueDate ? new Date(objectifsData.dueDate) : todayPlus14();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        let shouldResave = false;
        if (dueDate <= today) {
            dueDate = new Date(dueDate);
            dueDate.setDate(dueDate.getDate() + 14);
            shouldResave = true;
        }
        
        renderDueDate(dueDate);

        if (objectifsData && objectifsData.items) {
            objectifsData.items.forEach(item => {
                // if date was reset, items should be unchecked
                addItem(item.text, shouldResave ? false : item.checked)
            });
        }
        
        if (shouldResave) {
            await saveAll();
        }
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

        isSaving = true; // Set flag

        const items = [];
        list.querySelectorAll("li").forEach(li => {
            items.push({
                text: li.querySelector("span").textContent,
                checked: li.querySelector("input").checked
            });
        });

        const dateString = dueDateHeader.textContent.replace("Date d'échéance : ", "");
        const dueDate = new Date(dateString).toISOString();

        await saveData(currentUser.uid, { objectifs: { items: items, dueDate: dueDate } });

        // Reset flag after a short delay to allow Firestore to sync
        setTimeout(() => { isSaving = false; }, 500);
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
}

document.addEventListener("DOMContentLoaded", main);

function setVh() {
  let vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}
window.addEventListener('resize', setVh);
window.addEventListener('load', setVh);