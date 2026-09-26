// Pure money math. Every amount is integer cents, never floating-point dollars.

export function appendDigit(cents, digit) {
  if (cents > 999999999) return cents;
  return cents * 10 + Number(digit);
}

export function deleteDigit(cents) {
  return Math.floor(cents / 10);
}

export function percentTipCents(billCents, tipPercent) {
  return Math.round(billCents * (tipPercent / 100));
}

export function computeTotals(billCents, tipCents, splitCount) {
  const totalCents = billCents + tipCents;
  return {
    tipCents,
    totalCents,
    perPersonCents: Math.round(totalCents / splitCount),
  };
}
