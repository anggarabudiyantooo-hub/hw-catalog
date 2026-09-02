import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readOwnerFromRequest, reqBase } from "@/lib/auth";
import { hapusFile } from "@/lib/upload";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const BASE = reqBase(req);
  const uid = readOwnerFromRequest(req);
  if (!uid) return NextResponse.redirect(new URL("/panel/login", BASE), 303);

  const id = Number(params.id);
  const fd = await req.formData();
  const act = String(fd.get("act") || "");
  const ref = req.headers.get("referer") || `${BASE}/panel/ayam`;
  const go = (ok?: string, err?: string) => {
    const u = new URL(ref, BASE);
    if (ok) u.searchParams.set("ok", ok);
    if (err) u.searchParams.set("err", err);
    return NextResponse.redirect(u.toString(), 303);
  };

  const ayam = await prisma.ayam.findUnique({ where: { id }, include: { images: true } });
  if (!ayam) return go(undefined, "Ayam tidak ditemukan.");

  if (act === "arsip") {
    await prisma.ayam.update({ where: { id }, data: { isArsip: true, statusTampil: "DRAFT", isFeatured: false } });
    await prisma.log.create({ data: { userId: uid, aksi: "ARSIP", entitas: "ayam", entitasId: id, detail: `Arsip "${ayam.nama}"` } });
    return go("Ayam diarsipkan (disembunyikan dari publik).");
  }
  if (act === "pulih") {
    await prisma.ayam.update({ where: { id }, data: { isArsip: false } });
    await prisma.log.create({ data: { userId: uid, aksi: "PULIHKAN", entitas: "ayam", entitasId: id, detail: `Pulihkan "${ayam.nama}"` } });
    return go("Ayam dipulihkan dari arsip.");
  }
  if (act === "permanen") {
    for (const img of ayam.images) await hapusFile(img.filePath);
    await prisma.ayam.delete({ where: { id } });
    await prisma.log.create({ data: { userId: uid, aksi: "DELETE", entitas: "ayam", entitasId: id, detail: `Hapus permanen "${ayam.nama}"` } });
    return go("Ayam beserta galerinya dihapus permanen.");
  }

  return go(undefined, "Aksi tidak dikenal.");
}
