"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * Currency input — the canonical component from master_prompt.md §FORM RULES
 * RULE 2, built once and reused.
 *
 * Type `3000`, it displays `3,000`. Form state holds the raw integer and the
 * formatted string is derived on every render, which is the whole point:
 * storing the formatted string would make the state `typeof string` and force
 * every consumer to strip commas back out before doing arithmetic.
 *
 * Not `<Input type="number" />`, for the three reasons the master_prompt lists:
 * no comma formatting, the scroll-wheel-changes-the-value bug, and decimal
 * precision pain.
 */
type CurrencyInputProps = {
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  /** Rendered as a fixed prefix inside the field. Defaults to naira. */
  prefix?: string;
  placeholder?: string;
  className?: string;
  /** Applied to the wrapper, so callers can size the field. */
  wrapperClassName?: string;
  disabled?: boolean;
  id?: string;
  /** Passed through so React Hook Form's field object can be spread in. */
  name?: string;
  onBlur?: () => void;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
};

export const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  function CurrencyInput(
    {
      value,
      onChange,
      prefix = "₦",
      placeholder,
      className,
      wrapperClassName,
      disabled,
      id,
      name,
      onBlur,
      ...aria
    },
    ref,
  ) {
    const display =
      typeof value === "number" && !Number.isNaN(value)
        ? value.toLocaleString("en-US")
        : "";

    return (
      <div className={cn("relative flex items-center", wrapperClassName)}>
        <span
          aria-hidden
          className="pointer-events-none absolute left-3.5 text-[15px] font-medium text-[color:var(--color-text-muted)]"
        >
          {prefix}
        </span>

        <Input
          ref={ref}
          id={id}
          name={name}
          onBlur={onBlur}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          value={display}
          placeholder={placeholder ?? "0"}
          disabled={disabled}
          onChange={(e) => {
            // Strip anything that is not a digit, so the field can never hold a
            // value the schema would reject. Commas and spaces the user pasted
            // in are removed rather than fought with.
            const raw = e.target.value.replace(/[^0-9]/g, "");

            if (raw === "") {
              onChange(undefined);
              return;
            }

            const n = parseInt(raw, 10);
            onChange(Number.isFinite(n) ? n : undefined);
          }}
          className={cn(
            "pl-9 text-right font-semibold tabular-nums",
            className,
          )}
          {...aria}
        />
      </div>
    );
  },
);