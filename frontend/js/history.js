async function loadHistory() {
  const tableBody = document.querySelector("#history-body");
  const emptyState = document.querySelector("#empty-history");

  try {
    const expenses = await getExpenses();
    tableBody.innerHTML = "";

    if (expenses.length === 0) {
      emptyState.hidden = false;
      return;
    }

    emptyState.hidden = true;

    tableBody.innerHTML = [...expenses].reverse().map(expense => `
      <tr data-expense-row="${expense.id}">
        <td>${formatDate(expense.date)}</td>
        <td><strong>${escapeHtml(expense.description)}</strong></td>
        <td>${escapeHtml(expense.group)}</td>
        <td>${escapeHtml(expense.paidBy)}</td>
        <td>${(expense.splitWith || []).map(escapeHtml).join(", ") || expense.participants}</td>
        <td><strong>${formatCurrency(expense.amount)}</strong></td>
        <td><button class="delete-button" type="button" data-delete-expense="${expense.id}">Delete</button></td>
      </tr>
    `).join("");

    tableBody.querySelectorAll("[data-delete-expense]").forEach(button => {
      button.addEventListener("click", async () => {
        if (!window.confirm("Delete this expense? This action cannot be undone.")) {
          return;
        }

        button.disabled = true;
        try {
          await deleteExpense(button.dataset.deleteExpense);
          await loadHistory();
        } catch (error) {
          button.disabled = false;
          window.alert(error.message);
        }
      });
    });
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
