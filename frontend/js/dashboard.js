async function loadDashboard() {
  const recentList = document.querySelector("#recent-expenses");

  try {
    const expenses = await getExpenses();
    const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const amounts = calculateUserAmounts(expenses);

    document.querySelector("#total-expenses").textContent = formatCurrency(total);
    document.querySelector("#you-owe").textContent = formatCurrency(amounts.owe);
    document.querySelector("#you-are-owed").textContent = formatCurrency(amounts.owed);

    const recentExpenses = [...expenses].reverse().slice(0, 4);

    if (recentExpenses.length === 0) {
      recentList.innerHTML = '<p class="muted">No expenses added yet.</p>';
      return;
    }

    recentList.innerHTML = recentExpenses.map(expense => `
      <div class="expense-row">
        <div><strong>${escapeHtml(expense.description)}</strong></div>
        <div class="muted">${escapeHtml(expense.group)} · ${escapeHtml(expense.paidBy)}</div>
        <div class="expense-amount">${formatCurrency(expense.amount)}</div>
      </div>
    `).join("");
  } catch (error) {
    recentList.innerHTML = '<p class="negative">Start the Node server to load expenses.</p>';
  }
}

function calculateUserAmounts(expenses) {
  return expenses.reduce((totals, expense) => {
    const share = expense.amount / expense.participants;

    if (expense.paidBy === "You") {
      totals.owed += expense.amount - share;
    } else {
      totals.owe += share;
    }

    return totals;
  }, { owe: 0, owed: 0 });
}

function escapeHtml(value) {
  const element = document.createElement("div");
  element.textContent = value;
  return element.innerHTML;
}

loadDashboard();
