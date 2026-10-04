import "server-only";
import { createHash } from "node:crypto";

/** Best-effort client IP (Vercel sets x-forwarded-for / x-real-ip). */
export function clientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return headers.get("x-real-ip") ?? "unknown";
}

/** Salted hash so raw IPs are never stored. */
export function hashIp(ip: string): string {
  return createHash("sha256")
    .update(`${process.env.AUTH_SECRET ?? "dev-salt"}:${ip}`)
    .digest("hex")
    .slice(0, 32);
}

/**
 * CSRF protection for JSON endpoints: the browser-supplied Origin must match the
 * host serving the request. Cross-site forms/fetches are rejected.
 */
export function isSameOrigin(headers: Headers): boolean {
  const origin = headers.get("origin");
  if (!origin) return false;
  const host = headers.get("x-forwarded-host") ?? headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
