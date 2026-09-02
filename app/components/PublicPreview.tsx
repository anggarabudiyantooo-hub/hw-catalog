"use client";
import { useEffect, useState, type ReactNode } from "react";

/**
 * Tombol + jendela "Pratinjau Publik" untuk panel kelola ayam.
 * Menampilkan anak (children) — rendering publik — di dalam overlay, tanpa
 * harus membuka tab baru atau mensyaratkan ayam berstatus PUBLIKASI.
 */
export default function PublicPreview({
  label = "Previu Publik",
  note,
  children,
}: {
  label?: string;
  note?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button type="button" className="btn btn-sec pv-open" onClick={() => setOpen(true)}>
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.9">
          <path d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12z" />
          <circle cx="12" cy="12" r="2.6" />
        </svg>
        {label}
      </button>

      {open && (
        <div className="pv-ov" role="dialog" aria-modal="true" aria-label="Pratinjau tampilan publik">
          <div className="pv-dim" onClick={() => setOpen(false)} />
          <div className="pv-card">
            <div className="pv-head">
              <span className="pv-title">Pratinjau — seperti dilihat pengunjung</span>
              {note && <span className="pv-note">{note}</span>}
              <button className="pv-x" onClick={() => setOpen(false)} aria-label="Tutup pratinjau">
                ×
              </button>
            </div>
            <div className="pv-body">{children}</div>
          </div>
        </div>
      )}
    </>
  );
}
