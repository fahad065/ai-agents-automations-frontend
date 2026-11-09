import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PATHS = ["/dashboard", "/admin"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  const token = request.cookies.get("accessToken")?.value;

  if (!token) {
    // Real bug fixed here: this used to set `?from=`, but login-form.tsx
    // and signup-form.tsx both only ever read `?redirect=` (the same param
    // the rest of the auth flow — Google OAuth's `state`, the chatbot
    // autostart flow, etc. — already uses end to end). That mismatch meant
    // clicking a protected link while logged out (e.g. a notification
    // email's actionUrl) always landed back on the plain /dashboard after
    // sign-in, never on the page the link actually pointed to.
    const redirectTarget = pathname + request.nextUrl.search;
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    url.search = "";
    url.searchParams.set("redirect", redirectTarget);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};