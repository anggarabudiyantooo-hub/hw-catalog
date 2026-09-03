"use client";

import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";

const MAKS = 5 * 1024 * 1024; // 5 MB — sama dengan batas server

const JENIS_FOTO = [
  ["FULL_BADAN", "Full badan"],
  ["KEPALA", "Kepala"],
  ["KAKI", "Kaki"],
  ["BULU", "Bulu / ekor"],
  ["LAINNYA", "Lainnya"],
] as const;

interface Pilihan {
  file: File;
  url: string; // pratinjau sementara (object URL)
  invalid: boolean;
  alasan?: string;
}

/**
 * Pemilih foto galeri dengan PRATINJAU LANGSUNG: begitu file dipilih,
 * thumbnail langsung tampil di layar (belum disimpan). Tombol submit baru
 * benar-benar mengunggah ke server — sebelumnya tidak ada umpan balik
 * sehingga pengguna tidak tahu apakah gambar sudah terpilih/terunggah.
 */
export default function PanelTambahFoto({
  ayamId,
  nama,
}: {
  ayamId: number;
  nama: string;
}) {
  const [list, setList] = useState<Pilihan[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const adaInvalid = list.some((p) => p.invalid);
  const totalKb = list.reduce((s, p) => s + (p.invalid ? 0 : p.file.size), 0);

  // Bersihkan URL pratinjau saat komponen dilepas.
  useEffect(() => {
    const urls = list.map((p) => p.url);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Jaga input tetap sinkron: form hanya mengirim file yang masih dipilih.
  useEffect(() => {
    if (!inputRef.current) return;
    const dt = new DataTransfer();
    list.forEach((p) => dt.items.add(p.file));
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
    <div>
      <form
        method="post"
        action={`/api/panel/ayam/${ayamId}`}
        encType="multipart/form-data"
      >
        <label
          htmlFor="newImg"
          className="dz"
          style={{
            marginBottom: list.length ? 4 : 10,
            cursor: "pointer",
            display: "block",
            position: "relative",
          }}
        >
          <input
            ref={inputRef}
            type="file"
            name="newImages"
            multiple
            accept="image/jpeg,image/png,image/webp"
            id="newImg"
            onChange={tambah}
            style={{
              position: "absolute",
              inset: 0,
              opacity: 0,
              cursor: "pointer",
              zIndex: 2,
            }}
          />
          <svg viewBox="0 0 24 24">
            <path d="M12 16V4M6 10l6-6 6 6" />
            <path d="M4 20h16" />
          </svg>
          <div>
            <b>Klik untuk memilih foto</b> — bisa beberapa sekaligus
            (JPG/PNG/WebP, maks. 5 MB)
          </div>
          <small>
            {list.length
              ? `${list.length} file terpilih — belum disimpan. Pratinjau di bawah adalah isi file asli; tekan “Unggah + Simpan Data” untuk benar-benar mengirim.`
              : "Pilih foto, pratinjau akan langsung muncul di sini."}
          </small>
        </label>

        {list.length > 0 && (
          <div className="up-pre" style={{ marginBottom: 10 }}>
            {list.map((p, i) => (
              <div className="up-chip pick" key={i}>
                <img src={p.url} alt={p.file.name} />
                <span className="tag">{p.invalid ? "DITOLAK" : "BARU"}</span>
                {!p.invalid && (
                  <span className="sz">
                    {Math.max(1, Math.round(p.file.size / 1024))} KB
                  </span>
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
          <p style={{ margin: "0 0 10px", color: "var(--bata-700)", fontSize: 12.5 }}>
            Ada file yang tidak bisa diunggah (bukan JPG/PNG/WebP atau lebih
            dari 5 MB). Hapus lewat tombol ×, lalu pilih ulang.
          </p>
        )}

        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <select
            name="newJenis"
            style={{
              padding: "8px 11px",
              fontSize: 13.5,
              border: "1px solid var(--krem-300)",
              borderRadius: 5,
              background: "var(--paper)",
            }}
          >
            {JENIS_FOTO.map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
          <button
            className="btn btn-sec"
            type="submit"
            disabled={!list.length || adaInvalid}
            title={
              !list.length
                ? "Pilih foto dulu"
                : adaInvalid
                  ? "Ada file yang melebihi ketentuan"
                  : `Unggah ${list.length} foto ke galeri ${nama}`
            }
          >
            Unggah + Simpan Data{list.length > 0 ? ` (${list.length})` : ""}
          </button>
          <span
            className="hint"
            style={{ fontSize: 12, color: "var(--ink-faint)" }}
          >
            {list.length
              ? adaInvalid
                ? "Perbaiki pilihan di atas agar bisa diunggah."
                : `±${Math.max(1, Math.round(totalKb / 1024))} KB siap dikirim.`
              : "Pilih foto untuk melihat pratinjau sebelum diunggah."}
          </span>
        </div>
      </form>
    </div>
  );
}
