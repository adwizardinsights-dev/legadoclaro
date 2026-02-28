import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Protected route patterns
const PROTECTED_PATTERNS = ["/dashboard", "/will", "/admin"];
const ADMIN_PATTERNS = ["/admin"];
const AUTH_PAGES = ["/login", "/register", "/reset-password"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PATTERNS.some((p) => pathname.startsWith(p));
  const isAdminRoute = ADMIN_PATTERNS.some((p) => pathname.startsWith(p));
  const isAuthPage = AUTH_PAGES.some((p) => pathname.startsWith(p));

  // Get session
  const session = await auth();

  // Redirect unauthenticated users away from protected routes
  if (isProtected && !session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect non-admins away from admin routes
  if (isAdminRoute && session?.user?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Redirect authenticated users away from auth pages
  if (isAuthPage && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (Next.js static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - api/auth (NextAuth routes — handle their own auth)
     * - api/stripe/webhook (needs raw body, no auth check)
     * - public assets
     */
    "/((?!_next/static|_next/image|favicon.ico|api/auth|api/stripe/webhook|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
