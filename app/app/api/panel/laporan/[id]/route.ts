import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readOwnerFromRequest, reqBase } from "@/lib/auth";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const BASE = reqBase(req);
  const uid = readOwnerFromRequest(req);
  if (!uid) return NextResponse.redirect(new URL("/panel/login", BASE), 303);

  const id = Number(params.id);
  const fd = await req.formData();
  const status = String(fd.get("status") || "");
  const ref = req.headers.get("referer") || `${BASE}/panel/laporan`;
  const go = (ok?: string, err?: string) => {
    const u = new URL(ref, BASE);
    if (ok) u.searchParams.set("ok", ok);
    if (err) u.searchParams.set("err", err);
    return NextResponse.redirect(u.toString(), 303);
  };

  if (!["BARU", "DITINDAKLANJUTI", "SELESAI", "TUTUP"].includes(status)) return go(undefined, "Status tidak valid.");
  const l = await prisma.laporan.findUnique({ where: { id } });
  if (!l) return go(undefined, "Laporan tidak ditemukan.");

  await prisma.laporan.update({ where: { id }, data: { status } });
  return go(`Status laporan diubah ke ${status}.`);
}
