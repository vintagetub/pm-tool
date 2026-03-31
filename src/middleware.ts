import { stackServerApp } from "./stack";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = [
  "/handler",
  "/pending",
  "/rejected",
  "/api/stack",
  "/_next",
  "/favicon.ico",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const user = await stackServerApp.getUser();

  if (!user) {
    const signInUrl = new URL("/handler/sign-in", request.url);
    signInUrl.searchParams.set("after", pathname);
    return NextResponse.redirect(signInUrl);
  }

  const meta = (user.clientMetadata ?? {}) as Record<string, string>;
  const status = meta.status;
  const role = meta.role;

  // Unprovisioned user — send to pending page where provisioning happens
  if (!status) {
    if (pathname !== "/pending") {
      return NextResponse.redirect(new URL("/pending", request.url));
    }
    return NextResponse.next();
  }

  if (status === "PENDING" && pathname !== "/pending") {
    return NextResponse.redirect(new URL("/pending", request.url));
  }

  if (status === "REJECTED" && pathname !== "/rejected") {
    return NextResponse.redirect(new URL("/rejected", request.url));
  }

  if (pathname.startsWith("/admin") && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api/stack|_next/static|_next/image|favicon.ico).*)",
  ],
};
