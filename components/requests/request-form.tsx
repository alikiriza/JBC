"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Minus, Plus } from "lucide-react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { LoadingButton } from "@/components/loading-button";
import { SizeJarIllustration } from "@/components/illustrations";
import { toast } from "@/components/toast";
import { ApiError, api } from "@/lib/api-client";
import {
  CREAM_SIZES,
  CreatePriceRequestSchema,
  MAX_QUANTITY,
  type CreatePriceRequestInput,
} from "@/lib/schemas/price-request";

/**
 * The price request form.
 *
 * ── React Hook Form + Zod, no exceptions ──────────────────────────────────
 * The schema in lib/schemas/price-request.ts is the same one the API route
 * validates with. There is no second copy of the rules here: the form cannot
 * accept something the server will reject.
 *
 * ── The size is a picture, not a dropdown ─────────────────────────────────
 * Three sizes is well under the five-option threshold where a searchable select
 * would be required, but a dropdown would still be the wrong control. The whole
 * question is "how big", and a row of jars drawn to scale answers it without
 * being read. Each option is a real radio input under the artwork, so arrow keys
 * and screen readers work exactly as they would on any other radio group.
 *
 * ── Selected state is deliberately loud ───────────────────────────────────
 * Chosen: 2px green border, a green wash behind it, and a filled check.
 * Unchosen: 1px hairline border, no wash.
 * This deviates from the generic framework rule, which names the accent colour
 * (sunny yellow here) for selection. Yellow on white measures about 1.6:1 —
 * too weak for a boundary a client is meant to spot instantly — so the brand's
 * primary green is used instead. design-style-guide.md overrides the generic
 * design system, and yellow stays where the guide puts it: badges and the call to
 * action on dark green.
 */

const NOTE_MAX = 1000;

