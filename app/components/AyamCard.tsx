"use client";
import Link from "next/link";
import { Ayam, AyamImage, Kategori, RiwayatTarung } from "@prisma/client";
import { formatRupiah, rekapDari, usiaInfo, formatTanggal } from "@/lib/format";
import { waLink } from "@/lib/config";
import LaporTrigger from "./LaporTrigger";

type AyamWith = Ayam & { images: AyamImage[]; kategori: Kategori | null; riwayat: RiwayatTarung[] };

function MetaIcon({ kind }: { kind: "kal" | "berat" | "map" }) {
  const d =
    kind === "kal" ? (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M3 10h18M8 3v4M16 3v4" />
      </>
    ) : kind === "berat" ? (
      <>
        <path d="M3 17l3-3 4 4 8-8 3 3" />
        <path d="M14 6h4v4" />
      </>
    ) : (
      <>
        <path d="M12 21s-7-5.3-7-11a7 7 0 1 1 14 0c0 5.7-7 11-7 11z" />
        <circle cx="12" cy="10" r="2.6" />
      </>
    );
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      {d}
    </svg>
  );
}

export default function AyamCard({ ayam }: { ayam: AyamWith }) {
  const img = ayam.images.find((i) => i.isPrimary) || ayam.images[0];
  const usia = usiaInfo(ayam.tanggalMenetas);
  const rekap = rekapDari(ayam.riwayat);
  const sold = ayam.statusJual === "TERJUAL";
  const isBetina = ayam.jenisKelamin === "BETINA";

  return (
    <article className={`bird-card ${sold ? "sold" : ""}`}>
      <div className="bc-img">
        <Link href={`/ayam/${ayam.slug}`}>
          {img ? (
            <img src={img.filePath} alt={`${ayam.nama}, ${ayam.kategori?.nama ?? "ayam bangkok"}`} loading="lazy" decoding="async" />
          ) : (
            <div style={{ aspectRatio: "4/5", background: "var(--krem-200)", display: "grid", placeItems: "center", color: "var(--ink-faint)", fontSize: 13 }}>
              Belum ada foto
            </div>
          )}
        </Link>
        {ayam.statusJual === "TERSEDIA" && (
          <span className="badge-st badge-tersedia"><i /> Tersedia</span>
        )}
        {ayam.statusJual === "DIPESAN" && (
          <span className="badge-st badge-dipesan"><i /> Dipesan</span>
        )}
        {ayam.isFeatured && !sold && <span className="badge-st badge-feat">Unggulan</span>}
      </div>
      <div className="bc-body">
        <span className="bc-kat">{ayam.kategori?.nama ?? "Belum berkategori"}</span>
        <Link href={`/ayam/${ayam.slug}`}>
          <h3 className="bc-name">{ayam.nama}</h3>
        </Link>
        <span className="bc-kode">
          {[ayam.kodeRing, isBetina ? "betina" : "jantan"].filter(Boolean).join(" · ")}
        </span>
        <div className="bc-meta">
          {usia ? (
            <span>
              <MetaIcon kind="kal" /> <b>{usia.label}</b>
              <small> menetas {formatTanggal(ayam.tanggalMenetas)}</small>
            </span>
          ) : (
            <span style={{ color: "var(--ink-faint)", fontStyle: "italic" }}>tanggal menetas belum dicatat</span>
          )}
          <span>
            <MetaIcon kind="berat" /> {String(ayam.beratKg).replace(".", ",")} kg
          </span>
        </div>
        {isBetina ? (
          <div className="bc-laga" style={{ justifyContent: "flex-start" }}>
            <span className="d" style={{ fontStyle: "italic" }}>Indukan — bukan ayam laga, tidak diadu</span>
          </div>
        ) : rekap.total > 0 ? (
          <div className="bc-laga">
            <span className="lbl">Rekap laga</span>
            <span className="w">Menang <b>{rekap.menang}</b></span>
            <span className="l">Kalah <b>{rekap.kalah}</b></span>
            <span className="d">Seri <b>{rekap.seri}</b></span>
          </div>
        ) : null}
        <div className="bc-foot">
          {ayam.harga ? (
            <div className="price">
              {formatRupiah(ayam.harga)}
              <small>nego terbuka</small>
            </div>
          ) : (
            <div className="price ask">
              {sold ? "Terjual" : "Hubungi kami"}
              <small>{ayam.kategori?.nama}</small>
            </div>
          )}
          <div className="bc-cta">
            <a className="ic ic-wa" href={waLink(`Halo, saya tertarik dengan ${ayam.nama} (${ayam.kodeRing ?? ayam.slug}) di katalog Anda.`)} target="_blank" rel="noopener" aria-label="Hubungi via WhatsApp" title="Hubungi pemilik">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.6 8.6 0 0 1-3.7-.8L3 20l1-5.2a8.4 8.4 0 1 1 17-3.3z" /><path d="M8.6 8.9c.5 2.7 3.6 5.7 6.3 6.2l.6-1.6-1.9-1.2-.9.5c-.9-.5-2.4-2-2.9-2.9l.5-.9-1.2-1.9z" /></svg>
            </a>
            <Link className="btn btn-outline btn-sm" href={`/ayam/${ayam.slug}`}>Detail</Link>
            <LaporTrigger ayamId={ayam.id} nama={ayam.nama} variant="chip" />
          </div>
        </div>
      </div>
    </article>
  );
}
