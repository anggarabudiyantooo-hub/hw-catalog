import { purgPublik } from "@/lib/purg";
import { prisma } from "@/lib/prisma";
import { guardPemilik } from "@/lib/izin";
import { infodari } from "@/lib/requestinfo";
import { reqBase, redirectLocal } from "@/lib/auth";

/**
 * Simpan Kontak & Info Situs — satu-satunya sumber data kontak pengunjung.
 * Upsert baris tunggal (id = 1). Khusus pemilik.
 */
export async function POST(req: Request) {
  const BASE = reqBase(req);
  const { user, res } = await guardPemilik(req);
  if (res) return res;

  const fd = await req.formData();
  const ref = req.headers.get("referer") || `${BASE}/panel/kontak`;
  const go = (ok?: string, err?: string) => {
    const u = new URL(ref, BASE);
    if (ok) u.searchParams.set("ok", ok);
    if (err) u.searchParams.set("err", err);
    return redirectLocal(u.pathname + u.search);
  };

  const ambil = (k: string) => String(fd.get(k) || "").trim();

  const pemilik = ambil("pemilik");
  if (!pemilik) return go(undefined, "Nama pemilik wajib diisi.");

  // Normalisasi nomor WA: buang semua selain angka; awalan 08… / 8… → 628…
  let waNumber = ambil("waNumber").replace(/\D/g, "");
  if (!waNumber) return go(undefined, "Nomor WhatsApp wajib diisi.");
  if (waNumber.startsWith("0")) waNumber = "62" + waNumber.slice(1);
  else if (waNumber.startsWith("8")) waNumber = "62" + waNumber;

  const email = ambil("email");
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return go(undefined, "Format email tidak valid.");
  const sosmed = ambil("sosmed");
  if (sosmed && !/^https?:\/\//i.test(sosmed)) return go(undefined, "Tautan media sosial harus diawali http:// atau https://");
  const mapsUrl = ambil("mapsUrl");
  if (!mapsUrl) return go(undefined, "Tautan Google Maps wajib diisi.");

  const data = {
    pemilik,
    waNumber,
    waDisplay: ambil("waDisplay") || `+${waNumber}`,
    email,
    sosmed,
    alamatBaris1: ambil("alamatBaris1") || "Pedan, Kab. Klaten,",
    alamatBaris2: ambil("alamatBaris2") || "Jawa Tengah, Indonesia",
    mapsUrl,
    jamLayanan: ambil("jamLayanan") || "08:00 – 17:00 WIB",
    catatanKunjungan: ambil("catatanKunjungan"),
  };

  try {
    await prisma.siteSetting.upsert({
      where: { id: 1 },
      update: data,
      create: { id: 1, ...data },
    });
    await prisma.log.create({
      data: { ...infodari(req), userId: user!.id, aksi: "UPDATE", entitas: "kontak-situs", detail: `Perbarui kontak & info situs (WA ${data.waDisplay})` },
    }).catch(() => {});
    await purgPublik();
    return go("Kontak & info situs disimpan — seluruh halaman pengunjung sudah memakai data baru.");
  } catch {
    return go(undefined, "Gagal menyimpan data kontak.");
  }
}
