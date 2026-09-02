import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readOwnerFromRequest, reqBase, redirectLocal } from "@/lib/auth";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const BASE = reqBase(req);
  const uid = readOwnerFromRequest(req);
  if (!uid) return redirectLocal("/panel/login");

  const id = Number(params.id);
  const fd = await req.formData();
  const status = String(fd.get("status") || "");
  const ref = req.headers.get("referer") || `${BASE}/panel/permintaan`;
  const go = (ok?: string, err?: string) => {
    const u = new URL(ref, BASE);
    if (ok) u.searchParams.set("ok", ok);
    if (err) u.searchParams.set("err", err);
    const sTok = new URL(req.url).searchParams.get("s");
    if (sTok) u.searchParams.set("s", sTok);
    return redirectLocal(u.pathname + u.search);
  };

  if (!["BARU", "DIHUBUNGI", "DEAL", "BATAL"].includes(status)) return go(undefined, "Status tidak valid.");
  const p = await prisma.permintaan.findUnique({ where: { id } });
  if (!p) return go(undefined, "Permintaan tidak ditemukan.");

  await prisma.permintaan.update({ where: { id }, data: { status } });
  return go(`Status permintaan ${p.namaPengunjung} diubah ke ${status}.`);
}
