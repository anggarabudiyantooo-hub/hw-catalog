"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { labelJenisFoto } from "@/lib/format";

type GalFoto = {
  id: number;
  filePath: string;
  altText?: string | null;
  jenisFoto?: string | null;
};

export default function GalleryView({
  namaAyam,
  images,
  sold,
  statusJual,
  overlayRight,
  overlayBottom,
}: {
  namaAyam: string;
  images: GalFoto[];
  sold: boolean;
  statusJual: string;
  overlayRight?: string;
  overlayBottom?: string;
}) {
  const n = images.length;
  const [idx, setIdx] = useState(0);
  const [open, setOpen] = useState(false);
  const [zoom, setZoom] = useState(1); // 1 = pas layar (fit)
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const drag = useRef<{ sx: number; sy: number; ox: number; oy: number } | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };
  const openAt = (i: number) => {
    setIdx(i);
    resetView();
    setOpen(true);
  };
  const step = (d: number) => {
    setIdx((p) => {
      const v = (p + d + n) % n;
      resetView();
      return v;
    });
  };

  // Keyboard saat lightbox terbuka
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (n > 1 && e.key === "ArrowRight") step(1);
      if (n > 1 && e.key === "ArrowLeft") step(-1);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, n]);

  const clampZoom = (z: number) => Math.min(6, Math.max(1, Math.round(z * 100) / 100));

  if (n === 0) {
    return (
      <div className="gmain">
        <div className="gframe">
          <div
            style={{
              aspectRatio: "4/5",
              background: "var(--krem-200)",
              display: "grid",
              placeItems: "center",
              color: "var(--ink-faint)",
            }}
          >
            Belum ada foto
          </div>
        </div>
      </div>
    );
  }

  const cur = images[idx];
  const grayscale = sold ? { filter: "grayscale(1)" } : undefined;

  return (
    <div className="gv">
      <div className="gmain">
        <div className="gframe">
          <button
            type="button"
            className="zoom-open"
            onClick={() => openAt(idx)}
            title="Klik untuk memperbesar"
            aria-label="Perbesar foto"
          >
            <img src={cur.filePath} alt={cur.altText || `${namaAyam} — foto ${idx + 1}`} style={grayscale} fetchPriority="high" />
            <span className="zoom-chip">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.3-4.3M8 11h6M11 8v6" />
              </svg>
              Perbesar
            </span>
          </button>
        </div>
        {statusJual === "TERSEDIA" && (
          <span className="badge-st badge-tersedia"><i /> Tersedia</span>
        )}
        {statusJual === "DIPESAN" && (
          <span className="badge-st badge-dipesan"><i /> Dipesan</span>
        )}
        {sold && <span className="badge-st badge-terjual"><i /> Terjual</span>}
        {overlayRight && <span className="g-chip g-tr">{overlayRight}</span>}
        {overlayBottom && <span className="g-chip g-bl">{overlayBottom}</span>}
      </div>

      {n > 1 && (
        <div className="gthumbs">
          {images.map((im, i) => (
            <button
              key={im.id}
              type="button"
              className={`gthumb ${i === idx ? "on" : ""}`}
              onClick={() => setIdx(i)}
              aria-label={`Lihat foto ${i + 1}`}
              style={{ position: "relative", display: "block" }}
            >
              <img
                src={im.filePath}
                alt={im.altText || `${namaAyam} — ${labelJenisFoto(im.jenisFoto)}`}
                style={grayscale}
                loading="lazy"
                decoding="async"
              />
              <span className="g-cap">
                {im.jenisFoto ? labelJenisFoto(im.jenisFoto) : `Foto ${i + 1}`}
              </span>
            </button>
          ))}
        </div>
      )}
      {sold && (
        <p className="g-note">
          Ayam ini sudah <b>terjual</b> — foto ditampilkan hitam-putih sebagai riwayat.
        </p>
      )}

      {/* ================= LIGHTBOX / ZOOM ================= */}
      {open &&
        typeof document !== "undefined" &&
        createPortal(
        <div className="lbox" role="dialog" aria-modal="true" aria-label={`Foto ${namaAyam}`}>
          <div className="lbox-dim" onClick={() => setOpen(false)} />
          <button className="lbox-x" onClick={() => setOpen(false)} aria-label="Tutup">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>

          {n > 1 && (
            <button className="lbox-arr prev" onClick={() => step(-1)} aria-label="Foto sebelumnya">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 5l-7 7 7 7" /></svg>
            </button>
          )}

          <div className="lbox-body">
            <div className="lbox-cap">
              <span>
                {namaAyam} — {labelJenisFoto(cur.jenisFoto) || `foto ${idx + 1}`}
              </span>
              {n > 1 && <span className="cnt">{idx + 1} / {n}</span>}
            </div>
            <div
              className="lbox-stage"
              ref={stageRef}
              onWheel={(e) => {
                const next = clampZoom(zoom + (e.deltaY < 0 ? 0.25 : -0.25));
                if (next !== zoom) setZoom(next);
              }}
              onPointerDown={(e) => {
                if (zoom <= 1) return;
                (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
                drag.current = { sx: e.clientX, sy: e.clientY, ox: pan.x, oy: pan.y };
              }}
              onPointerMove={(e) => {
                if (!drag.current) return;
                setPan({
                  x: drag.current.ox + (e.clientX - drag.current.sx),
                  y: drag.current.oy + (e.clientY - drag.current.sy),
                });
              }}
              onPointerUp={() => (drag.current = null)}
              onPointerCancel={() => (drag.current = null)}
              onDoubleClick={() => setZoom((z) => (z > 1 ? 1 : 2.5))}
              style={{ cursor: zoom > 1 ? "grab" : "zoom-in" }}
            >
              <div
                className="lbox-pan"
                style={{
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                }}
              >
                <img
                  src={cur.filePath}
                  alt={cur.altText || `${namaAyam} — foto ${idx + 1}`}
                  draggable={false}
                  style={grayscale}
                />
              </div>
              {zoom === 1 && (
                <span className="lbox-hint">Klik dua kali untuk memperbesar · gulir untuk zoom</span>
              )}
            </div>
            <div className="lbox-bar">
              <button type="button" onClick={() => setZoom((z) => clampZoom(z - 0.5))} aria-label="Perkecil">
                −
              </button>
              <span className="pct">{Math.round(zoom * 100)}%</span>
              <button type="button" onClick={() => setZoom((z) => clampZoom(z + 0.5))} aria-label="Perbesar">
                +
              </button>
              <button
                type="button"
                className="fit"
                onClick={() => {
                  resetView();
                }}
              >
                Pas layar
              </button>
              {zoom > 1 && <span className="drag-hint">Seret foto untuk menggeser</span>}
            </div>
          </div>

          {n > 1 && (
            <button className="lbox-arr next" onClick={() => step(1)} aria-label="Foto berikutnya">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5l7 7-7 7" /></svg>
            </button>
          )}
        </div>,
        document.body
      )}
    </div>
  );
}
