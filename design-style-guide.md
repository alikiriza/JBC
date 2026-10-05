# JBC Skin Cream App — Design Style Guide

## Mood
Natural, clean, trustworthy, family-friendly. Fresh herbal green leads, sunny yellow adds warmth, calm blue adds trust and cleanliness.

## Colors
| Role | Name | Hex |
|---|---|---|
| Primary | Herbal green | `#2E7D32` |
| Primary dark | Deep green | `#1B5E20` |
| Primary tint | Leaf mist | `#E8F5E9` |
| Accent | Sunny yellow | `#F9C922` |
| Accent tint | Soft butter | `#FFF8DC` |
| Secondary | Calm blue | `#1E6FB8` |
| Secondary tint | Sky mist | `#E3F2FD` |
| Text | Charcoal | `#1F2933` |
| Muted text | Slate | `#5B6770` |
| Background | White | `#FFFFFF` |

**Added tokens (needed to build against the palette above):**

| Role | Name | Hex |
|---|---|---|
| Border | Hairline | `#E4E9E6` |
| Border strong | Deep hairline | `#C9D4CD` |
| Surface tint | Meadow wash | `#F7FAF8` |
| Error | Clay red | `#B3261E` |
| Error tint | Blush | `#FDECEA` |

Hairline is the card and input border. Deep hairline is a hovered border or a divider that needs more presence than a card border. Meadow wash is a barely-green page band used to separate sections without a hard colour change. Clay red is the only "something went wrong" colour — error messages, failed states, the destructive action. Blush is its surface tint. No other red belongs in this app.

**Usage:** green for headers, hero and main buttons; yellow for highlights, badges and the main call to action on dark green; blue for links, info cards and trust badges ("Safe for kids and adults"). Keep body text charcoal on white or tint backgrounds. Do not put yellow text on white.

## Typography
- Headings: a friendly rounded sans-serif (e.g. Poppins or Nunito), bold
- Body: Inter or system sans-serif, 16px minimum
- Generous line height (1.6) for easy reading on phones

## Layout
- Mobile first; most visitors will be on phones
- Single-column sections that stack cleanly; max content width about 1100px on desktop
- Large rounded cards (16px radius), soft shadows, plenty of white space

## Landing Page Sections
1. **Hero:** green background, headline about natural healing for the whole family, yellow "Sign in with Google" button
2. **Why JBC:** three or four benefit cards (all-natural herbs, no artificial additives, antifungal, gentle on skin)
3. **What it helps with:** fungal infections, burns, eczema/rashes/dry skin, and most other skin conditions, each with a simple icon
4. **Safe for everyone:** blue band with children, men and women
5. **How it works:** Sign in → Choose size → Get your price
6. **Footer:** patch-test and doctor note, contact details

## Components
- **Buttons:** pill-shaped; primary is green with white text, call to action is yellow with charcoal text; clear hover and focus states
- **Cards:** white, light border, soft shadow
- **Status badges:** Pending = yellow tint, Priced = green tint, Closed = grey
- **Forms:** large inputs, clear labels, visible focus ring in blue

## Accessibility
- Keep text contrast at WCAG AA or better
- Don't rely on color alone for status; include text labels
- Tap targets at least 44px
