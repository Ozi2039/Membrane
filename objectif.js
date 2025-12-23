function main() {
    const list = document.getElementById("objectifs_list");
    const input = document.getElementById("objectifs_input");
    const addBtn = document.getElementById("objectifs_button");
    const resetBtn = document.getElementById("objectifs_reset");
    const dueDateHeader = document.getElementById("dateEcheance_objectif");

    const COLLECTION_NAME = "objectifs";

    document.addEventListener("user-signed-in", async () => {
        await loadDueDate();
        await loadItems();
    });

    document.addEventListener("user-signed-out", () => {
        list.innerHTML = "";
        dueDateHeader.textContent = "Date d'échéance";
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
    async function loadDueDate() {
        let stored = await loadData(COLLECTION_NAME + "_due_date");
        let dueDate = stored ? new Date(stored.date) : todayPlus14();

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // If due date is today or in the past → +14 days
        if (dueDate <= today) {
            dueDate = new Date(dueDate);
            dueDate.setDate(dueDate.getDate() + 14);
            uncheckAll();
            await saveItems();
        }

        await saveDueDate(dueDate);
        renderDueDate(dueDate);
    }

    async function saveDueDate(date) {
        await saveData(COLLECTION_NAME + "_due_date", { date: date.toISOString() });
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
        checkbox.addEventListener("change", saveItems);

        const span = document.createElement("span");
        span.textContent = text;

        const deleteBtn = document.createElement("span");
        deleteBtn.textContent = "✕";
        deleteBtn.className = "delete-btn";

        deleteBtn.addEventListener("click", () => {
            const confirmed = confirm("Delete this item?");
            if (!confirmed) return;

            li.remove();
            saveItems();
        });

        li.appendChild(checkbox);
        li.appendChild(span);
        li.appendChild(deleteBtn);
        list.appendChild(li);
    }

    async function saveItems() {
        const items = [];
        list.querySelectorAll("li").forEach(li => {
            items.push({
                text: li.querySelector("span").textContent,
                checked: li.querySelector("input").checked
            });
        });
        await saveData(COLLECTION_NAME, items);
    }

    async function loadItems() {
        list.innerHTML = "";
        const items = await loadData(COLLECTION_NAME);
        if (!items) return;

        items.forEach(item =>
            addItem(item.text, item.checked)
        );
    }

    function uncheckAll() {
        list.querySelectorAll("input[type='checkbox']").forEach(cb => {
            cb.checked = false;
        });
    }

    /* ---------- EVENTS ---------- */
    addBtn.addEventListener("click", () => {
        const value = input.value.trim();
        if (!value) return;

        addItem(value, false);
        input.value = "";
        saveItems();
    });

    resetBtn.addEventListener("click", async () => {
        const confirmed = confirm("Reset due date and uncheck all items?");
        if (!confirmed) return;

        const newDueDate = todayPlus14();
        await saveDueDate(newDueDate);
        renderDueDate(newDueDate);
        uncheckAll();
        await saveItems();
    });
}

document.addEventListener("DOMContentLoaded", main);

function setVh() {
  let vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}
window.addEventListener('resize', setVh);
window.addEventListener('load', setVh);