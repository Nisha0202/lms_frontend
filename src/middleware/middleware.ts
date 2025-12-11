import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const adminToken = req.cookies.get("adminToken")?.value;
  const studentToken = req.cookies.get("studentToken")?.value;

  const path = req.nextUrl.pathname;

  const isAdminRoute = path.startsWith("/admin");
  const isStudentRoute = path.startsWith("/student");

  // Protect admin routes
  if (isAdminRoute && !adminToken) {
    return NextResponse.redirect(new URL("/signin", req.url));
  }

  // Protect student routes
  if (isStudentRoute && !studentToken) {
    return NextResponse.redirect(new URL("/signin", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/student/:path*"],
};
