function registerUser() {
    const name = document.getElementById("regName").value.trim();
    const email = document.getElementById("regEmail").value.trim();
    const password = document.getElementById("regPassword").value.trim();

    if (!name || !email || !password) {
        alert("Please fill all fields.");
        return;
    }

    let users = JSON.parse(localStorage.getItem("spendlistUsers")) || [];

    const exists = users.find(u => u.email === email);
    if (exists) {
        alert("This email is already registered. Please login.");
        toggleForms();
        return;
    }

    const newUser = {
        name,
        email,
        password,
        registeredOn: new Date().toLocaleString()
    };

    users.push(newUser);
    localStorage.setItem("spendlistUsers", JSON.stringify(users));
    localStorage.setItem("spendlistUser", JSON.stringify(newUser));

    alert("Account created! Please login.");
    toggleForms();
}

function loginUser() {
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value.trim();

    const users = JSON.parse(localStorage.getItem("spendlistUsers")) || [];
    const match = users.find(u => u.email === email && u.password === password);

    if (!match) {
        document.getElementById("loginError").style.display = "block";
        return;
    }

    localStorage.setItem("loggedIn", "true");
    localStorage.setItem("spendlistUser", JSON.stringify(match));
    window.location.href = "index.html";
}

function toggleForms() {
    const login = document.getElementById("loginSection");
    const register = document.getElementById("registerSection");
    if (!login || !register) return;

    if (login.style.display === "none") {
        login.style.display = "block";
        register.style.display = "none";
    } else {
        login.style.display = "none";
        register.style.display = "block";
    }
}

function signOut() {
    localStorage.removeItem("loggedIn");
    window.location.href = "login.html";
}

function checkAuth() {
    const loggedIn = localStorage.getItem("loggedIn");
    const isAuthPage = window.location.pathname.includes("login.html");
    const isAdminPage = window.location.pathname.includes("admin.html");

    if (!loggedIn && !isAuthPage && !isAdminPage) {
        window.location.href = "login.html";
    }
}

function loadWelcome() {
    const msg = document.getElementById("welcomeMsg");
    if (!msg) return;

    const user = JSON.parse(localStorage.getItem("spendlistUser"));
    if (user) {
        msg.textContent = "Hey, " + user.name + "! 👋";
    }
}

let records = JSON.parse(localStorage.getItem("records")) || [];

document.addEventListener("DOMContentLoaded", function () {

    checkAuth();
    loadWelcome();

    const form = document.getElementById("expenseForm");

    if (form) {
        form.addEventListener("submit", function (e) {
            e.preventDefault();

            const record = {
                type: document.getElementById("type").value,
                amount: Number(document.getElementById("amount").value),
                category: document.getElementById("category").value,
                date: document.getElementById("date").value,
                description: document.getElementById("description").value
            };

            records.push(record);
            localStorage.setItem("records", JSON.stringify(records));

            form.reset();

            const category = document.getElementById("category");
            if (category) {
                category.innerHTML = '<option value="">Select Type First</option>';
            }

            alert("Record Added Successfully!");

            loadDashboard();
            loadReports();
            loadChart();
        });
    }

    loadDashboard();
    loadReports();
    loadChart();
});


function updateCategories() {
    const type = document.getElementById("type").value;
    const category = document.getElementById("category");

    category.innerHTML = "";

    if (type === "income") {
        const incomeOptions = [
            "Select Category",
            "Salary",
            "Business",
            "Freelance",
            "Investment",
            "Rental Income",
            "Other"
        ];
        incomeOptions.forEach((opt, i) => {
            const option = document.createElement("option");
            option.value = i === 0 ? "" : opt;
            option.textContent = opt;
            category.appendChild(option);
        });

    } else if (type === "expense") {
        const expenseOptions = [
            "Select Category",
            "Food",
            "Travel",
            "Shopping",
            "Bills",
            "Entertainment",
            "Healthcare",
            "Education",
            "Other"
        ];
        expenseOptions.forEach((opt, i) => {
            const option = document.createElement("option");
            option.value = i === 0 ? "" : opt;
            option.textContent = opt;
            category.appendChild(option);
        });

    } else {
        const option = document.createElement("option");
        option.value = "";
        option.textContent = "Select Type First";
        category.appendChild(option);
    }
}

function loadDashboard() {

    let income = 0;
    let expense = 0;

    records.forEach(record => {
        if (record.type === "income") {
            income += record.amount;
        } else {
            expense += record.amount;
        }
    });

    const totalIncome = document.getElementById("totalIncome");
    const totalExpense = document.getElementById("totalExpense");
    const netBalance = document.getElementById("netBalance");

    if (totalIncome) totalIncome.textContent = "₹ " + income;
    if (totalExpense) totalExpense.textContent = "₹ " + expense;
    if (netBalance) netBalance.textContent = "₹ " + (income - expense);
}


