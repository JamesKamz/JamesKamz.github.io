import "server-only";
import { NextResponse } from "next/server";
import type { z } from "zod";
import { rateLimit } from "./rate-limit";
import { clientIp, hashIp, isSameOrigin } from "./request";

export function jsonError(status: number, error: string, extra?: Record<string, unknown>) {
  return NextResponse.json({ ok: false, error, ...extra }, { status });
}

/**
 * Common guard for public POST endpoints: same-origin check (CSRF),
 * per-IP rate limit, JSON parsing and Zod validation.
 */
export async function guardedJson<S extends z.ZodType>(
  request: Request,
  schema: S,
  opts: { bucket: string; limit: number; windowMs: number },
): Promise<{ data: z.output<S>; ipHash: string } | NextResponse> {
  if (!isSameOrigin(request.headers)) return jsonError(403, "forbidden");

  const ipHash = hashIp(clientIp(request.headers));
  const rl = await rateLimit(`${opts.bucket}:${ipHash}`, opts.limit, opts.windowMs);
  if (!rl.ok) {
    return NextResponse.json(
      { ok: false, error: "rate_limited" },
      { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt.getTime() - Date.now()) / 1000)) } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError(400, "invalid_json");
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return jsonError(422, "validation", { issues: parsed.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })) });
  }
  return { data: parsed.data, ipHash };
}
