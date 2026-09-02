"use client";
import { useState, type FormEvent } from "react";

const JENIS = [
  "Info tidak diperbarui (mis. sudah laku / harga beda)",
  "Sudah terjual tapi masih tampil tersedia",
  "Foto atau data keliru",
  "Lainnya",
];

export default function LaporTrigger({
  ayamId,
  nama,
  variant = "link",
}: {
  ayamId: number;
  nama: string;
  variant?: "link" | "chip";
}) {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    fd.set("ayamId", String(ayamId));
    fd.set("nama", nama);
    try {
      const r = await fetch("/api/laporan", { method: "POST", body: fd });
      if (!r.ok) throw new Error("gagal");
      setDone(true);
      setOpen(false);
    } catch {
      setError("Gagal mengirim laporan. Coba lagi.");
    }
  }

  const modal = open ? (
    <div className="rmodal show" onClick={() => setOpen(false)}>
      <div className="rmodal-card" onClick={(e) => e.stopPropagation()}>
        <div className="rh">
          <h3>Laporkan masalah</h3>
          <button type="button" onClick={() => setOpen(false)} aria-label="Tutup">×</button>
        </div>
        <p className="rs">
          Memberi tahu pengelola bila ada yang tidak beres pada <b>{nama}</b> — mis. sudah laku tapi masih tampil, atau datanya tidak diperbarui.
        </p>
        <form onSubmit={submit}>
          <div className="f">
            <label>Jenis masalah</label>
            <select name="jenis" defaultValue={JENIS[0]}>
              {JENIS.map((j) => (
                <option key={j} value={j}>{j}</option>
              ))}
            </select>
          </div>
          <div className="f">
            <label>Keterangan (opsional)</label>
            <textarea name="isi" rows={3} placeholder="Ceritakan singkat…" />
          </div>
          <div className="form-foot" style={{ marginTop: 12 }}>
            <button className="btn btn-primary" type="submit">Kirim Laporan</button>
            <button className="btn btn-sec" type="button" onClick={() => setOpen(false)}>Batal</button>
            <span className="hint">Hanya pemberitahuan ke pengelola.</span>
          </div>
        </form>
      </div>
    </div>
  ) : null;

  if (variant === "chip") {
    return (
      <>
        <button type="button" className="ic ic-flag" title="Laporkan masalah / info tidak update" aria-label="Laporkan masalah" onClick={() => { setOpen(true); setDone(false); }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 21V4" /><path d="M6 4h10l-1.8 3.3L16 11H6" /></svg>
        </button>
        {modal}
        {done && <p className="ok-note" style={{ gridColumn: "1/-1" }}>Laporan terkirim — terima kasih.</p>}
      </>
    );
  }

  return (
    <div style={{ textAlign: "center", padding: "4px 24px 8px" }}>
      {done && <p className="ok-note">Laporan terkirim — terima kasih, pengelola akan memeriksanya.</p>}
      {error && <p className="flash flash-err">{error}</p>}
      <div className="rep-mini">
        <span className="sep"></span>
        <p>
          Menemukan data yang keliru atau tidak diperbarui?{" "}
          <button type="button" className="link" onClick={() => { setOpen(true); setDone(false); }}>Laporkan masalah</button>
        </p>
        <span className="sep"></span>
      </div>
      {modal}
    </div>
  );
}
