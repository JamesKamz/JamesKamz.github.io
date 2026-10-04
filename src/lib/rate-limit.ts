import "server-only";
import { getDb } from "./db";

type Result = { ok: boolean; remaining: number; resetAt: Date };

const memory = new Map<string, { count: number; resetAt: number }>();

/**
 * Fixed-window rate limiter. Uses Postgres when available (shared across
 * serverless instances), otherwise an in-memory map (single instance / dev).
 */
export async function rateLimit(key: string, limit: number, windowMs: number): Promise<Result> {
  const now = Date.now();
  const db = getDb();

  if (db) {
    try {
      const row = await db.rateLimit.findUnique({ where: { key } });
      if (!row || row.resetAt.getTime() <= now) {
        const resetAt = new Date(now + windowMs);
        await db.rateLimit.upsert({
          where: { key },
          create: { key, count: 1, resetAt },
          update: { count: 1, resetAt },
        });
        return { ok: true, remaining: limit - 1, resetAt };
      }
      const updated = await db.rateLimit.update({ where: { key }, data: { count: { increment: 1 } } });
      return { ok: updated.count <= limit, remaining: Math.max(0, limit - updated.count), resetAt: updated.resetAt };
    } catch (error) {
      console.error("[rate-limit] db error, falling back to memory:", (error as Error).message);
    }
  }

  const entry = memory.get(key);
  if (!entry || entry.resetAt <= now) {
    memory.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, resetAt: new Date(now + windowMs) };
  }
  entry.count += 1;
  return { ok: entry.count <= limit, remaining: Math.max(0, limit - entry.count), resetAt: new Date(entry.resetAt) };
}
