import type { RentalCycle } from "./catalog";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export function formatMoney(amount: number) {
  return money.format(amount);
}

export function cycleLabel(cycle: RentalCycle) {
  return cycle === "weekly" ? "week" : "month";
}
