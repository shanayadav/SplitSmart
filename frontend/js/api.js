// All communication with the backend is kept in this one file.

async function getExpenses() {
  const response = await fetch("/api/expenses");

  if (!response.ok) {
    throw new Error("Could not load expenses");
  }

  return response.json();
}

async function addExpense(expense) {
  const response = await fetch("/api/expenses", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(expense)
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Could not save expense");
  }

  return result;
}

async function deleteExpense(expenseId) {
  const response = await fetch(`/api/expenses/${encodeURIComponent(expenseId)}`, {
    method: "DELETE"
  });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Could not delete expense");
  }

  return result;
}

async function getGroups() {
  const response = await fetch("/api/groups");

  if (!response.ok) {
    throw new Error("Could not load groups");
  }

  return response.json();
}

async function addGroup(group) {
  const response = await fetch("/api/groups", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(group)
  });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Could not save group");
  }

  return result;
}

async function getSettlements() {
  const response = await fetch("/api/settlements");

  if (!response.ok) {
    throw new Error("Could not load settlements");
  }

  return response.json();
}

async function addSettlement(settlement) {
  const response = await fetch("/api/settlements", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(settlement)
  });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Could not settle balance");
  }

  return result;
}
