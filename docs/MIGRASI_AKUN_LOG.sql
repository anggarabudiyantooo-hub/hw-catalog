-- ===================================================================
-- HW Catalog — MIGRASI: Log menyeluruh + Akun multi-peran & foto profil
-- Jalankan di NEON SQL Editor (database yang dipakai Vercel).
-- Aman dijalankan berulang (pakai IF NOT EXISTS).
-- Panduan Firebase (opsional, tanpa perubahan skema): docs/SETUP_FIREBASE.md
-- ===================================================================

-- 1) Tabel "User": kolom peran, izin per-modul, status aktif, foto profil
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "role" TEXT NOT NULL DEFAULT 'ADMIN';
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "izin" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "aktif" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "avatarUrl" TEXT;

-- 2) Tabel "Log": kolom metadata (email, IP, lokasi perkiraan, perangkat)
ALTER TABLE "Log" ADD COLUMN IF NOT EXISTS "email" TEXT;
ALTER TABLE "Log" ADD COLUMN IF NOT EXISTS "ip" TEXT;
ALTER TABLE "Log" ADD COLUMN IF NOT EXISTS "negara" TEXT;
ALTER TABLE "Log" ADD COLUMN IF NOT EXISTS "kota" TEXT;
ALTER TABLE "Log" ADD COLUMN IF NOT EXISTS "perangkat" TEXT;
ALTER TABLE "Log" ADD COLUMN IF NOT EXISTS "browser" TEXT;
ALTER TABLE "Log" ADD COLUMN IF NOT EXISTS "os" TEXT;

-- 3) Jadikan akun pemilik (admin@jalu.id) berperan PEMILIK
UPDATE "User" SET "role" = 'PEMILIK' WHERE email = 'admin@jalu.id';

-- 4) Cek hasil
SELECT id, nama, email, role, aktif, COALESCE(array_to_string(izin, ', '), '') AS izin,
       "avatarUrl" FROM "User";
SELECT aksi, email, ip, negara, kota, perangkat, browser, os, detail, "createdAt"
  FROM "Log" ORDER BY id DESC LIMIT 10;
