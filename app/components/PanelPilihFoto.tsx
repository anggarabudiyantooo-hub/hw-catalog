"use client";

import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";

const MAKS = 5 * 1024 * 1024; // 5 MB — sama dengan batas server

interface Pilihan {
  file: File;
  url: string; // pratinjau sementara (object URL)
  invalid: boolean;
  alasan?: string;
}

/**
 * Pemilih foto untuk form TAMBAH AYAM (server form, action="/api/panel/ayam").
 * Memberi PRATINJAU LANGSUNG begitu file dipilih: setiap file tampil sebagai
 * thumbnail (gambar asli) + ukuran + nama file, dan bisa dihapus dengan ×.
 * File yang valid tetap disinkronkan ke <input type="file" name="images">
 * sehingga satu formulir besar (data ayam + foto) tetap terkirim utuh.
 */
export default function PanelPilihFoto() {
  const [list, setList] = useState<Pilihan[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const adaInvalid = list.some((p) => p.invalid);
  const jumlahValid = list.filter((p) => !p.invalid).length;
  const totalKb = list.reduce((s, p) => s + (p.invalid ? 0 : p.file.size), 0);

  // Bersihkan object URL saat komponen dilepas.
  useEffect(() => {
    const urls = list.map((p) => p.url);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sinkronkan file terpilih ke input agar ikut terkirim bersama form induk.
  useEffect(() => {
    if (!inputRef.current) return;
    const dt = new DataTransfer();
    list.filter((p) => !p.invalid).forEach((p) => dt.items.add(p.file));
    inputRef.current.files = dt.files;
  }, [list]);

  function tambah(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const baru: Pilihan[] = files.map((file) => {
      const okTipe =
        file.type === "image/jpeg" ||
        file.type === "image/png" ||
        file.type === "image/webp";
      const okUkuran = file.size <= MAKS;
      return {
        file,
        url: URL.createObjectURL(file),
        invalid: !okTipe || !okUkuran,
        alasan: !okTipe
          ? "Bukan JPG/PNG/WebP"
          : !okUkuran
            ? "> 5 MB"
            : undefined,
      };
    });
    setList((l) => [...l, ...baru]);
    // Reset agar file yang sama bisa dipilih lagi.
    e.target.value = "";
  }

  function buang(idx: number) {
    const p = list[idx];
    if (!p) return;
    URL.revokeObjectURL(p.url);
    setList((l) => l.filter((_, i) => i !== idx));
  }

  return (
    <div className="pick-foto">
      <label className="dz" style={{ display: "block", cursor: "pointer", position: "relative" }}>
        <input
          ref={inputRef}
          type="file"
          name="images"
          multiple
          accept="image/jpeg,image/png,image/webp"
          onChange={tambah}
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0,
            cursor: "pointer",
            zIndex: 2,
            width: "100%",
            height: "100%",
          }}
        />
        <svg viewBox="0 0 24 24"><path d="M12 16V4M6 10l6-6 6 6" /><path d="M4 20h16" /></svg>
        <div>
          <b>Klik untuk memilih foto</b> — bisa beberapa sekaligus (JPG/PNG/WebP,
          maks. 5 MB)
        </div>
        <small>
          {list.length
            ? `${list.length} file dipilih${adaInvalid ? ` — ${jumlahValid} valid` : ""} — pratinjau di bawah adalah isi file asli.`
            : "Foto yang dipilih akan langsung tampil pratinjaunya di sini."}
        </small>
      </label>

      {list.length > 0 && (
        <div className="up-pre">
          {list.map((p, i) => (
            <div className={`up-chip pick${p.invalid ? " bad" : ""}`} key={i}>
              <img src={p.url} alt={p.file.name} />
              <span className="tag">{p.invalid ? p.alasan ?? "DITOLAK" : "BARU"}</span>
              <span className="nm" title={p.file.name}>{p.file.name}</span>
              {!p.invalid && (
                <span className="sz">{Math.max(1, Math.round(p.file.size / 1024))} KB</span>
              )}
              <button
                type="button"
                className="del"
                onClick={() => buang(i)}
                aria-label={`Buang ${p.file.name}`}
                title="Buang file ini"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {adaInvalid && (
        <p className="note-invalid">
          Ada file yang tidak bisa diunggah (bukan JPG/PNG/WebP atau lebih dari 5 MB).
          Hapus lewat tombol ×, lalu pilih ulang.
        </p>
      )}

      <small className="dz-hint">
        Foto pertama yang dipilih akan menjadi foto utama. Setelah tersimpan, atur
        jenis foto (Full badan / Kepala / Kaki / Bulu / ekor) di halaman kelola.
        {jumlahValid > 0 ? ` — ${jumlahValid} foto siap dikirim (±${Math.max(1, Math.round(totalKb / 1024))} KB).` : ""}
      </small>
    </div>
  );
}
