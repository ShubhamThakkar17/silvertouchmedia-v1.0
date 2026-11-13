import { describe, expect, it } from "vitest";
import { formatCount, formatCrore, formatINR, formatINRCompact, parseINR } from "./format-inr";

describe("format-inr", () => {
  it("uses Indian digit grouping", () => {
    expect(formatINR(1250000)).toBe("₹12,50,000");
    expect(formatINR(155105)).toBe("₹1,55,105");
  });
  it("compacts to lakh and crore", () => {
    expect(formatINRCompact(12500000)).toBe("₹1.25 Cr");
    expect(formatINRCompact(5000000)).toBe("₹50 L");
    expect(formatINRCompact(85000)).toBe("₹85,000");
  });
  it("formats crore figures", () => {
    expect(formatCrore(20866)).toBe("₹20,866 Cr");
  });
});

describe("counts and parsing", () => {
  it("formats counts in lakh and crore", () => {
    expect(formatCount(84000)).toBe("84,000");
    expect(formatCount(1250000)).toBe("12.5 L");
    expect(formatCount(25000000)).toBe("2.5 Cr");
  });
  it("parses Indian budget input", () => {
    expect(parseINR("40 L")).toBe(4000000);
    expect(parseINR("2.5 Cr")).toBe(25000000);
    expect(parseINR("₹15,00,000")).toBe(1500000);
    expect(parseINR("80k")).toBe(80000);
    expect(parseINR("abc")).toBeNaN();
  });
});
