import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readOwnerFromRequest } from "@/lib/auth";
import { hapusFile } from "@/lib/upload";

const BASE = process.env.APP_URL || "http://localhost:3000";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const uid = readOwnerFromRequest(req);
  if (!uid) return NextResponse.redirect(new URL("/panel/login", BASE), 303);

  const ayamId = Number(params.id);
  const fd = await req.formData();
  const imageId = Number(fd.get("imageId"));
  const act = String(fd.get("act") || "");
  const ref = req.headers.get("referer") || `${BASE}/panel/ayam/${ayamId}`;
  const go = (ok?: string, err?: string) => {
    const u = new URL(ref, BASE);
    if (ok) u.searchParams.set("ok", ok);
    if (err) u.searchParams.set("err", err);
    return NextResponse.redirect(u.toString(), 303);
  };

  const img = await prisma.ayamImage.findFirst({ where: { id: imageId, ayamId } });
  if (!img) return go(undefined, "Gambar tidak ditemukan.");

  if (act === "primary") {
    await prisma.$transaction([
      prisma.ayamImage.updateMany({ where: { ayamId }, data: { isPrimary: false } }),
      prisma.ayamImage.update({ where: { id: imageId }, data: { isPrimary: true } }),
    ]);
    return go("Foto utama diperbarui.");
  }

  if (act === "jenis") {
    const jenis = String(fd.get("jenis") || "").trim() || null;
    const urutan = Math.max(0, Number(fd.get("urutan") ?? img.urutan) || img.urutan);
    await prisma.ayamImage.update({ where: { id: imageId }, data: { jenisFoto: jenis, urutan } });
    return go("Jenis / urutan foto disimpan.");
  }

  if (act === "hapus") {
    await hapusFile(img.filePath);
    await prisma.ayamImage.delete({ where: { id: imageId } });
    // bila foto utama dihapus, angkat gambar lain jadi utama
    const sisa = await prisma.ayamImage.findFirst({ where: { ayamId }, orderBy: { urutan: "asc" } });
    if (sisa) await prisma.ayamImage.update({ where: { id: sisa.id }, data: { isPrimary: true } });
    return go("Foto dihapus.");
  }

  return go(undefined, "Aksi tidak dikenal.");
}
