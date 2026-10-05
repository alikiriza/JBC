import {
  formatCurrency as formatCurrencyRaw,
  formatDate as formatDateRaw,
  formatDateTime as formatDateTimeRaw,
  formatNumber as formatNumberRaw,
} from "@/lib/formatters";

/**
 * JBC's formatting defaults.
 *
 * The registry's lib/formatters.ts defaults to en-US, which is wrong for this
 * app — JBC's prices are in naira. Rather than repeating "en-NG" and "NGN" at
 * every call site (and getting one of them wrong), the locale and currency are
 * fixed here once and every screen imports from this file.
 *
 * PLACEHOLDER — if JBC prices in a different currency, `CURRENCY` is the only
 * line to change.
 */

const LOCALE = "en-NG";

/** PLACEHOLDER: JBC has not confirmed the currency. Naira assumed. */
const CURRENCY = "NGN";

/**
 * A price, in naira, with no decimals.
 *
 * JBC has no payment flow, so there is nothing to show kobo for and
 * `maximumFractionDigits: 0` keeps the number the shape an amount is expected
 * to have. Stored as Decimal(12,2), so it arrives as a string — hence the
 * parse. Callers pass `null` when no price has been set yet.
 */
export function formatPrice(amount: string | number | null | undefined): string {
  if (amount === null || amount === undefined || amount === "") return "";

  const value = typeof amount === "number" ? amount : Number(amount);
  if (!Number.isFinite(value)) return "";

  return formatCurrencyRaw(value, CURRENCY, {
    locale: LOCALE,
    maximumFractionDigits: 0,
  });
}

/** A plain number with thousands separators. Used for quantities and counts. */
export function formatCount(value: number): string {
  return formatNumberRaw(value, { locale: LOCALE });
}

/** "3 Oct 2026" — no time, because nobody checking a price needs the time. */
export function formatDate(
  date: Date | string | number,
  style: "short" | "medium" | "long" | "full" = "medium",
): string {
  return formatDateRaw(date, style, LOCALE);
}

/** Date plus time, for the admin page where the exact moment a price was set matters. */
export function formatDateTime(date: Date | string | number): string {
  return formatDateTimeRaw(date, { locale: LOCALE });
}