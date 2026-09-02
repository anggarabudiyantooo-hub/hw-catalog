import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readOwnerFromRequest, reqBase, redirectLocal } from "@/lib/auth";

export async function POST(req: Request) {
  const BASE = reqBase(req);
  const uid = readOwnerFromRequest(req);
  if (!uid) return redirectLocal("/panel/login");

  const fd = await req.formData();
  const ayamId = Number(fd.get("ayamId"));
  const tanggalRaw = String(fd.get("tanggal") || "");
  const hasil = String(fd.get("hasil") || "");
  const ref = req.headers.get("referer") || `${BASE}/panel/ayam/${ayamId}`;
  const go = (ok?: string, err?: string) => {
    const u = new URL(ref, BASE);
    if (ok) u.searchParams.set("ok", ok);
    if (err) u.searchParams.set("err", err);
    const sTok = new URL(req.url).searchParams.get("s");
    if (sTok) u.searchParams.set("s", sTok);
    return redirectLocal(u.pathname + u.search);
  };

  const ayam = await prisma.ayam.findUnique({ where: { id: ayamId } });
  if (!ayam) return go(undefined, "Ayam tidak ditemukan.");
  if (!tanggalRaw || !["MENANG", "KALAH", "SERI"].includes(hasil)) {
    return go(undefined, "Tanggal dan hasil (Menang/Kalah/Seri) wajib diisi.");
  }

  const ronde = Number(fd.get("ronde"));
  const berat = parseFloat(String(fd.get("beratLawan") || "").replace(",", "."));

  await prisma.riwayatTarung.create({
    data: {
      ayamId,
      tanggal: new Date(tanggalRaw + "T00:00:00"),
      jenisLaga: String(fd.get("jenisLaga") || "UJI_TERBATAS"),
      namaLawan: String(fd.get("namaLawan") || "").trim() || null,
      beratLawan: fd.get("beratLawan") && isFinite(berat) ? berat : null,
      ronde: fd.get("ronde") && isFinite(ronde) && ronde > 0 ? ronde : null,
      hasil,
      catatan: String(fd.get("catatan") || "").trim() || null,
    },
  });

  await prisma.log.create({
    data: { userId: uid, aksi: "CREATE", entitas: "riwayat_tarung", entitasId: ayamId, detail: `Tambah hasil laga "${hasil}" utk ${ayam.nama}` },
  });

  return go("Hasil laga dicatat — rekap menang/kalah/seri terbarui otomatis.");
}
