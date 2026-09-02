import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { SITE } from "@/lib/config";

export const metadata: Metadata = {
  title: {
    default: `${SITE.brand} — ${SITE.tagline}`,
    template: `%s · ${SITE.brand}`,
  },
  description: `Etalase ayam bangkok pilihan dari ${SITE.nama} (Pedan, Klaten). Lihat katalog, galeri foto, riwayat laga, usia otomatis, dan info penjualan. Kunjungan wajib reservasi.`,
  icons: { icon: "/brand/hw-logo.png", apple: "/brand/hw-logo.png" },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
