import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const hasDatabase = Boolean(process.env.DATABASE_URL);

function createClient() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  return new PrismaClient({ adapter });
}

/** Returns the Prisma client, or `null` when no DATABASE_URL is configured. */
export function getDb(): PrismaClient | null {
  if (!hasDatabase) return null;
  if (!globalForPrisma.prisma) globalForPrisma.prisma = createClient();
  return globalForPrisma.prisma;
}

/** Same as getDb() but throws — for admin code paths that require a database. */
export function requireDb(): PrismaClient {
  const db = getDb();
  if (!db) throw new Error("DATABASE_URL is not configured");
  return db;
}
