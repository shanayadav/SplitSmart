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
