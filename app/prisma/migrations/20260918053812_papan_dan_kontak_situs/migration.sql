-- AlterTable
ALTER TABLE "Log" ADD COLUMN     "browser" TEXT,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "ip" TEXT,
ADD COLUMN     "kota" TEXT,
ADD COLUMN     "negara" TEXT,
ADD COLUMN     "os" TEXT,
ADD COLUMN     "perangkat" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "aktif" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "izin" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'ADMIN';

-- CreateTable
CREATE TABLE "PapanInfo" (
    "id" SERIAL NOT NULL,
    "jenis" TEXT NOT NULL DEFAULT 'PERINGATAN',
    "judul" TEXT NOT NULL,
    "pesan" TEXT NOT NULL,
    "aktif" BOOLEAN NOT NULL DEFAULT false,
    "kedip" BOOLEAN NOT NULL DEFAULT true,
    "urutan" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PapanInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteSetting" (
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
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSetting_pkey" PRIMARY KEY ("id")
);
