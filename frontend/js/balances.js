async function loadBalances() {
  const balanceList = document.querySelector("#balance-list");
  const balanceMessage = document.querySelector("#balance-message");

  try {
    const [expenses, settlements] = await Promise.all([getExpenses(), getSettlements()]);
    const balances = calculateBalances(expenses, settlements);
    const { entries } = balances;

    document.querySelector("#total-owed").textContent = formatCurrency(balances.owed);
    document.querySelector("#total-owe").textContent = formatCurrency(balances.owe);

    const netBalance = balances.net;
    const netElement = document.querySelector("#net-balance");
    netElement.textContent = formatCurrency(netBalance);
    netElement.className = `stat-value ${netBalance >= 0 ? "positive" : "negative"}`;

    balanceList.innerHTML = entries.length ? entries.map((entry, index) => `
      <div class="balance-row">
        <div class="balance-person">
          <strong>${escapeHtml(entry.person)}</strong>
          <span class="muted">${escapeHtml(entry.group)}</span>
        </div>
        <span class="expense-amount ${entry.amount >= 0 ? "positive" : "negative"}">
          ${entry.amount >= 0 ? "You get " : "You owe "}${formatCurrency(Math.abs(entry.amount))}
        </span>
        <button class="button secondary small-button" type="button" data-settle-index="${index}">Settle Up</button>
      </div>
    `).join("") : '<p class="muted">All balances are settled.</p>';

    balanceList.querySelectorAll("[data-settle-index]").forEach(button => {
      button.addEventListener("click", async () => {
        const entry = entries[Number(button.dataset.settleIndex)];
        const action = entry.amount > 0 ? `${entry.person} has paid you` : `you have paid ${entry.person}`;

        if (!window.confirm(`Confirm that ${action} ${formatCurrency(Math.abs(entry.amount))} for ${entry.group}?`)) {
          return;
        }

        button.disabled = true;
        try {
          await addSettlement({
            groupId: entry.groupId,
            person: entry.person,
            amount: entry.amount
          });
          balanceMessage.textContent = `Balance with ${entry.person} in ${entry.group} was settled.`;
          balanceMessage.className = "message show success";
          await loadBalances();
        } catch (error) {
          balanceMessage.textContent = error.message;
          balanceMessage.className = "message show error";
          button.disabled = false;
        }
      });
    });
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

// Refresh balances when the user returns after adding or deleting an expense
// in another page or browser tab.
window.addEventListener("focus", loadBalances);
