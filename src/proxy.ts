import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";
import { auth } from "./auth";
import { routing } from "./i18n/routing";

const intl = createMiddleware(routing);

// Auth.js only runs for /admin, so the public site never depends on auth configuration.
const adminGuard = auth((req) => {
  const isLogin = req.nextUrl.pathname === "/admin/login";
  const isAdmin = req.auth?.user?.role === "ADMIN";
  if (!isAdmin && !isLogin) {
    const url = new URL("/admin/login", req.nextUrl.origin);
    url.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  if (isAdmin && isLogin) return NextResponse.redirect(new URL("/admin", req.nextUrl.origin));
  const res = NextResponse.next();
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  return res;
});

export default function proxy(req: NextRequest, event: NextFetchEvent) {
  const { pathname } = req.nextUrl;
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return (adminGuard as unknown as (r: NextRequest, e: NextFetchEvent) => ReturnType<typeof intl>)(req, event);
  }
  return intl(req);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
