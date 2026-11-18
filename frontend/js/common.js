// This file contains behaviour shared by every page.

const menuButton = document.querySelector("[data-menu-button]");
const sidebar = document.querySelector("[data-sidebar]");
const menuOverlay = document.querySelector("[data-menu-overlay]");

function closeMenu() {
  sidebar?.classList.remove("open");
  menuOverlay?.classList.remove("show");
}

menuButton?.addEventListener("click", () => {
  sidebar?.classList.add("open");
  menuOverlay?.classList.add("show");
});

menuOverlay?.addEventListener("click", closeMenu);

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    closeMenu();
  }
});

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2
  }).format(amount);
}

function formatDate(dateString) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(new Date(`${dateString}T00:00:00`));
}

function calculateBalances(expenses, settlements) {
  const people = new Map();

  function addBalance(groupId, group, person, amount) {
    const key = `${groupId}::${person}`;
    const current = people.get(key) || { groupId, group, person, amount: 0 };
    current.amount += amount;
    people.set(key, current);
  }

  expenses.forEach(expense => {
    const splitWith = expense.splitWith || [];
    const participantCount = splitWith.length || expense.participants;

    if (!participantCount) {
      return;
    }

    const share = expense.amount / participantCount;

    if (expense.paidBy === "You") {
      splitWith
        .filter(person => person !== "You")
        .forEach(person => addBalance(expense.groupId, expense.group, person, share));
    } else if (splitWith.includes("You")) {
      addBalance(expense.groupId, expense.group, expense.paidBy, -share);
    }
  });

  settlements.forEach(settlement => {
    addBalance(settlement.groupId, settlement.group, settlement.person, -settlement.amount);
  });

  const entries = [...people.values()].filter(entry => Math.abs(entry.amount) >= 0.01);
  const owed = entries
    .filter(entry => entry.amount > 0)
    .reduce((total, entry) => total + entry.amount, 0);
  const owe = entries
    .filter(entry => entry.amount < 0)
    .reduce((total, entry) => total + Math.abs(entry.amount), 0);

  return { entries, owe, owed, net: owed - owe };
}
