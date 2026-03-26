import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export default function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  const { pathname } = request.nextUrl;

  const protectedPaths = ["/account"];
  const authPaths = ["/sign-in", "/sign-up", "/forgot-password", "/reset-password", "/verify-email"];

  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));
  const isAuth = authPaths.some((p) => pathname.startsWith(p));

  // Unauthenticated user trying to access protected route -> redirect to sign-in
  if (isProtected && !sessionCookie) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }
  // Authenticated user trying to access auth pages -> redirect to home
  if (isAuth && sessionCookie) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/account/:path*", "/sign-in", "/sign-up", "/forgot-password", "/reset-password", "/verify-email"],
};
