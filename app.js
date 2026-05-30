emailjs.init({
    publicKey: "sBfvL6_wNnJ8RweKV"
});
let users = JSON.parse(localStorage.getItem("users")) || [];
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;

function showLogin() {
    document.getElementById("loginForm").style.display = "block";
    document.getElementById("registerForm") in.style.display = "none";
}

function showRegister() {
    document.getElementById("loginForm").style.display = "none";
    document.getElementById("registerForm").style.display = "block";
}

function register() {
    const username = document.getElementById("regUsername").value;
    const email = document.getElementById("regEmail").value;
    const password = document.getElementById("regPassword").value;

    if (!username || !email || !password) {
        alert("Please fill all fields");
        return;
    }

    users.push({
        username,
        email,
        password
    });

    localStorage.setItem("users", JSON.stringify(users));

    alert("Registration Successful");
    showLogin();
}

function login() {
    const username = document.getElementById("loginUsername").value;
    const password = document.getElementById("loginPassword").value;

    const user = users.find(
        u => u.username === username && u.password === password
    );

    if (!user) {
        alert("Invalid Login");
        return;
    }

    currentUser = user;

    localStorage.setItem(
        "currentUser",
        JSON.stringify(user)
    );

    document.getElementById("authContainer").style.display = "none";
    document.getElementById("dashboard").style.display = "block";

    renderTasks();
}

function logout() {
    localStorage.removeItem("currentUser");
    location.reload();
}

function addTask() {
    const title = document.getElementById("taskTitle").value;
    const description = document.getElementById("taskDescription").value;
    const deadline = document.getElementById("taskDeadline").value;

    if (!title || !deadline) {
        alert("Fill required fields");
        return;
    }
    const currentUser =
JSON.parse(
localStorage.getItem("currentUser")
);

    tasks.push({
    id: Date.now(),
    title,
    description,
    deadline,
    email: currentUser.email,
    completed: false,
    emailSent: false
});

    localStorage.setItem(
        "tasks",
        JSON.stringify(tasks)
    );

    document.getElementById("taskTitle").value = "";
    document.getElementById("taskDescription").value = "";
    document.getElementById("taskDeadline").value = "";

    renderTasks();
}

function hideDeadlinePlaceholder() {
    const input = document.getElementById("taskDeadline");
    const placeholder = document.getElementById("deadlinePlaceholder");

    if (input.value) {
        placeholder.style.display = "none";
    } else {
        placeholder.style.display = "block";
    }
}

function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);

    localStorage.setItem(
        "tasks",
        JSON.stringify(tasks)
    );

    renderTasks();
}

function completeTask(id) {
    tasks = tasks.map(task => {
        if (task.id === id) {
            task.completed = true;
        }
        return task;
    });

    localStorage.setItem(
        "tasks",
        JSON.stringify(tasks)
    );

    renderTasks();
}

function renderTasks() {
    const taskList = document.getElementById("taskList");

    if (!taskList) return;

    taskList.innerHTML = "";

    let completed = 0;

    tasks.forEach(task => {

        if (task.completed) {
            completed++;
        }

        const card = document.createElement("div");

        card.className = "task-card";

        card.innerHTML = `
            <h3>${task.title}</h3>

            <p>${task.description}</p>

            <p>
                Deadline:
                ${new Date(task.deadline).toLocaleString()}
            </p>

            <p class="countdown"
               id="countdown-${task.id}">
               Loading...
            </p>

            <div class="task-actions">

<button
class="edit-btn"
onclick="editTask(${task.id})">
Edit
</button>

<button
class="complete-btn"
onclick="completeTask(${task.id})">
Complete
</button>

<button
class="delete-btn"
onclick="deleteTask(${task.id})">
Delete
</button>

</div>



            
        `;

        taskList.appendChild(card);
    });

    document.getElementById("totalTasks").innerText =
        tasks.length;

    document.getElementById("completedTasks").innerText =
        completed;

    document.getElementById("pendingTasks").innerText =
        tasks.length - completed;
}

function updateCountdowns() {
    tasks.forEach(task => {

        const el = document.getElementById(
            `countdown-${task.id}`
        );

        if (!el) return;

        const diff =
            new Date(task.deadline) - new Date();

        if (diff <= 0) {

    el.innerHTML = " Deadline Reached";

    if (!task.emailSent) {

        sendReminderEmail(
            task.email,
            task.title,
            task.deadline
        );

        task.emailSent = true;

        localStorage.setItem(
            "tasks",
            JSON.stringify(tasks)
        );
    }

    return;
}
        const days =
            Math.floor(diff / (1000 * 60 * 60 * 24));

        const hours =
            Math.floor(
                (diff % (1000 * 60 * 60 * 24))
                /
                (1000 * 60 * 60)
            );

        const minutes =
            Math.floor(
                (diff % (1000 * 60 * 60))
                /
                (1000 * 60)
            );

        const seconds =
            Math.floor(
                (diff % (1000 * 60))
                /
                1000
            );

        el.innerHTML =
            `${days}d ${hours}h ${minutes}m ${seconds}s`;
    });
}

if (currentUser) {
    window.onload = () => {

        document.getElementById(
            "authContainer"
        ).style.display = "none";

        document.getElementById(
            "dashboard"
        ).style.display = "block";

        renderTasks();
    };
}

setInterval(updateCountdowns, 1000);function editTask(id) {

    const task = tasks.find(
        task => task.id === id
    );

    const newTitle = prompt(
        "Edit Task Title",
        task.title
    );

    if (!newTitle) return;

    task.title = newTitle;

    localStorage.setItem(
        "tasks",
        JSON.stringify(tasks)
    );

    renderTasks();
}
function sendReminderEmail(userEmail, taskTitle, taskDeadline) {

    emailjs.send(
        "service_irf836y",
        "template_s9rflwu",
        {
            email: userEmail,
            task_title: taskTitle,
            task_deadline: taskDeadline,
            name: "TaskMaster Pro",
            message: "Your task deadline is approaching."
        }
    )
    .then(() => {
        console.log("Reminder email sent");
    })
    .catch((error) => {
        console.log("Email error:", error);
    });
}