"use client";

import { useForm, useWatch } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CurrencyInput } from "@/components/ui/currency-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { LoadingButton } from "@/components/loading-button";
import { StatusBadge } from "@/components/requests/status-badge";
import { toast } from "@/components/toast";
import { ApiError, api } from "@/lib/api-client";
import { formatDateTime } from "@/lib/format";
import {
  UpdatePriceRequestSchema,
  type AdminRequestListItem,
  type UpdatePriceRequestInput,
} from "@/lib/schemas/admin";
import { REQUEST_STATUSES } from "@/lib/schemas/price-request";

/**
 * The pricing panel: what an admin fills in to reply to one client.
 *
 * ── The one rule this screen exists to enforce ─────────────────────────────
 * A price is private. It is written here, on a row only admins can reach, and
 * the only route that reads it back returns it solely to the client who owns the
 * row. Nothing on the public site links to this.
 *
 * ── React Hook Form + Zod, same schema as the route ────────────────────────
 * `UpdatePriceRequestSchema` is imported from lib/schemas/admin.ts, which is
 * the very schema app/api/admin/requests/[id]/route.ts validates with. The
 * form's "Enter a price before marking this Priced" rule and the API's are the
 * same rule, so the two can never disagree about what is acceptable.
 *
 * ── The sheet, not a page ──────────────────────────────────────────────────
 * Pricing is a short, interruptible task done in the middle of working through a
 * queue. Navigating to a form per request would lose the queue's place and its
 * filters, and force the admin back through both every time. The sheet keeps the
 * list mounted underneath.
 *
 * ── Why the form is a separate component with a `key` ──────────────────────
 * Each request needs its own blank-or-prefilled form. Remounting on
 * `key={request.id}` gives every request a fresh form built from its own
 * `defaultValues`, which means no effect, no reset() call, and no stale price
 * from whichever request was open before.
 */

const NOTE_MAX = 1000;

export function PriceRequestSheet({
  request,
  open,
  onOpenChange,
}: {
  /** The row being priced. Null while the sheet is closed. */
  request: AdminRequestListItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!request) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full gap-0 overflow-y-auto sm:max-w-lg">
        <SheetHeader className="border-b border-[color:var(--color-border)] p-5">
          <SheetTitle className="text-[20px] font-semibold text-[color:var(--color-primary-dark)]">
            Reply to {request.client.name || request.client.email}
          </SheetTitle>
          <SheetDescription className="text-[15px] text-[color:var(--color-text-muted)]">
            {request.quantity} × {request.size} · asked {formatDateTime(request.createdAt)}
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-6 p-5">
          <RequestSummary request={request} />

          <PriceRequestForm
            key={request.id}
            request={request}
            onDone={() => onOpenChange(false)}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}

/** What the client asked for — read-only context above the form. */
function RequestSummary({ request }: { request: AdminRequestListItem }) {
  return (
    <section className="rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface-tint)] p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-[14px] font-semibold uppercase tracking-wide text-[color:var(--color-text-muted)]">
          Their request
        </h3>
        <StatusBadge status={request.status} />
      </div>

      <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-[15px]">
        <dt className="text-[color:var(--color-text-muted)]">Email</dt>
        <dd className="break-all font-medium text-[color:var(--color-text)]">
          {request.client.email}
        </dd>

        <dt className="text-[color:var(--color-text-muted)]">Quantity</dt>
        <dd className="font-medium tabular-nums text-[color:var(--color-text)]">
          {request.quantity} × {request.size}
        </dd>
      </dl>

      {/* The client's own words about their skin. Rendered as text, never as
          markup, and `whitespace-pre-wrap` so the multi-line notes the seed data
          includes survive. */}
      <div className="mt-3 border-t border-[color:var(--color-border)] pt-3">
        <h4 className="text-[14px] font-semibold uppercase tracking-wide text-[color:var(--color-text-muted)]">
          Note
        </h4>
        <p className="mt-1.5 whitespace-pre-wrap text-[15px] leading-relaxed text-[color:var(--color-text)]">
          {request.note || "No note left."}
        </p>
      </div>
    </section>
  );
}

/**
 * The editable half.
 *
 * Remounted per request by the `key` above, so `defaultValues` below are read
 * exactly once per request and always describe the right row.
 */
