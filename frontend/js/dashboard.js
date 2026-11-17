async function loadDashboard() {
  const recentList = document.querySelector("#recent-expenses");

  try {
    const [expenses, groups, settlements] = await Promise.all([getExpenses(), getGroups(), getSettlements()]);
    const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const amounts = calculateUserAmounts(expenses, settlements);

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

function calculateUserAmounts(expenses, settlements) {
  const totals = expenses.reduce((result, expense) => {
    const splitWith = expense.splitWith || [];
    const participantCount = splitWith.length || expense.participants;
    const share = expense.amount / participantCount;

    if (expense.paidBy === "You") {
      result.owed += share * splitWith.filter(person => person !== "You").length;
    } else if (splitWith.includes("You")) {
      result.owe += share;
    }

    return result;
  }, { owe: 0, owed: 0 });

  settlements.forEach(settlement => {
    if (settlement.amount > 0) {
      totals.owed -= settlement.amount;
    } else {
      totals.owe -= Math.abs(settlement.amount);
    }
  });

  totals.owe = Math.max(0, totals.owe);
  totals.owed = Math.max(0, totals.owed);
  return totals;
}

function escapeHtml(value) {
  const element = document.createElement("div");
  element.textContent = value;
  return element.innerHTML;
}

loadDashboard();
