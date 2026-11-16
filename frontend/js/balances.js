async function loadBalances() {
  const balanceList = document.querySelector("#balance-list");

  try {
    const expenses = await getExpenses();
    let youOwe = 0;
    let youAreOwed = 0;
    const people = {};

    expenses.forEach(expense => {
      const share = expense.amount / expense.participants;

      if (expense.paidBy === "You") {
        const amountOwedToYou = expense.amount - share;
        youAreOwed += amountOwedToYou;
        people[expense.group] = (people[expense.group] || 0) + amountOwedToYou;
      } else {
        youOwe += share;
        people[expense.paidBy] = (people[expense.paidBy] || 0) - share;
      }
    });

    document.querySelector("#total-owed").textContent = formatCurrency(youAreOwed);
    document.querySelector("#total-owe").textContent = formatCurrency(youOwe);

    const netBalance = youAreOwed - youOwe;
    const netElement = document.querySelector("#net-balance");
    netElement.textContent = formatCurrency(netBalance);
    netElement.className = `stat-value ${netBalance >= 0 ? "positive" : "negative"}`;

    const entries = Object.entries(people);
    balanceList.innerHTML = entries.length ? entries.map(([name, amount]) => `
      <div class="balance-row">
        <strong>${escapeHtml(name)}</strong>
        <span class="muted">Equal split summary</span>
        <span class="expense-amount ${amount >= 0 ? "positive" : "negative"}">
          ${amount >= 0 ? "You get " : "You owe "}${formatCurrency(Math.abs(amount))}
        </span>
      </div>
    `).join("") : '<p class="muted">Add an expense to calculate balances.</p>';
  } catch (error) {
    balanceList.innerHTML = '<p class="negative">Start the Node server to calculate balances.</p>';
  }
}

function escapeHtml(value) {
  const element = document.createElement("div");
  element.textContent = value;
  return element.innerHTML;
}

loadBalances();
