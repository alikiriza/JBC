import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth-guard";
import { cacheKey, getCachedOrFetch, tags } from "@/lib/cache";
import {
  ListAdminRequestsSchema,
  type AdminRequestCounts,
  type AdminRequestListItem,
  type AdminRequestPage,
} from "@/lib/schemas/admin";
import { REQUEST_STATUSES } from "@/lib/schemas/price-request";

/**
 * The admin requests queue — every client's requests, with who they are from.
 *
 * GET — the queue. Paginated, searchable, filterable by status.
 *
 * ── Two gates, both required ───────────────────────────────────────────────
 * `requireRole("admin")` reads `user.isAdmin` from the database row, and
 * lib/admin.ts re-checks the ADMIN_EMAILS allowlist behind it (verifyAdmin).
 * The second gate is the one that matters for revocation: remove an address from
 * ADMIN_EMAILS and they are refused on their very next request, without a
 * migration and without touching their row.
 *
 * This is the ONLY route that returns another person's request together with
 * their name and email. The client's own endpoint in app/api/requests is scoped
 * to `clientId: session.user.id` and never selects those columns.
 *
 * Only ever cache an admin list, scoped by the admin's user id so two admins
 * never share a cache entry that one of them can change.
 */
export const dynamic = "force-dynamic";

/** Cache lifetime. Short: this is a work queue, and 30s is invisible to the
 *  person using it while the invalidateTag below makes writes instant anyway. */
const TTL = 30;

export async function GET(req: Request) {
  const { session, error } = await requireRole("admin");
  if (error) return error;

  const { searchParams } = new URL(req.url);

  const { page, limit, search, status } = ListAdminRequestsSchema.parse({
    page: searchParams.get("page") ?? undefined,
    limit: searchParams.get("limit") ?? undefined,
    search: searchParams.get("search") ?? undefined,
    status: searchParams.get("status") ?? undefined,
  });

  // The admin's own id is the cache scope. Taken from the session, never from
  // the query string.
  const adminId = session!.user.id;

  const where = {
    ...(status && status !== "all" ? { status } : {}),
    ...(search
      ? {
          OR: [
            { note: { contains: search, mode: "insensitive" as const } },
            { size: { contains: search, mode: "insensitive" as const } },
            { client: { name: { contains: search, mode: "insensitive" as const } } },
            { client: { email: { contains: search, mode: "insensitive" as const } } },
          ],
        }
      : {}),
  };

  const result = await getCachedOrFetch<AdminRequestPage & { counts: AdminRequestCounts }>(
    cacheKey(tags.adminRequests, adminId, {
      page,
      limit,
      search: search ?? "",
      status: status ?? "all",
    }),
    async () => {
      const [rows, total, grouped] = await Promise.all([
        db.priceRequest.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            size: true,
            quantity: true,
            note: true,
            status: true,
            price: true,
            adminNote: true,
            contactMethod: true,
            createdAt: true,
            pricedAt: true,
            client: { select: { id: true, name: true, email: true } },
          },
        }),
        db.priceRequest.count({ where }),
        // groupBy gives the header counts for all four tabs in one query, and —
        // unlike counting the rows on screen — it counts the whole table, not
        // just the page being looked at.
        db.priceRequest.groupBy({
          by: ["status"],
          _count: { _all: true },
        }),
      ]);

      const data: AdminRequestListItem[] = rows.map((row) => ({
        id: row.id,
        size: row.size,
        quantity: row.quantity,
        note: row.note,
        status: row.status,
        // Decimal → string so the JSON stays exact.
        price: row.price === null ? null : row.price.toString(),
        adminNote: row.adminNote,
        contactMethod: row.contactMethod,
        createdAt: row.createdAt.toISOString(),
        pricedAt: row.pricedAt ? row.pricedAt.toISOString() : null,
        client: row.client,
      }));

      const counts: AdminRequestCounts = { all: 0, Pending: 0, Priced: 0, Closed: 0 };
      for (const group of grouped) {
        // An unexpected status is counted under `all` rather than dropped, so the
        // tabs can never silently disagree with each other.
        if (REQUEST_STATUSES.includes(group.status as never)) {
          counts[group.status as keyof Omit<AdminRequestCounts, "all">] = group._count._all;
          counts.all += group._count._all;
        } else {
          counts.all += group._count._all;
        }
      }

      return {
        data,
        total,
        page,
        pageSize: limit,
        limit,
        totalPages: Math.ceil(total / limit),
        counts,
      };
    },
    TTL,
  );

  return NextResponse.json(result);
}