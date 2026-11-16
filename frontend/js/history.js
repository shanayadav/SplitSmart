async function loadHistory() {
  const tableBody = document.querySelector("#history-body");
  const emptyState = document.querySelector("#empty-history");

  try {
    const expenses = await getExpenses();

    if (expenses.length === 0) {
      emptyState.hidden = false;
      return;
    }

    tableBody.innerHTML = [...expenses].reverse().map(expense => `
      <tr>
        <td>${formatDate(expense.date)}</td>
        <td><strong>${escapeHtml(expense.description)}</strong></td>
        <td>${escapeHtml(expense.group)}</td>
        <td>${escapeHtml(expense.paidBy)}</td>
        <td>${expense.participants}</td>
        <td><strong>${formatCurrency(expense.amount)}</strong></td>
      </tr>
    `).join("");
  } catch (error) {
    emptyState.hidden = false;
    emptyState.textContent = "Start the Node server to load expense history.";
  }
}

function escapeHtml(value) {
  const element = document.createElement("div");
  element.textContent = value;
  return element.innerHTML;
}

loadHistory();
