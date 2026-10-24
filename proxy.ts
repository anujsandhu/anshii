import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isServerDateLocked } from "@/lib/dateLock";

// Protected routes that must remain inaccessible before 28 October 2026
const PROTECTED_BIRTHDAY_ROUTES = [
  "/birthday",
  "/our-chat",
  "/memories",
  "/final",
  "/photos",
  "/secret",
  "/password",
  "/conversation",
  "/qr-card",
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const locked = isServerDateLocked();

  if (locked) {
    const isAccessingProtected = PROTECTED_BIRTHDAY_ROUTES.some(
      (route) => pathname === route || pathname.startsWith(`${route}/`)
    );

    if (isAccessingProtected) {
      const pass =
        request.nextUrl.searchParams.get("pass") ||
        request.nextUrl.searchParams.get("bypass") ||
        request.nextUrl.searchParams.get("key");
      const isTesterQuery =
        pass &&
        (pass.toLowerCase() === "anuj88" || pass.toLowerCase() === "anuj19");
      const cookieSession = request.cookies.get("anshii_auth_session")?.value;

      if (isTesterQuery || cookieSession) {
        return NextResponse.next();
      }

      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4|mp3|wav|ico)$).*)",
  ],
};
