import { NextResponse, type NextRequest } from "next/server";
import { LANG_COOKIE, LANG_HEADER, isLang } from "@/lib/i18n";

const YEAR = 60 * 60 * 24 * 365;

// Public pages live under /en, /si and /ta, so a shared link or QR code
// opens in the language it was made for. The front page (/) is the
// language screen. Older addresses without a language (/home, /register/...)
// are sent to the remembered language, or to the language screen first.
// Staff access is checked against the database on every protected page,
// action and API request, independently of this middleware.
export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const seg = pathname.split("/")[1] ?? "";

  if (isLang(seg)) {
    const headers = new Headers(request.headers);
    headers.set(LANG_HEADER, seg);
    const res = NextResponse.next({ request: { headers } });
    if (request.cookies.get(LANG_COOKIE)?.value !== seg) {
      res.cookies.set(LANG_COOKIE, seg, { path: "/", maxAge: YEAR, sameSite: "lax" });
    }
    return res;
  }

  if (pathname === "/home" || pathname === "/register" || pathname.startsWith("/register/")) {
    const rest = legacyTarget(pathname);
    const chosen = request.cookies.get(LANG_COOKIE)?.value;
    if (isLang(chosen)) {
      return NextResponse.redirect(new URL(`/${chosen}${rest === "/" ? "" : rest}${search}`, request.url));
    }
    const to = new URL("/", request.url);
    if (rest !== "/") to.searchParams.set("next", rest);
    return NextResponse.redirect(to);
  }

  return NextResponse.next();
}

/** Where an old address lives now, without the language segment. */
function legacyTarget(pathname: string): string {
  if (pathname === "/home") return "/";
  if (pathname === "/register/athlete") return "/register/athlete/details";
  if (pathname === "/register" || pathname === "/register/check" || pathname === "/register/done") return "/register/athlete";
  return pathname;
}

export const config = {
  matcher: [
    "/home",
    "/register",
    "/register/:path*",
    "/(en|si|ta)",
    "/(en|si|ta)/:path*",
    "/admin/:path*",
    "/api/admin/:path*",
    "/auth/:path*",
  ],
};
