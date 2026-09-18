"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Prisma } from "@prisma/client";
import AyamCard from "./AyamCard";

type AyamFull = Prisma.AyamGetPayload<{
  include: { images: true; kategori: true; riwayat: true };
}>;
type Kat = { id: number; nama: string; slug: string };

/**
 * Jelajah katalog tanpa reload: seluruh koleksi sudah dikirim sekali dari
 * server (di-cache ISR), lalu penyaringan/urutkan dijalankan langsung di
 * browser — klik filter tidak lagi menunggu server/cold-start.
 */
export default function KatalogBrowser({
  items,
  kategori,
  waNumber,
}: {
  items: AyamFull[];
  kategori: Kat[];
  waNumber?: string;
}) {
  const [q, setQ] = useState("");
  const [kat, setKat] = useState("");
  const [kel, setKel] = useState("");
  const [st, setSt] = useState("tersedia");
  const [sort, setSort] = useState("terbaru");
  const [siap, setSiap] = useState(false);

  // Baca query string sekali (mis. /katalog?kat=... dari beranda) lalu sinkronkan URL.
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    setQ(p.get("q")?.trim() ?? "");
    setKat(p.get("kat") ?? "");
    setKel(p.get("kel") ?? "");
    const stIni = p.get("st");
    setSt(stIni ?? "tersedia");
    setSort(p.get("sort") ?? "terbaru");
    setSiap(true);
  }, []);

  useEffect(() => {
    if (!siap) return;
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (kat) p.set("kat", kat);
    if (kel) p.set("kel", kel);
    if (st && st !== "tersedia") p.set("st", st);
    if (sort && sort !== "terbaru") p.set("sort", sort);
    const s = p.toString();
    history.replaceState(null, "", s ? `/katalog?${s}` : "/katalog");
  }, [q, kat, kel, st, sort, siap]);

  const list = useMemo(() => {
    const teks = q.trim().toLowerCase();
    let out = items.filter((a) => {
      if (st === "tersedia" && a.statusJual === "TERJUAL") return false;
      if (st === "dipesan" && a.statusJual !== "DIPESAN") return false;
      if (st === "terjual" && a.statusJual !== "TERJUAL") return false;
      if (kat && a.kategori?.slug !== kat) return false;
      if (kel && a.jenisKelamin !== kel.toUpperCase()) return false;
      if (teks) {
        const gabung = [a.nama, a.kodeRing ?? "", a.kategori?.nama ?? ""]
          .join(" ")
          .toLowerCase();
        if (!gabung.includes(teks)) return false;
      }
      return true;
    });
    if (sort === "termahal") out.sort((a, b) => (b.harga ?? -1) - (a.harga ?? -1));
    else if (sort === "termurah") out.sort((a, b) => (a.harga ?? 1e12) - (b.harga ?? 1e12));
    else if (sort === "nama") out.sort((a, b) => a.nama.localeCompare(b.nama, "id"));
    else out.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    return out;
  }, [items, q, kat, kel, st, sort]);

  const reset = () => {
    setQ("");
    setKat("");
    setKel("");
    setSt("tersedia");
    setSort("terbaru");
  };

  const adaFilter = q || kat || kel || st !== "tersedia" || sort !== "terbaru";

  return (
    <div className="wrap">
      <div className="toolbar">
        <div className="field grow">
          <label>Cari nama / kode</label>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="mis. Rajawali, BKT-007…"
          />
        </div>
        <div className="field">
          <label>Kategori</label>
          <select value={kat} onChange={(e) => setKat(e.target.value)}>
            <option value="">Semua kategori</option>
            {kategori.map((k) => (
              <option key={k.id} value={k.slug}>
                {k.nama}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Jenis kelamin</label>
          <select value={kel} onChange={(e) => setKel(e.target.value)}>
            <option value="">Semua</option>
            <option value="JANTAN">Jantan</option>
            <option value="BETINA">Betina</option>
          </select>
        </div>
        <div className="field">
          <label>Status</label>
          <select value={st} onChange={(e) => setSt(e.target.value)}>
            <option value="tersedia">Tersedia</option>
            <option value="semua">Semua status</option>
            <option value="dipesan">Dipesan</option>
            <option value="terjual">Terjual</option>
          </select>
        </div>
        <div className="field">
          <label>Urutkan</label>
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="terbaru">Terbaru</option>
            <option value="termahal">Termahal</option>
            <option value="termurah">Termurah</option>
            <option value="nama">Nama A–Z</option>
          </select>
        </div>
        {adaFilter && (
          <button className="btn btn-sec" type="button" onClick={reset}>
            Reset
          </button>
        )}
        <span className="res">Menampilkan {list.length} ekor</span>
      </div>

      <div className="block" style={{ paddingTop: 0 }}>
        <div className="wrap" style={{ padding: 0 }}>
          {list.length === 0 ? (
            <p
              style={{
                textAlign: "center",
                color: "var(--ink-muted)",
                fontStyle: "italic",
                padding: "30px 0",
              }}
            >
              Tidak ada ayam yang cocok dengan filter ini.
            </p>
          ) : (
            <div className="cards">
              {list.map((a) => (
                <AyamCard key={a.id} ayam={a} />
              ))}
            </div>
          )}
          {adaFilter && (
            <nav className="pager">
              <button
                className="btn btn-sec btn-sm"
                type="button"
                style={{ cursor: "pointer", border: "1px solid var(--krem-300)" }}
                onClick={reset}
              >
                Reset filter
              </button>
            </nav>
          )}
          <p style={{ textAlign: "center", margin: "14px 0 6px" }}>
            <Link href="/" style={{ color: "var(--bata-700)", fontSize: 13 }}>
              ← Kembali ke Beranda
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
