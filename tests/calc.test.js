// Run with: node --test
import assert from "node:assert/strict";
import { test } from "node:test";
import { appendDigit, computeTotals, deleteDigit, percentTipCents } from "../calc.js";

test("keypad digits build cents directly", () => {
  const cents = [1, 2, 3, 4].reduce(appendDigit, 0);
  assert.equal(cents, 1234);
});

test("keypad stops accepting digits at ten digits", () => {
  const full = appendDigit(999999999, 9);
  assert.equal(full, 9999999999);
  assert.equal(appendDigit(full, 1), full);
});

test("delete drops the last digit", () => {
  assert.equal(deleteDigit(1234), 123);
  assert.equal(deleteDigit(0), 0);
});

test("percent tip rounds to the nearest cent", () => {
  assert.equal(percentTipCents(5000, 20), 1000);
  assert.equal(percentTipCents(1234, 18), 222); // 222.12
  assert.equal(percentTipCents(1250, 18), 225);
  assert.equal(percentTipCents(1234, 0), 0);
});

test("percent tip rounds exact half cents up", () => {
  // 50 * 29 / 100 is exactly 14.5; dividing the percent first gave 14.
  assert.equal(percentTipCents(50, 29), 15);
  assert.equal(percentTipCents(25, 58), 15);
  assert.equal(percentTipCents(4500, 70), 3150);
});

test("totals add the tip and round the per-person share", () => {
  assert.deepEqual(computeTotals(1000, 200, 3), {
    tipCents: 200,
    totalCents: 1200,
    perPersonCents: 400,
  });
  assert.equal(computeTotals(1000, 0, 3).perPersonCents, 333); // 333.33
  assert.equal(computeTotals(1001, 0, 2).perPersonCents, 501); // 500.5 rounds up
});
