import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readOwnerFromRequest, reqBase, redirectLocal } from "@/lib/auth";
import { parseAyam, cekJenisFotoTerpenuhi } from "@/lib/ayamFields";
import { ambilFiles, simpanGambar } from "@/lib/upload";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const BASE = reqBase(req);
  const uid = readOwnerFromRequest(req);
  if (!uid) return redirectLocal("/panel/login");

  const id = Number(params.id);
  const ref = req.headers.get("referer") || `${BASE}/panel/ayam/${id}`;
  const back = (ok?: string, err?: string) => {
    const u = new URL(ref, BASE);
    if (ok) u.searchParams.set("ok", ok);
    if (err) u.searchParams.set("err", err);
    return NextResponse.redirect(u.toString(), 303);
  };

  const existing = await prisma.ayam.findUnique({ where: { id }, include: { images: true } });
  if (!existing) return back(undefined, "Data ayam tidak ditemukan.");

  const fd = await req.formData();
  // Submis murni "tambah foto ke galeri" (tanpa field data) vs simpan data penuh
  const galleryOnly =
    !String(fd.get("nama") || "").trim() && !String(fd.get("beratKg") || "").trim();
  const files = ambilFiles(fd, "newImages");
  const newJenis = String(fd.get("newJenis") || "").trim() || null;
  const jenisFotoBaru = Array.from({ length: files.length }, () => newJenis);

  if (!galleryOnly) {
    const parsed = parseAyam(fd);
    if (!parsed.ok) return back(undefined, parsed.err);

    // foto wajib bila dipublikasikan — hitung termasuk foto yang diunggah sekarang
    if (parsed.data.statusTampil === "PUBLIKASI") {
      const currentJenis = existing.images.map((i) => i.jenisFoto);
      const kurang = cekJenisFotoTerpenuhi([...currentJenis, ...jenisFotoBaru]);
      if (kurang.length > 0) {
        return back(
          undefined,
          `Belum bisa dipublikasikan — foto wajib kurang: ${kurang
            .map((k) => ({ FULL_BADAN: "Full badan", KEPALA: "Kepala", KAKI: "Kaki" } as Record<string, string>)[k])
            .join(", ")}. Atur jenis foto di galeri di bawah.`
        );
      }
    }

    try {
      await prisma.ayam.update({ where: { id }, data: parsed.data });
    } catch {
      return back(undefined, "Kode ring sudah dipakai ayam lain — gunakan kode berbeda atau kosongkan.");
    }

    await prisma.log.create({
      data: { userId: uid, aksi: "UPDATE", entitas: "ayam", entitasId: id, detail: `Update data ayam "${parsed.data.nama}"` },
    });
  }

  // upload tambahan (jenis foto sama untuk semua file pada submit ini)
  const urutanMulai = existing.images.length;
  for (let i = 0; i < files.length; i++) {
    try {
      const saved = await simpanGambar(files[i]);
      await prisma.ayamImage.create({
        data: {
          ayamId: id,
          filePath: saved.filePath,
          ukuranKb: saved.sizeKb,
          isPrimary: existing.images.length === 0 && i === 0,
          urutan: urutanMulai + i,
          jenisFoto: newJenis,
          altText: `${galleryOnly ? existing.nama : ""} — foto`,
        },
      });
    } catch {
      /* lewati file bermasalah */
    }
  }

  return back(galleryOnly ? "Foto ditambahkan ke galeri." : "Perubahan tersimpan.");
}
