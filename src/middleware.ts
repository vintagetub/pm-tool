import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // Redirect PENDING users to the waiting page (except for that page itself)
    if (token?.status === "PENDING" && pathname !== "/pending") {
      return NextResponse.redirect(new URL("/pending", req.url));
    }

    // Redirect REJECTED users to the rejected page (except for that page itself)
    if (token?.status === "REJECTED" && pathname !== "/rejected") {
      return NextResponse.redirect(new URL("/rejected", req.url));
    }

    // Protect /admin routes — only ADMIN role allowed
    if (pathname.startsWith("/admin") && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/((?!api/auth|login|signup|_next/static|_next/image|favicon.ico).*)",
  ],
};
