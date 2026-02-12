// ========================
// GLOBAL STORAGE
// ========================

let records = JSON.parse(localStorage.getItem("records")) || [];

// ========================
// DOM LOADED
// ========================

document.addEventListener("DOMContentLoaded", function () {

    const form = document.getElementById("expenseForm");

    // Add Record
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

// ========================
// DASHBOARD
// ========================

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

// ========================
// REPORTS WITH SORTING
// ========================

function loadReports() {

    const table = document.getElementById("expenseTable");
    if (!table) return;

    table.innerHTML = "";

    // Copy + sort without changing original array
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

// ========================
// DELETE RECORD
// ========================

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

// ========================
// EDIT RECORD
// ========================

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

// ========================
// RESET ALL DATA
// ========================

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

// ========================
// CHART.JS
// ========================

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

    // Destroy previous chart if exists
    if (window.financeChartInstance) {
        window.financeChartInstance.destroy();
    }

    window.financeChartInstance = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: ['Income', 'Expense'],
            datasets: [{
                data: [income, expense],
                backgroundColor: ['green', 'red']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
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
            "Great! You are meeting your savings goal.";
    } else {
        const required = target - currentSavings;
        document.getElementById("suggestion").textContent =
            "You need to reduce expenses by ₹ " + required + " to reach your target.";
    }
}
