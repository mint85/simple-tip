import {
  appendDigit,
  computeTotals,
  deleteDigit,
  effectiveTipPercent,
  nearestDollarTip,
  percentTipCents,
} from "./calc.js";

const state = {
  cents: 0,
  tipMode: "percent",
  tipPercent: 20,
  tipDollars: 0,
  splitCount: 1,
};

const MAX_TIP_DOLLARS = 999;

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const HAPTIC_TAP_MS = 22;
// Holding a stepper repeats after HOLD_DELAY_MS, then steadily every HOLD_REPEAT_MS
// (about 6 steps a second, no acceleration) so the value never runs away.
const HOLD_DELAY_MS = 500;
const HOLD_REPEAT_MS = 150;

const elements = {
  billAmount: document.querySelector("#billAmount"),
  tipValue: document.querySelector("#tipValue"),
  tipModePercent: document.querySelector("#tipModePercent"),
  tipModeDollars: document.querySelector("#tipModeDollars"),
  splitCount: document.querySelector("#splitCount"),
  totalToPay: document.querySelector("#totalToPay"),
  totalTip: document.querySelector("#totalTip"),
  totalTipLabel: document.querySelector("#totalTipLabel"),
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

function formatPercent(percent) {
  return percent === null ? "—" : `${percent.toFixed(1)}%`;
}

function hapticTap() {
  if ("vibrate" in navigator) {
    navigator.vibrate(HAPTIC_TAP_MS);
  }
}

function render() {
  const dollarMode = state.tipMode === "dollars";
  const tipCents = dollarMode ? state.tipDollars * 100 : percentTipCents(state.cents, state.tipPercent);
  const { totalCents, perPersonCents } = computeTotals(state.cents, tipCents, state.splitCount);

  elements.billAmount.value = formatCents(state.cents);
  elements.tipValue.value = dollarMode ? `$${state.tipDollars}` : `${state.tipPercent}%`;
  elements.splitCount.value = String(state.splitCount);
  elements.totalToPay.value = formatCents(totalCents);
  elements.perPerson.value = formatCents(perPersonCents);

  // In dollar mode the stepper already shows the tip, so this slot shows the rate instead.
  elements.totalTipLabel.textContent = dollarMode ? "Tip rate" : "Total tip";
  elements.totalTip.value = dollarMode
    ? formatPercent(effectiveTipPercent(state.cents, tipCents))
    : formatCents(tipCents);

  elements.tipModePercent.setAttribute("aria-pressed", String(!dollarMode));
  elements.tipModeDollars.setAttribute("aria-pressed", String(dollarMode));
  elements.tipValue.setAttribute("aria-label", dollarMode ? "Tip in dollars" : "Tip percentage");
  elements.tipDown.setAttribute("aria-label", dollarMode ? "Decrease tip by one dollar" : "Decrease tip percentage");
  elements.tipUp.setAttribute("aria-label", dollarMode ? "Increase tip by one dollar" : "Increase tip percentage");
}

// Step functions return false when the value is already at its limit.
function stepTip(direction) {
  const dollarMode = state.tipMode === "dollars";
  const key = dollarMode ? "tipDollars" : "tipPercent";
  const next = clamp(state[key] + direction, 0, dollarMode ? MAX_TIP_DOLLARS : 100);
  if (next === state[key]) return false;
  state[key] = next;
  render();
  return true;
}

function stepSplit(direction) {
  const next = clamp(state.splitCount + direction, 1, 99);
  if (next === state.splitCount) return false;
  state.splitCount = next;
  render();
  return true;
}

function bindStepperButton(button, step) {
  let delayTimer;
  let repeatTimer;
  let held = false;

  const stop = () => {
    clearTimeout(delayTimer);
    clearInterval(repeatTimer);
  };

  const repeat = () => {
    held = true;
    if (step()) hapticTap();
    else stop();
  };

  button.addEventListener("pointerdown", (event) => {
    if (!event.isPrimary || event.button !== 0) return;
    // Touch pointers are captured by default; releasing lets sliding off fire pointerleave.
    if (button.hasPointerCapture(event.pointerId)) button.releasePointerCapture(event.pointerId);
    held = false;
    stop();
    delayTimer = setTimeout(() => {
      repeat();
      repeatTimer = setInterval(repeat, HOLD_REPEAT_MS);
    }, HOLD_DELAY_MS);
  });

  ["pointerup", "pointerleave", "pointercancel"].forEach((type) => button.addEventListener(type, stop));

  // Stops a long press from opening the context menu.
  button.addEventListener("contextmenu", (event) => event.preventDefault());

  // Taps and keyboard presses step here. The click that ends a hold is skipped so
  // letting go never adds one extra step.
  button.addEventListener("click", () => {
    if (held) {
      held = false;
      return;
    }
    hapticTap();
    step();
  });
}

function addDigit(digit) {
  state.cents = appendDigit(state.cents, digit);
  render();
}

// Stepper buttons handle their own haptics so a hold buzzes once per step.
document.querySelectorAll("button").forEach((button) => {
  if (!button.closest(".stepper")) button.addEventListener("click", hapticTap);
});

document.querySelectorAll("[data-digit]").forEach((button) => {
  button.addEventListener("click", () => addDigit(button.dataset.digit));
});

elements.reset.addEventListener("click", () => {
  state.cents = 0;
  render();
});

elements.delete.addEventListener("click", () => {
  state.cents = deleteDigit(state.cents);
  render();
});

elements.tipModePercent.addEventListener("click", () => {
  state.tipMode = "percent";
  render();
});

elements.tipModeDollars.addEventListener("click", () => {
  if (state.tipMode === "dollars") return;
  state.tipMode = "dollars";
  state.tipDollars = nearestDollarTip(state.cents, state.tipPercent);
  render();
});

bindStepperButton(elements.tipDown, () => stepTip(-1));
bindStepperButton(elements.tipUp, () => stepTip(1));
bindStepperButton(elements.splitDown, () => stepSplit(-1));
bindStepperButton(elements.splitUp, () => stepSplit(1));

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
    state.cents = deleteDigit(state.cents);
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
