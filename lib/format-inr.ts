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

/** Counts in Indian units: 1250000 → "12.5 L", 25000000 → "2.5 Cr", 84000 → "84,000". */
export function formatCount(n: number, digits = 1): string {
  const abs = Math.abs(n);
  if (abs >= 1e7) return `${trim(n / 1e7, digits)} Cr`;
  if (abs >= 1e5) return `${trim(n / 1e5, digits)} L`;
  return grouping.format(Math.round(n));
}

export function formatCountRange(low: number, high: number): string {
  return `${formatCount(low)} to ${formatCount(high)}`;
}

/** Parses "40 L", "2.5 cr", "₹15,00,000" or "400000" into rupees. Returns NaN if unreadable. */
export function parseINR(input: string): number {
  const s = input.toLowerCase().replace(/[₹,\s]/g, "");
  const m = s.match(/^(\d+(?:\.\d+)?)(cr|crore|l|lakh|lakhs|k)?$/);
  if (!m) return NaN;
  const n = parseFloat(m[1]);
  const unit = m[2] ?? "";
  if (unit.startsWith("c")) return Math.round(n * 1e7);
  if (unit.startsWith("l")) return Math.round(n * 1e5);
  if (unit === "k") return Math.round(n * 1e3);
  return Math.round(n);
}
