import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "./prisma";

const COOKIE = "jalu_session";
const secret = process.env.SESSION_SECRET || "jalu-kandang-dev-secret";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 hari

function sign(payload: string): string {
  return createHmac("sha256", secret).update(payload).update("jalu.v1").digest("base64url");
}

function verify(token: string): { uid: number; exp: number } | null {
  const i = token.lastIndexOf(".");
  if (i < 0) return null;
  const payload = token.slice(0, i);
  const sig = token.slice(i + 1);
  const expected = sign(payload);
  let a: Buffer, b: Buffer;
  try {
    a = Buffer.from(sig);
    b = Buffer.from(expected);
  } catch {
    return null;
  }
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (!data || typeof data.uid !== "number" || typeof data.exp !== "number") return null;
    if (data.exp < Date.now()) return null;
    return data;
  } catch {
    return null;
  }
}

export function createSession(userId: number): string {
  const payload = Buffer.from(
    JSON.stringify({ uid: userId, exp: Date.now() + MAX_AGE * 1000 })
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function redirectLocal(path: string): Response {
  return new Response(null, { status: 303, headers: { Location: path } });
}

export async function setSessionCookie(userId: number): Promise<void> {
  const store = await cookies();
  store.set(COOKIE, createSession(userId), {
    httpOnly: true,
    sameSite: "lax",
    // CATATAN DEMO: Secure dimatikan agar sesi tetap jalan walau preview/http.
    // Saat produksi pakai HTTPS murni, set secure: true.
    secure: false,
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE);
}

/** Mengambil User pemilik dari cookie sesi; null bila belum login. */
export async function getOwner() {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) return null;
  const data = verify(token);
  if (!data) return null;
  const user = await prisma.user.findUnique({ where: { id: data.uid } });
  return user;
}

/** Dipakai di halaman panel: redirect ke /panel/login bila belum login. */
export async function requireOwner() {
  const user = await getOwner();
  if (!user) {
    return { user: null as null, redirect: NextResponse.redirect(new URL("/panel/login", process.env.APP_URL || "http://localhost:3000")) };
  }
  return { user, redirect: null };
}

/** Asal URL (skema+host) dari sebuah Request — memakai header proxy agar redirect
 *  tetap valid saat situs diakses lewat domain preview/balik proxy. */
export function reqBase(req: Request): string {
  const u = new URL(req.url);
  const proto = (req.headers.get("x-forwarded-proto") || "").split(",")[0].trim() || u.protocol.replace(":", "");
  const host = (req.headers.get("x-forwarded-host") || "").split(",")[0].trim() || req.headers.get("host") || u.host;
  return `${proto}://${host}`;
}

export function readOwnerFromRequest(req: Request) {
  const header = req.headers.get("cookie") || "";
  const match = header.split(";").map((c) => c.trim()).find((c) => c.startsWith(`${COOKIE}=`));
  if (!match) return null;
  const data = verify(decodeURIComponent(match.split("=").slice(1).join("=")));
  return data ? data.uid : null;
}

export async function logAksi(aksi: string, entitas: string, entitasId: number | null, detail?: string, userId?: number | null) {
  try {
    await prisma.log.create({
      data: { aksi, entitas, entitasId, detail: detail ?? null, userId: userId ?? null },
    });
  } catch {
    // log tidak boleh menghentikan alur utama
  }
}

