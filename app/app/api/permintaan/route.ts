import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { waLink } from "@/lib/config";

export async function POST(req: Request) {
  try {
    const fd = await req.formData();
    const ayamId = Number(fd.get("ayamId"));
    const nama = String(fd.get("namaPengunjung") || "").trim();
    const noWa = String(fd.get("noWa") || "").trim();
    const kota = String(fd.get("kota") || "").trim() || null;
    const pesan = String(fd.get("pesan") || "").trim() || null;

    if (!nama || !noWa) {
      return NextResponse.json({ error: "Nama dan nomor WhatsApp wajib diisi." }, { status: 400 });
    }

    await prisma.permintaan.create({
      data: { ayamId: Number.isFinite(ayamId) && ayamId > 0 ? ayamId : null, namaPengunjung: nama, noWa, kota, pesan },
    });

    return NextResponse.json({ ok: true, wa: waLink(`Halo, saya ${nama} tertarik dengan ayam Anda di katalog. No. WhatsApp saya ${noWa}.`) });
  } catch {
    return NextResponse.json({ error: "Terjadi kesalahan, coba lagi." }, { status: 500 });
  }
}
