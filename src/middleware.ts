import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");

  // Determine allowed origins
  const allowedOrigins = new Set<string>();
  if (process.env.NEXTAUTH_URL) {
    try {
      allowedOrigins.add(new URL(process.env.NEXTAUTH_URL).origin);
    } catch {}
  }
  if (host) {
    allowedOrigins.add(`http://${host}`);
    allowedOrigins.add(`https://${host}`);
  }
  // Local development origins
  allowedOrigins.add("http://localhost:3000");
  allowedOrigins.add("http://localhost:3001");
  allowedOrigins.add("http://127.0.0.1:3000");

  const isAllowedOrigin = origin && allowedOrigins.has(origin);
  const corsOrigin = isAllowedOrigin ? origin : (process.env.NEXTAUTH_URL || "http://localhost:3000");

  // Handle preflight OPTIONS requests
  if (request.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": corsOrigin,
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        ...(isAllowedOrigin ? { "Access-Control-Allow-Credentials": "true" } : {}),
      },
    });
  }

  // Handle standard requests
  const response = NextResponse.next();
  if (isAllowedOrigin) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Credentials", "true");
  }
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

  return response;
}

export const config = {
  matcher: "/api/:path*",
};
