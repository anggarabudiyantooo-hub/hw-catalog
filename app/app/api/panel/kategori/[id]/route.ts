import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readOwnerFromRequest, reqBase, redirectLocal } from "@/lib/auth";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const BASE = reqBase(req);
  const uid = readOwnerFromRequest(req);
  if (!uid) return redirectLocal("/panel/login");

  const id = Number(params.id);
  const fd = await req.formData();
  const act = String(fd.get("act") || "update");
  const ref = req.headers.get("referer") || `${BASE}/panel/kategori`;
  const go = (ok?: string, err?: string) => {
    const u = new URL(ref, BASE);
    if (ok) u.searchParams.set("ok", ok);
    if (err) u.searchParams.set("err", err);
    return NextResponse.redirect(u.toString(), 303);
  };

  const kat = await prisma.kategori.findUnique({ where: { id }, include: { _count: { select: { ayam: true } } } });
  if (!kat) return go(undefined, "Kategori tidak ditemukan.");

  if (act === "update") {
    const nama = String(fd.get("nama") || "").trim();
    if (!nama) return go(undefined, "Nama wajib diisi.");
    try {
      await prisma.kategori.update({
        where: { id },
        data: {
          nama,
          deskripsi: String(fd.get("deskripsi") || "").trim() || null,
          urutan: Number(fd.get("urutan")) || 0,
        },
      });
      return go("Kategori diperbarui.");
    } catch {
      return go(undefined, "Nama sudah dipakai kategori lain.");
    }
  }

  if (act === "hapus") {
    if (kat._count.ayam > 0) return go(undefined, `Kategori ini masih dipakai ${kat._count.ayam} ayam — pindahkan atau hapus ayamnya dulu.`);
    await prisma.kategori.delete({ where: { id } });
    return go("Kategori dihapus.");
  }

  return go(undefined, "Aksi tidak dikenal.");
}
