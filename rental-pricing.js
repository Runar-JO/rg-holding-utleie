"use strict";

// Example prices include VAT. A week of scaffolding is prorated over seven days.
const RENTAL_RATES = Object.freeze({
  Gravemaskin: { amountOre: 150000, periodDays: 1, label: "1 500 kr / dag" },
  Stillas: { amountOre: 300000, periodDays: 7, label: "3 000 kr / uke, fordelt på 7 dager" },
  Tilhenger: { amountOre: 30000, periodDays: 1, label: "300 kr / dag" },
});

function rentalDayNumber(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return NaN;
  const [year, month, day] = value.split("-").map(Number);
  if (year < 1000) return NaN;
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return NaN;
  return date.getTime() / 86400000;
}

function calculateRental(product, start, end) {
  if (!Object.hasOwn(RENTAL_RATES, product)) return null;
  const first = rentalDayNumber(start);
  const last = rentalDayNumber(end);
  if (!Number.isFinite(first) || !Number.isFinite(last) || last < first) return null;
  const days = last - first + 1;
  const rate = RENTAL_RATES[product];
  const totalOre = Math.round(rate.amountOre * days / rate.periodDays);
  const netOre = Math.round(totalOre / 1.25);
  return { days, totalOre, netOre, vatOre: totalOre - netOre, rateLabel: rate.label };
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { calculateRental, rentalDayNumber };
}
