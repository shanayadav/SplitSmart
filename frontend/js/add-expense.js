const expenseForm = document.querySelector("#expense-form");
const amountInput = document.querySelector("#amount");
const groupSelect = document.querySelector("#group");
const paidBySelect = document.querySelector("#paid-by");
const memberChecklist = document.querySelector("#member-checklist");
const splitPreview = document.querySelector("#split-preview");
const formMessage = document.querySelector("#form-message");
const saveButton = document.querySelector("#save-expense-button");
let groups = [];

function getSelectedGroup() {
  return groups.find(group => group.id === groupSelect.value);
}

function getSelectedMembers() {
  const group = getSelectedGroup();

  if (!group) {
    return [];
  }

  const splitType = expenseForm.elements.splitType.value;
  if (splitType === "all") {
    return [...group.members];
  }

  return [...memberChecklist.querySelectorAll("input:checked")].map(input => input.value);
}

function updateSplitPreview() {
  const amount = Number(amountInput.value);
  const selectedMembers = getSelectedMembers();

  if (amount > 0 && selectedMembers.length >= 2) {
    splitPreview.textContent = `Equal split: ${formatCurrency(amount / selectedMembers.length)} each between ${selectedMembers.join(", ")}.`;
  } else {
    splitPreview.textContent = "Choose a group, an amount and at least two people to see the equal split.";
  }
}

function showMessage(text, type) {
  formMessage.textContent = text;
  formMessage.className = `message show ${type}`;
}

amountInput.addEventListener("input", updateSplitPreview);

function renderGroupMembers() {
  const group = getSelectedGroup();
  paidBySelect.innerHTML = "";
  memberChecklist.innerHTML = "";

  if (!group) {
    paidBySelect.innerHTML = '<option value="">Choose a group first</option>';
    saveButton.disabled = true;
    updateSplitPreview();
    return;
  }

  group.members.forEach(member => {
    const payerOption = document.createElement("option");
    payerOption.value = member;
    payerOption.textContent = member;
    paidBySelect.appendChild(payerOption);

    const label = document.createElement("label");
    label.className = "member-option";
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.name = "splitMembers";
    checkbox.value = member;
    checkbox.checked = true;
    label.append(checkbox, document.createTextNode(member));
    memberChecklist.appendChild(label);
  });

  paidBySelect.value = "You";
  saveButton.disabled = false;
  updateSplitPreview();
}

groupSelect.addEventListener("change", renderGroupMembers);

expenseForm.elements.splitType.forEach(option => {
  option.addEventListener("change", () => {
    memberChecklist.hidden = expenseForm.elements.splitType.value !== "selected";
    updateSplitPreview();
  });
});

memberChecklist.addEventListener("change", event => {
  if (event.target.matches("input[type='checkbox']")) {
    updateSplitPreview();
  }
});

paidBySelect.addEventListener("change", () => {
  if (expenseForm.elements.splitType.value === "selected") {
    const payerCheckbox = [...memberChecklist.querySelectorAll("input")]
      .find(input => input.value === paidBySelect.value);

    if (payerCheckbox) {
      payerCheckbox.checked = true;
    }
  }
  updateSplitPreview();
});

expenseForm.addEventListener("submit", async event => {
  event.preventDefault();

  const formData = new FormData(expenseForm);
  const splitWith = getSelectedMembers();

  if (splitWith.length < 2) {
    showMessage("Choose at least two people for the split.", "error");
    return;
  }

  if (!splitWith.includes(formData.get("paidBy"))) {
    showMessage("The person who paid must be included in the split.", "error");
    return;
  }

  const expense = {
    description: formData.get("description"),
    amount: Number(formData.get("amount")),
    groupId: formData.get("group"),
    paidBy: formData.get("paidBy"),
    splitWith,
    date: formData.get("date")
  };

  try {
    await addExpense(expense);
    expenseForm.reset();
    document.querySelector("#date").valueAsDate = new Date();
    memberChecklist.hidden = true;
    renderGroupMembers();
    updateSplitPreview();
    showMessage("Expense saved. You can view it in History.", "success");
  } catch (error) {
    showMessage(error.message, "error");
  }
});

document.querySelector("#date").valueAsDate = new Date();

async function loadGroupOptions() {
  try {
    groups = await getGroups();

    groups.forEach(group => {
      const option = document.createElement("option");
      option.value = group.id;
      option.textContent = group.name;
      groupSelect.appendChild(option);
    });

    if (groups.length === 0) {
      showMessage("Create a group before adding an expense.", "error");
    }
  } catch (error) {
    showMessage("Start the Node server to load groups.", "error");
  }

  updateSplitPreview();
}

loadGroupOptions();
