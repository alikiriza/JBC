import { createAuthClient } from "better-auth/react";

// The emailOTP plugin from the JB block is deliberately NOT here: JBC sends no
// email, and JBC sign-in is Google-only.
//
// The baseURL is left to Better Auth, which resolves it from the browser. Hard-
// coding BETTER_AUTH_URL here would break the moment the app is deployed to a
// different address than .env.local says.
export const authClient = createAuthClient();