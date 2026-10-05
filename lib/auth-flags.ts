/**
 * Browser-safe auth flags.
 *
 * Kept out of lib/auth.ts on purpose: lib/auth.ts builds the server auth
 * instance and imports the database, so it must never reach a client bundle.
 * This file reads only environment variables and has no imports, so server
 * components can read it and pass the value down as a prop.
 */
export const googleConfigured = Boolean(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
);