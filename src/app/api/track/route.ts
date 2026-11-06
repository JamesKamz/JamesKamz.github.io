import { NextResponse } from "next/server";
import { z } from "zod";
import { geoFromHeaders, isBot, localeFromPath, parseUserAgent, referrerHost } from "@/lib/analytics";
import { guardedJson } from "@/lib/api";
import { getDb } from "@/lib/db";
import { clientIp, hashIp } from "@/lib/request";

const trackSchema = z.object({
  path: z.string().max(300).regex(/^\/(?!admin|api)/),
  referrer: z.string().max(500).optional(),
});

/** Records one public page view (sent with navigator.sendBeacon from <PageViewTracker>). */
export async function POST(request: Request) {
  const ua = request.headers.get("user-agent") ?? "";
  if (isBot(ua)) return new NextResponse(null, { status: 204 });

  const guard = await guardedJson(request, trackSchema, { bucket: "track", limit: 60, windowMs: 60_000 });
  if (guard instanceof NextResponse) return guard;
  const { path, referrer } = guard.data;

  const db = getDb();
  if (db) {
    try {
      await db.pageView.create({
        data: {
          path,
          locale: localeFromPath(path),
          referrer: referrerHost(referrer, request.headers.get("x-forwarded-host") ?? request.headers.get("host")),
          // Same visitor = same IP + browser; hashed with the server secret, never stored raw.
          visitorId: hashIp(`${clientIp(request.headers)}|${ua}`),
          ...geoFromHeaders(request.headers),
          ...parseUserAgent(ua),
        },
      });
    } catch (error) {
      console.error("[track] failed:", (error as Error).message);
    }
  }
  return new NextResponse(null, { status: 204 });
}
