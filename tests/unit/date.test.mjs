import assert from "node:assert/strict";
import test from "node:test";
import {
  daysInMonth,
  fromKey,
  leadingBlanks,
  monthCells,
  startOfMonth,
  todayKey,
  toKey,
} from "../../lib/date.ts";

test("a key round-trips through a local Date unchanged", () => {
  for (const key of ["2026-01-01", "2026-07-31", "2026-12-31", "2024-02-29"]) {
    assert.equal(toKey(fromKey(key)), key);
  }
});

test("parsing a key does not shift the day west of Greenwich", () => {
  // `new Date("2026-03-01")` is UTC midnight, which is still 28 February in any
  // negative-offset zone. Component-wise parsing has to stay local.
  const parsed = fromKey("2026-03-01");

  assert.equal(parsed.getFullYear(), 2026);
  assert.equal(parsed.getMonth(), 2);
  assert.equal(parsed.getDate(), 1);
  assert.equal(parsed.getHours(), 0);
});

test("months and days are zero-padded so keys sort lexicographically", () => {
  assert.equal(toKey(new Date(2026, 0, 5)), "2026-01-05");
  assert.equal(toKey(new Date(2026, 8, 9)), "2026-09-09");

  const keys = [new Date(2026, 10, 2), new Date(2026, 1, 20), new Date(2026, 1, 3)].map(
    toKey,
  );
  assert.deepEqual([...keys].sort(), ["2026-02-03", "2026-02-20", "2026-11-02"]);
});

test("today is a valid key and is not in the past relative to itself", () => {
  const key = todayKey();

  assert.match(key, /^\d{4}-\d{2}-\d{2}$/);
  assert.equal(toKey(fromKey(key)), key);
});

test("a delivery date before today is rejected by string comparison", () => {
  // The date picker disables backdated days by comparing keys directly, so the
  // padding above is what makes that comparison safe.
  const min = "2026-07-31";

  assert.ok("2026-07-30" < min, "the day before must compare as earlier");
  assert.ok("2026-08-01" > min, "the day after must compare as later");
  assert.equal("2026-07-31" < min, false, "the minimum itself must be selectable");
  assert.ok("2026-12-01" > min, "a later month must not be rejected as backdated");
  assert.ok("2027-01-01" > min, "a later year must not be rejected as backdated");
});

test("the month grid starts on Monday", () => {
  // 1 March 2026 is a Sunday, which is the last column of a Monday-first week.
  assert.equal(leadingBlanks(new Date(2026, 2, 1)), 6);
  // 1 June 2026 is a Monday, so it needs no leading blanks.
  assert.equal(leadingBlanks(new Date(2026, 5, 1)), 0);
});

test("day counts cover short months and leap years", () => {
  assert.equal(daysInMonth(new Date(2026, 1, 1)), 28);
  assert.equal(daysInMonth(new Date(2024, 1, 1)), 29);
  assert.equal(daysInMonth(new Date(2026, 3, 1)), 30);
  assert.equal(daysInMonth(new Date(2026, 6, 1)), 31);
});

test("the start of a month keeps the month and drops to the first", () => {
  const start = startOfMonth(new Date(2026, 6, 31));

  assert.equal(start.getDate(), 1);
  assert.equal(start.getMonth(), 6);
  assert.equal(start.getFullYear(), 2026);
});

test("the grid holds every day of the month after its leading blanks", () => {
  const month = new Date(2026, 2, 1);
  const cells = monthCells(month);

  assert.equal(cells.length, leadingBlanks(month) + daysInMonth(month));
  assert.equal(
    cells.slice(0, leadingBlanks(month)).every((cell) => cell === null),
    true,
  );

  const days = cells.filter((cell) => cell !== null);
  assert.equal(days.length, daysInMonth(month));
  assert.equal(toKey(days[0]), "2026-03-01");
  assert.equal(toKey(days.at(-1)), "2026-03-31");
});