function PriceRequestForm({
  request,
  onDone,
}: {
  request: AdminRequestListItem;
  onDone: () => void;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const form = useForm<UpdatePriceRequestInput>({
    resolver: zodResolver(UpdatePriceRequestSchema),
    defaultValues: {
      price: request.price === null ? undefined : Number(request.price),
      adminNote: request.adminNote ?? "",
      contactMethod: request.contactMethod ?? "",
      // Opening the sheet on a Pending row means "price it", so Priced is the
      // sensible starting status. On an already-priced row, start where it
      // already is — this is an edit, not a fresh quote.
      status:
        request.status === "Pending"
          ? "Priced"
          : (request.status as UpdatePriceRequestInput["status"]),
    },
    mode: "onBlur",
  });

  // useWatch rather than form.watch(): it subscribes to this one field instead
  // of re-rendering the whole sheet on every keystroke anywhere in the form.
  const status = useWatch({ control: form.control, name: "status" });

  const save = useMutation({
    mutationFn: (values: UpdatePriceRequestInput) =>
      api.patch<{ id: string; status: string }>(`/admin/requests/${request.id}`, values),
    onSuccess: async () => {
      // Two lists are stale after a write: the admin queue behind this sheet,
      // and this client's own cached "my requests" if they are signed in
      // elsewhere. The server has already flushed both cache tags.
      await queryClient.invalidateQueries({ queryKey: ["admin-requests"] });
      await queryClient.invalidateQueries({ queryKey: ["requests"] });

      onDone();
      toast.success("Saved", {
        description: "The client will see this on their requests page.",
      });

      // This admin's own access may have just been revoked by an ADMIN_EMAILS
      // change, in which case the layout guard will bounce them. Re-rendering
      // makes that happen now rather than on their next click.
      router.refresh();
    },
    onError: (error) => {
      // Field-level messages land on the right input, so a rule caught by the
      // server is reported in the same place as one caught by Zod in the browser.
      if (error instanceof ApiError && error.status === 400) {
        const fields = (error.data as { fields?: Record<string, string> } | null)?.fields;
        if (fields) {
          for (const [name, message] of Object.entries(fields)) {
            form.setError(name as keyof UpdatePriceRequestInput, {
              type: "server",
              message,
            });
          }
          return;
        }
      }

      toast.error("Could not save", {
        description:
          error instanceof Error && error.message
            ? error.message
            : "Please check your connection and try again.",
      });
    },
  });

  return (
    <Form {...form}>
      <form
        noValidate
        onSubmit={form.handleSubmit((values) => save.mutate(values))}
        className="flex flex-col gap-6"
      >
        {/* ── Price ────────────────────────────────────────────────────── */}
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[16px] font-semibold">
                Price for this request
              </FormLabel>
              <FormDescription className="text-[15px] text-[color:var(--color-text-muted)]">
                The total for all {request.quantity}{" "}
                {request.quantity === 1 ? "jar" : "jars"}, in naira. Shown to
                this client only.
              </FormDescription>

              <FormControl>
                <CurrencyInput
                  wrapperClassName="mt-2"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        {/* ── Reply note ────────────────────────────────────────────────── */}
        <FormField
          control={form.control}
          name="adminNote"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[16px] font-semibold">
                Note to the client{" "}
                <span className="font-normal text-[color:var(--color-text-muted)]">
                  (optional)
                </span>
              </FormLabel>
              <FormDescription className="text-[15px] text-[color:var(--color-text-muted)]">
                Appears under the price. Keep payment and delivery detail here —
                JBC takes no payment in the app.
              </FormDescription>

              <FormControl>
                <Textarea
                  {...field}
                  value={field.value ?? ""}
                  maxLength={NOTE_MAX}
                  rows={3}
                  placeholder="For example: confirmed in stock, pay on delivery."
                  className="mt-2 rounded-md border-[color:var(--color-border-strong)] bg-[color:var(--color-bg)] text-[16px] leading-relaxed focus-visible:border-[color:var(--color-secondary)]"
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        {/* ── Contact ───────────────────────────────────────────────────── */}
        <FormField
          control={form.control}
          name="contactMethod"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[16px] font-semibold">
                How to reach them{" "}
                <span className="font-normal text-[color:var(--color-text-muted)]">
                  (optional)
                </span>
              </FormLabel>
              <FormDescription className="text-[15px] text-[color:var(--color-text-muted)]">
                WhatsApp number or phone. Shown to this client once priced.
              </FormDescription>

              <FormControl>
                <Input
                  {...field}
                  value={field.value ?? ""}
                  autoComplete="off"
                  placeholder="+234 800 000 0000"
                  className="mt-2 h-11 rounded-md border-[color:var(--color-border-strong)] bg-[color:var(--color-bg)] text-[16px] focus-visible:border-[color:var(--color-secondary)]"
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        {/* ── Status ────────────────────────────────────────────────────── */}
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[16px] font-semibold">Status</FormLabel>
              <FormDescription className="text-[15px] text-[color:var(--color-text-muted)]">
                Priced means the client can see the price. Closed means the order
                is done.
              </FormDescription>

              {/* Three fixed options — well under the five-option threshold
                  where a searchable select becomes required. */}
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="mt-2 h-11 w-full rounded-md border-[color:var(--color-border-strong)] bg-[color:var(--color-bg)] text-[16px]">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {REQUEST_STATUSES.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <FormMessage />
            </FormItem>
          )}
        />

        {/* Actions live in the sheet's footer but stay inside the <form>, so
            Enter submits from any field. */}
        <SheetFooter className="m-0 flex-row items-center justify-end gap-3 border-t border-[color:var(--color-border)] p-5">
          <button
            type="button"
            onClick={onDone}
            className="inline-flex min-h-[44px] items-center rounded-md px-4 text-[15px] font-medium text-[color:var(--color-text-muted)] transition-colors duration-150 hover:text-[color:var(--color-text)]"
          >
            Cancel
          </button>

          <LoadingButton
            type="submit"
            loading={save.isPending}
            loadingText="Saving…"
            className="min-h-[44px] rounded-md bg-[color:var(--color-primary)] px-5 text-[15px] font-medium text-white transition-[filter,transform] duration-150 hover:brightness-95 active:scale-[0.98]"
          >
            Save and mark {status === "Closed" ? "closed" : "priced"}
          </LoadingButton>
        </SheetFooter>

        {/* The spinner is inside the button; this gives the pending state in
            words as well. */}
        <p aria-live="polite" className="sr-only">
          {save.isPending ? "Saving" : ""}
        </p>
      </form>
    </Form>
  );
}