import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readOwnerFromRequest, reqBase, redirectLocal } from "@/lib/auth";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const BASE = reqBase(req);
  const uid = readOwnerFromRequest(req);
  if (!uid) return redirectLocal("/panel/login");

  const id = Number(params.id);
  const fd = await req.formData();
  const act = String(fd.get("act") || "");
  const ref = req.headers.get("referer") || `${BASE}/panel/riwayat`;
  const go = (ok?: string, err?: string) => {
    const u = new URL(ref, BASE);
    if (ok) u.searchParams.set("ok", ok);
    if (err) u.searchParams.set("err", err);
    const sTok = new URL(req.url).searchParams.get("s");
    if (sTok) u.searchParams.set("s", sTok);
    return redirectLocal(u.pathname + u.search);
  };

  const row = await prisma.riwayatTarung.findUnique({ where: { id }, include: { ayam: true } });
  if (!row) return go(undefined, "Catatan tidak ditemukan.");

  if (act === "hapus") {
    await prisma.riwayatTarung.delete({ where: { id } });
    await prisma.log.create({ data: { userId: uid, aksi: "DELETE", entitas: "riwayat_tarung", entitasId: id, detail: `Hapus hasil laga ${row.ayam?.nama ?? row.ayamId}` } });
    return go("Catatan laga dihapus — rekap diperbarui.");
  }

  return go(undefined, "Aksi tidak dikenal.");
}
