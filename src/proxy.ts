import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionJwt } from "@/lib/session";

async function isAuthenticated(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return false;

  try {
    await verifySessionJwt(token);
    return true;
  } catch {
    return false;
  }
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const authed = await isAuthenticated(req);

  // ✅ if logged in, block "/" (login page) and go dashboard
  if (pathname === "/" && authed) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // ✅ protect dashboard
  if (pathname.startsWith("/dashboard") && !authed) {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/dashboard/:path*"],
};
