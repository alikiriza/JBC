# JBC Skin Cream App — Pre-Design Review Report

**Date:** Phase 1, immediately after the landing page was built
**Reviewed against:** `design-style-guide.md` (source of truth) + the universal
checklist in `pre-design-review.md`
**Method:** rendered page measured in Chromium at 375px and 1280px. Token
values, contrast ratios, radii, tap targets and states were read from the live
DOM, not judged from source. Playwright screenshots were captured but could not
be viewed (the reviewing model has no image input), so all findings below rest on
**measured** values. Visual judgements a screenshot would inform (photographic
quality, illustration charm) are flagged as unverified rather than guessed.

---

## 1. Executive Summary

| Severity | Found | Fixed in this pass | Outstanding |
|---|---|---|---|
| Critical | 1 | 1 | 0 |
| High | 2 | 2 | 0 |
| Medium | 3 | 1 | 2 (Phase 5) |

**Verdict.** The page follows `design-style-guide.md` closely. All ten palette
tokens in the built CSS match the guide's hex values exactly, every one of 23
unique text colour/size combinations meets WCAG AA, and no colour appears in the
rendered UI that is not a guide token. The page does not read as template
output: the four benefit cells are deliberately unequal rather than a row of
identical tiles, the six sections use six different layout families, and the
copy carries no em-dashes, no eyebrow labels, no invented statistics and no
testimonials.

One Critical issue was found and fixed: white 13px text on a translucent white
badge over the blue band measured **1.05:1**, which is invisible to a human but
*looked* compliant in code. It is now blue-on-white at **5.2:1**.

The one remaining caveat is that this review is measurement-only. A senior
designer's eye on the rendered pixels may still find composition issues that no
number reveals. Treat the two outstanding Medium items as that gap.

---

## 2. Per-screen findings

### Landing page (`/`) — the only screen in Phase 1

Six sections in the order the guide specifies: hero, why JBC, what it helps
with, safe for everyone, how it works, get a price. Footer carries the
patch-test note.

- **Measured:** no horizontal scroll at 375px (`scrollWidth 375` = `clientWidth
  375`). Verified twice, on both viewports.
- **Measured:** 14 headings, semantic and in order. Exactly one `h1`. No
  skipped levels (`h2` → `h3` only).
- **Measured:** 13 illustrations, every one carrying a descriptive
  `aria-label` or `alt`. No bare decorative icon is the sole visual of any card.
  Image-to-icon ratio is well past the 80/20 requirement.
- **Measured:** no `transition-all`. Two earlier scans flagged 306 instances;
  investigation showed those were the CSS *initial value* on elements with a
  zero-duration transition, not authored rules. Zero elements actually transition
  all properties.
- **Measured:** zero looping animations.
- **Measured:** focus ring renders at 2px solid blue on keyboard focus.
- **Measured:** `prefers-reduced-motion` collapses transitions to 0.00001s.

### 404 page (`/does-not-exist`)

Returns HTTP 404 with custom artwork, a plain explanation, and two routes out
(one primary button, one text link). No lonely icon.

### Error page (`app/error.tsx`)

Warning illustration, plain-language message, "Try again" plus a route home.
The raw error is logged server-side only and never shown to the visitor.

### Loading page (`app/loading.tsx`)

Skeleton shaped like the hero and first section, so content does not jump on
arrival. Uses `aria-busy` and a screen-reader label.

### Sign-in button (Phase 1 stub)

The button is honest: clicking it explains that sign-in arrives in Phase 2
rather than silently doing nothing, which would read as a broken site.

---

## 3. Findings

### CRITICAL

**1. Invisible text on the blue "Safe for everyone" band**
`components/site/family-safe.tsx:16`

The "Safe for the whole family" badge used `bg-white/15` with white text.
Measured contrast: **1.05:1** against the composited background. WCAG AA needs
4.5:1 for 13px text. This is the worst kind of finding: it reads as correct in
the source and fails for every real user. It was not caught by eye because the
background is mid-blue, not white.

