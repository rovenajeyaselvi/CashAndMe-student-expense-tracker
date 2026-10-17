
const happyButton = document.getElementById("happyButton");
const excellentButton = document.getElementById("excellentButton");
const moodOverlay = document.querySelector(".mood-overlay");
const homepage = document.getElementById("homepage");

const expenseForm = document.getElementById("expenseForm");
const expenseList = document.getElementById("expenseList");

const monthlyBudgetInput = document.getElementById("monthlyBudget");
const weeklyBudgetInput = document.getElementById("weeklyBudget");
const dailyBudgetInput = document.getElementById("dailyBudget");
const saveBudgetButton = document.getElementById("saveBudgetButton");
const budgetMessage = document.getElementById("budgetMessage");

let chartsCreated = false;
const charts = {};

let expenses =
    JSON.parse(localStorage.getItem("cashandmeExpenses")) || [];

let budgets =
    JSON.parse(localStorage.getItem("cashandmeBudgets")) || {
        monthly: 0,
        weekly: 0,
        daily: 0
    };

// Load previously saved budgets
monthlyBudgetInput.value = budgets.monthly || "";
weeklyBudgetInput.value = budgets.weekly || "";
dailyBudgetInput.value = budgets.daily || "";

// Mood buttons
happyButton.addEventListener("click", function () {
    openHomepage(false);
});

excellentButton.addEventListener("click", function () {
    openHomepage(true);
});

function openHomepage(showCelebration) {
    moodOverlay.style.display = "none";
    homepage.style.display = "block";
    document.body.style.backgroundColor = "#FFF0A6";

    if (!chartsCreated) {
        createExpenseCharts();
        chartsCreated = true;
    }

    updateExpenseCharts();
    renderExpenses();

    if (showCelebration) {
        showConfetti();
    }
}

// Confetti
function showConfetti() {
    const colors = [
        "#FFD93D", "#FF6B6B", "#6BCB77",
        "#4D96FF", "#C77DFF"
    ];

    for (let i = 0; i < 100; i++) {
        const piece = document.createElement("div");

        piece.style.position = "fixed";
        piece.style.left = Math.random() * 100 + "vw";
        piece.style.top = "-20px";
        piece.style.width = "10px";
        piece.style.height = "14px";
        piece.style.backgroundColor =
            colors[Math.floor(Math.random() * colors.length)];
        piece.style.zIndex = "9999";
        piece.style.pointerEvents = "none";
        piece.style.borderRadius = "2px";

        document.body.appendChild(piece);

        const drift = (Math.random() - 0.5) * 300;
        const duration = 2000 + Math.random() * 2000;

        const animation = piece.animate(
            [
                {
                    transform: "translate(0, 0) rotate(0deg)",
                    opacity: 1
                },
                {
                    transform:
                        `translate(${drift}px, 110vh) rotate(${Math.random() * 720}deg)`,
                    opacity: 0.8
                }
            ],
            {
                duration: duration,
                easing: "ease-in",
                fill: "forwards"
            }
        );

        animation.onfinish = function () {
            piece.remove();
        };
    }
}

// Save budgets
saveBudgetButton.addEventListener("click", function () {
    const monthly = monthlyBudgetInput.value;
    const weekly = weeklyBudgetInput.value;
    const daily = dailyBudgetInput.value;

    const values = [monthly, weekly, daily];

    if (values.some(value =>
        value.trim() === "" ||
        !Number.isFinite(Number(value)) ||
        Number(value) < 0
    )) {
        budgetMessage.textContent =
            "Please enter valid budgets of ₹0 or more.";
        return;
    }

    budgets = {
        monthly: Number(monthly),
        weekly: Number(weekly),
        daily: Number(daily)
    };

    localStorage.setItem(
        "cashandmeBudgets",
        JSON.stringify(budgets)
    );

    budgetMessage.textContent = "Your budgets are saved! 💛";

    updateExpenseCharts();
});

// Date helpers
function getExpenseDate(expense) {
    return new Date(expense.date);
}

function isToday(date) {
    const today = new Date();

    return date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate();
}

function isThisMonth(date) {
    const today = new Date();

    return date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth();
}

function isThisWeek(date) {
    const today = new Date();

    const startOfWeek = new Date(today);
    startOfWeek.setHours(0, 0, 0, 0);

    const day = startOfWeek.getDay();
    startOfWeek.setDate(
        startOfWeek.getDate() - (day === 0 ? 6 : day - 1)
    );

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 7);

    return date >= startOfWeek && date < endOfWeek;
}

// Calculate spending from saved expenses
function calculateSpent(period) {
    return expenses.reduce(function (total, expense) {
        const date = getExpenseDate(expense);

        if (Number.isNaN(date.getTime())) {
            return total;
        }

        let matches = false;

        if (period === "monthly") {
            matches = isThisMonth(date);
        } else if (period === "weekly") {
            matches = isThisWeek(date);
        } else if (period === "daily") {
            matches = isToday(date);
        }

        return total + (matches ? Number(expense.amount) : 0);
    }, 0);
}

