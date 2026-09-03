import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const hari = (iso: string) => new Date(iso + "T00:00:00");

async function main() {
  console.log("Seed ulang database demo…");

  // Reset data (kecuali tak ada relasi lain)
  await prisma.permintaan.deleteMany();
  await prisma.laporan.deleteMany();
  await prisma.riwayatTarung.deleteMany();
  await prisma.ayamImage.deleteMany();
  await prisma.ayam.deleteMany();
  await prisma.kategori.deleteMany();
  await prisma.log.deleteMany();
  await prisma.user.deleteMany();

  // ---------- pemilik ----------
  const user = await prisma.user.create({
    data: {
      nama: "Pemilik Demo",
      email: "admin@jalu.id",
      passwordHash: await bcrypt.hash("jalu1234", 10),
      role: "PEMILIK",
      izin: [],
    },
  });
  console.log("Akun pemilik: admin@jalu.id / jalu1234");

  // ---------- kategori ----------
  const kats = [
    ["Bangkok Tulen", "bangkok-tulen", "Ayam Bangkok asli darah Thailand, seleksi ketat garis juara.", 1],
    ["Bangkok Birma", "bangkok-birma", "Kombinasi Bangkok–Birma: pukulan keras, tenaga panjang.", 2],
    ["Bangkok Thailand F1", "bangkok-thailand-f1", "Hasil impor F1 dari Thailand, postur ideal laga.", 3],
    ["Bangkok Lokal", "bangkok-lokal", "Kualitas tangguh hasil pemeliharaan lokal terpilih.", 4],
    ["Betina / Indukan", "betina-indukan", "Indukan betina terpilih untuk program pembibitan.", 5],
  ] as const;
  for (const [nama, slug, deskripsi, urutan] of kats) {
    await prisma.kategori.create({ data: { nama, slug, deskripsi, urutan } });
  }
  const kat = await prisma.kategori.findMany();

  const cari = (slug: string) => kat.find((k) => k.slug === slug)!.id;

  // ---------- helper ayam ----------
  async function buatAyam(p: {
    nama: string;
    kodeRing?: string;
    kategori: string;
    jenisKelamin: "JANTAN" | "BETINA";
    menetas: string;
    berat: number;
    warna?: string;
    postur?: string;
    tinggi?: number;
    kaki?: string;
    jalu?: string;
    harga?: number;
    statusJual: string;
    featured?: boolean;
    file: string;
    jenisFoto: string[];
    keunggulan?: string;
    deskripsi?: string;
  }) {
    const slug = `${(p.kodeRing || p.nama).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")}`;
    const ayam = await prisma.ayam.create({
      data: {
        slug,
        kodeRing: p.kodeRing ?? null,
        nama: p.nama,
        kategoriId: cari(p.kategori),
        jenisKelamin: p.jenisKelamin,
        tanggalMenetas: hari(p.menetas),
        beratKg: p.berat,
        warnaBulu: p.warna ?? null,
        postur: p.postur ?? null,
        tinggiCm: p.tinggi ?? null,
        kakiSisik: p.kaki ?? null,
        jalu: p.jalu ?? null,
        keunggulan: p.keunggulan ?? null,
        deskripsi: p.deskripsi ?? null,
        harga: p.harga ?? null,
        statusJual: p.statusJual,
        statusTampil: "PUBLIKASI",
        isFeatured: p.featured ?? false,
        publishedAt: new Date(),
      },
    });
    for (let i = 0; i < p.jenisFoto.length; i++) {
      await prisma.ayamImage.create({
        data: {
          ayamId: ayam.id,
          filePath: p.file,
          isPrimary: i === 0,
          urutan: i,
          jenisFoto: p.jenisFoto[i],
          ukuranKb: 0,
          altText: `${p.nama} — ${p.jenisFoto[i]}`,
        },
      });
    }
    return ayam;
  }

  const umum =
    "Postur tegak, tulang besar & rapat\nDada bidang, sayap mengepung rapat\nKaki bersisik halus, jalu kokoh\nPukulan keras & sambung rapat\nWatak tenang di luar, galak di laga";

  const rajawali = await buatAyam({
    nama: "Rajawali",
    kodeRing: "BKT-001",
    kategori: "bangkok-tulen",
    jenisKelamin: "JANTAN",
    menetas: "2025-03-13",
    berat: 3.6,
    warna: "Hitam legam, dada merah bata",
    postur: "Besar & kekar, dada bidang",
    tinggi: 52,
    kaki: "Sisik halus rapat, kering",
    jalu: "GANDA",
    harga: 3500000,
    statusJual: "TERSEDIA",
    featured: true,
    file: "/uploads/seed/rajawali.jpg",
    jenisFoto: ["FULL_BADAN", "KEPALA", "KAKI", "LAINNYA"],
    keunggulan: umum,
    deskripsi:
      "Jagoan andalan garis F1 kami — anak dari indukan juara yang telah lama dipelihara di kandang ini. Telah diuji tanding terbatas beberapa kali dan menang penuh tanpa cacat. Cocok bagi kolektor yang mencari jantan siap laga sekaligus pejantan pembibitan.",
  });

  const ronggolawe = await buatAyam({
    nama: "Ronggolawe",
    kodeRing: "BKX-019",
    kategori: "bangkok-thailand-f1",
    jenisKelamin: "JANTAN",
    menetas: "2025-11-08",
    berat: 3.15,
    warna: "Lurik emas gelap, ekor panjang",
    postur: "Ramping atletis, leher panjang",
    tinggi: 49,
    kaki: "Sisik rapat halus",
    jalu: "TUNGGAL",
    harga: 4500000,
    statusJual: "TERSEDIA",
    featured: true,
    file: "/uploads/seed/ronggolawe.jpg",
    jenisFoto: ["FULL_BADAN", "KEPALA", "KAKI", "BULU"],
    keunggulan: umum,
    deskripsi: "Impor F1 langsung dari Thailand. Usia muda dengan potensi besar — ideal untuk dikembangkan.",
  });

  const pamenan = await buatAyam({
    nama: "Sang Pamenan",
    kodeRing: "BKT-007",
    kategori: "bangkok-tulen",
    jenisKelamin: "JANTAN",
    menetas: "2025-07-01",
    berat: 3.35,
    warna: "Hitam kemerahan",
    postur: "Sedang padat, dada tebal",
    tinggi: 50,
    kaki: "Sisik halus",
    jalu: "GANDA",
    harga: 2750000,
    statusJual: "TERSEDIA",
    featured: true,
    file: "/uploads/seed/pamenan.jpg",
    jenisFoto: ["FULL_BADAN", "KEPALA", "KAKI"],
    deskripsi: "Baru dua minggu di kandang. Kepala gagah dan pukulan terukur.",
  });

  const kyaisemar = await buatAyam({
    nama: "Kyai Semar",
    kodeRing: "BKB-012",
    kategori: "bangkok-birma",
    jenisKelamin: "JANTAN",
    menetas: "2024-11-09",
    berat: 3.8,
    warna: "Hitam pekat",
    postur: "Kekar, tulang besar",
    tinggi: 54,
    kaki: "Sisik tebal kering",
    jalu: "GANDA",
    statusJual: "DIPESAN",
    file: "/uploads/seed/kyaisemar.jpg",
    jenisFoto: ["FULL_BADAN", "KEPALA", "KAKI", "LAINNYA"],
    deskripsi: "Jantan warisan 2023 dengan pengalaman uji terbanyak di kandang. Sedang dipesan calon pembeli.",
  });

  const bima = await buatAyam({
    nama: "Bima Sakti",
    kodeRing: "BKL-008",
    kategori: "bangkok-lokal",
    jenisKelamin: "JANTAN",
    menetas: "2025-05-02",
    berat: 3.5,
    warna: "Merah bata tua",
    postur: "Sedang tegap",
    tinggi: 51,
    kaki: "Sisik halus",
    jalu: "TUNGGAL",
    harga: 1900000,
    statusJual: "TERSEDIA",
    file: "/uploads/seed/bima.jpg",
    jenisFoto: ["FULL_BADAN", "KEPALA", "KAKI"],
    deskripsi: "Hasil seleksi lokal terpilih — tangguh dan mudah dirawat.",
  });

  await buatAyam({
    nama: "Sekar Arum",
    kodeRing: "BKB-021",
    kategori: "betina-indukan",
    jenisKelamin: "BETINA",
    menetas: "2025-01-05",
    berat: 2.6,
    warna: "Lurik cokelat halus",
    postur: "Indukan ideal, dada lebar",
    tinggi: 42,
    statusJual: "TERJUAL",
    file: "/uploads/seed/sekararum.jpg",
    jenisFoto: ["FULL_BADAN", "KEPALA", "KAKI", "BULU"],
    deskripsi: "Babon F1 berkualitas — telah terjual dan ditampilkan sebagai riwayat koleksi (foto hitam-putih).",
  });

  // ---------- riwayat tarung ----------
  async function laga(ayamId: number, tanggal: string, namaLawan: string, berat: number, ronde: number, hasil: string, catatan?: string) {
    await prisma.riwayatTarung.create({
      data: { ayamId, tanggal: hari(tanggal), jenisLaga: "UJI_TERBATAS", namaLawan, beratLawan: berat, ronde, hasil, catatan: catatan ?? null },
    });
  }
  await laga(rajawali.id, "2026-06-12", "Bima Blitar", 3.45, 3, "MENANG", "Pukulan kanan rapat, tahan pukulan baik.");
  await laga(rajawali.id, "2026-05-03", "Jago Klaten", 3.55, 2, "MENANG", "Kuncian leher rapat sejak ronde awal.");
  await laga(rajawali.id, "2026-02-17", "Jalu Selatan", 3.6, 5, "SERI", "Dihentikan kedua pihak — kondisi aman.");
  await laga(rajawali.id, "2025-12-09", "Hitam Magelang", 3.5, 4, "KALAH", "Lelah di ronde akhir — bahan evaluasi stamina.");
  await laga(ronggolawe.id, "2026-07-20", "Jago Klaten", 3.4, 2, "MENANG", "Menang penuh tanpa cacat.");
  await laga(ronggolawe.id, "2026-08-02", "Bima Blitar", 3.5, 3, "MENANG", "Pukulan sambung rapat.");
  await laga(pamenan.id, "2026-06-28", "Jalu Selatan", 3.3, 3, "MENANG", "Kondisi prima.");
  await laga(pamenan.id, "2026-07-19", "Hitam Magelang", 3.55, 4, "KALAH", "Kalah poin tipis.");
  await laga(kyaisemar.id, "2025-11-15", "Bima Blitar", 3.7, 5, "MENANG", "Pengalaman terbaik kandang.");
  await laga(kyaisemar.id, "2026-03-22", "Jago Klaten", 3.75, 4, "MENANG", "Tenaga panjang.");
  await laga(kyaisemar.id, "2026-05-30", "Hitam Magelang", 3.8, 3, "SERI", "Kedua pihak bertahan.");

  // ---------- contoh permintaan & laporan ----------
  await prisma.permintaan.create({
    data: { ayamId: rajawali.id, namaPengunjung: "Budi Santoso", noWa: "0812-9999-1111", kota: "Surabaya", pesan: "Ingin survei kandang dulu minggu depan, apakah bisa?", status: "BARU" },
  });
  await prisma.permintaan.create({
    data: { ayamId: bima.id, namaPengunjung: "Agus W", noWa: "0857-1234-5678", kota: "Semarang", pesan: "Boleh tawar?", status: "BARU" },
  });
  await prisma.laporan.create({
    data: { ayamId: null, jenis: "INFO_TIDAK_UPDATE", isi: "Contoh laporan dari pengunjung — ayam yang sudah laku masih terlihat di daftar.", status: "BARU" },
  });

  console.log(`Selesai. Total ayam: ${await prisma.ayam.count()}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
