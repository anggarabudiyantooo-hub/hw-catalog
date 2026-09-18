"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Papan pengumuman publik — dua bentuk sesuai jenisnya (dikelola pemilik
 * dari panel, tanpa sentuh kode):
 *
 * 1) PERINGATAN → JENDELA PERINGATAN di tengah layar, gaya dialog Windows:
 *    judul merah di tengah + pesan di bawahnya + tombol OK. Selalu muncul
 *    setiap kali halaman dimuat / dimuat ulang — penutupan TIDAK diingat,
 *    jadi pengunjung selalu melihat peringatan yang sedang berlaku.
 * 2) IKLAN / INFO → pita kaca di bagian atas halaman. Cukup sekali ditutup
 *    per sesi kunjungan (sessionStorage) agar tidak mengganggu.
 */

export type PapanBarProps = {
  items: {
    id: number;
    jenis: string;
    judul: string;
    pesan: string;
    kedip: boolean;
  }[];
};

const IKON_PITA: Record<string, string> = {
  IKLAN: "M3 11.5 20.4 4.6a.6.6 0 0 1 .8.8L14.3 22.8a.6.6 0 0 1-1.1 0l-2.6-6-6-2.6a.6.6 0 0 1 0-1.1z",
  INFO: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zm0-13.2h.01M11.4 12H12v4.2h.6",
};

/* ---------------- Pita atas (IKLAN / INFO) ---------------- */

function PapanPita({ item }: { item: PapanBarProps["items"][number] }) {
  const [tutup, setTutup] = useState(false);
  const [siap, setSiap] = useState(false);
  const kunci = `papan_tutup_${item.id}`;

  useEffect(() => {
    try {
      setTutup(window.sessionStorage.getItem(kunci) === "1");
    } catch {
      /* sessionStorage diblokir → biarkan tampil */
    }
    setSiap(true);
  }, [kunci]);

  if (siap && tutup) return null;

  const jenis = item.jenis in IKON_PITA ? item.jenis : "INFO";

  return (
    <div className={`papan-item j-${jenis}${item.kedip ? " kedip" : ""}`} role="status" aria-live="polite">
      <span className="p-dot" aria-hidden="true" />
      <svg className="p-ikon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d={IKON_PITA[jenis]} />
      </svg>
      <span className="papan-teks">
        <strong className="papan-judul">{item.judul}</strong>
        {item.pesan ? <span className="papan-pesan">{item.pesan}</span> : null}
      </span>
      <button
        type="button"
        className="papan-tutup"
        aria-label="Tutup pengumuman ini"
        onClick={() => {
          setTutup(true);
          try {
            window.sessionStorage.setItem(kunci, "1");
          } catch {
            /* abaikan bila sessionStorage diblokir */
          }
        }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>
    </div>
  );
}

/* ------- Jendela peringatan di tengah (PERINGATAN) ------- */

function PapanJendela({ items }: { items: PapanBarProps["items"] }) {
  const [tutup, setTutup] = useState(false);
  const tombolOk = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (tutup) return;
    // Kunci gulir halaman selama jendela terbuka ( perilaku dialog modal ).
    const sebelum = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    tombolOk.current?.focus();
    const tekan = (e: KeyboardEvent) => {
      if (e.key === "Escape") setTutup(true);
    };
    window.addEventListener("keydown", tekan);
    return () => {
      document.body.style.overflow = sebelum;
      window.removeEventListener("keydown", tekan);
    };
  }, [tutup]);

  // Tidak ada penyimpanan penutupan — jendela muncul lagi di setiap muat ulang.
  if (tutup) return null;

  return (
    <div className="papan-modal" role="alertdialog" aria-modal="true" aria-label={items[0]?.judul || "Peringatan"}>
      <div className="papan-modal-veil" onClick={() => setTutup(true)} aria-hidden="true" />
      <div className="papan-kotak">
        {items.map((it) => (
          <div key={it.id} className="papan-jendela-isi">
            <span className={`papan-simbol${it.kedip ? " kedip" : ""}`} aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0zM12 9v4m0 4h.01" />
              </svg>
            </span>
            <h2 className="papan-jendela-judul">{it.judul}</h2>
            {it.pesan ? <p className="papan-jendela-pesan">{it.pesan}</p> : null}
          </div>
        ))}
        <button ref={tombolOk} type="button" className="papan-jendela-ok" onClick={() => setTutup(true)}>
          OK — Mengerti
        </button>
      </div>
    </div>
  );
}

export default function PapanBar({ items }: PapanBarProps) {
  if (!items.length) return null;
  const jendela = items.filter((i) => i.jenis === "PERINGATAN");
  const pita = items.filter((i) => i.jenis !== "PERINGATAN");
  return (
    <>
      {pita.length > 0 && (
        <div className="papan">
          <div className="papan-in">
            {pita.map((it) => (
              <PapanPita key={it.id} item={it} />
            ))}
          </div>
        </div>
      )}
      {jendela.length > 0 && <PapanJendela items={jendela} />}
    </>
  );
}
