import { describe, expect, it } from "vitest";
import { formatCrore, formatINR, formatINRCompact } from "./format-inr";

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
