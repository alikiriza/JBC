import { z } from "zod";
import { REQUEST_STATUSES } from "@/lib/schemas/price-request";

/**
 * The admin-side contract: pricing a request, and the two admin lists.
 *
 * Same rule as lib/schemas/price-request.ts — ONE schema, imported by both the
 * React Hook Form (via zodResolver) and the API route. The admin form cannot
 * accept something the route will reject.
 */

/**
 * The price an admin enters, in naira.
 *
 * An integer, not a decimal. Two reasons, and they agree:
 *   • master_prompt.md §FORM RULES RULE 2 — currency form state holds the raw
 *     integer and the comma-formatted string is derived for display.
 *   • JBC quotes whole-naira amounts (lib/format.ts → maximumFractionDigits: 0).
 * The database column is Decimal(12,2), so this stores as `.00`.
 *
 * The ceiling is a sanity bound, not a business rule: it stops a mistyped
 * number from writing an eleven-figure price that a real client would then be
 * shown.
 */
export const MAX_PRICE_NGN = 10_000_000;

/**
 * What an admin submits when pricing or closing a request.
 *
 * `status` is required because this form is how a request leaves Pending, and
 * making the admin state the new status explicitly keeps the transition visible
 * in one place instead of implied by which fields happen to be filled in.
 */
export const UpdatePriceRequestSchema = z
  .object({
    price: z
      .number({ error: "Enter the price in naira" })
      .int("Whole naira only")
      .positive("The price must be more than zero")
      .max(MAX_PRICE_NGN, "That price looks too high — check the number")
      // Optional in the schema's own right, because a Priced row may be re-saved
      // without changing the price. The requirement is asserted below.
      .optional(),
    adminNote: z
      .string()
      .trim()
      .max(1000, "Please keep this under 1000 characters")
      .optional(),
    contactMethod: z
      .string()
      .trim()
      // PLACEHOLDER: a WhatsApp number or phone number. project-description.md
      // → Open Items has not confirmed the format, so this is length-bounded
      // rather than pattern-matched. Tighten it once the format is settled.
      .max(200, "That is longer than a phone number or handle")
      .optional(),
    status: z.enum(REQUEST_STATUSES, {
      error: "Choose a status",
    }),
  })
  // A request cannot be marked Priced without a price — that is the one rule the
  // client would otherwise discover by seeing an empty price on their own page.
  // Stated here rather than in the form so the API enforces it too.
  .refine((value) => value.status !== "Priced" || value.price !== undefined, {
    error: "Enter a price before marking this request Priced",
    path: ["price"],
  });

export type UpdatePriceRequestInput = z.input<typeof UpdatePriceRequestSchema>;
export type UpdatePriceRequest = z.output<typeof UpdatePriceRequestSchema>;

/**
 * The admin requests queue query.
 *
 * Adds the `status` filter the client's own list deliberately cannot have
 * (lib/schemas/price-request.ts → ListPriceRequestsSchema). `.catch()` on each
 * field means a hand-typed ?status=Nonsense falls back to "all" rather than
 * throwing a 500 at the admin who typed it.
 */
export const ListAdminRequestsSchema = z.object({
  page: z.coerce.number().int().min(1).catch(1),
  limit: z.coerce.number().int().min(1).max(50).catch(10),
  search: z.string().trim().max(200).optional().catch(undefined),
  status: z
    .enum(["all", ...REQUEST_STATUSES] as [string, ...string[]])
    .optional()
    .catch("all"),
});

export type ListAdminRequests = z.output<typeof ListAdminRequestsSchema>;

/** The admin clients list query. Search covers both name and email. */
export const ListAdminClientsSchema = z.object({
  page: z.coerce.number().int().min(1).catch(1),
  limit: z.coerce.number().int().min(1).max(50).catch(20),
  search: z.string().trim().max(200).optional().catch(undefined),
});

export type ListAdminClients = z.output<typeof ListAdminClientsSchema>;

/**
 * One row in the admin requests queue.
 *
 * Carries the client's name and email alongside the request, because the admin
 * has to know who they are replying to (project-description.md → Admin page).
 * This is the ONLY place those two are joined onto a request: the client's own
 * endpoint in app/api/requests never selects them.
 *
 * `price` is a string so the JSON stays exact — the column is Decimal, which
 * Prisma returns as a string.
 */
export type AdminRequestListItem = {
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
  client: {
    id: string;
    name: string | null;
    email: string;
  };
};

/** The paginated envelope, matching PriceRequestPage in lib/schemas/price-request.ts. */
export type AdminRequestPage = {
  data: AdminRequestListItem[];
  total: number;
  page: number;
  pageSize: number;
  limit: number;
  totalPages: number;
};

/**
 * One row in the admin clients list.
 *
 * `requestCount` and `lastRequestAt` are aggregated per client in the route
 * rather than counted in the browser, so the numbers on screen are the same
 * numbers a paginated query can produce — counting them after fetching one page
 * of clients would silently under-report anyone past page one.
 */
export type AdminClientListItem = {
  id: string;
  name: string | null;
  email: string;
  createdAt: string;
  requestCount: number;
  lastRequestAt: string | null;
};

export type AdminClientPage = {
  data: AdminClientListItem[];
  total: number;
  page: number;
  pageSize: number;
  limit: number;
  totalPages: number;
};

/** Counts for the queue header. Separate from the list so it can cache on its own. */
export type AdminRequestCounts = {
  all: number;
  Pending: number;
  Priced: number;
  Closed: number;
};