import { auth, googleSignIn, googleSignOut, saveData, loadData } from './firebase.js';

function main() {
    const connectButton = document.getElementById("connect-button");
    const button = document.getElementById("projectManager_button");
    const list = document.getElementById("projectManager_list");
    const input = document.getElementById("projectManager_input");
    const descriptionField = document.getElementById("projectManager_description");

    let editIndex = null;
    let currentUser = null;

    // Handle Authentication
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            currentUser = user;
            connectButton.textContent = "Disconnect";
            connectButton.classList.add("connected");
            await loadList();
        } else {
            currentUser = null;
            connectButton.textContent = "Connect";
            connectButton.classList.remove("connected");
            list.innerHTML = ""; // Clear the list
        }
    });

    connectButton.addEventListener("click", async () => {
        if (currentUser) {
            await googleSignOut();
        } else {
            await googleSignIn();
        }
    });

    button.addEventListener("click", async function () {
        if (!currentUser) {
            alert("Please connect to your Google account first.");
            return;
        }

        const title = input.value.trim();
        const description = descriptionField.value.trim();
        if (title === "") return;

        if (editIndex !== null) {
            updateItem(editIndex, title, description);
            editIndex = null;
        } else {
            addItem(title, description, 0); // default order = 0
        }

        input.value = "";
        descriptionField.value = "";
        sortList();
        await saveList();
    });

    function addItem(title, description, order) {
        const li = document.createElement("li");

        // Header: title + icons + order input
        const header = document.createElement("div");
        header.className = "task-header";

        const titleSpan = document.createElement("strong");
        titleSpan.textContent = title;
        header.appendChild(titleSpan);

        // Edit button
        const editBtn = document.createElement("span");
        editBtn.textContent = "✎";
        editBtn.style.cursor = "pointer";
        editBtn.style.marginLeft = "10px";
        editBtn.addEventListener("click", () => {
            input.value = title;
            descriptionField.value = description;
            editIndex = Array.from(list.children).indexOf(li);
        });

        // Delete button
        const deleteBtn = document.createElement("span");
        deleteBtn.textContent = "✕";
        deleteBtn.style.cursor = "pointer";
        deleteBtn.style.marginLeft = "5px";
        deleteBtn.addEventListener("click", async () => {
            li.remove();
            await saveList();
        });

        // Order input
        const orderInput = document.createElement("input");
        orderInput.type = "number";
        orderInput.value = order;
        orderInput.style.width = "50px";
        orderInput.style.marginLeft = "10px";
        orderInput.addEventListener("change", async () => {
            sortList();
            await saveList();
        });

        header.appendChild(editBtn);
        header.appendChild(deleteBtn);
        header.appendChild(orderInput);

        // Description
        const descDiv = document.createElement("div");
        descDiv.className = "task-desc";
        descDiv.innerHTML = description.replace(/\n/g, "<br>");

        li.appendChild(header);
        li.appendChild(descDiv);
        li.dataset.order = order; // store order as data attribute
        list.appendChild(li);
    }

    function updateItem(index, title, description) {
        const li = list.children[index];
        li.querySelector(".task-header strong").textContent = title;
        li.querySelector(".task-desc").innerHTML = description.replace(/\n/g, "<br>");
    }

    function sortList() {
        const items = Array.from(list.children);
        items.sort((a, b) => {
            const orderA = parseInt(a.querySelector(".task-header input").value) || 0;
            const orderB = parseInt(b.querySelector(".task-header input").value) || 0;
            return orderA - orderB;
        });
        // Re-append in sorted order
        items.forEach(item => list.appendChild(item));
    }

    async function saveList() {
        if (!currentUser) return;
        const items = [];
        list.querySelectorAll("li").forEach(li => {
            const title = li.querySelector(".task-header strong").textContent;
            const description = li.querySelector(".task-desc").innerHTML.replace(/<br>/g, "\n");
            const order = parseInt(li.querySelector(".task-header input").value) || 0;
            items.push({ title, description, order });
        });
        await saveData(currentUser.uid, { projectManager: items });
    }

    async function loadList() {
        if (!currentUser) return;
        const data = await loadData(currentUser.uid);
        if (data && data.projectManager) {
            list.innerHTML = "";
            data.projectManager.forEach(item => addItem(item.title, item.description, item.order));
            sortList();
        }
    }
}

document.addEventListener("DOMContentLoaded", main);

function setVh() {
  let vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}
window.addEventListener('resize', setVh);
window.addEventListener('load', setVh);