/**
 * Page-view analytics helpers — pure functions, no dependencies.
 * Visitors are counted by a salted hash (see /api/track); raw IPs are never stored.
 */

const BOT = /bot|crawl|spider|slurp|facebookexternalhit|embedly|preview|headless|lighthouse|pagespeed|curl|wget|python-requests|axios|node-fetch|go-http/i;

export function isBot(ua: string): boolean {
  return !ua || BOT.test(ua);
}

// shortcut: regex sniffing covers mainstream browsers only; switch to a UA parser library if precise versions are ever needed.
export function parseUserAgent(ua: string): { device: "mobile" | "tablet" | "desktop"; browser: string | null; os: string | null } {
  const device = /ipad|tablet|(android(?!.*mobile))/i.test(ua) ? "tablet" : /mobi|iphone|android/i.test(ua) ? "mobile" : "desktop";
  const browser = /edg\//i.test(ua)
    ? "Edge"
    : /opr\/|opera/i.test(ua)
      ? "Opera"
      : /samsungbrowser/i.test(ua)
        ? "Samsung Internet"
        : /firefox|fxios/i.test(ua)
          ? "Firefox"
          : /chrome|crios/i.test(ua)
            ? "Chrome"
            : /safari/i.test(ua)
              ? "Safari"
              : null;
  const os = /windows/i.test(ua)
    ? "Windows"
    : /iphone|ipad|ipod/i.test(ua)
      ? "iOS"
      : /android/i.test(ua)
        ? "Android"
        : /mac os x|macintosh/i.test(ua)
          ? "macOS"
          : /linux/i.test(ua)
            ? "Linux"
            : null;
  return { device, browser, os };
}

/** External referrer host without "www.", or null for direct / internal traffic. */
export function referrerHost(referrer: string | undefined, siteHost: string | null): string | null {
  if (!referrer) return null;
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, "");
    return host && host !== siteHost?.replace(/^www\./, "").split(":")[0] ? host : null;
  } catch {
    return null;
  }
}

export function localeFromPath(path: string): string {
  const first = path.split("/")[1];
  return first === "en" || first === "ar" ? first : "fr";
}

/** Country (ISO code) and city from the hosting edge headers (Vercel, Cloudflare); empty locally. */
export function geoFromHeaders(headers: Headers): { country: string | null; city: string | null } {
  const country = headers.get("x-vercel-ip-country") ?? headers.get("cf-ipcountry");
  const city = headers.get("x-vercel-ip-city") ?? headers.get("cf-ipcity");
  let decodedCity: string | null = null;
  try {
    decodedCity = city ? decodeURIComponent(city) : null;
  } catch {
    decodedCity = city;
  }
  return { country: country && country !== "XX" ? country.toUpperCase() : null, city: decodedCity };
}
