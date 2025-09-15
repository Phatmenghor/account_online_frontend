// src/middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { ROUTES } from "./src/constants/AppRoutes/routes";

export default function middleware(req: NextRequest) {
  const token = req.cookies.get("auth-token")?.value;
  const pathname = req.nextUrl.pathname;

  console.log("=== MIDDLEWARE DEBUG ===");
  console.log("pathname:", pathname);
  console.log("token exists:", !!token);
  console.log("ROUTES.AUTH.LOGIN:", ROUTES.AUTH.LOGIN);
  console.log("========================");

  if (pathname === "/auth/login") {
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL(ROUTES.AUTH.LOGIN, req.url));
  }

  if (pathname === "/") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  console.log("Proceeding normally...");
  return NextResponse.next();
}

// Apply middleware to all routes except _next, static files, and api routes if needed
export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/"],
};
