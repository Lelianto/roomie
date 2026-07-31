/**
 * Calendar dates are passed around as `YYYY-MM-DD` keys rather than `Date`
 * objects. Every conversion here is deliberately component-wise: parsing the
 * key with `new Date(key)` reads it as UTC midnight, which lands on the
 * previous day for anyone west of Greenwich.
 */

export const monthFormat = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
});

export const dayFormat = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  day: "numeric",
  month: "short",
});

/** Monday-first, matching the calendar grid. */
export const weekdays = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

export function toKey(date: Date) {
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export function fromKey(key: string) {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year ?? 1970, (month ?? 1) - 1, day ?? 1);
}

export function todayKey() {
  return toKey(new Date());
}

export function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/** Blank leading cells before the 1st, so the month starts on the right column. */
export function leadingBlanks(month: Date) {
  return (startOfMonth(month).getDay() + 6) % 7;
}

export function daysInMonth(month: Date) {
  return new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
}

/** Every day of the month, with `null` padding for the leading blanks. */
export function monthCells(month: Date): (Date | null)[] {
  return [
    ...Array.from({ length: leadingBlanks(month) }, () => null),
    ...Array.from(
      { length: daysInMonth(month) },
      (_, index) => new Date(month.getFullYear(), month.getMonth(), index + 1),
    ),
  ];
}
