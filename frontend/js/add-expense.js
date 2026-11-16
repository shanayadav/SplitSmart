const expenseForm = document.querySelector("#expense-form");
const amountInput = document.querySelector("#amount");
const participantsInput = document.querySelector("#participants");
const splitPreview = document.querySelector("#split-preview");
const formMessage = document.querySelector("#form-message");

function updateSplitPreview() {
  const amount = Number(amountInput.value);
  const participants = Number(participantsInput.value);

  if (amount > 0 && participants >= 2) {
    splitPreview.textContent = `Equal split: ${formatCurrency(amount / participants)} per person`;
  } else {
    splitPreview.textContent = "Enter an amount and number of people to see the equal split.";
  }
}

function showMessage(text, type) {
  formMessage.textContent = text;
  formMessage.className = `message show ${type}`;
}

amountInput.addEventListener("input", updateSplitPreview);
participantsInput.addEventListener("input", updateSplitPreview);

expenseForm.addEventListener("submit", async event => {
  event.preventDefault();

  const formData = new FormData(expenseForm);
  const expense = {
    description: formData.get("description"),
    amount: Number(formData.get("amount")),
    group: formData.get("group"),
    paidBy: formData.get("paidBy"),
    participants: Number(formData.get("participants")),
    date: formData.get("date")
  };

  try {
    await addExpense(expense);
    expenseForm.reset();
    document.querySelector("#date").valueAsDate = new Date();
    updateSplitPreview();
    showMessage("Expense saved. You can view it in History.", "success");
  } catch (error) {
    showMessage(error.message, "error");
  }
});

document.querySelector("#date").valueAsDate = new Date();
updateSplitPreview();
