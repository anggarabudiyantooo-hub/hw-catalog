import { cache } from "react";
import { prisma } from "./prisma";
import { SITE } from "./config";

/**
 * ============================================================
 * SATU SUMBER DATA KONTAK & INFO SITUS (server-only).
 * ============================================================
 * Semua kontak yang tampil di halaman pengunjung (nomor WhatsApp, email,
 * alamat, peta, jam layanan, nama pemilik) diambil dari sini — gabungan
 * nilai default (lib/config.ts) dengan baris SiteSetting (id = 1) yang
 * diedit pemilik lewat panel. Bila tabel belum ada / belum diisi, otomatis
 * jatuh kembali ke nilai default sehingga situs tetap tampil normal.
 *
 * Catatan: file ini mengimpor Prisma — JANGAN diimpor dari komponen
 * "use client". Komponen client menerima nilai lewat props dari induk
 * server-nya (atau memakai fallback lib/config.ts).
 */

export type SiteInfo = typeof SITE;

export const getSite = cache(async (): Promise<SiteInfo> => {
  try {
    const row = await prisma.siteSetting.findUnique({ where: { id: 1 } });
    if (row) {
      const { id: _id, updatedAt: _updatedAt, ...nilai } = row;
      return { ...SITE, ...nilai };
    }
  } catch {
    // tabel belum dibuat / database belum siap → pakai nilai default
  }
  return SITE;
});

export type PapanItem = {
  id: number;
  jenis: string;
  judul: string;
  pesan: string;
  kedip: boolean;
};

/** Papan pengumuman aktif untuk halaman pengunjung (urut: urutan lalu terbaru). */
export const getPapan = cache(async (): Promise<PapanItem[]> => {
  try {
    return await prisma.papanInfo.findMany({
      where: { aktif: true },
      orderBy: [{ urutan: "asc" }, { updatedAt: "desc" }],
      select: { id: true, jenis: true, judul: true, pesan: true, kedip: true },
    });
  } catch {
    return [];
  }
});
