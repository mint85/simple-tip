const state = {
  cents: 0,
  tipPercent: Number(localStorage.getItem("simpleTip.tipPercent")) || 18,
  splitCount: Number(localStorage.getItem("simpleTip.splitCount")) || 1,
};

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const HAPTIC_TAP_MS = 22;

const elements = {
  billAmount: document.querySelector("#billAmount"),
  tipPercent: document.querySelector("#tipPercent"),
  splitCount: document.querySelector("#splitCount"),
  totalToPay: document.querySelector("#totalToPay"),
  totalTip: document.querySelector("#totalTip"),
  perPerson: document.querySelector("#perPerson"),
  tipDown: document.querySelector("#tipDown"),
  tipUp: document.querySelector("#tipUp"),
  splitDown: document.querySelector("#splitDown"),
  splitUp: document.querySelector("#splitUp"),
  reset: document.querySelector("#reset"),
  delete: document.querySelector("#delete"),
  aboutOpen: document.querySelector("#aboutOpen"),
  aboutClose: document.querySelector("#aboutClose"),
  aboutDialog: document.querySelector("#aboutDialog"),
};

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function formatCents(cents) {
  return money.format(cents / 100);
}

function hapticTap() {
  if ("vibrate" in navigator) {
    navigator.vibrate(HAPTIC_TAP_MS);
  }
}

function render() {
  const tipCents = Math.round(state.cents * (state.tipPercent / 100));
  const totalCents = state.cents + tipCents;
  const perPersonCents = Math.round(totalCents / state.splitCount);

  elements.billAmount.value = formatCents(state.cents);
  elements.tipPercent.value = `${state.tipPercent}%`;
  elements.splitCount.value = String(state.splitCount);
  elements.totalToPay.value = formatCents(totalCents);
  elements.totalTip.value = formatCents(tipCents);
  elements.perPerson.value = formatCents(perPersonCents);

  localStorage.setItem("simpleTip.tipPercent", String(state.tipPercent));
  localStorage.setItem("simpleTip.splitCount", String(state.splitCount));
}

function addDigit(digit) {
  if (state.cents > 999999999) return;
  state.cents = state.cents * 10 + Number(digit);
  render();
}

document.querySelectorAll("button").forEach((button) => {
  button.addEventListener("click", hapticTap);
});

document.querySelectorAll("[data-digit]").forEach((button) => {
  button.addEventListener("click", () => addDigit(button.dataset.digit));
});

elements.reset.addEventListener("click", () => {
  state.cents = 0;
  render();
});

elements.delete.addEventListener("click", () => {
  state.cents = Math.floor(state.cents / 10);
  render();
});

elements.tipDown.addEventListener("click", () => {
  state.tipPercent = clamp(state.tipPercent - 1, 0, 100);
  render();
});

elements.tipUp.addEventListener("click", () => {
  state.tipPercent = clamp(state.tipPercent + 1, 0, 100);
  render();
});

elements.splitDown.addEventListener("click", () => {
  state.splitCount = clamp(state.splitCount - 1, 1, 99);
  render();
});

elements.splitUp.addEventListener("click", () => {
  state.splitCount = clamp(state.splitCount + 1, 1, 99);
  render();
});

elements.aboutOpen.addEventListener("click", () => {
  elements.aboutDialog.showModal();
});

elements.aboutClose.addEventListener("click", () => {
  elements.aboutDialog.close();
});

elements.aboutDialog.addEventListener("click", (event) => {
  if (event.target === elements.aboutDialog) {
    elements.aboutDialog.close();
  }
});

document.addEventListener("keydown", (event) => {
  if (/^[0-9]$/.test(event.key)) addDigit(event.key);
  if (event.key === "Backspace") {
    state.cents = Math.floor(state.cents / 10);
    render();
  }
  if (event.key === "Escape") {
    state.cents = 0;
    render();
  }
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("service-worker.js");
  });
}

render();
