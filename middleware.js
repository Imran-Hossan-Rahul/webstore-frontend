// middleware.js
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(req) {
  const pathname = req.nextUrl.pathname;
  const token = req.cookies.get("token")?.value;

  const JWT_SECRET = process.env.JWT_SECRET_ACCESS_TOKEN;

  if (!JWT_SECRET) {
    return NextResponse.redirect(new URL("/no-access", req.url));
  }

  // Temporary: Hide all admin routes completely from everyone
  if (pathname.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/no-access", req.url));
  }

  // If user is unauthenticated
  if (!token) {
    // Guard dashboard: send visitors back home
    if (pathname.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    // Protect /user/* routes
    if (pathname.startsWith("/user/")) {
      return NextResponse.redirect(new URL("/no-access", req.url));
    }
    // Allow everything else (homepage, blogs, etc.)
    return NextResponse.next();
  }

  let decoded;
  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    decoded = payload;
  } catch (err) {
    // If token is invalid, allow public routes through
    if (pathname === "/" || pathname.startsWith("/blogs")) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/no-access", req.url));
  }

  const hasCreatorAccount = decoded?.hasCreatorAccount;

  // Debug log
  console.log('🔍 Middleware Debug:', {
    pathname,
    hasCreatorAccount,
    decodedPayload: decoded
  });

  // Creator route protection
  if (pathname.startsWith("/user/creator")) {
    if (!hasCreatorAccount) {
      console.log('❌ Redirecting: No creator account');
      return NextResponse.redirect(new URL("/", req.url));
    }
    console.log('✅ Allowing access to creator route');
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/admin/:path*",
    "/dashboard/:path*",
    "/user/:path*", // This will match all /user/* routes
  ],
};
