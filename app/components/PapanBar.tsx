"use client";

import { useEffect, useState } from "react";

/**
 * Papan pengumuman publik — pita kaca (frosted glass) bergaya Apple yang
 * muncul paling atas segera saat halaman pengunjung dimuat.
 * Isi (judul, pesan, jenis, kedap-kedip) datang dari panel pemilik;
 * tombol × menutup papan untuk sesi ini saja (muncul lagi di kunjungan berikutnya).
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

const IKON: Record<string, string> = {
  PERINGATAN: "M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0zM12 9v4m0 4h.01",
  IKLAN: "M3 11.5 20.4 4.6a.6.6 0 0 1 .8.8L14.3 22.8a.6.6 0 0 1-1.1 0l-2.6-6-6-2.6a.6.6 0 0 1 0-1.1z",
  INFO: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zm0-13.2h.01M11.4 12H12v4.2h.6",
};

function PapanSatu({ item }: { item: PapanBarProps["items"][number] }) {
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

  const jenis = item.jenis in IKON ? item.jenis : "INFO";

  return (
    <div className={`papan-item j-${jenis}${item.kedip ? " kedip" : ""}`} role="status" aria-live="polite">
      <span className="p-dot" aria-hidden="true" />
      <svg className="p-ikon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d={IKON[jenis]} />
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

export default function PapanBar({ items }: PapanBarProps) {
  if (!items.length) return null;
  return (
    <div className="papan">
      <div className="papan-in">
        {items.map((it) => (
          <PapanSatu key={it.id} item={it} />
        ))}
      </div>
    </div>
  );
}
