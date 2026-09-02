import { NextResponse } from "next/server";
import { clearSessionCookie, reqBase } from "@/lib/auth";

export async function POST(req: Request) {
  await clearSessionCookie();
  return NextResponse.redirect(new URL("/panel/login", reqBase(req)), 303);
}
