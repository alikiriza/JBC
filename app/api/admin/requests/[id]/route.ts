import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth-guard";
import { invalidateTag, tags } from "@/lib/cache";
import { UpdatePriceRequestSchema } from "@/lib/schemas/admin";

/**
 * Price one request, or move it to another status.
 *
 * PATCH /api/admin/requests/[id]
 *
 * This is the write that makes Phase 4 work: an admin enters a price and a reply
 * note, and the client sees it on "my requests".
 *
 * ── Why the body cannot widen its own authority ────────────────────────────
 * `id` comes from the URL and is looked up as a plain findUnique — there is no
 * `where` clause an admin can influence, because the only field they choose is
 * which row to write, and every row in this table is theirs to write.
 * `clientId` is never accepted from the body at all. Neither is the user's id:
 * nothing here reads it, so there is no code path that lets one admin write to
 * another admin's work.
 *
 * The fields Zod strips are the reason that matters. Even a hand-crafted body
 * with `clientId` or `isAdmin` in it cannot do anything: the schema declares
 * exactly five keys and `Object.keys` below is driven by that schema, not by the
 * incoming JSON.
 */

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
  const { error } = await requireRole("admin");
  if (error) return error;

  const { id } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = UpdatePriceRequestSchema.safeParse(body);

  if (!parsed.success) {
    // Field-level messages, so the pricing form can show each one against the
    // input it belongs to.
    return NextResponse.json(
      { error: "Please check the form", fields: flatten(parsed.error) },
      { status: 400 },
    );
  }

  const { price, adminNote, contactMethod, status } = parsed.data;

  const existing = await db.priceRequest.findUnique({
    where: { id },
    select: { id: true, status: true, price: true },
  });

  if (!existing) {
    return NextResponse.json({ error: "Request not found" }, { status: 404 });
  }

  // `pricedAt` records when the price was set, and only that. Re-saving a priced
  // row without changing the price must not move the date, or "priced since"
  // starts lying after the first correction.
  const isBeingPricedNow = status === "Priced" && existing.price === null;

  const updated = await db.priceRequest.update({
    where: { id },
    data: {
      status,
      ...(price !== undefined ? { price } : {}),
      // An empty note means "clear it", which is different from "leave it", so
      // these two are always written rather than conditionally omitted.
      ...(adminNote !== undefined ? { adminNote: adminNote || null } : {}),
      ...(contactMethod !== undefined ? { contactMethod: contactMethod || null } : {}),
      ...(isBeingPricedNow ? { pricedAt: new Date() } : {}),
      ...(status === "Pending" ? { pricedAt: null } : {}),
    },
    select: {
      id: true,
      status: true,
      price: true,
      adminNote: true,
      contactMethod: true,
      pricedAt: true,
    },
  });

  // Two tags, because two different screens are now stale: the admin queue and
  // counts, and the client's own cached list of their requests. Missing the
  // second is the bug where an admin prices a request and the client keeps
  // seeing "Pending" until the cache expires.
  await invalidateTag(tags.adminRequests);
  await invalidateTag(tags.requests);

  return NextResponse.json({
    id: updated.id,
    status: updated.status,
    price: updated.price === null ? null : updated.price.toString(),
    adminNote: updated.adminNote,
    contactMethod: updated.contactMethod,
    pricedAt: updated.pricedAt ? updated.pricedAt.toISOString() : null,
  });
}

/**
 * Zod v4 dropped `.flatten()`. Every issue keyed by its field path, message as
 * the string — the same shape app/api/requests returns, so the form's error
 * handling works identically on both sides of the app.
 */
function flatten(error: { issues: { path: PropertyKey[]; message: string }[] }) {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.map(String).join(".") || "form";
    if (!fields[key]) fields[key] = issue.message;
  }
  return fields;
}