*Why it matters:* a low-vision client cannot read the one badge that carries
the trust message for the whole family section. That message is a core product
claim.

*Fixed.* Badge is now `bg-[color:var(--color-bg)]` with
`text-[color:var(--color-secondary)]` — blue on solid white, **5.2:1**, using
existing tokens. Re-measured after the fix: all 23 combinations pass AA.

---

### HIGH

**2. Tap targets below the 44px minimum**
`components/site/wordmark.tsx:12`

The header logo was a 73×32px link. The guide requires 44px minimum tap targets
on mobile.

*Why it matters:* a 32px target is hard to hit accurately on a phone, and it is
the primary "go home" control.

*Fixed.* `min-h-[44px]` added. The visible mark stays 32px; only the hit area
grew. The remaining sub-44px element in the audit is the skip-to-content link,
which is `sr-only` (1×1px) until focused, then expands to full size. That is
correct behaviour, not a defect.

**3. Two colour tokens not defined in the style guide**
`app/globals.css:16-20`

The build needed a card border and a page-band tint. The guide had no value for
either, so three were introduced from judgement: `#e4e9e6`, `#c9d4cd`,
`#f7faf8`.

*Why it matters:* the guide's own rule is that a fix needing an undefined value
must add it to the guide first. Undocumented tokens are how a palette silently
drifts over five phases.

*Fixed, in the correct order.* Added to `design-style-guide.md` under Colors as
"Hairline", "Deep hairline" and "Meadow wash", with the role of each stated.
The guide remains the source of truth. Verified after: zero tokens in the
rendered page are undefined by the guide.

---

### MEDIUM

**4. Skip link and 404 content could not be visually confirmed** — unresolved,
needs a human eye. Screenshots were captured but not viewable. See
Recommendation 1.

**5. Illustration charm is unverified.** The 13 SVGs pass every structural
check (size, `aria-label`, no layout shift, image-to-icon ratio), but whether
they look appealing rather than merely competent cannot be measured. Queued for
Phase 5, when real product photography arrives.

**6. Nav has no active-state concept.** Not a defect: it is a single-scroll
page with one anchor target. Will need real navigation in Phase 2.

---

## 4. Deliberate choices worth recording

These were judgement calls, not oversights:

- **"Step 1 / Step 2 / Step 3"** is the only uppercase micro-label on the page.
  The checklist caps eyebrows at roughly one per three sections; there is one
  label across six sections. It carries real meaning (sequence order), so it
  stays.
- **The four benefit cards are unequal on purpose** — two wide, then narrow
  beside wide. A four-across grid of identical tiles is the exact default the
  checklist warns against.
- **Section backgrounds alternate** white → meadow wash → white → blue → white
  → meadow wash, with the final CTA on deep green. Six distinct layout
  families down an eight-block page.
- **No testimonials, no statistics, no trust logos, no "as seen on".** The
  guide's own rule treats fabrication as Critical. JBC supplied no numbers, so
  none appear.
- **No "prices from $X" anywhere**, because prices are never public.
- **Contact details in the footer are visibly marked** `(email to confirm)`
  and `(WhatsApp number to confirm)`, so a placeholder cannot be mistaken for
  a real address.

---

## 5. Recommendations

1. **Have a human look at the rendered page before Phase 2.** This review is
   measurement-only. A browser screenshot at 375px and 1280px would close the
   gap that findings 4 and 5 represent.
2. **Add a contrast check to the routine.** The Critical finding passed code
   review and passed a naive source read. Only measuring the composited
   background caught it. Contrast should be re-measured whenever a colour is
   used on a non-white surface.
3. **Keep the token-first discipline in later phases.** Adding the three
   missing tokens to the guide before using them took two minutes and prevented
   a silent palette drift across four remaining phases.
4. **Run this review again after Phase 2.** Sign-in adds an auth screen, a
   signed-in header state and a protected route. Those are new screens with
   their own focus, error and loading states, and none of them have been seen
   yet.

---

*Review generated as part of Phase 1. Fixes applied in the same pass; re-measured
after each change.*