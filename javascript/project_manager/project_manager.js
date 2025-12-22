import { db } from '../../firebase_init.js';

export function initTasks(uid) { // Accept uid
    const input = document.getElementById("taskInput");
    const list = document.getElementById("taskList");
    const log = document.getElementById("log");

    let tasks = []; // Initialize as empty, will be loaded from Firestore

    const tasksRef = db.collection('users').doc(uid).collection('projectManager').doc('tasks');

    // Real-time listener for tasks
    tasksRef.onSnapshot(doc => {
        if (doc.exists) {
            tasks = doc.data().tasks || [];
        } else {
            tasks = [];
        }
        renderTasks();
    }, error => {
        console.error("Error getting tasks:", error);
        log.textContent = "log > Error loading tasks.";
    });

    input.addEventListener("keydown", async (e) => { // Made async
        if (e.key === "Enter") {
            e.preventDefault();
            const text = input.value.trim();
            if (!text) return;

            log.textContent = "log >";

            if (text.startsWith("/del ")) {
                const taskName = text.slice(5).trim();
                const index = tasks.findIndex(t => t.name === taskName);
                if (index !== -1) {
                    tasks.splice(index, 1);
                    await saveTasks(); // Use await
                } else {
                    log.textContent = "log > invalid_input";
                }

            } else if (text.startsWith("/set ")) {
                const rest = text.slice(5).trim();
                const spaceIndex = rest.lastIndexOf(" ");
                if (spaceIndex === -1) {
                    log.textContent = "log > invalid_input";
                } else {
                    const taskName = rest.slice(0, spaceIndex).trim();
                    const order = parseInt(rest.slice(spaceIndex + 1).trim());
                    if (isNaN(order)) {
                        log.textContent = "log > invalid_input";
                    } else {
                        const task = tasks.find(t => t.name === taskName);
                        if (task) {
                            task.order = order;
                            await saveTasks(); // Use await
                        } else {
                            log.textContent = "log > invalid_input";
                        }
                    }
                }

            } else if (text.startsWith("/des ")) {
                const rest = text.slice(5).trim();
                const firstSpace = rest.indexOf(" ");
                if (firstSpace === -1) {
                    log.textContent = "log > invalid_input";
                } else {
                    const taskName = rest.slice(0, firstSpace).trim();
                    const descRaw = rest.slice(firstSpace + 1).trim();
                    const task = tasks.find(t => t.name === taskName);
                    if (task) {
                        task.description = descRaw.split("-").join("\n");
                        await saveTasks(); // Use await
                    } else {
                        log.textContent = "log > invalid_input";
                    }
                }

            } else {
                if (!tasks.some(t => t.name === text)) {
                    tasks.push({name: text, order: null, description: ""});
                    await saveTasks(); // Use await
                }
            }

            input.value = "";
        }
    });

    // Function to save tasks to Firestore
    async function saveTasks() {
        try {
            await tasksRef.set({ tasks: tasks });
        } catch (error) {
            console.error("Error saving tasks:", error);
            log.textContent = "log > Error saving tasks.";
        }
    }

    function renderTasks() {
        const sorted = [...tasks].sort((a, b) => {
            if (a.order === null && b.order === null) return 0;
            if (a.order === null) return 1;
            if (b.order === null) return -1;
            return a.order - b.order;
        });

        list.innerHTML = "";
        sorted.forEach(t => {
            const li = document.createElement("li");
            const orderDisplay = t.order !== null ? t.order : "x";
            li.textContent = orderDisplay + " - " + t.name;
            li.className = "task-item";
            li.dataset.order = orderDisplay;
            list.appendChild(li);

            if (t.description) {
                const desc = document.createElement("div");
                desc.className = "description";
                desc.textContent = t.description;
                list.appendChild(desc);
            }
        });
    }
}
