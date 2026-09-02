import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const PILIHAN = [
  "Info tidak diperbarui (mis. sudah laku / harga beda)",
  "Sudah terjual tapi masih tampil tersedia",
  "Foto atau data keliru",
  "Lainnya",
];

export async function POST(req: Request) {
  try {
    const fd = await req.formData();
    const ayamId = Number(fd.get("ayamId"));
    const jenisRaw = String(fd.get("jenis") || "Lainnya");
    const isi = String(fd.get("isi") || "").trim() || null;

    let jenis = PILIHAN.find((p) => p === jenisRaw) ? jenisRaw : "Lainnya";
    if (jenis === PILIHAN[1]) jenis = "MASIH_TAMPIL_PADAHAL_TERJUAL";
    else if (jenis === PILIHAN[0]) jenis = "INFO_TIDAK_UPDATE";
    else if (jenis === PILIHAN[2]) jenis = "DATA_KELIRU";

    await prisma.laporan.create({
      data: {
        ayamId: Number.isFinite(ayamId) && ayamId > 0 ? ayamId : null,
        jenis,
        isi,
      },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Gagal menyimpan laporan." }, { status: 500 });
  }
}
