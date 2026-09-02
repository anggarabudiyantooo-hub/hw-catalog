-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Kategori" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "deskripsi" TEXT,
    "urutan" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Kategori_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ayam" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "kodeRing" TEXT,
    "nama" TEXT NOT NULL,
    "kategoriId" INTEGER,
    "jenisKelamin" TEXT NOT NULL,
    "tanggalMenetas" TIMESTAMP(3),
    "beratKg" DOUBLE PRECISION NOT NULL,
    "warnaBulu" TEXT,
    "postur" TEXT,
    "tinggiCm" DOUBLE PRECISION,
    "kakiSisik" TEXT,
    "jalu" TEXT,
    "keunggulan" TEXT,
    "deskripsi" TEXT,
    "harga" INTEGER,
    "statusJual" TEXT NOT NULL DEFAULT 'TERSEDIA',
    "statusTampil" TEXT NOT NULL DEFAULT 'DRAFT',
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isArsip" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ayam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AyamImage" (
    "id" SERIAL NOT NULL,
    "ayamId" INTEGER NOT NULL,
    "filePath" TEXT NOT NULL,
    "ukuranKb" INTEGER,
    "altText" TEXT,
    "jenisFoto" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "urutan" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AyamImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permintaan" (
    "id" SERIAL NOT NULL,
    "ayamId" INTEGER,
    "namaPengunjung" TEXT NOT NULL,
    "noWa" TEXT NOT NULL,
    "kota" TEXT,
    "pesan" TEXT,
    "status" TEXT NOT NULL DEFAULT 'BARU',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Permintaan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Laporan" (
    "id" SERIAL NOT NULL,
    "ayamId" INTEGER,
    "namaPelapor" TEXT,
    "noWa" TEXT,
    "jenis" TEXT NOT NULL DEFAULT 'LAINNYA',
    "isi" TEXT,
    "status" TEXT NOT NULL DEFAULT 'BARU',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Laporan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RiwayatTarung" (
    "id" SERIAL NOT NULL,
    "ayamId" INTEGER NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "jenisLaga" TEXT NOT NULL DEFAULT 'UJI_TERBATAS',
    "namaLawan" TEXT,
    "beratLawan" DOUBLE PRECISION,
    "ronde" INTEGER,
    "hasil" TEXT NOT NULL,
    "catatan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RiwayatTarung_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Log" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER,
    "aksi" TEXT NOT NULL,
    "entitas" TEXT NOT NULL,
    "entitasId" INTEGER,
    "detail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Kategori_nama_key" ON "Kategori"("nama");

-- CreateIndex
CREATE UNIQUE INDEX "Kategori_slug_key" ON "Kategori"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Ayam_slug_key" ON "Ayam"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Ayam_kodeRing_key" ON "Ayam"("kodeRing");

-- AddForeignKey
ALTER TABLE "Ayam" ADD CONSTRAINT "Ayam_kategoriId_fkey" FOREIGN KEY ("kategoriId") REFERENCES "Kategori"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AyamImage" ADD CONSTRAINT "AyamImage_ayamId_fkey" FOREIGN KEY ("ayamId") REFERENCES "Ayam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Permintaan" ADD CONSTRAINT "Permintaan_ayamId_fkey" FOREIGN KEY ("ayamId") REFERENCES "Ayam"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Laporan" ADD CONSTRAINT "Laporan_ayamId_fkey" FOREIGN KEY ("ayamId") REFERENCES "Ayam"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiwayatTarung" ADD CONSTRAINT "RiwayatTarung_ayamId_fkey" FOREIGN KEY ("ayamId") REFERENCES "Ayam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Log" ADD CONSTRAINT "Log_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

