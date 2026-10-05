import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth-guard";
import { cacheKey, getCachedOrFetch, invalidateTag, tags } from "@/lib/cache";
import {
  CreatePriceRequestSchema,
  ListPriceRequestsSchema,
  type PriceRequestListItem,
  type PriceRequestPage,
} from "@/lib/schemas/price-request";

/**
 * A client's own price requests.
 *
 * GET  — their requests, newest first, paginated and searchable.
 * POST — create one.
 *
 * ── Privacy, the whole point of this route ──────────────────────────────────
 * Every query is scoped with `clientId: session.user.id`. `session.user.id` comes
 * from the signed cookie, never from the request body, so there is no code path
 * where one client can read or write another client's rows. The database id in
 * the URL is not even accepted as an input.
 *
 * A price is only ever returned to the client who owns the row, and only because
 * the admin who owns pricing wrote it there. There is no public route that reads
 * a price — see project-description.md → Rules.
 */

// Only ever cache a signed-in client's own list, keyed by their user id.
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { session, error } = await requireSession();
  if (error) return error;

  const { searchParams } = new URL(req.url);

  // Parse the query with Zod and fall back to page 1 / 10 rows on anything
  // nonsensical. A hand-typed ?page=-4 should not become a 500.
  const { page, limit, search } = ListPriceRequestsSchema.parse({
    page: searchParams.get("page") ?? undefined,
    limit: searchParams.get("limit") ?? undefined,
    search: searchParams.get("search") ?? undefined,
  });

  const userId = session.user.id;

  const result = await getCachedOrFetch<PriceRequestPage>(
    cacheKey(tags.requests, userId, { page, limit, search: search ?? "" }),
    async () => {
      const where = {
        clientId: userId,
        ...(search
          ? { note: { contains: search, mode: "insensitive" as const } }
          : {}),
      };

      const [rows, total] = await Promise.all([
        db.priceRequest.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: "desc" },
        }),
        db.priceRequest.count({ where }),
      ]);

      // Map to the narrow list type instead of leaking raw Prisma rows (which
      // carry clientId) to the browser. Decimal → string so JSON stays exact.
      const data: PriceRequestListItem[] = rows.map((row) => ({
        id: row.id,
        size: row.size,
        quantity: row.quantity,
        note: row.note,
        status: row.status,
        price: row.price === null ? null : row.price.toString(),
        adminNote: row.adminNote,
        contactMethod: row.contactMethod,
        createdAt: row.createdAt.toISOString(),
        pricedAt: row.pricedAt ? row.pricedAt.toISOString() : null,
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
    // 60s. A client's own list changes only when they submit, and the POST
    // below invalidates the tag immediately — the TTL is just a safety net.
    60,
  );

  return NextResponse.json(result);
}

export async function POST(req: Request) {
  const { session, error } = await requireSession();
  if (error) return error;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = CreatePriceRequestSchema.safeParse(body);

  if (!parsed.success) {
    // Field-level messages, so the form can show them against the right input.
    return NextResponse.json(
      {
        error: "Please check the form",
        fields: z_flatten(parsed.error),
      },
      { status: 400 },
    );
  }

  const created = await db.priceRequest.create({
    data: {
      clientId: session.user.id,
      size: parsed.data.size,
      quantity: parsed.data.quantity,
      note: parsed.data.note || null,
      // Status, price, adminNote and contactMethod are all left at their
      // defaults. A client cannot set a price on their own request, not even by
      // sending extra fields — Zod strips anything the schema does not declare.
      status: "Pending",
    },
    select: { id: true, createdAt: true },
  });

  // Bust the cache so "my requests" shows the new row immediately.
  await invalidateTag(tags.requests);

  return NextResponse.json(
    {
      id: created.id,
      createdAt: created.createdAt.toISOString(),
    },
    { status: 201 },
  );
}

/**
 * Zod v4 dropped `.flatten()`. This is the equivalent: every issue keyed by its
 * field path, message as the string. The form looks messages up by field name.
 */
function z_flatten(error: { issues: { path: PropertyKey[]; message: string }[] }) {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.map(String).join(".") || "form";
    if (!fields[key]) fields[key] = issue.message;
  }
  return fields;
}