// Create the three pie charts
function createExpenseCharts() {
    const periods = [
        { id: "monthlyChart", key: "monthly", label: "Monthly" },
        { id: "weeklyChart", key: "weekly", label: "Weekly" },
        { id: "dailyChart", key: "daily", label: "Today's" }
    ];

    periods.forEach(function (period) {
        charts[period.key] = new Chart(
            document.getElementById(period.id),
            {
                type: "pie",
                data: {
                    labels: ["Spent", "Remaining"],
                    datasets: [{
                        data: [0, 0],
                        backgroundColor: ["#F2CF54", "#78A875"],
                        borderColor: "#FFFCF0",
                        borderWidth: 3
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: "bottom"
                        },
                        tooltip: {
                            callbacks: {
                                label: function (context) {
                                    return context.label + ": ₹" +
                                        Number(context.raw).toFixed(2);
                                }
                            }
                        }
                    }
                }
            }
        );
    });
}

// Update charts using actual budgets and expenses
function updateExpenseCharts() {
    if (!chartsCreated) {
        return;
    }

    ["monthly", "weekly", "daily"].forEach(function (period) {
        const spent = calculateSpent(period);
        const budget = budgets[period];
        const remaining = Math.max(0, budget - spent);

        const chart = charts[period];

        chart.data.datasets[0].data = [spent, remaining];

        chart.data.labels = [
            "Spent ₹" + spent.toFixed(2),
            "Remaining ₹" + remaining.toFixed(2)
        ];

        chart.update();
    });
}

// Display saved expenses


function renderExpenses() {
    expenseList.innerHTML = "";

    expenses.forEach(function (expense, index) {
        const listItem = document.createElement("li");

        const expenseText = document.createElement("span");
        expenseText.textContent =
            `${expense.name} — ₹${Number(expense.amount).toFixed(2)} (${expense.category})`;

        // Edit button
        const editButton = document.createElement("button");
        editButton.textContent = "Edit ✏️";
        editButton.type = "button";

        editButton.addEventListener("click", function () {
            const newName = prompt(
                "Edit expense name:",
                expense.name
            );

            if (newName === null) return;

            if (newName.trim() === "") {
                alert("Expense name cannot be empty.");
                return;
            }

            const newAmountText = prompt(
                "Edit expense amount (₹):",
                expense.amount
            );

            if (newAmountText === null) return;

            const newAmount = Number(newAmountText);

            if (
                newAmountText.trim() === "" ||
                !Number.isFinite(newAmount) ||
                newAmount <= 0
            ) {
                alert("Please enter a valid amount greater than zero.");
                return;
            }

            const newCategory = prompt(
                "Edit category (Food, Travel, Shopping, Education, Other):",
                expense.category
            );

            if (newCategory === null) return;

            const validCategories = [
                "Food", "Travel", "Shopping", "Education", "Other"
            ];

            const matchedCategory = validCategories.find(
                category =>
                    category.toLowerCase() === newCategory.trim().toLowerCase()
            );

            if (!matchedCategory) {
                alert("Please enter a valid category.");
                return;
            }

            // Update the existing expense
            expenses[index].name = newName.trim();
            expenses[index].amount = newAmount;
            expenses[index].category = matchedCategory;

            localStorage.setItem(
                "cashandmeExpenses",
                JSON.stringify(expenses)
            );

            renderExpenses();
            updateExpenseCharts();
        });

        // Delete button
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete 🗑️";
        deleteButton.type = "button";

        deleteButton.addEventListener("click", function () {
            const confirmed = confirm(
                `Delete "${expense.name}" (₹${Number(expense.amount).toFixed(2)})?`
            );

            if (!confirmed) return;

            expenses.splice(index, 1);

            localStorage.setItem(
                "cashandmeExpenses",
                JSON.stringify(expenses)
            );

            renderExpenses();
            updateExpenseCharts();
        });

        listItem.appendChild(expenseText);
        listItem.appendChild(editButton);
        listItem.appendChild(deleteButton);

        expenseList.appendChild(listItem);
    });
}



// Add and save an expense
expenseForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const name =
        document.getElementById("expenseName").value.trim();

    const amount =
        Number(document.getElementById("expenseAmount").value);

    const category =
        document.getElementById("expenseCategory").value;

    if (!name || !Number.isFinite(amount) ||
        amount <= 0 || !category) {
        alert("Please enter a valid expense.");
        return;
    }

    expenses.push({
        name: name,
        amount: amount,
        category: category,
        date: new Date().toISOString()
    });

    localStorage.setItem(
        "cashandmeExpenses",
        JSON.stringify(expenses)
    );

    renderExpenses();
    updateExpenseCharts();
    expenseForm.reset();
});

// Show previously saved expenses
renderExpenses();

const aiExpenseButton = document.getElementById("aiExpenseButton");

if (aiExpenseButton) {
  aiExpenseButton.addEventListener("click", async function () {
    const input = document.getElementById("aiExpenseInput");
    const message = document.getElementById("aiExpenseMessage");

    const sentence = input.value.trim();

    if (!sentence) {
      message.textContent = "Please describe your expense first.";
      return;
    }

    aiExpenseButton.disabled = true;
    message.textContent = "Understanding your expense... ✨";

    try {
      const response = await fetch("/api/parse-expense", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ sentence })
      });

      const expense = await response.json();

      if (!response.ok) {
        throw new Error(
          expense.error || "Couldn't understand that expense."
        );
      }

      document.getElementById("expenseName").value = expense.name;
      document.getElementById("expenseAmount").value = expense.amount;
      document.getElementById("expenseCategory").value = expense.category;

      message.textContent =
        "Your form is ready! Review the details and click Add Expense + to save.";
    } catch (error) {
      console.error("AI assistant error:", error);
      message.textContent =
        error.message || "Couldn't connect to the AI. Please try again.";
    } finally {
      aiExpenseButton.disabled = false;
    }
  });
}
