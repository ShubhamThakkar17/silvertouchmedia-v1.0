/**
 * Indian currency formatting.
 *   formatINR(1250000)            → "₹12,50,000"
 *   formatINRCompact(12500000)    → "₹1.25 Cr"
 *   formatINRCompact(5000000)     → "₹50 L"
 *   formatINRCompact(85000)       → "₹85,000"
 */
const grouping = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

export function formatINR(value: number): string {
  const sign = value < 0 ? "-" : "";
  return `${sign}₹${grouping.format(Math.round(Math.abs(value)))}`;
}

function trim(n: number, digits: number) {
  return Number(n.toFixed(digits)).toString();
}

export function formatINRCompact(value: number, digits = 2): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs >= 1e7) return `${sign}₹${trim(abs / 1e7, digits)} Cr`;
  if (abs >= 1e5) return `${sign}₹${trim(abs / 1e5, digits)} L`;
  return formatINR(value);
}

/** Crore figures as published in adex reports: 20866 → "₹20,866 Cr". */
export function formatCrore(crore: number): string {
  return `₹${grouping.format(crore)} Cr`;
}

export function formatINRRange(low: number, high: number): string {
  return `${formatINRCompact(low)} to ${formatINRCompact(high)}`;
}
