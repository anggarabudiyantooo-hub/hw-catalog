-- ===================================================================
-- HW Catalog — MIGRASI: Papan Pengumuman + Kontak & Info Situs terpusat
-- Jalankan di NEON SQL Editor (database yang dipakai Vercel).
-- Aman dijalankan berulang (pakai IF NOT EXISTS / ON CONFLICT).
--
-- Apa yang ditambahkan:
--   1. Tabel "PapanInfo"  : papan peringatan/iklan/info di halaman pengunjung
--                           (kelola dari panel pemilik → menu "Papan Pengumuman").
--   2. Tabel "SiteSetting": SATU sumber data kontak & info situs
--                           (kelola dari panel pemilik → menu "Kontak & Info Situs").
--   3. Baris pengaturan awal (id = 1) berisi nilai yang dipakai situs saat ini.
--   4. Satu contoh papan PERINGATAN aktif — edit/nonaktifkan dari panel.
-- ===================================================================

-- 1) Tabel papan pengumuman
CREATE TABLE IF NOT EXISTS "PapanInfo" (
    "id" SERIAL NOT NULL,
    "jenis" TEXT NOT NULL DEFAULT 'PERINGATAN',   -- PERINGATAN | IKLAN | INFO
    "judul" TEXT NOT NULL,
    "pesan" TEXT NOT NULL DEFAULT '',
    "aktif" BOOLEAN NOT NULL DEFAULT false,
    "kedip" BOOLEAN NOT NULL DEFAULT true,
    "urutan" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PapanInfo_pkey" PRIMARY KEY ("id")
);

-- 2) Tabel pengaturan kontak & info situs (satu baris, id = 1)
CREATE TABLE IF NOT EXISTS "SiteSetting" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "pemilik" TEXT NOT NULL DEFAULT 'Pemilik Demo',
    "waNumber" TEXT NOT NULL DEFAULT '6280000000000',
    "waDisplay" TEXT NOT NULL DEFAULT '+62 800-0000-0000',
    "email" TEXT NOT NULL DEFAULT '',
    "sosmed" TEXT NOT NULL DEFAULT '',
    "alamatBaris1" TEXT NOT NULL DEFAULT 'Pedan, Kab. Klaten,',
    "alamatBaris2" TEXT NOT NULL DEFAULT 'Jawa Tengah, Indonesia',
    "mapsUrl" TEXT NOT NULL DEFAULT 'https://maps.google.com/?q=Pedan+Klaten+Jawa+Tengah',
    "jamLayanan" TEXT NOT NULL DEFAULT '08:00 – 17:00 WIB',
    "catatanKunjungan" TEXT NOT NULL DEFAULT 'Kunjungan wajib reservasi (janji temu). Chat WhatsApp dulu untuk mencocokkan jadwal pemilik — tanpa janji, mohon tidak datang langsung.',
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SiteSetting_pkey" PRIMARY KEY ("id")
);

-- 3) Baris pengaturan awal (nilai sama dengan yang dipakai situs saat ini)
INSERT INTO "SiteSetting" ("id", "updatedAt")
VALUES (1, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

-- 4) Papan peringatan awal (ubah/nonaktifkan lewat panel pemilik)
INSERT INTO "PapanInfo" ("jenis", "judul", "pesan", "aktif", "kedip", "urutan")
SELECT 'PERINGATAN', 'PERINGATAN',
       'Situs sedang dalam pemeliharaan sementara - mohon hubungi lewat WhatsApp untuk info terbaru.',
       true, true, 1
WHERE NOT EXISTS (SELECT 1 FROM "PapanInfo");

-- 5) Cek hasil
SELECT id, jenis, judul, aktif, kedip, urutan FROM "PapanInfo" ORDER BY id;
SELECT id, pemilik, "waNumber", "waDisplay", email, "alamatBaris1", "jamLayanan" FROM "SiteSetting";
