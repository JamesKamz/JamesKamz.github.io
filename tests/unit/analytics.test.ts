import { describe, expect, it } from "vitest";
import { geoFromHeaders, isBot, localeFromPath, parseUserAgent, referrerHost } from "@/lib/analytics";

const UA = {
  chromeWin: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  safariIphone: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1",
  edgeMac: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0",
  androidTablet: "Mozilla/5.0 (Linux; Android 14; SM-X710) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  firefoxLinux: "Mozilla/5.0 (X11; Linux x86_64; rv:133.0) Gecko/20100101 Firefox/133.0",
};

describe("parseUserAgent", () => {
  it("detects device, browser and OS", () => {
    expect(parseUserAgent(UA.chromeWin)).toEqual({ device: "desktop", browser: "Chrome", os: "Windows" });
    expect(parseUserAgent(UA.safariIphone)).toEqual({ device: "mobile", browser: "Safari", os: "iOS" });
    expect(parseUserAgent(UA.edgeMac)).toEqual({ device: "desktop", browser: "Edge", os: "macOS" });
    expect(parseUserAgent(UA.androidTablet)).toEqual({ device: "tablet", browser: "Chrome", os: "Android" });
    expect(parseUserAgent(UA.firefoxLinux)).toEqual({ device: "desktop", browser: "Firefox", os: "Linux" });
  });
});

describe("isBot", () => {
  it("filters crawlers, headless browsers and empty agents", () => {
    expect(isBot("Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)")).toBe(true);
    expect(isBot("Mozilla/5.0 HeadlessChrome/131.0.0.0")).toBe(true);
    expect(isBot("")).toBe(true);
    expect(isBot(UA.chromeWin)).toBe(false);
  });
});

describe("referrerHost", () => {
  it("keeps external hosts only", () => {
    expect(referrerHost("https://www.google.com/search?q=x", "jameskamz.com")).toBe("google.com");
    expect(referrerHost("https://jameskamz.com/projets", "www.jameskamz.com")).toBeNull();
    expect(referrerHost("http://localhost:3000/", "localhost:3000")).toBeNull();
    expect(referrerHost("not a url", "jameskamz.com")).toBeNull();
    expect(referrerHost(undefined, "jameskamz.com")).toBeNull();
  });
});

describe("localeFromPath / geoFromHeaders", () => {
  it("derives the site locale from the URL", () => {
    expect(localeFromPath("/")).toBe("fr");
    expect(localeFromPath("/projets/ele-afrika")).toBe("fr");
    expect(localeFromPath("/en/about")).toBe("en");
    expect(localeFromPath("/ar")).toBe("ar");
  });

  it("reads and decodes edge geo headers", () => {
    expect(geoFromHeaders(new Headers({ "x-vercel-ip-country": "ma", "x-vercel-ip-city": "F%C3%A8s" }))).toEqual({ country: "MA", city: "Fès" });
    expect(geoFromHeaders(new Headers({ "cf-ipcountry": "XX" }))).toEqual({ country: null, city: null });
    expect(geoFromHeaders(new Headers())).toEqual({ country: null, city: null });
  });
});
