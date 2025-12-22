import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = ["/consultation"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check auth for protected routes (lightweight - only check cookie)
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    // NextAuth stores session in cookies with key "authjs.session-token" or "next-auth.session-token"
    const sessionToken =
      request.cookies.get("authjs.session-token")?.value ||
      request.cookies.get("next-auth.session-token")?.value ||
      request.cookies.get("__Secure-authjs.session-token")?.value ||
      request.cookies.get("__Secure-next-auth.session-token")?.value;

    // If no session token, redirect to home with login popup
    if (!sessionToken) {
      const url = new URL("/", request.url);
      url.searchParams.set("login", "true");
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
  }

  // Add CORS headers for API routes
  if (pathname.startsWith("/api/")) {
    const response = NextResponse.next();
    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, PATCH, OPTIONS"
    );
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*", "/((?!_next/static|_next/image|favicon.ico).*)"],
};
