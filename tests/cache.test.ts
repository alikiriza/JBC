import { describe, expect, it, vi } from "vitest";
import { cacheKey, getCachedOrFetch, invalidateTag } from "@/lib/cache";

describe("cacheKey", () => {
  it("builds a scoped key without parts", () => {
    expect(cacheKey("requests", "user_1")).toBe("tag:requests:user_1");
  });

  it("appends parts in order", () => {
    expect(cacheKey("admin-requests", "all", { page: 2, status: "Pending" })).toBe(
      "tag:admin-requests:all:page:2:status:Pending",
    );
  });
});

// Without UPSTASH_REDIS_URL/TOKEN the modules construct no Redis client, so
// these tests pin the documented fail-open contract.
describe("without Redis configured", () => {
  it("getCachedOrFetch always runs the fetcher", async () => {
    const fetcher = vi.fn().mockResolvedValue("data");
    await expect(getCachedOrFetch("tag:requests:user_1", fetcher)).resolves.toBe("data");
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("getCachedOrFetch propagates fetcher errors", async () => {
    const fetcher = vi.fn().mockRejectedValue(new Error("db down"));
    await expect(getCachedOrFetch("tag:requests:user_1", fetcher)).rejects.toThrow("db down");
  });

  it("invalidateTag is a silent no-op", async () => {
    await expect(invalidateTag("requests", "user_1")).resolves.toBeUndefined();
  });
});
