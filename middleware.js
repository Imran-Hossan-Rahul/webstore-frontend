// middleware.js
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(req) {
  const pathname = req.nextUrl.pathname;
  const token = req.cookies.get("token")?.value;

  const JWT_SECRET =
    "4625f0409cbe8a2008e3b6e1e779ad02f1fd4fc792b0b9dda08d4e72236fca086460f4fac2061d082f21449b64329ffc6bc6b2328bbd737f8aa92eb87661fc45";

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
