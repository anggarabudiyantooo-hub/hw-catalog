// ============================================================
// KONFIGURASI KANDANG — satu tempat untuk data kontak/lokasi.
// Ubah sesuai data asli Anda sebelum produksi.
// ============================================================

export const SITE = {
  nama: "Kandang Jalu",
  brand: "JALU",
  tagline: "Galeri Ayam Bangkok · Surakarta",
  pemilik: "H. Suroto",
  waDisplay: "+62 812-3456-7890",
  // Nomor WhatsApp internasional (awali 62, tanpa + dan tanda baca)
  waNumber: "6281234567890",
  email: "jalu@kandang.example",
  alamatBaris1: "Jl. Pahlawan No. 12, Banjarsari,",
  alamatBaris2: "Surakarta, Jawa Tengah 57135",
  mapsUrl: "https://maps.google.com/?q=Kandang+Jalu+Surakarta",
  jamLayanan: "08.00–17.00 WIB",
  catatanKunjungan:
    "Kunjungan wajib reservasi (janji temu). Chat WhatsApp dulu untuk mencocokkan jadwal pemilik — tanpa janji, mohon tidak datang langsung.",
  sejak: "1996",
};

export function waLink(pesan?: string): string {
  const base = `https://wa.me/${SITE.waNumber}`;
  return pesan ? `${base}?text=${encodeURIComponent(pesan)}` : base;
}
