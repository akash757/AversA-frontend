import { NextResponse } from "next/server";
import { canAccessRoute, getDashboardHomeRoute } from "@/lib/auth/dashboard-config";

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;
  const role = request.cookies.get("userRole")?.value;
  const status = request.cookies.get("userStatus")?.value;

  // Active session exists if either access token or long-lived refresh token is present
  const hasSession = !!(accessToken || refreshToken);

  // 1. If user is logged in and visits homepage (/) or auth pages (/login, /signup),
  // redirect immediately to dashboard according to their role.
  if (hasSession && (pathname === "/" || pathname === "/login" || pathname === "/signup")) {
    if (status === "pending") {
      return NextResponse.redirect(new URL("/pending-approval", request.url));
    }
    const targetRoute = getDashboardHomeRoute(role);
    return NextResponse.redirect(new URL(targetRoute, request.url));
  }

  // 2. Protect dashboard & private routes
  const isProtectedRoute = [
    "/dashboard",
    "/organizations",
    "/projects",
    "/meetings",
    "/users",
    "/settings",
  ].some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

  if (isProtectedRoute) {
    if (!hasSession) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (status === "pending") {
      return NextResponse.redirect(new URL("/pending-approval", request.url));
    }

    if (!canAccessRoute(role, pathname)) {
      return NextResponse.redirect(new URL("/dashboard?denied=1", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/signup",
    "/dashboard/:path*",
    "/organizations/:path*",
    "/projects/:path*",
    "/meetings/:path*",
    "/users/:path*",
    "/settings/:path*",
  ],
};
