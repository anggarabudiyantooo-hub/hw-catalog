import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { SITE } from "@/lib/config";

export const metadata: Metadata = {
  title: {
    default: `${SITE.brand} — Galeri Ayam Bangkok · ${SITE.nama}`,
    template: `%s · ${SITE.brand}`,
  },
  description: `Etalase ayam bangkok pilihan dari ${SITE.nama}, Surakarta. Lihat katalog, galeri foto, riwayat laga, usia otomatis, dan info penjualan. Kunjungan wajib reservasi.`,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
