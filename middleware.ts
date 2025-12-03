import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

const ProtectedRoutes = ["/consultation"];
const API_ROUTES_WITH_TIMEOUT = ["/api/consultation"];

export async function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;
    
    // Add timeout for API routes
    if (API_ROUTES_WITH_TIMEOUT.some(route => pathname.startsWith(route))) {
      const response = NextResponse.next();
      response.headers.set('X-API-Timeout', '30000'); // 30 seconds
      
      // Add CORS headers for better API handling
      response.headers.set('Access-Control-Allow-Origin', '*');
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      
      return response;
    }

    // Auth logic with timeout
    const authPromise = auth();
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Auth timeout')), 5000);
    });

    const session = await Promise.race([authPromise, timeoutPromise]).catch(() => null);
    const isLoginedIn = !!session?.user;

    // Untuk redirect ke login jika mau akses konsultasi tapi belum login
    if (
      !isLoginedIn &&
      ProtectedRoutes.some((route) => pathname.startsWith(route))
    ) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    // Untuk redirect ke home jika sudah login mau akses halaman login lagi
    if (isLoginedIn && pathname.startsWith("/login")) {
      return NextResponse.redirect(new URL("/consultation", request.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
