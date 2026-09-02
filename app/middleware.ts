import { NextRequest, NextResponse } from "next/server";

// Meneruskan path+query (mis. /panel?s=TOKEN) ke Server Component melalui header,
// karena layout tidak bisa membaca searchParams secara langsung.
export function middleware(req: NextRequest) {
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-path", req.nextUrl.pathname + req.nextUrl.search);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/panel", "/panel/:path*"],
};
