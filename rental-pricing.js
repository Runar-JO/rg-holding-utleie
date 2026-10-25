"use strict";

// Example prices include VAT. Scaffolding has a one-week minimum, except Fri–Sun.
const RENTAL_RATES = Object.freeze({
  Gravemaskin: { amountOre: 150000, periodDays: 1, label: "1 500 kr / dag" },
  Stillas: { amountOre: 300000, periodDays: 7, label: "Minst 3 000 kr / uke" },
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

function scaffoldingEndDate(start, end) {
  const first = rentalDayNumber(start);
  const last = rentalDayNumber(end);
  if (!Number.isFinite(first) || (end && !Number.isFinite(last)) || last < first) return end;
  const friday = new Date(first * 86400000).getUTCDay() === 5;
  if (friday && last === first + 2) return end;
  if (!end || last < first + 6) return new Date((first + 6) * 86400000).toISOString().slice(0, 10);
  return end;
}

function calculateRental(product, start, end) {
  if (!Object.hasOwn(RENTAL_RATES, product)) return null;
  const first = rentalDayNumber(start);
  const last = rentalDayNumber(end);
  if (!Number.isFinite(first) || !Number.isFinite(last) || last < first) return null;
  const days = last - first + 1;
  const rate = RENTAL_RATES[product];
  const weekend = product === "Stillas" && days === 3 && new Date(first * 86400000).getUTCDay() === 5;
  const totalOre = weekend ? 150000 : Math.round(rate.amountOre * (product === "Stillas" ? Math.max(7, days) : days) / rate.periodDays);
  const netOre = Math.round(totalOre / 1.25);
  const rateLabel = weekend ? "Helgeleie fredag–søndag: 1 500 kr" : rate.label;
  return { days, totalOre, netOre, vatOre: totalOre - netOre, rateLabel };
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { calculateRental, rentalDayNumber, scaffoldingEndDate };
}
