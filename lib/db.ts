import { PrismaClient } from "@/lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// PRISMA v7 RULE 5: the driver adapter is required. Prisma v7 no longer ships a
// Rust query engine, so without this adapter there is no connection.
//
// Neon's connection string works here unchanged. @neondatabase/serverless is
// installed for the WebSocket path that Neon serverless drivers use under load;
// @prisma/adapter-pg opens its own pool, so we are not switching to it.
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });

// Next.js hot-reloads server modules in development. Without the global cache,
// every edit would open a new connection pool and Neon would throttle us.
const globalForPrisma = global as unknown as { prisma: PrismaClient };

const db = globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

export { db };