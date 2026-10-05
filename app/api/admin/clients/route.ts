import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth-guard";
import { cacheKey, getCachedOrFetch, tags } from "@/lib/cache";
import {
  ListAdminClientsSchema,
  type AdminClientListItem,
  type AdminClientPage,
} from "@/lib/schemas/admin";

/**
 * The admin clients list.
 *
 * GET — every client who has signed in, with their name, Google email and
 * sign-up date, plus how many requests each has made.
 *
 * `image` (the Google profile picture URL) is deliberately not returned. Nothing
 * on this page needs an avatar, and Google's `usercontent.com` URLs are stable
 * trackers of who has looked at what — carrying them into an admin table buys
 * nothing and hands Google an audit log it did not have.
 *
 * Cached per admin, like the requests queue, and invalidated by the same write.
 */
export const dynamic = "force-dynamic";

/** Reference-ish data: client records change far less often than requests do. */
const TTL = 60;

export async function GET(req: Request) {
  const { session, error } = await requireRole("admin");
  if (error) return error;

  const { searchParams } = new URL(req.url);

  const { page, limit, search } = ListAdminClientsSchema.parse({
    page: searchParams.get("page") ?? undefined,
    limit: searchParams.get("limit") ?? undefined,
    search: searchParams.get("search") ?? undefined,
  });

  const adminId = session!.user.id;

  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const result = await getCachedOrFetch<AdminClientPage>(
    cacheKey(tags.adminClients, adminId, { page, limit, search: search ?? "" }),
    async () => {
      // One query. `include: { _count, priceRequests: { take: 1, orderBy } }`
      // gets the per-client request count and most recent request date without
      // the N+1 that a separate count per client would cause.
      const [rows, total] = await Promise.all([
        db.user.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
            _count: { select: { priceRequests: true } },
            priceRequests: {
              take: 1,
              orderBy: { createdAt: "desc" },
              select: { createdAt: true },
            },
          },
        }),
        db.user.count({ where }),
      ]);

      const data: AdminClientListItem[] = rows.map((row) => ({
        id: row.id,
        name: row.name,
        email: row.email,
        createdAt: row.createdAt.toISOString(),
        requestCount: row._count.priceRequests,
        lastRequestAt: row.priceRequests[0]?.createdAt.toISOString() ?? null,
      }));

      return {
        data,
        total,
        page,
        pageSize: limit,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    },
    TTL,
  );

  return NextResponse.json(result);
}