export function RequestForm() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const form = useForm<CreatePriceRequestInput>({
    resolver: zodResolver(CreatePriceRequestSchema),
    defaultValues: { size: undefined, quantity: 1, note: "" },
    mode: "onBlur",
  });

  const createRequest = useMutation({
    mutationFn: (values: CreatePriceRequestInput) =>
      api.post<{ id: string; createdAt: string }>("/requests", values),
    onSuccess: async () => {
      // The new row is Pending, so "my requests" has to be refetched — an
      // invalidate on the list key is cheaper and less error-prone than
      // splicing the new item into the cache by hand.
      await queryClient.invalidateQueries({ queryKey: ["requests"] });
      toast.success("Request sent", {
        description: "We will reply with your price shortly.",
      });
      router.push("/requests");
    },
    onError: (error) => {
      // Field-level messages from the API land on the right input, so the same
      // validation failure is reported in the same place whether Zod caught it
      // in the browser or the server caught it.
      if (error instanceof ApiError && error.status === 400) {
        const fields = (error.data as { fields?: Record<string, string> } | null)?.fields;
        if (fields) {
          for (const [name, message] of Object.entries(fields)) {
            form.setError(name as keyof CreatePriceRequestInput, {
              type: "server",
              message,
            });
          }
          return;
        }
      }

      toast.error("Could not send your request", {
        description:
          error instanceof Error && error.message
            ? error.message
            : "Please check your connection and try again.",
      });
    },
  });

  // useWatch rather than form.watch(): it subscribes to just these two fields
  // instead of re-rendering the whole form on every keystroke anywhere.
  const quantity = useWatch({ control: form.control, name: "quantity" }) ?? 1;
  const note = useWatch({ control: form.control, name: "note" }) ?? "";

  function bumpQuantity(by: number) {
    const next = Math.min(MAX_QUANTITY, Math.max(1, quantity + by));
    form.setValue("quantity", next, { shouldValidate: true, shouldDirty: true });
  }

  return (
    <Form {...form}>
      <form
        noValidate
        onSubmit={form.handleSubmit((values) => createRequest.mutate(values))}
        className="space-y-8"
      >
        {/* ── Size ─────────────────────────────────────────────────────── */}
        <FormField
          control={form.control}
          name="size"
          render={({ field }) => (
            <FormItem>
              <fieldset>
                <legend className="text-[16px] font-semibold text-[color:var(--color-text)]">
                  Which size do you need?
                </legend>
                <FormDescription className="mt-1 text-[15px] text-[color:var(--color-text-muted)]">
                  Sizes are shown to scale. Pick one.
                </FormDescription>

                <div className="mt-4 grid grid-cols-3 gap-3">
                  {CREAM_SIZES.map((size) => {
                    const selected = field.value === size;

                    return (
                      <label
                        key={size}
                        className={[
                          "group relative flex cursor-pointer flex-col items-center gap-2 rounded-lg border p-3 pb-4",
                          "transition-[transform,border-color,box-shadow,background-color] duration-150",
                          selected
                            ? "-translate-y-0.5 border-2 border-[color:var(--color-primary)] bg-[color:var(--color-primary)]/5 shadow-sm"
                            : "border border-[color:var(--color-border)] bg-[color:var(--color-bg)] hover:border-[color:var(--color-border-strong)] hover:shadow-sm",
                          "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[color:var(--color-secondary)]",
                        ].join(" ")}
                      >
                        {/* A real radio, visually hidden. Keeps native keyboard
                            behaviour: arrows move between options, space selects,
                            and the group is announced as a radio group. */}
                        <input
                          type="radio"
                          name={field.name}
                          value={size}
                          checked={selected}
                          onChange={() => field.onChange(size)}
                          onBlur={field.onBlur}
                          className="sr-only"
                        />

                        <SizeJarIllustration
                          size={size}
                          selected={selected}
                          className="h-auto w-full"
                        />

                        <span
                          className={[
                            "text-[15px] font-medium",
                            selected
                              ? "text-[color:var(--color-primary-dark)]"
                              : "text-[color:var(--color-text-muted)]",
                          ].join(" ")}
                        >
                          {size}
                        </span>

                        {/* The filled check. Present only when chosen, so the
                            difference is visible from across the room. */}
                        {selected ? (
                          <span
                            aria-hidden
                            className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[color:var(--color-primary)] text-white"
                          >
                            <Check className="h-3.5 w-3.5" strokeWidth={3} />
                          </span>
                        ) : null}
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              <FormMessage />
            </FormItem>
          )}
        />

        {/* ── Quantity ──────────────────────────────────────────────────── */}
        <FormField
          control={form.control}
          name="quantity"
          render={({ field: qtyField }) => (
            <FormItem>
              <FormLabel className="text-[16px] font-semibold">
                How many?
              </FormLabel>
              <FormDescription className="text-[15px] text-[color:var(--color-text-muted)]">
                Up to {MAX_QUANTITY} per request.
              </FormDescription>

              <div className="mt-3 flex items-center gap-4">
                {/* 44px minimum on both buttons — §Accessibility. Disabled at
                    the limits rather than allowing a pointless value. */}
                <button
                  type="button"
                  onClick={() => bumpQuantity(-1)}
                  disabled={quantity <= 1}
                  aria-label="One fewer jar"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-[color:var(--color-border-strong)] bg-[color:var(--color-bg)] text-[color:var(--color-text)] transition-[background-color,border-color,transform] duration-150 hover:bg-[color:var(--color-surface-tint)] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40"
                >
                  <Minus className="h-5 w-5" aria-hidden />
                </button>

                {/* A real number input rather than a read-only display, so the
                    value can be typed as well as stepped, and so assistive tech
                    announces the quantity properly. */}
                <input
                  ref={qtyField.ref}
                  name={qtyField.name}
                  onBlur={qtyField.onBlur}
                  value={qtyField.value ?? ""}
                  onChange={(e) => {
                    const next = e.target.value.replace(/[^0-9]/g, "");
                    qtyField.onChange(next === "" ? undefined : Number(next));
                  }}
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={MAX_QUANTITY}
                  aria-label="Number of jars"
                  className="h-11 w-20 rounded-md border border-[color:var(--color-border-strong)] bg-[color:var(--color-bg)] text-center text-[18px] font-semibold tabular-nums text-[color:var(--color-text)] transition-colors duration-150 focus-visible:border-[color:var(--color-secondary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-secondary)]"
                />

                <button
                  type="button"
                  onClick={() => bumpQuantity(1)}
                  disabled={quantity >= MAX_QUANTITY}
                  aria-label="One more jar"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-[color:var(--color-border-strong)] bg-[color:var(--color-bg)] text-[color:var(--color-text)] transition-[background-color,border-color,transform] duration-150 hover:bg-[color:var(--color-surface-tint)] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40"
                >
                  <Plus className="h-5 w-5" aria-hidden />
                </button>

                <span className="text-[15px] text-[color:var(--color-text-muted)]">
                  {quantity === 1 ? "jar" : "jars"}
                </span>
              </div>

              <FormMessage />
            </FormItem>
          )}
        />

        {/* ── Note ─────────────────────────────────────────────────────── */}
        <FormField
          control={form.control}
          name="note"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[16px] font-semibold">
                Anything we should know?{" "}
                <span className="font-normal text-[color:var(--color-text-muted)]">
                  (optional)
                </span>
              </FormLabel>
              <FormDescription className="text-[15px] text-[color:var(--color-text-muted)]">
                Tell us where it is and how long it has been there. It helps us
                quote the right thing.
              </FormDescription>

              <FormControl>
                <Textarea
                  {...field}
                  value={note}
                  maxLength={NOTE_MAX}
                  rows={5}
                  placeholder="For example: dry patches on both elbows, worse in the dry season."
                  className="mt-3 min-h-[140px] rounded-md border-[color:var(--color-border-strong)] bg-[color:var(--color-bg)] text-[16px] leading-relaxed focus-visible:border-[color:var(--color-secondary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-secondary)]"
                />
              </FormControl>

              <div className="flex items-baseline justify-between gap-4">
                <FormMessage />
                <span className="shrink-0 text-[14px] tabular-nums text-[color:var(--color-text-muted)]">
                  {note.length} / {NOTE_MAX}
                </span>
              </div>
            </FormItem>
          )}
        />

        {/* ── Submit ───────────────────────────────────────────────────── */}
        <div className="flex flex-col-reverse gap-3 border-t border-[color:var(--color-border)] pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[14px] leading-relaxed text-[color:var(--color-text-muted)]">
            No payment now. You will see the price on your requests page once we
            have replied.
          </p>

          <div className="flex items-center gap-3">
            <Link
              href="/requests"
              className="inline-flex min-h-[44px] items-center justify-center rounded-full px-5 text-[15px] font-medium text-[color:var(--color-text-muted)] transition-colors duration-150 hover:text-[color:var(--color-text)]"
            >
              Cancel
            </Link>

            <LoadingButton
              type="submit"
              loading={createRequest.isPending}
              loadingText="Sending…"
              className="min-h-[44px] rounded-full bg-[color:var(--color-primary)] px-6 text-[15px] font-medium text-white transition-[filter,transform] duration-150 hover:brightness-95 active:scale-[0.98]"
            >
              Send my request
            </LoadingButton>
          </div>
        </div>

        {/* Spinner lives inside the button above, so this is only here to give a
            screen reader the pending state in words as well as in a spinner. */}
        <p aria-live="polite" className="sr-only">
          {createRequest.isPending ? "Sending your request" : ""}
        </p>
      </form>
    </Form>
  );
}