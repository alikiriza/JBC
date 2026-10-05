import { z } from "zod";

/**
 * The price request contract.
 *
 * ONE schema, imported by both the form (client-side validation, via zodResolver)
 * and the API route (server-side validation before anything touches the
 * database). master_prompt.md §FORM RULES RULE 1: never duplicate validation.
 * If the two ever disagree, a request that the form accepted would be rejected
 * by the API for no visible reason.
 */

/**
 * The cream sizes a client can ask about.
 *
 * PLACEHOLDER — these three sizes are not confirmed by JBC yet
 * (project-description.md → Open Items). They are collected here and nowhere
 * else, so when the real sizes arrive this is the only line that changes: the
 * form, the API and the database column all read from this array.
 *
 * `CREAM_SIZES` is also what makes the API safe. The route checks the incoming
 * size against this list instead of trusting whatever the browser sent, so a
 * hand-crafted request cannot write an arbitrary string into the database.
 */
export const CREAM_SIZES = ["30ml", "50ml", "100ml"] as const;

export type CreamSize = (typeof CREAM_SIZES)[number];

/**
 * How many jars a client may ask about in one request.
 *
 * PLACEHOLDER — the real limit is not confirmed yet. A generous cap is still
 * better than none: without one, a client could ask for 100000 jars and no admin
 * would ever be able to reply sensibly.
 */
export const MAX_QUANTITY = 24;

/**
 * What a client submits.
 *
 * Deliberately NO `.coerce()` and NO `.transform()` here. Both would split the
 * schema's input and output types, and the form uses `z.input<>` for its React
 * Hook Form state while the resolver hands back `z.output<>`. Keeping them
 * identical is what stops the form's types from drifting from what the API
 * accepts. Normalising an empty note to null happens in the route instead.
 */
export const CreatePriceRequestSchema = z.object({
  size: z.enum(CREAM_SIZES, {
    error: "Choose one of the available sizes",
  }),
  quantity: z
    .number({ error: "Enter how many you need" })
    .int("Whole numbers only")
    .min(1, "At least 1")
    .max(MAX_QUANTITY, `At most ${MAX_QUANTITY} per request`),
  note: z
    .string()
    .trim()
    // Optional. `.max()` not `.min()` — there is no such thing as too short a note.
    .max(1000, "Please keep this under 1000 characters")
    .optional(),
});

export type CreatePriceRequestInput = z.input<typeof CreatePriceRequestSchema>;
export type CreatePriceRequest = z.output<typeof CreatePriceRequestSchema>;

/**
 * The list query, so a hand-typed URL cannot ask for page -3 or limit 999999.
 *
 * `search` matches the client's own note text. It is deliberately NOT able to
 * filter by status: a client sees all of their own requests regardless, and the
 * status filter is an admin-side concern.
 */
export const ListPriceRequestsSchema = z.object({
  page: z.coerce.number().int().min(1).catch(1),
  limit: z.coerce.number().int().min(1).max(50).catch(10),
  search: z.string().trim().max(200).optional().catch(undefined),
});

export type ListPriceRequests = z.output<typeof ListPriceRequestsSchema>;

/**
 * The shape the "my requests" list renders from.
 *
 * Declared as its own type rather than inferred from the Prisma row because the
 * client must never receive more than this. `price` is deliberately included —
 * a client is allowed to see the price on their OWN request once an admin has
 * set it (project-description.md → Rules) — but the API route only ever returns
 * rows already filtered to session.user.id, so nothing leaks sideways.
 */
export type PriceRequestListItem = {
  id: string;
  size: string;
  quantity: number;
  note: string | null;
  status: string;
  price: string | null;
  adminNote: string | null;
  contactMethod: string | null;
  createdAt: string;
  pricedAt: string | null;
};

/** The paginated envelope both the API route and use-paginated-query agree on. */
export type PriceRequestPage = {
  data: PriceRequestListItem[];
  total: number;
  page: number;
  /** Present so use-paginated-query's Page<T> type is satisfied. */
  pageSize: number;
  /** Alias of pageSize, matching the master_prompt API contract. */
  limit: number;
  totalPages: number;
};

/** The three states a request moves through. Mirrors the database default. */
export const REQUEST_STATUSES = ["Pending", "Priced", "Closed"] as const;
export type RequestStatus = (typeof REQUEST_STATUSES)[number];