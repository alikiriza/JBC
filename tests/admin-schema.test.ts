import { describe, expect, it } from "vitest";
import {
  ListAdminRequestsSchema,
  MAX_PRICE_UGX,
  UpdatePriceRequestSchema,
} from "@/lib/schemas/admin";

describe("UpdatePriceRequestSchema", () => {
  it("accepts a Priced transition with a price", () => {
    const result = UpdatePriceRequestSchema.safeParse({
      status: "Priced",
      price: 25000,
      adminNote: "Pay on delivery",
      contactMethod: "+256700000000",
    });
    expect(result.success).toBe(true);
  });

  it("rejects Priced without a price", () => {
    const result = UpdatePriceRequestSchema.safeParse({ status: "Priced" });
    expect(result.success).toBe(false);
  });

  it("accepts Closed without a price", () => {
    const result = UpdatePriceRequestSchema.safeParse({ status: "Closed" });
    expect(result.success).toBe(true);
  });

  it("rejects a zero or negative price", () => {
    for (const price of [0, -100]) {
      const result = UpdatePriceRequestSchema.safeParse({ status: "Priced", price });
      expect(result.success).toBe(false);
    }
  });

  it("rejects a fractional price", () => {
    const result = UpdatePriceRequestSchema.safeParse({ status: "Priced", price: 1000.5 });
    expect(result.success).toBe(false);
  });

  it("rejects a price above MAX_PRICE_UGX", () => {
    const result = UpdatePriceRequestSchema.safeParse({
      status: "Priced",
      price: MAX_PRICE_UGX + 1,
    });
    expect(result.success).toBe(false);
  });

  it("rejects an unknown status", () => {
    const result = UpdatePriceRequestSchema.safeParse({ status: "Refunded", price: 1000 });
    expect(result.success).toBe(false);
  });
});

describe("ListAdminRequestsSchema", () => {
  it("accepts every valid status filter", () => {
    for (const status of ["all", "Pending", "Priced", "Closed"]) {
      const result = ListAdminRequestsSchema.safeParse({ status });
      expect(result.success).toBe(true);
    }
  });

  it("falls back to all on an unknown status", () => {
    const result = ListAdminRequestsSchema.parse({ status: "Nonsense" });
    expect(result.status).toBe("all");
  });

  it("leaves status undefined when omitted (route treats it as all)", () => {
    const result = ListAdminRequestsSchema.parse({});
    expect(result.status).toBeUndefined();
  });
});
