import { db } from '../../firebase_init.js';

function arrayToString(array) {
    return array.join(',');
}

function stringToArray(string) {
    if (!string || string === "") return [];
    return string.split(',');
}

function arraysToList(arr1, arr2) {
    return arr1.map((item, index) => `${index + 1} - ${item} ${arr2[index]}`).join('\n');
}

function stringToDate(dateString) {
    if (!dateString) return null;
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        console.error("Invalid Date String provided:", dateString);
        return null;
    }
    return date;
}

function dateToString(dateObject) {
    if (!(dateObject instanceof Date)) {
        dateObject = new Date(dateObject);
    }
    if (isNaN(dateObject.getTime())) {
        console.error("Invalid Date Object provided");
        return "";
    }
    return dateObject.toISOString().split('T')[0];
}

let listItem = [];
let listItemState = [];
let dateEcheanceStr = '';

const input = document.getElementById("modify_objectif");
const log = document.getElementById("log_objectif");
const textList = document.getElementById("taskList_objectif");
let dateHTML = document.getElementById("dateEcheance_objectif");

export function Main(uid) { // Accept uid
    const objectifRef = db.collection('users').doc(uid).collection('objectifs').doc('data');

    // Real-time listener for objectif data
    objectifRef.onSnapshot(doc => {
        if (doc.exists) {
            const data = doc.data();
            listItem = stringToArray(data.listItem || "");
            listItemState = stringToArray(data.listItemState || "");
            dateEcheanceStr = data.dateEcheance || dateToString(new Date());
        } else {
            // Set initial data if document doesn't exist
            let initDate = new Date();
            initDate.setDate(initDate.getDate() + 14);
            dateEcheanceStr = dateToString(initDate);
            saveObjectiveData(); // Save initial data to Firestore
        }
        updateUI();
    }, error => {
        console.error("Error getting objectif data:", error);
        log.textContent = "log > Error loading objectifs.";
    });

    // Function to save data to Firestore
    async function saveObjectiveData() {
        try {
            await objectifRef.set({
                listItem: arrayToString(listItem),
                listItemState: arrayToString(listItemState),
                dateEcheance: dateEcheanceStr
            });
        } catch (error) {
            console.error("Error saving objectif data:", error);
            log.textContent = "log > Error saving objectifs.";
        }
    }

    function updateUI() {
        let dateEcheanceObj = stringToDate(dateEcheanceStr);
        let today = new Date();
        today.setHours(0, 0, 0, 0);

        if (dateEcheanceObj <= today) {
            dateEcheanceObj.setDate(dateEcheanceObj.getDate() + 14);
            dateEcheanceStr = dateToString(dateEcheanceObj);

            for (let i = 0; i < listItemState.length; i++) {
                listItemState[i] = "[ ]";
            }
            saveObjectiveData(); // Save updated date and states to Firestore
        }

        dateHTML.textContent = "Date d'échéance > " + dateEcheanceStr;
        textList.textContent = arraysToList(listItem, listItemState);
    }

    input.addEventListener("keydown", async (e) => { // Made async
        if (e.key === "Enter") {
            let val = input.value.trim();

            let delContentRegex = /^\/del\s+(\d+)$/;
            let checkContentRegex = /^\/ch\s+(\d+)$/;
            let uncheckContentRegex = /^\/un\s+(\d+)$/;

            if (val === "") {
                log.textContent = "log > empty input";
                return;
            }

            if (val.startsWith("/del")) {
                const match = val.match(delContentRegex);
                const index = (match ? parseInt(match[1]) : -1) - 1;

                if (index >= 0 && index < listItem.length) {
                    listItem.splice(index, 1);
                    listItemState.splice(index, 1);
                    await saveObjectiveData();
                } else {
                    log.textContent = "log > invalid index";
                }
            } else if (val.startsWith("/ch")) {
                const match = val.match(checkContentRegex);
                const index = (match ? parseInt(match[1]) : -1) - 1;

                if (index >= 0 && index < listItem.length) {
                    listItemState[index] = "[x]";
                    await saveObjectiveData();
                } else {
                    log.textContent = "log > invalid index";
                }
            } else if (val.startsWith("/un")) {
                const match = val.match(uncheckContentRegex);
                const index = (match ? parseInt(match[1]) : -1) - 1;

                if (index >= 0 && index < listItem.length) {
                    listItemState[index] = "[ ]";
                    await saveObjectiveData();
                } else {
                    log.textContent = "log > invalid index";
                }
            } else if (val.startsWith("/reset")) {
                let newDateReset = new Date();
                newDateReset.setDate(newDateReset.getDate() + 14);
                dateEcheanceStr = dateToString(newDateReset);

                for (let i = 0; i < listItem.length; i++) {
                    listItemState[i] = "[ ]";
                }
                await saveObjectiveData();
            } else {
                log.textContent = "log > ";
                listItem.push(val);
                listItemState.push("[ ]");
                await saveObjectiveData();
            }

            input.value = "";
        }
    });
}