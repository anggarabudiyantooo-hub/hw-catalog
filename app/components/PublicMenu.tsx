"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SITE, waLink } from "@/lib/config";

const LINKS = [
  { href: "/", label: "Beranda" },
  { href: "/katalog", label: "Katalog Ayam" },
  { href: "/#lokasi", label: "Lokasi & Kunjungan" },
];

/**
 * Menu hamburger untuk header publik di layar sempit (≤760px). Di desktop,
 * tautan navigasi tampil seperti biasa; tombol ini hanya muncul di mobile dan
 * membuka panel menu berisi tautan + tombol Hubungi. Menutup sendiri saat
 * berpindah halaman.
 *
 * `waHref` = tautan WhatsApp dari sumber terpusat (panel pemilik), dikirim
 * oleh induk server; bila kosong jatuh ke konfigurasi default.
 */
export default function PublicMenu({ waHref }: { waHref?: string }) {
  const [open, setOpen] = useState(false);
  const path = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [path]);

  const is = (href: string) => {
    if (href === "/") return path === "/";
    if (href.startsWith("/#")) return false;
    return path.startsWith(href);
  };

  return (
    <>
      <button
        type="button"
        className="pub-burger"
        aria-expanded={open}
        aria-label={open ? "Tutup menu" : "Buka menu"}
        aria-controls="pub-menu-mobile"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? (
          <svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" /></svg>
        ) : (
          <svg viewBox="0 0 24 24"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
        )}
      </button>

      {open && (
        <nav className="pub-mnav" id="pub-menu-mobile">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={is(l.href) ? "on" : ""}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          <a
            className="btn btn-primary pub-mhubungi"
            href={waHref ?? waLink(
              `Halo ${SITE.pemilik}, saya ingin bertanya tentang ayam Bangkok di ${SITE.nama}.`
            )}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
          >
            Hubungi via WhatsApp
          </a>
        </nav>
      )}
    </>
  );
}
