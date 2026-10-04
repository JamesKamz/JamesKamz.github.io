import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import { auth } from "./auth";
import { routing } from "./i18n/routing";

const intl = createMiddleware(routing);

export default auth((req) => {
  const { pathname } = req.nextUrl;

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    const isLogin = pathname === "/admin/login";
    const isAdmin = req.auth?.user?.role === "ADMIN";
    if (!isAdmin && !isLogin) {
      const url = new URL("/admin/login", req.nextUrl.origin);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
    if (isAdmin && isLogin) return NextResponse.redirect(new URL("/admin", req.nextUrl.origin));
    const res = NextResponse.next();
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
    return res;
  }

  return intl(req);
});

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
