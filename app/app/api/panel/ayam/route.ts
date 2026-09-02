import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readOwnerFromRequest, reqBase } from "@/lib/auth";
import { parseAyam, cekJenisFotoTerpenuhi } from "@/lib/ayamFields";
import { ambilFiles, simpanGambar } from "@/lib/upload";

export async function POST(req: Request) {
  const BASE = reqBase(req);
  const uid = readOwnerFromRequest(req);
  if (!uid) return NextResponse.redirect(new URL("/panel/login", BASE), 303);

  const ref = req.headers.get("referer") || `${BASE}/panel/ayam`;
  const back = (ok?: string, err?: string) => {
    const u = new URL(ref, BASE);
    if (ok) u.searchParams.set("ok", ok);
    if (err) u.searchParams.set("err", err);
    return NextResponse.redirect(u.toString(), 303);
  };

  try {
    const fd = await req.formData();
    const parsed = parseAyam(fd);
    if (!parsed.ok) return back(undefined, parsed.err);

    const files = ambilFiles(fd, "images");

    // gating foto wajib bila langsung publikasi
    if (parsed.data.statusTampil === "PUBLIKASI" && files.length === 0) {
      return back(undefined, "Publikasi butuh minimal 1 foto (lengkapkan Full badan, Kepala & Kaki) — simpan dulu sebagai Draf.");
    }

    const slugBase = (parsed.data.kodeRing || parsed.data.nama).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "ayam";
    const slug = `${slugBase}-${Date.now().toString(36)}`;

    const ayam = await prisma.ayam.create({
      data: { ...parsed.data, slug },
    });

    for (let i = 0; i < files.length; i++) {
      try {
        const saved = await simpanGambar(files[i]);
        await prisma.ayamImage.create({
          data: {
            ayamId: ayam.id,
            filePath: saved.filePath,
            ukuranKb: saved.sizeKb,
            isPrimary: i === 0,
            urutan: i,
            altText: `${parsed.data.nama} — foto ${i + 1}`,
          },
        });
      } catch (e) {
        console.error("gagal simpan gambar", e);
      }
    }

    return NextResponse.redirect(new URL(`/panel/ayam/${ayam.id}?ok=Tersimpan.+Atur+jenis+foto+lalu+publikasikan.`, BASE), 303);
  } catch {
    return back(undefined, "Terjadi kesalahan saat menyimpan.");
  }
}
