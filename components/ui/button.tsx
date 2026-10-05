import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { Slot } from "radix-ui"

/**
 * Button.
 *
 * The shadcn base variants are kept because other JB components may rely on
 * them. JBC's own variants (primary, cta) sit alongside, following
 * design-style-guide.md §Components:
 *   "Buttons: pill-shaped; primary is green with white text, call to action is
 *    yellow with charcoal text."
 *
 * The base radius is `rounded-full` (pill) because every JBC button is a pill.
 * Tailwind-Merge in `cn` resolves the shadcn sizes that also set a radius.
 *
 * The transition names every property it actually animates — colour, background,
 * border, the focus ring's box-shadow, disabled opacity, and the press scale.
 * It was `transition-all`, which subscribes the button to every animatable
 * property on the page: a font swap, a sibling reflow or a late-loading icon
 * would all get animated along with the hover. On the element users hover most,
 * that is exactly where jank shows up.
 */
const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-full text-sm font-medium whitespace-nowrap transition-[color,background-color,border-color,box-shadow,opacity,transform] duration-150 outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        // shadcn defaults, kept for installed JB components.
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20",
        outline:
          "border border-border-strong bg-background hover:bg-primary-tint hover:border-primary",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        // JBC's own.
        primary:
          "bg-primary text-primary-foreground hover:bg-primary-dark",
        cta: "bg-accent text-accent-foreground hover:brightness-[0.97] active:scale-[0.98]",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        xs: "h-6 gap-1 rounded-md px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 px-3 has-[>svg]:px-2.5",
        // JBC §Accessibility: tap targets at least 44px.
        md: "min-h-[44px] px-5 text-[15px] has-[>svg]:px-5",
        lg: "min-h-[52px] px-7 text-[16px] has-[>svg]:px-6",
        icon: "size-9",
        "icon-xs": "size-6 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

/**
 * The button's props, named.
 *
 * Exported because the registry's LoadingButton (components/loading-button.tsx)
 * extends it. Upstream shadcn inlines this type; exporting it is additive and
 * changes nothing for existing callers.
 */
type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants, type ButtonProps }