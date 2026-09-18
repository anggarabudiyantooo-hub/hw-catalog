// ============================================================
// KONFIGURASI KANDANG — satu tempat untuk data kontak/lokasi.
// Ubah sesuai data asli Anda sebelum produksi.
// ============================================================

export const SITE = {
  nama: "HW Catalog",
  brand: "HW Catalog",
  tagline: "Galeri Ayam Bangkok · Klaten",
  // Pemilik / pengelola tunggal
  pemilik: "Pemilik Demo",
  waDisplay: "+62 800-0000-0000",
  // Nomor WhatsApp internasional (awali 62, tanpa + dan tanda baca)
  waNumber: "6280000000000",
  // Email & sosial media masih menyusul — kosongkan sampai tersedia
  email: "",
  sosmed: "",
  alamatBaris1: "Pedan, Kab. Klaten,",
  alamatBaris2: "Jawa Tengah, Indonesia",
  mapsUrl: "https://maps.google.com/?q=Pedan+Klaten+Jawa+Tengah",
  jamLayanan: "08:00 – 17:00 WIB",
  catatanKunjungan:
    "Kunjungan wajib reservasi (janji temu). Chat WhatsApp dulu untuk mencocokkan jadwal pemilik — tanpa janji, mohon tidak datang langsung.",
  sejak: "",
};

export function waLink(pesan?: string): string {
  return waLinkDari(SITE.waNumber, pesan);
}

/**
 * Tautan WhatsApp dari nomor tertentu — dipakai bersama nilai yang dibaca
 * dari database (getSite di lib/site.ts) agar nomor bisa diubah dari panel.
 */
export function waLinkDari(waNumber: string, pesan?: string): string {
  const base = `https://wa.me/${waNumber}`;
  return pesan ? `${base}?text=${encodeURIComponent(pesan)}` : base;
}
