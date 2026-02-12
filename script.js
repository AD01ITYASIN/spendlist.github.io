let records = JSON.parse(localStorage.getItem("records")) || [];

document.addEventListener("DOMContentLoaded", function () {

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
            alert("Record Added Successfully!");
        });
    }

    loadDashboard();
    loadReports();
});

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

    const grouped = {};

    records.forEach(record => {
        const month = new Date(record.date).toLocaleString('default', { month: 'long', year: 'numeric' });

        if (!grouped[month]) {
            grouped[month] = [];
        }

        grouped[month].push(record);
    });

    for (let month in grouped) {

        const monthRow = document.createElement("tr");
        monthRow.innerHTML = `<td colspan="5" style="font-weight:bold; background:#e2e8f0;">${month}</td>`;
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
            `;

            table.appendChild(row);
        });
    }
}
function resetData() {

    const confirmReset = confirm("Are you sure you want to delete all records? This action cannot be undone.");

    if (confirmReset) {
        localStorage.removeItem("records");
        records = [];
        location.reload();
    }

}
