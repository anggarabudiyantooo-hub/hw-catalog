import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { waLinkDari } from "@/lib/config";
import { getSite } from "@/lib/site";

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

    const site = await getSite();
    return NextResponse.json({ ok: true, wa: waLinkDari(site.waNumber, `Halo, saya ${nama} tertarik dengan ayam Anda di katalog. No. WhatsApp saya ${noWa}.`) });
  } catch {
    return NextResponse.json({ error: "Terjadi kesalahan, coba lagi." }, { status: 500 });
  }
}
