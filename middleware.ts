import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const isDemo = process.env.APP_MODE === "demo" || process.env.NEXT_PUBLIC_APP_MODE === "demo";
  const expected = process.env.DEMO_API_KEY;

  if (!isDemo || !expected) return NextResponse.next();

  const existing = request.cookies.get("nova_demo_key")?.value;
  if (existing === expected) return NextResponse.next();

  const response = NextResponse.next();
  response.cookies.set("nova_demo_key", expected, {
    httpOnly: true,
    sameSite: "lax",
    secure: request.nextUrl.protocol === "https:",
    path: "/",
  });
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
