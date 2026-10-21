import { afterEach, describe, expect, it, vi } from "vitest";
import { withApiErrors } from "@/lib/api-error";
import { logger } from "@/lib/logger";

afterEach(() => {
  vi.restoreAllMocks();
  delete process.env.LOG_LEVEL;
});

describe("logger.error", () => {
  it("unwraps an Error instance into flat fields", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    logger.error("boom", { error: new Error("db down"), route: "/api/x" });
    const line = spy.mock.calls[0]?.[0] as string;
    expect(line).toContain("boom");
    expect(line).toContain("db down");
    expect(line).toContain("/api/x");
  });

  it("respects LOG_LEVEL filtering", () => {
    process.env.LOG_LEVEL = "error";
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    logger.warn("quiet");
    logger.error("loud");
    expect(warnSpy).not.toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalledTimes(1);
  });
});

describe("withApiErrors", () => {
  it("passes responses through untouched", async () => {
    const handler = withApiErrors("GET /api/x", async () => Response.json({ ok: true }));
    const res = await handler();
    expect(res.status).toBe(200);
  });

  it("converts a throw into a logged generic 500", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const handler = withApiErrors("GET /api/x", async () => {
      throw new Error("secret db detail");
    });
    const res = await handler();
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe("Something went wrong. Please try again.");
    // The raw detail goes to the log, never to the client.
    expect(JSON.stringify(body)).not.toContain("secret db detail");
    expect(spy).toHaveBeenCalled();
  });
});