function loadReports() {

    const table = document.getElementById("expenseTable");
    if (!table) return;

    table.innerHTML = "";

    const sortedRecords = [...records]
        .map((record, index) => ({ ...record, originalIndex: index }))
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    const grouped = {};

    sortedRecords.forEach(record => {
        const monthKey = new Date(record.date)
            .toLocaleString('default', { month: 'long', year: 'numeric' });

        if (!grouped[monthKey]) {
            grouped[monthKey] = [];
        }
        grouped[monthKey].push(record);
    });

    for (let month in grouped) {

        const monthRow = document.createElement("tr");
        monthRow.innerHTML = `
            <td colspan="7" style="text-align:center; font-weight:bold; background:#e2e8f0;">
                ${month}
            </td>`;
        table.appendChild(monthRow);

        grouped[month].forEach(record => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${record.type}</td>
                <td class="${record.type === 'income' ? 'income' : 'expense'}">
                    ₹ ${record.amount}
                </td>
                <td>${record.category}</td>
                <td>${record.date}</td>
                <td>${record.description}</td>
                <td><button onclick="editRecord(${record.originalIndex})">Edit</button></td>
                <td><button onclick="deleteRecord(${record.originalIndex})">Delete</button></td>
            `;
            table.appendChild(row);
        });
    }
}

function deleteRecord(index) {

    const confirmDelete = confirm("Delete this record?");

    if (confirmDelete) {
        records.splice(index, 1);
        localStorage.setItem("records", JSON.stringify(records));
        loadDashboard();
        loadReports();
        loadChart();
    }
}

function editRecord(index) {

    const record = records[index];

    const newAmount = prompt("Enter new amount:", record.amount);
    if (newAmount === null) return;

    const newCategory = prompt("Enter new category:", record.category);
    if (newCategory === null) return;

    const newDescription = prompt("Enter new description:", record.description);
    if (newDescription === null) return;

    records[index].amount = Number(newAmount);
    records[index].category = newCategory;
    records[index].description = newDescription;

    localStorage.setItem("records", JSON.stringify(records));

    loadDashboard();
    loadReports();
    loadChart();
}

function resetData() {

    const confirmReset = confirm("Are you sure you want to delete all records?");

    if (confirmReset) {
        localStorage.removeItem("records");
        records = [];
        loadDashboard();
        loadReports();
        loadChart();
    }
}

function loadChart() {

    const canvas = document.getElementById("financeChart");
    if (!canvas || typeof Chart === "undefined") return;

    let income = 0;
    let expense = 0;

    records.forEach(record => {
        if (record.type === "income") {
            income += record.amount;
        } else {
            expense += record.amount;
        }
    });

    if (window.financeChartInstance) {
        window.financeChartInstance.destroy();
    }

    window.financeChartInstance = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: ['Income', 'Expense'],
            datasets: [{
                data: [income, expense],
                backgroundColor: ['#22c55e', '#ef4444']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function calculateSavings() {

    const incomeInput = document.getElementById("income");
    const expenseInput = document.getElementById("expense");
    const targetInput = document.getElementById("targetSavings");

    if (!incomeInput || !expenseInput || !targetInput) return;

    const income = Number(incomeInput.value);
    const expense = Number(expenseInput.value);
    const target = Number(targetInput.value);

    if (!income || !expense || !target) {
        alert("Please fill all fields.");
        return;
    }

    const currentSavings = income - expense;

    document.getElementById("currentSavings").textContent =
        "Current Savings: ₹ " + currentSavings;

    if (currentSavings >= target) {
        document.getElementById("suggestion").textContent =
            "Great! You are meeting your savings goal. 🎉";
    } else {
        const required = target - currentSavings;
        document.getElementById("suggestion").textContent =
            "You need to reduce expenses by ₹ " + required + " to reach your target.";
    }
}

function submitFeedback() {
    alert("Thank you for your feedback!");
}

function checkAdminPassword() {
    const input = document.getElementById("adminPassword");
    if (!input) return;

    if (input.value === "admin123") {
        document.getElementById("adminGate").style.display = "none";
        document.getElementById("adminPanel").style.display = "block";
        loadAdminPanel();
    } else {
        document.getElementById("adminError").style.display = "block";
        input.value = "";
    }
}

function loadAdminPanel() {
    const users = JSON.parse(localStorage.getItem("spendlistUsers")) || [];
    const records = JSON.parse(localStorage.getItem("records")) || [];
    const table = document.getElementById("usersTable");
    const count = document.getElementById("userCount");
    const totalUsers = document.getElementById("adminTotalUsers");
    const latestUser = document.getElementById("adminLatestUser");
    const totalRecords = document.getElementById("adminTotalRecords");

    if (!table) return;

    if (totalUsers) totalUsers.textContent = users.length;
    if (totalRecords) totalRecords.textContent = records.length;
    if (latestUser) {
        latestUser.textContent = users.length > 0
            ? users[users.length - 1].name
            : "No users yet";
    }

    if (count) count.textContent = "Total Registered Users: " + users.length;

    table.innerHTML = "";

    if (users.length === 0) {
        table.innerHTML = `
            <tr>
                <td colspan="4" style="text-align:center; color:#999; padding:20px;">
                    No users registered yet.
                </td>
            </tr>`;
        return;
    }

    users.forEach((user, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.registeredOn}</td>
        `;
        table.appendChild(row);
    });
}
