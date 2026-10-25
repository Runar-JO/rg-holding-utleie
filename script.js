"use strict";

document.getElementById("year").textContent = new Date().getFullYear();

const menuButton = document.querySelector(".menu-toggle");
const nav = document.querySelector(".main-nav");
menuButton.hidden = false;
nav.classList.add("mobile-nav");
function closeMenu() {
  nav.classList.remove("open");
  menuButton.setAttribute("aria-expanded", "false");
}
menuButton.addEventListener("click", () => {
  const open = menuButton.getAttribute("aria-expanded") !== "true";
  menuButton.setAttribute("aria-expanded", String(open));
  nav.classList.toggle("open", open);
});
nav.addEventListener("click", (event) => {
  if (event.target.closest("a")) closeMenu();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && nav.classList.contains("open")) {
    closeMenu();
    menuButton.focus();
  }
});

const filters = document.querySelector(".filters");
filters.hidden = false;
filters.addEventListener("click", (event) => {
  const button = event.target.closest("[data-filter]");
  if (!button) return;
  filters.querySelectorAll("button").forEach((item) => {
    const selected = item === button;
    item.classList.toggle("active", selected);
    item.setAttribute("aria-pressed", String(selected));
  });
  document.querySelectorAll(".product").forEach((product) => {
    product.hidden = button.dataset.filter !== "alle" && product.dataset.category !== button.dataset.filter;
  });
});

const form = document.querySelector(".contact-form");
document.querySelectorAll(".product-select").forEach((link) => {
  link.addEventListener("click", () => {
    form.elements.product.value = link.dataset.product;
    updateRentalSummary();
  });
});
function openProductFromHash() {
  const id = window.location.hash.slice(1);
  const target = document.getElementById(id);
  if (target instanceof HTMLDetailsElement) {
    const category = target.closest(".product")?.dataset.category;
    if (category) filters.querySelector('[data-filter="alle"]').click();
    target.open = true;
  }
}
window.addEventListener("hashchange", openProductFromHash);
openProductFromHash();
document.addEventListener("click", (event) => {
  const link = event.target.closest('a[href^="#"]');
  if (!link) return;
  const target = document.getElementById(link.getAttribute("href").slice(1));
  if (target instanceof HTMLDetailsElement) {
    filters.querySelector('[data-filter="alle"]').click();
    target.open = true;
  }
});

const currency = new Intl.NumberFormat("nb-NO", { style: "currency", currency: "NOK" });
const startInput = form.elements.start;
const endInput = form.elements.end;
const summary = form.querySelector(".rental-summary");
const rentalError = form.querySelector(".rental-error");

function updateRentalSummary() {
  endInput.min = startInput.value;
  endInput.setCustomValidity("");
  endInput.removeAttribute("aria-invalid");
  rentalError.textContent = "";
  form.querySelector(".form-status").textContent = "";
  const startDay = rentalDayNumber(startInput.value);
  const endDay = rentalDayNumber(endInput.value);
  if (Number.isFinite(startDay) && Number.isFinite(endDay) && endDay < startDay) {
    rentalError.textContent = "Sluttdato kan ikke være før startdato.";
    endInput.setCustomValidity(rentalError.textContent);
    endInput.setAttribute("aria-invalid", "true");
  }
  const result = calculateRental(form.elements.product.value, startInput.value, endInput.value);
  summary.querySelector(".rental-prompt").hidden = Boolean(result);
  summary.querySelector(".rental-breakdown").hidden = !result;
  if (!result) return;
  summary.querySelector(".rental-rate").textContent = `${form.elements.product.value} · ${result.rateLabel} inkl. mva.`;
  document.getElementById("rental-days").textContent = `${result.days} ${result.days === 1 ? "dag" : "dager"}`;
  document.getElementById("rental-net").textContent = currency.format(result.netOre / 100);
  document.getElementById("rental-vat").textContent = currency.format(result.vatOre / 100);
  document.getElementById("rental-total").textContent = currency.format(result.totalOre / 100);
}

// Do not rewrite a date while the visitor is editing it in the calendar.
// Apply the minimum rental period only after they leave the field.
function commitRentalDates() {
  if (form.elements.product.value === "Stillas") {
    endInput.value = scaffoldingEndDate(startInput.value, endInput.value);
  }
  updateRentalSummary();
}

for (const field of [form.elements.product, startInput, endInput]) {
  field.addEventListener("input", updateRentalSummary);
  field.addEventListener("change", updateRentalSummary);
  field.addEventListener("blur", commitRentalDates);
}
window.addEventListener("pageshow", updateRentalSummary);
updateRentalSummary();

form.addEventListener("submit", (event) => event.preventDefault());
const demoButton = form.querySelector('button[type="button"]');
demoButton.addEventListener("click", () => {
  commitRentalDates();
  if (!form.reportValidity()) return;
  form.querySelector(".form-status").textContent = "Forespørselen er klar som demonstrasjon. Ingen melding er sendt. Innsending kobles til når kontaktinformasjon og skjemaløsning er valgt.";
});
