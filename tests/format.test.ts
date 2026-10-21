import { describe, expect, it } from "vitest";
import { formatCount, formatDate, formatPrice } from "@/lib/format";

describe("formatPrice", () => {
  it("formats a numeric UGX amount with no decimals", () => {
    const result = formatPrice(25000);
    // en-UG renders the UGX symbol as "USh".
    expect(result).toContain("25,000");
    expect(result).toContain("USh");
    expect(result).not.toContain(".");
  });

  it("formats a Decimal-as-string from Prisma", () => {
    expect(formatPrice("15000.00")).toContain("15,000");
  });

  it("returns an empty string for null, undefined, or empty string", () => {
    expect(formatPrice(null)).toBe("");
    expect(formatPrice(undefined)).toBe("");
    expect(formatPrice("")).toBe("");
  });

  it("returns an empty string for non-numeric input", () => {
    expect(formatPrice("abc")).toBe("");
  });
});

describe("formatCount", () => {
  it("adds thousands separators", () => {
    expect(formatCount(1234567)).toBe("1,234,567");
  });

  it("leaves small numbers alone", () => {
    expect(formatCount(42)).toBe("42");
  });
});

describe("formatDate", () => {
  it("formats a Date into a readable UG-locale date", () => {
    const result = formatDate(new Date("2026-10-03T12:00:00Z"));
    expect(result).toMatch(/2026/);
    expect(result).toMatch(/Oct/);
  });

  it("accepts an ISO string", () => {
    expect(formatDate("2026-10-03T12:00:00Z")).toMatch(/2026/);
  });
});
