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
