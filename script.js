// =================================
// 1. SELECT HTML ELEMENTS
// =================================

const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");

const totalElement = document.getElementById("total");
const completedElement = document.getElementById("completedCount");
const pendingElement = document.getElementById("pending");

const searchInput = document.getElementById("searchInput");
const filterSelect = document.getElementById("filterSelect");
const clearAllBtn = document.getElementById("clearAllBtn");


// =================================
// 2. LOAD TASKS FROM LOCAL STORAGE
// =================================

let tasks = [];

try {
    const savedTasks = JSON.parse(
        localStorage.getItem("studentTasks") || "[]"
    );

    tasks = Array.isArray(savedTasks) ? savedTasks : [];
} catch (error) {
    console.error("Unable to load tasks:", error);
}


// =================================
// 3. SAVE TASKS
// =================================

function saveTasks() {

    localStorage.setItem(
        "studentTasks",
        JSON.stringify(tasks)
    );

}


// =================================
// 4. UPDATE STATISTICS
// =================================

function updateStats() {

    const total = tasks.length;

    const completed = tasks.filter(
        task => task.completed
    ).length;

    const pending = total - completed;

    totalElement.textContent = total;

    completedElement.textContent = completed;

    pendingElement.textContent = pending;

}


// =================================
// 5. DISPLAY TASKS
// =================================

function renderTasks() {

    taskList.innerHTML = "";

    const searchValue = searchInput.value
        .trim()
        .toLowerCase();

    const filterValue = filterSelect.value;

    const filteredTasks = tasks.filter(task => {

        const matchesSearch = task.title
            .toLowerCase()
            .includes(searchValue);

        const matchesFilter =
            filterValue === "all" ||
            (filterValue === "completed" && task.completed) ||
            (filterValue === "pending" && !task.completed);

        return matchesSearch && matchesFilter;

    });

    if (filteredTasks.length === 0) {

        const message = document.createElement("p");

        message.className = "empty";

        message.textContent = tasks.length === 0
            ? "No tasks yet. Add your first task!"
            : "No matching tasks found.";

        taskList.appendChild(message);

        updateStats();

        return;
    }

    filteredTasks.forEach(task => {

        // Main task container
        const taskItem = document.createElement("div");

        taskItem.className = "task";


        // Task information
        const taskInfo = document.createElement("div");

        taskInfo.className = "task-info";


        // Checkbox
        const checkbox = document.createElement("input");

        checkbox.type = "checkbox";

        checkbox.checked = task.completed;


        // Task title
        const title = document.createElement("span");

        title.className = "task-title";

        title.textContent = task.title;

        if (task.completed) {

            title.classList.add("completed");

        }


        // Checkbox event
        checkbox.addEventListener("change", () => {

            toggleTask(task.id);

        });


        // Task actions
        const actions = document.createElement("div");

        actions.className = "task-actions";


        // Edit button
        const editButton = document.createElement("button");

        editButton.textContent = "Edit";

        editButton.className = "edit-btn";

        editButton.addEventListener("click", () => {

            editTask(task.id);

        });


        // Delete button
        const deleteButton = document.createElement("button");

        deleteButton.textContent = "Delete";

        deleteButton.className = "delete-btn";

        deleteButton.addEventListener("click", () => {

            deleteTask(task.id);

        });


        // Append elements
        taskInfo.append(checkbox, title);

        actions.append(editButton, deleteButton);

        taskItem.append(taskInfo, actions);

        taskList.appendChild(taskItem);

    });

    updateStats();

}


// =================================
// 6. ADD NEW TASK
// =================================

taskForm.addEventListener("submit", (event) => {

    event.preventDefault();

    const title = taskInput.value.trim();

    if (!title) return;

    const newTask = {

        id: Date.now(),

        title: title,

        completed: false

    };

    tasks.push(newTask);

    saveTasks();

    renderTasks();

    taskInput.value = "";

    taskInput.focus();

});


// =================================
// 7. COMPLETE / UNCOMPLETE TASK
// =================================

function toggleTask(id) {

    tasks = tasks.map(task => {

        if (task.id === id) {

            return {

                ...task,

                completed: !task.completed

            };

        }

        return task;

    });

    saveTasks();

    renderTasks();

}


// =================================
// 8. EDIT TASK
// =================================

function editTask(id) {

    const task = tasks.find(
        task => task.id === id
    );

    if (!task) return;

    const newTitle = prompt(
        "Edit your task:",
        task.title
    );

    if (newTitle === null) return;

    const updatedTitle = newTitle.trim();

    if (!updatedTitle) {

        alert("Task title cannot be empty!");

        return;

    }

    if (updatedTitle.length > 100) {

        alert("Maximum 100 characters allowed!");

        return;

    }

    task.title = updatedTitle;

    saveTasks();

    renderTasks();

}


// =================================
// 9. DELETE TASK
// =================================

function deleteTask(id) {

    const confirmed = confirm(
        "Are you sure you want to delete this task?"
    );

    if (!confirmed) return;

    tasks = tasks.filter(
        task => task.id !== id
    );

    saveTasks();

    renderTasks();

}


// =================================
// 10. CLEAR ALL TASKS
// =================================

clearAllBtn.addEventListener("click", () => {

    if (tasks.length === 0) {

        alert("There are no tasks to clear!");

        return;

    }

    const confirmed = confirm(
        "Are you sure you want to delete all tasks?"
    );

    if (!confirmed) return;

    tasks = [];

    saveTasks();

    renderTasks();

});


// =================================
// 11. SEARCH TASKS
// =================================

searchInput.addEventListener("input", () => {

    renderTasks();

});


// =================================
// 12. FILTER TASKS
// =================================

filterSelect.addEventListener("change", () => {

    renderTasks();

});


// =================================
// 13. INITIALIZE APPLICATION
// =================================

renderTasks();

console.log("Student Task Manager is running!");