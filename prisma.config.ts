// PRISMA v7 RULE 3: the datasource URL lives HERE, not in schema.prisma.
// PRISMA v7 RULE 6: no `engine` property.
// PRISMA v7 RULE 7: dotenv first, so env() reads the local env file.
//
// REPLACED the JB auth block's version, which read process.env directly (breaks
// RULE 3's env() validation) and never loaded .env.local.

import "dotenv/config";
import { config } from "dotenv";
import { defineConfig, env } from "prisma/config";

// `dotenv/config` alone only loads `.env`. JBC keeps its real values in
// `.env.local`, which is the file .gitignore protects and the one Next.js
// reads. Load it explicitly, with override so a real .env.local always wins
// over a stray .env.
config({ path: ".env.local", override: true });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: { url: env("DATABASE_URL") },
});