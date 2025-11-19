import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

const ProtectedRoutes = ["/consultation"];

export async function middleware(request: NextRequest) {
  const session = await auth();
  const isLoginedIn = !!session?.user;
  const { pathname } = request.nextUrl;

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
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
