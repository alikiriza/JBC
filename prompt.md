# Build Prompt: JBC Skin Cream App

You are building a client-facing web app for **JBC**, an all-natural herbal skin cream (antifungal, works on burns and most skin conditions, safe for children and adults).

Read these files first and follow them:
- `project-description.md` (what to build and the rules)
- `project-phases.md` (build in this order, one phase at a time)
- `design-style-guide.md` (colors, typography, layout)

## Key Requirements
1. **Landing page** in green, yellow and blue, using the exact colors in the style guide. Mobile first.
2. **Google sign-in only.** No email/password, no other providers.
3. **Request a price:** a signed-in client picks cream size/quantity (use placeholder options until the real ones are provided), adds an optional note, and submits.
4. **Prices are never public.** A client sees a price only after the admin sets it on their request.
5. **Admin page** (protected by an email allowlist kept in an environment variable): shows all clients with their Google emails and their requests; the admin enters a price and reply note and marks the request Priced.
6. **Privacy:** clients see only their own requests.

## Tech
Use the stack from the existing VibeKit setup (GitHub for the repo, Vercel for deployment). Store secrets (Google OAuth keys, admin emails) in environment variables, never in the code.

## How to Work
- Start with **Phase 1** only. When it is done, stop and tell me what was built and how to check it, then wait for me to say go before starting the next phase.
- Explain each step in plain language. I am not a developer.
- Keep the code simple and well organized.
- If something is unclear (sizes, contact number, admin email), use a clearly marked placeholder and list it for me at the end.
- Include this footer note on the site: "For external use only. Do a small patch test first. For severe burns or conditions that don't improve, see a doctor."
