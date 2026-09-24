// middleware.js
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(req) {
  const pathname = req.nextUrl.pathname;
  const token    = req.cookies.get("accessToken")?.value;
  const JWT_SECRET = process.env.JWT_ACCESS_SECRET;

  // ─── Community Feature Flag Redirect ──────────────────────────────────────
  const enableCommunity = process.env.NEXT_PUBLIC_ENABLE_COMMUNITY === "true";
  
  if (!enableCommunity) {
    const isCommunityRoute = 
      pathname.startsWith("/devlogs") ||
      pathname.startsWith("/artifacts") ||
      pathname.startsWith("/codex") ||
      pathname.startsWith("/studio") ||
      pathname.startsWith("/challenges") ||
      pathname.startsWith("/jobs") ||
      pathname.startsWith("/achievements");

    if (isCommunityRoute) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // ─── Dev warning if secret missing ────────────────────────────────────────
  if (!JWT_SECRET) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[MIDDLEWARE] JWT_ACCESS_SECRET is missing — route protection degraded.");
    }
    return NextResponse.next();
  }

  // ─── Verify token (when present) ──────────────────────────────────────────
  let decoded = null;

  if (token) {
    try {
      const secret = new TextEncoder().encode(JWT_SECRET);
      const { payload } = await jwtVerify(token, secret);
      decoded = payload;
    } catch (err) {
      // Token is invalid or expired
      if (process.env.NODE_ENV === "development") {
        console.warn("[MIDDLEWARE] JWT verify failed:", err.message);
      }

      // For protected routes, send to login (not /no-access — that's for role errors)
      const isPublic =
        pathname === "/" ||
        pathname.startsWith("/auth") ||
        pathname.startsWith("/codex") ||
        pathname.startsWith("/artifacts") ||
        pathname.startsWith("/search") ||
        pathname.startsWith("/about") ||
        pathname.startsWith("/embed");

      if (!isPublic) {
        const loginUrl = new URL("/auth/login", req.url);
        loginUrl.searchParams.set("error", "session_expired");
        return NextResponse.redirect(loginUrl);
      }

      // For public routes clear the bad cookie by continuing — backend will
      // handle token refresh on next authenticated API call
      return NextResponse.next();
    }
  }

  // ─── Admin route protection ────────────────────────────────────────────────
  if (pathname.startsWith("/admin")) {
    const isAdmin =
      decoded?.role === "admin" ||
      decoded?.role === "superadmin" ||
      decoded?.isSuperAdmin === true; // ✅ FIX: isSuperAdmin flag was not checked before

    if (!decoded || !isAdmin) {
      return NextResponse.redirect(new URL("/no-access", req.url));
    }
    return NextResponse.next();
  }


  // ─── Unauthenticated user gates ───────────────────────────────────────────
  if (!token) {
    // Authenticated-only areas
    const protectedPrefixes = [
      "/dashboard",
      "/user/",
      "/settings",
      "/upload",
      "/opportunities",
      "/inbox",
    ];

    for (const prefix of protectedPrefixes) {
      if (pathname.startsWith(prefix)) {
        // Redirect to login with return URL for UX
        const loginUrl = new URL("/auth/login", req.url);
        loginUrl.searchParams.set("next", pathname);
        return NextResponse.redirect(loginUrl);
      }
    }

    return NextResponse.next();
  }

  // ─── Craftsman-only routes ────────────────────────────────────────────────
  if (pathname.startsWith("/user/craftsman")) {
    if (!decoded?.hasCraftsmanAccount) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // ─── Already logged-in users shouldn't see auth pages ────────────────────
  // if (decoded && pathname.startsWith("/auth")) {
  //   return NextResponse.redirect(new URL("/", req.url));
  // }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/devlogs/:path*",
    "/artifacts/:path*",
    "/codex/:path*",
    "/studio/:path*",
    "/challenges/:path*",
    "/jobs/:path*",
    "/achievements/:path*",
    "/market/:path*",
    "/admin/:path*",
    "/dashboard/:path*",
    "/user/:path*",
    "/settings/:path*",
    "/upload/:path*",
    "/opportunities/:path*",
    "/auth/:path*",
  ],
};
