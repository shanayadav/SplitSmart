async function loadDashboard() {
  const recentList = document.querySelector("#recent-expenses");

  try {
    const [expenses, groups, settlements] = await Promise.all([getExpenses(), getGroups(), getSettlements()]);
    const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const amounts = calculateBalances(expenses, settlements);

    document.querySelector("#group-count").textContent = groups.length;
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
        <div class="muted">${escapeHtml(expense.paidBy)} · ${escapeHtml(expense.group)}</div>
        <div class="expense-amount">${formatCurrency(expense.amount)}</div>
      </div>
    `).join("");
  } catch (error) {
    recentList.innerHTML = '<p class="negative">Start the Node server to load expenses.</p>';
  }
}

function escapeHtml(value) {
  const element = document.createElement("div");
  element.textContent = value;
  return element.innerHTML;
}

loadDashboard();

// Browsers can restore the dashboard from their back/forward cache. Refresh its
// figures whenever it becomes active again so newly saved expenses are shown.
window.addEventListener("pageshow", event => {
  if (event.persisted) {
    loadDashboard();
  }
});
window.addEventListener("focus", loadDashboard);
