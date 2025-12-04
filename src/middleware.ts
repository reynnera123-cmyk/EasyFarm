import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const url = req.nextUrl.pathname;

  if (url.startsWith("/empresa/")) {
    const companyId = url.split("/")[2];
    const cookie = req.cookies.get("companyId");

    if (!cookie || cookie.value !== companyId) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/empresa/:path*"],
};
