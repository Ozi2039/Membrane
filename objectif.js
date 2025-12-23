function main() {
    const list = document.getElementById("objectifs_list");
    const input = document.getElementById("objectifs_input");
    const addBtn = document.getElementById("objectifs_button");
    const resetBtn = document.getElementById("objectifs_reset");
    const dueDateHeader = document.getElementById("dateEcheance_objectif");

    const DUE_DATE_KEY = "objectifs_due_date";
    const ITEMS_KEY = "objectifs_items";

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
    function loadDueDate() {
        let stored = localStorage.getItem(DUE_DATE_KEY);
        let dueDate = stored ? new Date(stored) : todayPlus14();

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // If due date is today or in the past → +14 days
        if (dueDate <= today) {
            dueDate = new Date(dueDate);
            dueDate.setDate(dueDate.getDate() + 14);
            uncheckAll();
            saveItems();
        }

        saveDueDate(dueDate);
        renderDueDate(dueDate);
    }

    function saveDueDate(date) {
        localStorage.setItem(DUE_DATE_KEY, date.toISOString());
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

    function saveItems() {
        const items = [];
        list.querySelectorAll("li").forEach(li => {
            items.push({
                text: li.querySelector("span").textContent,
                checked: li.querySelector("input").checked
            });
        });
        localStorage.setItem(ITEMS_KEY, JSON.stringify(items));
    }

    function loadItems() {
        const saved = localStorage.getItem(ITEMS_KEY);
        if (!saved) return;

        JSON.parse(saved).forEach(item =>
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

    resetBtn.addEventListener("click", () => {
        const confirmed = confirm("Reset due date and uncheck all items?");
        if (!confirmed) return;

        const newDueDate = todayPlus14();
        saveDueDate(newDueDate);
        renderDueDate(newDueDate);
        uncheckAll();
        saveItems();
    });

    /* ---------- INIT ---------- */
    loadItems();
    loadDueDate();
}

document.addEventListener("DOMContentLoaded", main);

function setVh() {
  let vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}
window.addEventListener('resize', setVh);
window.addEventListener('load', setVh);
