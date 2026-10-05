import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/lib/db";
// ─────────────────────────────────────────────────────────────────────────────
// JBC sign-in.
//
// JBC is Google-only by requirement (project-description.md), so the JB Better
// Auth UI block's defaults are switched OFF on purpose:
//   • emailAndPassword      → removed. No password field, no sign-up form.
//   • emailOTP + Resend     → removed. JBC sends no email at all.
//   • github provider       → removed. Google only.
//
// Everything else below is Better Auth's own machinery. This file only points
// it at the database and names the single provider.
// ─────────────────────────────────────────────────────────────────────────────

export const auth = betterAuth({
  // Reached through the Prisma v7 pg driver adapter in lib/db.ts, per
  // master_prompt.md §PRISMA v7 RULE 5. Not lib/prisma.ts — the JB block
  // ships one, but VibeKit's lib/db.ts is the single db entry point.
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      // Always return people to the app rather than stranding them on a Google
      // page, and let them switch accounts without signing out first.
      prompt: "select_account",
    },
  },

  session: {
    // Someone checking a price quote days later should not be forced to sign in
    // on every visit.
    expiresIn: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      // Lets server components read the session without a database round trip
      // on every render.
      enabled: true,
      maxAge: 60 * 5,
    },
  },

  user: {
    additionalFields: {
      // JBC's own field. `input: false` means Better Auth will never accept it
      // from a request body, so a client cannot grant themselves admin. The
      // only writer is syncAdminFlag() in lib/admin.ts, driven by ADMIN_EMAILS.
      isAdmin: {
        type: "boolean",
        required: false,
        defaultValue: false,
        input: false,
      },
    },
  },

  // Required for Server Actions and Route Handlers to be able to set cookies.
  plugins: [nextCookies()],
});

export type AuthSession = typeof auth.$Infer.Session;
export type AuthUser = typeof auth.$Infer.Session.user;