import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readOwnerFromRequest } from "@/lib/auth";
import { slugify } from "@/lib/format";

const BASE = process.env.APP_URL || "http://localhost:3000";

export async function POST(req: Request) {
  const uid = readOwnerFromRequest(req);
  if (!uid) return NextResponse.redirect(new URL("/panel/login", BASE), 303);

  const fd = await req.formData();
  const nama = String(fd.get("nama") || "").trim();
  const ref = req.headers.get("referer") || `${BASE}/panel/kategori`;
  const go = (ok?: string, err?: string) => {
    const u = new URL(ref, BASE);
    if (ok) u.searchParams.set("ok", ok);
    if (err) u.searchParams.set("err", err);
    return NextResponse.redirect(u.toString(), 303);
  };
  if (!nama) return go(undefined, "Nama kategori wajib diisi.");

  let slug = slugify(nama);
  let unik = false;
  while (!unik) {
    const ada = await prisma.kategori.findUnique({ where: { slug } });
    if (ada) slug = `${slugify(nama)}-${Date.now().toString(36)}`;
    else unik = true;
  }

  try {
    await prisma.kategori.create({
      data: { nama, slug, deskripsi: String(fd.get("deskripsi") || "").trim() || null, urutan: Number(fd.get("urutan")) || 0 },
    });
    await prisma.log.create({ data: { userId: uid, aksi: "CREATE", entitas: "kategori", detail: `Tambah kategori "${nama}"` } });
    return go("Kategori ditambahkan.");
  } catch {
    return go(undefined, "Nama kategori sudah ada.");
  }
}
