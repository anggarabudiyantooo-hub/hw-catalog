import { NextResponse } from "next/server";
import { purgPublik } from "@/lib/purg";
import { prisma } from "@/lib/prisma";
import { readOwnerFromRequest, reqBase, redirectLocal } from "@/lib/auth";
import { hapusFile } from "@/lib/upload";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const BASE = reqBase(req);
  const uid = readOwnerFromRequest(req);
  if (!uid) return redirectLocal("/panel/login");

  const id = Number(params.id);
  const fd = await req.formData();
  const act = String(fd.get("act") || "");
  const ref = req.headers.get("referer") || `${BASE}/panel/ayam`;
  const go = (ok?: string, err?: string) => {
    const u = new URL(ref, BASE);
    if (ok) u.searchParams.set("ok", ok);
    if (err) u.searchParams.set("err", err);
    const sTok = new URL(req.url).searchParams.get("s");
    if (sTok) u.searchParams.set("s", sTok);
    return redirectLocal(u.pathname + u.search);
  };

  const ayam = await prisma.ayam.findUnique({ where: { id }, include: { images: true } });
  if (!ayam) return go(undefined, "Ayam tidak ditemukan.");

  if (act === "arsip") {
    await prisma.ayam.update({ where: { id }, data: { isArsip: true, statusTampil: "DRAFT", isFeatured: false } });
    await prisma.log.create({ data: { userId: uid, aksi: "ARSIP", entitas: "ayam", entitasId: id, detail: `Arsip "${ayam.nama}"` } });
    await purgPublik();
    return go("Ayam diarsipkan (disembunyikan dari publik).");
  }
  if (act === "pulih") {
    await prisma.ayam.update({ where: { id }, data: { isArsip: false } });
    await prisma.log.create({ data: { userId: uid, aksi: "PULIHKAN", entitas: "ayam", entitasId: id, detail: `Pulihkan "${ayam.nama}"` } });
    await purgPublik();
    return go("Ayam dipulihkan dari arsip.");
  }
  if (act === "permanen") {
    for (const img of ayam.images) await hapusFile(img.filePath);
    await prisma.ayam.delete({ where: { id } });
    await prisma.log.create({ data: { userId: uid, aksi: "DELETE", entitas: "ayam", entitasId: id, detail: `Hapus permanen "${ayam.nama}"` } });
    await purgPublik();
    return go("Ayam beserta galerinya dihapus permanen.");
  }

  return go(undefined, "Aksi tidak dikenal.");
}
