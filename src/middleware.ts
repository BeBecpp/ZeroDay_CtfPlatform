import { NextRequest, NextResponse } from "next/server";
import {
  getAdminSessionFromRequest,
  getTeamSessionFromRequest,
} from "@/lib/auth";

const TEAM_PAGE_PREFIXES = ["/arena", "/challenge", "/scoreboard"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isTeamPage = TEAM_PAGE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (isTeamPage) {
    const session = await getTeamSessionFromRequest(request);
    if (!session) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (pathname.startsWith("/api/admin")) {
    if (pathname === "/api/admin/login") {
      return NextResponse.next();
    }

    const admin = await getAdminSessionFromRequest(request);
    if (!admin) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/arena",
    "/arena/:path*",
    "/challenge/:path*",
    "/scoreboard",
    "/api/admin/:path*",
  ],
};
