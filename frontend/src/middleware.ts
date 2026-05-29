import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = ["/dashboard", "/accounts", "/transactions", "/ledger", "/profile"];
const authRoutes = ["/login", "/register", "/verify-email", "/reset-password"];

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  const isProtected = protectedRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
  if (isProtected && !token) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  const isAuthPage = authRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
  if (isAuthPage && token) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/dashboard/:path*", "/accounts/:path*", "/transactions/:path*", "/ledger/:path*", "/profile/:path*", "/login", "/register", "/verify-email", "/reset-password"],
};