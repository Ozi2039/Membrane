import { auth, setupAuthListener, saveUserData, getUserCollection, deleteUserData } from './firebase-init.js';
import { collection, query, where, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";


function main() {
    const button = document.getElementById("projectManager_button");
    const list = document.getElementById("projectManager_list");
    const input = document.getElementById("projectManager_input");
    const descriptionField = document.getElementById("projectManager_description");

    let editItemId = null; // Changed from editIndex to editItemId

    let currentUser = null; // To store the current authenticated user

    // Listen for auth state changes
    setupAuthListener(user => {
        currentUser = user;
        if (currentUser) {
            loadList(currentUser.uid);
        } else {
            // Clear list if user logs out
            list.innerHTML = '';
        }
    });

    button.addEventListener("click", async function () {
        if (!currentUser) {
            alert("Please sign in to save your projects.");
            return;
        }

        const title = input.value.trim();
        const description = descriptionField.value.trim();
        if (title === "") return;

        if (editItemId !== null) {
            await updateItemInFirestore(currentUser.uid, editItemId, title, description);
            editItemId = null;
        } else {
            await addItemToFirestore(currentUser.uid, title, description, 0); // default order = 0
        }

        input.value = "";
        descriptionField.value = "";
        // Re-load list to reflect changes and sort
        await loadList(currentUser.uid);
    });

    function createListItem(itemData, itemId) {
        const li = document.createElement("li");
        li.dataset.itemId = itemId; // Store Firebase document ID

        // Header: title + icons + order input
        const header = document.createElement("div");
        header.className = "task-header";

        const titleSpan = document.createElement("strong");
        titleSpan.textContent = itemData.title;
        header.appendChild(titleSpan);

        // Edit button
        const editBtn = document.createElement("span");
        editBtn.textContent = "✎";
        editBtn.style.cursor = "pointer";
        editBtn.style.marginLeft = "10px";
        editBtn.addEventListener("click", () => {
            input.value = itemData.title;
            descriptionField.value = itemData.description;
            editItemId = itemId;
        });

        // Delete button
        const deleteBtn = document.createElement("span");
        deleteBtn.textContent = "✕";
        deleteBtn.style.cursor = "pointer";
        deleteBtn.style.marginLeft = "5px";
        deleteBtn.addEventListener("click", async () => {
            if (!currentUser) return;
            const confirmed = confirm("Delete this item?");
            if (!confirmed) return;

            await deleteItemFromFirestore(currentUser.uid, itemId);
            li.remove();
            await loadList(currentUser.uid); // Re-load to ensure sorting and data consistency
        });

        // Order input
        const orderInput = document.createElement("input");
        orderInput.type = "number";
        orderInput.value = itemData.order;
        orderInput.style.width = "50px";
        orderInput.style.marginLeft = "10px";
        orderInput.addEventListener("change", async () => {
            if (!currentUser) return;
            const newOrder = parseInt(orderInput.value) || 0;
            await saveUserData(currentUser.uid, "projectManager", itemId, { order: newOrder });
            await loadList(currentUser.uid); // Re-load to re-sort
        });

        header.appendChild(editBtn);
        header.appendChild(deleteBtn);
        header.appendChild(orderInput);

        // Description
        const descDiv = document.createElement("div");
        descDiv.className = "task-desc";
        descDiv.innerHTML = itemData.description.replace(/\n/g, "<br>");

        li.appendChild(header);
        li.appendChild(descDiv);
        li.dataset.order = itemData.order; // store order as data attribute for sorting
        return li;
    }

    async function addItemToFirestore(uid, title, description, order) {
        // Firebase will generate an ID if docId is not provided to setDoc
        await saveUserData(uid, "projectManager", Date.now().toString(), { title, description, order });
    }

    async function updateItemInFirestore(uid, itemId, title, description) {
        await saveUserData(uid, "projectManager", itemId, { title, description });
    }

    async function deleteItemFromFirestore(uid, itemId) {
        await deleteUserData(uid, "projectManager", itemId);
    }

    async function loadList(uid) {
        list.innerHTML = ''; // Clear current list
        const items = await getUserCollection(uid, "projectManager");

        // Convert object to array and sort
        const sortedItems = items.sort((a, b) => {
            const orderA = a.order || 0;
            const orderB = b.order || 0;
            return orderA - orderB;
        });

        sortedItems.forEach(item => {
            list.appendChild(createListItem(item, item.id));
        });
    }
}

document.addEventListener("DOMContentLoaded", main);

function setVh() {
  let vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}
window.addEventListener('resize', setVh);
window.addEventListener('load', setVh);