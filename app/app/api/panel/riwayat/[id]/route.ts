import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readOwnerFromRequest } from "@/lib/auth";

const BASE = process.env.APP_URL || "http://localhost:3000";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const uid = readOwnerFromRequest(req);
  if (!uid) return NextResponse.redirect(new URL("/panel/login", BASE), 303);

  const id = Number(params.id);
  const fd = await req.formData();
  const act = String(fd.get("act") || "");
  const ref = req.headers.get("referer") || `${BASE}/panel/riwayat`;
  const go = (ok?: string, err?: string) => {
    const u = new URL(ref, BASE);
    if (ok) u.searchParams.set("ok", ok);
    if (err) u.searchParams.set("err", err);
    return NextResponse.redirect(u.toString(), 303);
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
