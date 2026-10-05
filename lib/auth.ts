import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/lib/db";
import { syncAdminFlag } from "@/lib/admin-flag";
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
      // only writer is syncAdminFlag() in lib/admin-flag.ts, driven by
      // ADMIN_EMAILS.
      isAdmin: {
        type: "boolean",
        required: false,
        defaultValue: false,
        input: false,
      },
    },
  },

  databaseHooks: {
    // ── Keeping `isAdmin` in step with ADMIN_EMAILS ──────────────────────────
    // Runs on every new session, which is every sign-in. That is what makes
    // adding an admin instant (no manual SQL update) and revoking one instant
    // too (it is off again the next time they sign in).
    //
    // The session hook is used rather than user.create because a user's first
    // session and their hundredth must behave identically: someone added to
    // ADMIN_EMAILS months later has to pick up admin on their next sign-in, and
    // user.create.after would never fire for them again.
    session: {
      create: {
        after: async (session) => {
          // Better Auth types this hook's `session` loosely — `user` comes back
          // as `unknown`. Narrow it here rather than casting, so a shape change
          // upstream degrades to "no sync this sign-in" instead of a crash on
          // the sign-in path.
          const user = session.user as { email?: unknown } | undefined;
          const email = user?.email;

          if (typeof email !== "string" || !session.userId) return;

          try {
            await syncAdminFlag(session.userId, email);
          } catch {
            // A failure here must never block the sign-in itself. The worst case
            // is that isAdmin is one sign-in out of date; every admin action
            // re-checks ADMIN_EMAILS through verifyAdmin(), so a stale flag
            // still cannot grant access.
          }
        },
      },
    },
  },

  // Required for Server Actions and Route Handlers to be able to set cookies.
  plugins: [nextCookies()],
});

export type AuthSession = typeof auth.$Infer.Session;
export type AuthUser = typeof auth.$Infer.Session.user;