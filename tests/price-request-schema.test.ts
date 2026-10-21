import { describe, expect, it } from "vitest";
import {
  CREAM_SIZES,
  CreatePriceRequestSchema,
  ListPriceRequestsSchema,
  MAX_QUANTITY,
} from "@/lib/schemas/price-request";

describe("CreatePriceRequestSchema", () => {
  it("accepts a minimal valid request", () => {
    const result = CreatePriceRequestSchema.safeParse({ size: "50ml", quantity: 1 });
    expect(result.success).toBe(true);
  });

  it("accepts every size in CREAM_SIZES", () => {
    for (const size of CREAM_SIZES) {
      const result = CreatePriceRequestSchema.safeParse({ size, quantity: 2 });
      expect(result.success).toBe(true);
    }
  });

  it("rejects a size outside CREAM_SIZES", () => {
    const result = CreatePriceRequestSchema.safeParse({ size: "1L", quantity: 1 });
    expect(result.success).toBe(false);
  });

  it("rejects quantity below 1", () => {
    const result = CreatePriceRequestSchema.safeParse({ size: "30ml", quantity: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects quantity above MAX_QUANTITY", () => {
    const result = CreatePriceRequestSchema.safeParse({
      size: "30ml",
      quantity: MAX_QUANTITY + 1,
    });
    expect(result.success).toBe(false);
  });

  it("rejects fractional quantity", () => {
    const result = CreatePriceRequestSchema.safeParse({ size: "30ml", quantity: 1.5 });
    expect(result.success).toBe(false);
  });

  it("trims the note and allows it to be omitted", () => {
    const result = CreatePriceRequestSchema.safeParse({
      size: "100ml",
      quantity: 3,
      note: "  hello  ",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.note).toBe("hello");
  });

  it("rejects a note over 1000 characters", () => {
    const result = CreatePriceRequestSchema.safeParse({
      size: "30ml",
      quantity: 1,
      note: "x".repeat(1001),
    });
    expect(result.success).toBe(false);
  });
});

describe("ListPriceRequestsSchema", () => {
  it("coerces query strings into numbers", () => {
    const result = ListPriceRequestsSchema.parse({ page: "2", limit: "20" });
    expect(result.page).toBe(2);
    expect(result.limit).toBe(20);
  });

  it("falls back to page 1 on nonsense input", () => {
    const result = ListPriceRequestsSchema.parse({ page: "-3" });
    expect(result.page).toBe(1);
  });

  it("falls back to limit 10 on out-of-range input", () => {
    const result = ListPriceRequestsSchema.parse({ limit: "999999" });
    expect(result.limit).toBe(10);
  });

  it("applies defaults when nothing is passed", () => {
    const result = ListPriceRequestsSchema.parse({});
    expect(result.page).toBe(1);
    expect(result.limit).toBe(10);
  });
});
