// Pure money math. Every amount is integer cents, never floating-point dollars.

export function appendDigit(cents, digit) {
  if (cents > 999999999) return cents;
  return cents * 10 + Number(digit);
}

export function deleteDigit(cents) {
  return Math.floor(cents / 10);
}

export function percentTipCents(billCents, tipPercent) {
  // Multiply before dividing: tipPercent / 100 is inexact (0.29 is 0.28999...), which
  // can turn an exact half cent into 14.4999... and round it the wrong way.
  return Math.round((billCents * tipPercent) / 100);
}

export function computeTotals(billCents, tipCents, splitCount) {
  const totalCents = billCents + tipCents;
  return {
    tipCents,
    totalCents,
    perPersonCents: Math.round(totalCents / splitCount),
  };
}

// Whole-dollar tip that is closest to a percent tip, used to seed dollar mode.
export function nearestDollarTip(billCents, tipPercent) {
  return Math.round(percentTipCents(billCents, tipPercent) / 100);
}

// For display only; never fed back into money math. Null when there is no bill.
export function effectiveTipPercent(billCents, tipCents) {
  return billCents === 0 ? null : (tipCents * 100) / billCents;
}
