import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db", () => ({
  db: { user: { findUnique: vi.fn() } },
}));
vi.mock("@/lib/auth", () => ({ auth: {} }));
vi.mock("next/headers", () => ({ headers: vi.fn() }));
vi.mock("@/lib/admin-flag", () => ({ syncAdminFlag: vi.fn() }));

import { db } from "@/lib/db";
import { isAdminEmail, verifyAdmin } from "@/lib/admin";

const findUnique = db.user.findUnique as ReturnType<typeof vi.fn>;

beforeEach(() => {
  process.env.ADMIN_EMAILS = "Admin@Example.com, second@Example.com";
});

afterEach(() => {
  vi.clearAllMocks();
  delete process.env.ADMIN_EMAILS;
});

describe("isAdminEmail", () => {
  it("matches case-insensitively against the allowlist", () => {
    expect(isAdminEmail("admin@example.com")).toBe(true);
    expect(isAdminEmail("ADMIN@EXAMPLE.COM")).toBe(true);
    expect(isAdminEmail("  admin@example.com  ")).toBe(true);
  });

  it("rejects emails not on the allowlist", () => {
    expect(isAdminEmail("someone@example.com")).toBe(false);
  });

  it("rejects null, undefined, and empty values", () => {
    expect(isAdminEmail(null)).toBe(false);
    expect(isAdminEmail(undefined)).toBe(false);
    expect(isAdminEmail("")).toBe(false);
  });

  it("rejects everything when ADMIN_EMAILS is unset", () => {
    delete process.env.ADMIN_EMAILS;
    expect(isAdminEmail("admin@example.com")).toBe(false);
  });
});

describe("verifyAdmin", () => {
  it("passes only when both gates pass", async () => {
    findUnique.mockResolvedValue({ isAdmin: true, email: "admin@example.com" });
    expect(await verifyAdmin("user_1")).toBe(true);
  });

  it("fails when the DB flag is false even if the email is allowlisted", async () => {
    findUnique.mockResolvedValue({ isAdmin: false, email: "admin@example.com" });
    expect(await verifyAdmin("user_1")).toBe(false);
  });

  it("fails when the DB flag is true but the email is not allowlisted", async () => {
    findUnique.mockResolvedValue({ isAdmin: true, email: "revoked@example.com" });
    expect(await verifyAdmin("user_1")).toBe(false);
  });

  it("fails when the user does not exist", async () => {
    findUnique.mockResolvedValue(null);
    expect(await verifyAdmin("user_missing")).toBe(false);
  });
});
