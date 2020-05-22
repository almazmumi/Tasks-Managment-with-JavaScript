let months = ['Jun', 'Feb', "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

class NoteDB {
    dbVersion = 1;
    dbName = "toDoAppDatabase";

    notesChangedQueue = []

    // Connect to the database and return promice
    connect() {
        return new Promise((res, rej) => {
            const request = indexedDB.open("toDoAppDatabase", 1)
            request.onupgradeneeded = e => {
                console.log("Creating a new version of database...");

                let db = request.result
                if (!db.objectStoreNames.contains("groups")) {
                    db.createObjectStore("groups", { keyPath: 'id', autoIncrement: true });
                }
                if (!db.objectStoreNames.contains("notes")) {
                    db.createObjectStore("notes", { keyPath: 'id', autoIncrement: true });
                }

            }


            request.onsuccess = e => {
                // console.log("We successfully connected to the database.");
                res(request.result)
            }

            request.onerror = e => {
                rej(request.error)
            }

            request.onerror = e => {
                console.log("Storage is blocked");
            }
        });
    }

    // This function to be called when a transaction in notes object store is needed
    async notesAccessStore(transactionMode) {
        let connect = await this.connect();
        let tx = connect.transaction("notes", transactionMode)
        return tx.objectStore("notes")
    }


    // Get object from the DB
    async get(noteID) {
        let store = await this.notesAccessStore("readwrite")
        return store.get(noteID)
    }

    // Add object to the DB
    async add(note) {
        let noteObj = await this.notesAccessStore("readwrite");

        return noteObj.add(note)
    }


    // Delete object from the DB
    async delete(noteID) {
        let store = await this.notesAccessStore("readwrite")
        return store.delete(Number(noteID))
    }


    // Update object in the DB
    async update(noteObject) {
        let store = await this.notesAccessStore("readwrite")
        return store.put(noteObject)
    }

    // Retrieve all objects from the DB
    async fetchAll() {
        let store = await this.notesAccessStore("readonly")
        return store.openCursor()
    }

}

class GroupDB {
    dbVersion = 1;
    dbName = "toDoAppDatabase";


    // Connect to the database and return promice
    connect() {
        return new Promise((res, rej) => {
            const request = indexedDB.open("toDoAppDatabase", 1)
            request.onupgradeneeded = e => {
                console.log("Creating a new version of database...");

                let db = request.result
                if (!db.objectStoreNames.contains("groups")) {
                    db.createObjectStore("groups", { keyPath: 'id', autoIncrement: true });
                }
                if (!db.objectStoreNames.contains("notes")) {
                    db.createObjectStore("notes", { keyPath: 'id', autoIncrement: true });

                }

            }


            request.onsuccess = e => {
                // console.log("We successfully connected to the database.");
                res(request.result)
            }

            request.onerror = e => {
                rej(request.error)
            }

            request.onerror = e => {
                console.log("Storage is blocked");
            }
        });
    }

    // This function to be called when a transaction in groups object store is needed
    async groupsAccessStore(transactionMode) {
        let connect = await this.connect();
        let tx = connect.transaction("groups", transactionMode)
        return tx.objectStore("groups")
    }


    // Add object to the DB
    async add(group) {
        let groupObj = await this.groupsAccessStore("readwrite");
        return groupObj.add(group)
    }


    // Delete object from the DB
    async delete(groupID) {
        let store = await this.groupsAccessStore("readwrite")
        return store.delete(groupID)
    }

    // Delete object from the DB
    async get(groupID) {
        let store = await this.groupsAccessStore("readwrite")
        return store.get(groupID)
    }


    // Update object in the DB
    async update(groupObject) {
        let store = await this.groupsAccessStore("readwrite")
        return store.put(groupObject)
    }

    // Retrieve all objects from the DB
    async fetchAll() {
        let store = await this.groupsAccessStore("readonly")
        return store.openCursor()
    }

    // Clear all objects from the DB
    async clear() {
        let store = await this.groupsAccessStore("readwrite")
        return store.clear()
    }

}


class Group {

    constructor(groupName) {
        this.name = groupName;
        // this.gid = groupID
        this.tasks = [];
        this.tasksCounter = 0;
    }

    addTask(task) {
        this.tasksCounter += 1;
        task.id = this.tasksCounter;
        this.tasks.push(task);

        return task;
    }

    removeTask(taskID) {
        let foundTask = this.tasks.find(item => item.id == taskID)
        let foundTaskIndex = this.tasks.indexOf(foundTask)

        if (foundTask != undefined) {
            this.tasks.splice(foundTaskIndex, 1)
            return this.tasks

        } else {
            return -1;
        }
    }

    modifyTask(replaceTaskText, taskID) {
        let foundTask = this.tasks.find(item => item.id == taskID)
        let foundTaskIndex = this.tasks.indexOf(foundTask)
        if (foundTask != undefined) {
            this.tasks[foundTaskIndex].taskText = replaceTaskText
            return this.tasks
        } else {
            return -1;
        }
    }

    taskCheck(taskID, isChecked) {
        let foundTask = this.tasks.find(item => item.id == taskID)
        let foundTaskIndex = this.tasks.indexOf(foundTask)
        if (foundTask != undefined) {
            this.tasks[foundTaskIndex].isChecked = isChecked
            return this.tasks[foundTaskIndex]
        } else {
            return -1;
        }
    }

    getSpecificTask(taskID) {
        return this.tasks.find(item => item.id == taskID)
    }

    get numberOfTasks() {
        let count = 0;
        this.tasks.forEach(el => {
            count = el != null ? count + 1 : count;
        });
        return count;
    }

    get numberOfCompletedTasks() {
        let count = 0;
        this.tasks.forEach(el => {
            count = el.isChecked ? count + 1 : count;
        });
        return count;
    }

    get precentage() {
        return this.numberOfCompletedTasks / this.numberOfTasks
    }



}

class Task {
    constructor(taskText) {
        let d = new Date();
        this.id = -1;
        this.taskText = taskText;
        this.taskDate = `${d.getDate()}, ${months[d.getDay()]}`;
        this.isChecked = false;
    }

}

class Note {
    constructor() {
        this.noteText = ""
        this.color = ""
        this.top = 0
        this.left = 0
        this.fontSize = 16
    }
}




// =================================================================================


// Create Groups Object
let groupDB = new GroupDB();


// Initiate Database 
groupDB.connect()

async function getGroup(groupID) {
    let request = await groupDB.get(groupID)


    return new Promise((res, rej) => {
        request.onsuccess = (e) => {

            c = new Group()
            Object.assign(c, request.result);
            res(c);


        }

    })

}

async function addGroup(groupObject) {
    let request = await groupDB.add(groupObject)

    return new Promise((res) => {
        request.onsuccess = () => {

            res(request.result)
        }
    })
}

async function updateGroup(groupObject) {
    let request = await groupDB.update(groupObject)
}

async function deleteGroup(groupID) {
    let request = await groupDB.delete(groupID)
}

async function clearAllGroups() {
    let request = await groupDB.clear()
}


async function fetchAllGroups() {
    let request = await groupDB.fetchAll()

    let groupsArray = []
    request.onsuccess = () => {
        let cursor = request.result
        if (cursor) {
            c = new Group()
            Object.assign(c, cursor.value);
            groupsArray.push(c)
            cursor.continue()
        } else {
            renderAllGroupsElements(groupsArray);
        }

    }
}





// Create Notes Object
let noteDB = new NoteDB();


// Initiate Database 
noteDB.connect()

async function getNote(noteID) {
    let request = await noteDB.get(noteID)

    return new Promise((res, rej) => {
        request.onsuccess = (e) => {

            res(request.result);


        }

    })

}

async function addNote(noteObject) {
    let request = await noteDB.add(noteObject)

    return new Promise((res) => {
        request.onsuccess = () => {
            res(request.result)
        }
    })
}

async function updateNote(noteObject) {
    let request = await noteDB.update(noteObject)
}

async function deleteNote(noteID) {
    let request = await noteDB.delete(noteID)
    request.onsuccess = () => {
        console.log(request)
    }
    request.onerror = () => {
        console.log(request.error);

    }


}

async function clearAllNotes() {
    let request = await noteDB.clear()
}

async function fetchAllNotes() {
    let request = await noteDB.fetchAll()

    let notessArray = []
    request.onsuccess = () => {
        let cursor = request.result
        if (cursor) {

            notessArray.push(cursor.value)
            cursor.continue()
        } else {
            renderAllNotesElements(notessArray);
        }

    }
}




// =================================================================================================
// GROUPS AND TASKS

function renderAllGroupsElements(groups) {
    let groupsDiv = document.querySelector(".groups .addNewGroup");

    groups.forEach((el) => {
        groupsDiv.before(renderOneGroupElement(el))
    })
}


function renderAllNotesElements(notes) {
    notes.forEach((el) => {
        // console.log(el);

        renderNoteElement(el)
    })
}



window.onload = () => {
    fetchAllGroups()
    fetchAllNotes()
}

let lightsOff;
document.addEventListener("DOMContentLoaded", () => {

    // Dark Mode
    if (document.cookie.split("=")[1] == 1) {
        document.body.classList.add("dark")
        lightsOff = 1;
    } else {
        document.body.classList.remove("dark")
        lightsOff = 0;
    }



    // To overcome the problem of search bar height in mobile devices 
    // First we get the viewport height and we multiple it by 1% to get a value for a vh unit
    let vh = window.innerHeight * 0.01;
    // Then we set the value in the --vh custom property to the root of the document
    document.documentElement.style.setProperty('--vh', `${vh}px`);
})




// =================================================================================================
// GROUPS AND TASKS


// Render Group HTML element Function
function renderOneGroupElement(specificGroup) {
    let groupElement = document.createElement('div');
    groupElement.className = 'group'
    groupElement.id = specificGroup.id
    groupElement.dataset['groupId'] = specificGroup.id

    groupElement.innerHTML = `
    <div class="header">
        <h1>${specificGroup.name}</h1>
        <h5>${specificGroup.numberOfTasks} Tasks</h5>
        <span class="progress"></span>
        <span class="material-icons deleteGroup" onclick="deleteGroupElement(this)">
            delete
        </span>

    </div>
    <div class="content">
        <input class="textInput" type="text" placeholder="Enter your task and press enter">
    </div>
    <div class="footer">
        <p>${specificGroup.numberOfCompletedTasks} Tasks Completed</p>
    </div>`;

    // Add the tasks to the groups
    specificGroup.tasks.forEach(element => {
        groupElement.querySelector('.content').appendChild(renderOneTaskElement(element, specificGroup.id))
    });

    groupElement.querySelector(".header .progress").style.width = specificGroup.precentage * 100 + "%"

    groupElement.onkeyup = createNewTask;
    groupElement.onchange = checkTask;
    groupElement.onmousemove = enableDragging;
    groupElement.onmouseleave = disableDragging;
    groupElement.ondragover = dragOverFunction;
    groupElement.ondrop = onDropFunction;
    groupElement.ondblclick = dubleClickToModifyGroupTitle;


    return groupElement;
}



// Render task HTML element
function renderOneTaskElement(specificTask, specificGroupID) {
    taskElement = document.createElement("div")
    taskElement.className = "task"
    taskElement.id = `g${specificGroupID}t${specificTask.id}`

    taskElement.dataset.taskId = specificTask.id
    taskElement.innerHTML = `
    <lable>
        <input class="checkboxTask" type="checkbox">
        <span class="checkboxSpan"></span>
    </lable>
    <input class="taskText" type="text" value="${specificTask.taskText}">
    <p>${specificTask.taskDate.split(",")[0]} ${specificTask.taskDate.split(",")[1]}</p>`;

    if (specificTask.isChecked) {
        taskElement.querySelector("input[type='checkbox']").checked = "true"
        taskElement.querySelector("input[type='text']").style.textDecoration = "line-through"
    }

    taskElement.ondragstart = dragStartFunction

    return taskElement;
}



// CREATE Task and UPDATE Task
function createNewTask(e) {
    if (e.key == "Enter") {

        if (e.target.className == "textInput") {
            // If the user press enter in the insert task input

            let d = new Date();
            let task = {
                id: -1,
                taskText: e.target.value,
                taskDate: `${d.getDate()}, ${months[d.getDay()]}`,
                isChecked: false
            }

            let groupID = e.currentTarget.dataset.groupId;

            // =========================================================
            getGroup(Number(groupID)).then((res) => {

                res.addTask(task)
                updateGroup(res)

                e.target.parentNode.append(renderOneTaskElement(task, groupID))
                e.target.value = ""
                rerenderGroupElement(res)
            })
            // ==========================================================


        } else if (e.target.className == "taskText") {
            // If the user press enter in the task input

            let taskID = e.target.parentNode.dataset.taskId;
            let groupID = e.currentTarget.dataset.groupId;

            // =========================================================
            getGroup(Number(groupID)).then((res) => {

                res.modifyTask(e.target.value, taskID);
                updateGroup(res)

                rerenderGroupElement(res)
            })
            // ==========================================================

        } else if (e.target.tagName == "INPUT") {
            // If the user press enter in the group title input
            let value = e.target.value
            let heading = document.createElement("h1")
            heading.innerText = value;
            e.target.parentNode.classList.remove("edit")


            groupID = e.target.parentNode.parentNode.id;
            // =========================================================
            getGroup(Number(groupID)).then((res) => {

                res.name = value
                updateGroup(res)

                rerenderGroupElement(res)
                e.target.replaceWith(heading)
            })
            // ==========================================================


        }
    }
}


// UPDATE Task - To check done tasks
function checkTask(e) {
    if (e.target.className == "checkboxTask") {

        let groupID = e.currentTarget.dataset["groupId"];
        let taskID = e.target.parentNode.parentNode.dataset["taskId"];

        // =========================================================

        getGroup(Number(groupID)).then((res) => {


            if (e.target.checked) {
                res.taskCheck(taskID, true)
                e.target.parentNode.parentNode.querySelector(".task input[type='text']").style.textDecoration = "line-through"

            } else {
                res.taskCheck(taskID, false)
                e.target.parentNode.parentNode.querySelector(".task input[type='text']").style.textDecoration = ""
            }

            updateGroup(res)
            rerenderGroupElement(res);

        })

        // =========================================================


    }

}


// UpdateGroupInformationFunction
function rerenderGroupElement(specificGroup) {

    let groupElement = document.getElementById(specificGroup.id);

    // Access the group Information
    let foundGroup = specificGroup

    // # Tasks
    groupElement.querySelector(".header h5").innerText = `${foundGroup.numberOfTasks} Tasks`

    // Progress Bar
    groupElement.querySelector(".header .progress").style.width = foundGroup.precentage * 100 + "%"


    // # Task Completed
    groupElement.querySelector(".footer p").innerText = `${foundGroup.numberOfCompletedTasks} Tasks Completed`
}




function createNewGroup() {
    let groupsDiv = document.querySelector(".groups .addNewGroup");
    let g = new Group("Untitled")
    addGroup(g).then((res) => {

        g.id = res;
        groupsDiv.before(renderOneGroupElement(g))
    })

}


function dubleClickToModifyGroupTitle(e) {

    if (e.target.tagName == "H1") {
        let value = e.target.innerText
        let input = document.createElement("input")
        input.value = value
        input.type = "text"
        e.target.parentNode.classList.add("edit")
        e.target.replaceWith(input)
    }

}


function deleteGroupElement(el) {
    groupID = el.parentNode.parentNode.id;
    deleteGroup(Number(groupID))
    el.parentNode.parentNode.remove()
}


















// =================================================================================================
// DRAG AND DROP

// To Enable dragging functionalities that allow  tasks to move to different groups
function enableDragging(e) {

    if (e.target.className == "taskText") {
        if (e.ctrlKey) {
            e.target.parentNode.setAttribute("draggable", "true")
            if (!e.target.parentNode.classList.contains('draggable')) {
                e.target.parentNode.classList.add('draggable')
            }

        } else {
            e.target.parentNode.setAttribute("draggable", "false")
            e.target.parentNode.classList.remove('draggable')
        }
    }
}

function disableDragging(e) {
    if (e.target.className == "taskText") {

        e.target.parentNode.setAttribute("draggable", "false")
        e.target.parentNode.classList.remove('draggable')
    }
}


let deleteZone = document.getElementById("deleteZone")
deleteZone.ondragover = dragOverDeleteZoneFunction;
deleteZone.ondrop = onDropToDeleteFunction
deleteZone.ondragenter = dragEnterDeleteZoneFunction
deleteZone.ondragleave = dragLeaveDeleteZoneFunction
deleteZone.ondragend = dragLeaveDeleteZoneFunction



// Drag and Drop Functions
function dragStartFunction(e) {
    e.dataTransfer.setData("target", e.target.id)


}

function dragOverFunction(e) {
    e.preventDefault()
}

function onDropFunction(e) {
    e.preventDefault()

    let droppedElementID = e.dataTransfer.getData("target")
    let droppedElement = document.getElementById(droppedElementID)

    // Remove it From old group
    let newGroupID = e.currentTarget.dataset.groupId
    let oldGroupID = droppedElement.id.split("t")[0].substring(1)
    let oldTaskID = droppedElement.id.split("t")[1]
    let oldTask = {};


    // =========================================================
    getGroup(Number(oldGroupID)).then((res) => {

        Object.assign(oldTask, res.getSpecificTask(oldTaskID))
        // Delete task from old group
        res.removeTask(oldTaskID)

        updateGroup(res)
        // Update the interface
        rerenderGroupElement(res)



        return getGroup(Number(newGroupID))

    }).then((res) => {

        // Add it to the new group
        let newTask = res.addTask(oldTask)
        updateGroup(res)
        rerenderGroupElement(res)

        // Change its ID
        droppedElement.id = `g${newGroupID}t${newTask.id}`
        droppedElement.dataset.taskId = newTask.id

        document.querySelector(`.group[data-group-id="${newGroupID}"]`).querySelector('.content').appendChild(droppedElement)

    })
    // ==========================================================



}


function onDropToDeleteFunction(e) {
    e.preventDefault();
    let droppedElementID = e.dataTransfer.getData("target")
    let droppedElement = document.getElementById(droppedElementID)

    if (droppedElementID != "") {
        droppedElement.remove()
        // Remove it From old group
        let groupID = droppedElement.id.split("t")[0].substring(1)
        let taskID = droppedElement.id.split("t")[1]

        // =========================================================
        getGroup(Number(groupID)).then((res) => {

            res.removeTask(taskID)
            updateGroup(res)
            // e.target.parentNode.append(makeTaskElement(task, groupID))
            // e.target.value = ""
            rerenderGroupElement(res)
        })
        // ==========================================================


    }

    document.getElementById("deleteZone").classList.remove("show")


}


function dragOverDeleteZoneFunction(e) {
    e.preventDefault();
}


function dragEnterDeleteZoneFunction(e) {
    e.preventDefault();
    document.getElementById("deleteZone").classList.add("show")
}

function dragLeaveDeleteZoneFunction(e) {
    e.preventDefault();
    document.getElementById("deleteZone").classList.remove("show")
}



// =================================================================================================
// STICKY NOTES


// Sticky Notes
let sCanvas = document.getElementById("sCanvas")
function showStickyNotesFunction(el) {
    document.getElementById("sCanvas").classList.toggle("showCanvas")
    el.classList.toggle("stickyNotesHideButton")
    el.classList.toggle("stickyNotesShowButton")
    el.innerText = el.innerText == "Sticky Notes" ? "CLOSE" : "Sticky Notes"
}

function renderNoteElement(note) {
    let stickyElement = document.createElement("div")
    stickyElement.id = `n${note.id}`
    stickyElement.dataset.noteId = note.id
    stickyElement.innerHTML = `
    <div class="noteHeader">
        <div class="colorPattle">
            <span class="color" onclick="changeColor(this)" data-color-hex="c7fbc7"></span>
            <span class="color" onclick="changeColor(this)" data-color-hex="ffff88"></span>
            <span class="color" onclick="changeColor(this)" data-color-hex="ffcccc"></span>
            <span class="color" onclick="changeColor(this)" data-color-hex="ffffff"></span>  
        </div>
        <div class="fontControl">
            <button class="decreaseFontSize" onclick="changeFontSize(this)" data-font-size="-">A-</button>
            <button class="increaseFontSize" onclick="changeFontSize(this)" data-font-size="+">A+</button>
        </div>
        
        <span class="material-icons deleteNote"">
            delete
        </span>

        
    </div>
    <div class="noteInput">
        <textarea  style="font-size: 16px;"></textarea>
    </div>
    <div class="noteDate">
    <span class="saveChanges" onclick="saveChange(this)">
        Save
    </span>
    </div>`

    stickyElement.className = "sticky"
    stickyElement.style.backgroundColor = note.color != "" ? note.color : "";
    stickyElement.style.top = note.top + "px"
    stickyElement.style.left = note.left + "px"
    stickyElement.querySelector("textarea").innerText = note.noteText
    stickyElement.onmousedown = moveNote
    stickyElement.onclick = deleteNoteElement
    stickyElement.onchange = () => {
        stickyElement.querySelector(".saveChanges").style.display = "block"
        addChangesToTheQueue({ id: Number(note.id), noteText: stickyElement.querySelector("textarea").value })

    }
    sCanvas.append(stickyElement)
}

// Add new note
sCanvas.ondblclick = (e) => {
    if (e.target.id == "sCanvas") {

        let note = new Note();
        note.top = e.pageY
        note.left = e.pageX
        let noteID = -1;
        addNote(note).then(
            (res) => {
                noteID = res
                note.id = noteID
                renderNoteElement(note)
            }

        )
    }
}

function changeColor(el) {
    let stickyElement = el.parentNode.parentNode.parentNode
    stickyElement.style.backgroundColor = "#" + el.dataset.colorHex
    stickyElement.querySelector(".saveChanges").style.display = "block"
    let noteID = stickyElement.dataset.noteId
    addChangesToTheQueue({ id: Number(noteID), color: "#" + el.dataset.colorHex })
}

function changeFontSize(el) {
    let note = el.parentNode.parentNode.parentNode.querySelector("textarea");
    let fontSize = note.style.fontSize;
    fontSize = parseFloat(fontSize);
    if (el.dataset.fontSize == "+") {
        note.style.fontSize = (fontSize + 1) + "px"

    } else if (el.dataset.fontSize == "-") {
        note.style.fontSize = (fontSize - 1) + "px"

    }
    el.parentNode.parentNode.parentNode.querySelector(".saveChanges").style.display = "block"
}

function deleteNoteElement(e) {

    if (e.target.classList.contains("deleteNote")) {
        let noteID = e.currentTarget.dataset.noteId
        deleteNote(Number(noteID))
        e.target.parentNode.parentNode.remove()
    }


}

function moveNote(e) {

    if (e.ctrlKey) {
        e.preventDefault()
        let stickyNote = e.currentTarget
        let noteID = stickyNote.dataset.noteId
        document.body.style.cursor = "move"

        function moveTo(x, y) {
            stickyNote.style.left = x - 150 / 2 + "px";
            stickyNote.style.top = y - 150 / 2 + "px";
        }


        function onMoving(e) {
            moveTo(e.pageX, e.pageY)
        }

        document.addEventListener("mousemove", onMoving)

        document.onmouseup = function () {
            document.removeEventListener("mousemove", onMoving)
            document.body.style.cursor = ""

            let ntop = stickyNote.style.top.split("px")[0]
            let nleft = stickyNote.style.left.split("px")[0]
            addChangesToTheQueue({ id: Number(noteID), top: ntop, left: nleft })


        }



        e.currentTarget.querySelector(".saveChanges").style.display = "block"
    }





}

function saveChange(e) {

    let stickyNote = e.parentNode.parentNode;
    let foundNote = noteDB.notesChangedQueue.find((el) => el.id == stickyNote.dataset.noteId)

    if (foundNote != undefined) {
        // =========================================================
        getNote(Number(foundNote.id)).then((res) => {
            console.log(res);
            updateNote({ ...res, ...foundNote })
            e.style.display = "none"
        })

        // =========================================================

    }


}


function addChangesToTheQueue(note) {

    // lock for an object with the same ID
    let foundNote = noteDB.notesChangedQueue.find((el) => note.id == el.id)
    // if exists, merge the two object
    if (foundNote != undefined) {
        let index = noteDB.notesChangedQueue.indexOf(foundNote);
        noteDB.notesChangedQueue.splice(index, 1, { ...foundNote, ...note })
    } else {
        noteDB.notesChangedQueue.push(note)
    }
}


// =================================================================================================
// TOGGLE DARK MODE


function toggleDarkMode() {
    document.body.classList.toggle("dark")
    if (lightsOff == 1) {
        document.cookie = "lights_off=0;max-age=259200;"
        lightsOff = 0;
    } else {
        document.cookie = "lights_off=1;max-age=259200;"
        lightsOff = 1;
    }
}







