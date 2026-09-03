"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * Tombol menu untuk panel di layar sempit (≤980px). Navigasi panel
 * (Data Ayam, Kategori, dst.) disembunyikan oleh CSS di mobile; tombol ini
 * membukanya sebagai panel gulir yang muncul di bawah kepala merek. Menu
 * otomatis tertutup saat berpindah halaman (pathname berubah) atau saat
 * tombol/backdrop diklik.
 */
export default function PanelNavDrawer() {
  const [open, setOpen] = useState(false);
  const path = usePathname();

  useEffect(() => {
    if (open) {
      document.body.classList.add("panel-nav-open");
      document.querySelector(".side")?.classList.add("open");
    } else {
      document.body.classList.remove("panel-nav-open");
      document.querySelector(".side")?.classList.remove("open");
    }
    return () => {
      document.body.classList.remove("panel-nav-open");
      document.querySelector(".side")?.classList.remove("open");
    };
  }, [open]);

  // Tutup menu saat navigasi berpindah halaman.
  useEffect(() => {
    setOpen(false);
  }, [path]);

  function tutup() {
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        className="side-toggle"
        aria-expanded={open}
        aria-label={open ? "Tutup menu panel" : "Buka menu panel"}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? (
          <svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" /></svg>
        ) : (
          <svg viewBox="0 0 24 24"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
        )}
      </button>
      {open && (
        <button
          type="button"
          className="side-backdrop"
          aria-label="Tutup menu panel"
          onClick={tutup}
        />
      )}
    </>
  );
}
