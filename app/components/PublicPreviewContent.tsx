import type { Ayam, AyamImage, Kategori, RiwayatTarung } from "@prisma/client";
import { formatRupiah, formatTanggal, usiaInfo, rekapDari, labelJenisFoto } from "@/lib/format";
import { waLinkDari } from "@/lib/config";
import { getSite } from "@/lib/site";
import GalleryView from "./GalleryView";

type AyamFull = Ayam & {
  images: AyamImage[];
  kategori: Kategori | null;
  riwayat: RiwayatTarung[];
};

const JALU: Record<string, string> = { BELUM: "Belum tumbuh", TUNGGAL: "Tunggal", GANDA: "Ganda" };

/** Replika tampilan halaman publik (detail ayam) untuk pratinjau di panel. */
export default async function PublicPreviewContent({ ayam }: { ayam: AyamFull }) {
  const site = await getSite();
  const isBetina = ayam.jenisKelamin === "BETINA";
  const sold = ayam.statusJual === "TERJUAL";
  const usia = usiaInfo(ayam.tanggalMenetas);
  const rekap = rekapDari(ayam.riwayat);
  const publik = ayam.statusTampil === "PUBLIKASI" && !ayam.isArsip;

  const spec: [string, string | null][] = [
    ["Jenis kelamin", isBetina ? "Betina" : "Jantan"],
    [
      "Tanggal menetas",
      ayam.tanggalMenetas ? formatTanggal(ayam.tanggalMenetas, true) + " (perkiraan pencatatan kandang)" : null,
    ],
    ["Usia saat ini", usia ? `± ${usia.bulan} bulan — dihitung otomatis, selalu terbaru` : null],
    ["Berat badan", `${String(ayam.beratKg).replace(".", ",")} kg`],
    ["Postur / ukuran badan", ayam.postur],
    ["Tinggi punggung", ayam.tinggiCm != null ? `± ${ayam.tinggiCm} cm` : null],
    ["Kaki & sisik", ayam.kakiSisik],
    ["Jalu", ayam.jalu ? JALU[ayam.jalu] ?? ayam.jalu : null],
    ["Warna bulu", ayam.warnaBulu],
    ["Nomor ring", ayam.kodeRing ? `${ayam.kodeRing} (terdaftar)` : "Belum ber-ring"],
  ].filter(([, v]) => v !== null) as [string, string][];

  return (
    <div className="pv-wrap">
      <div className="pv-bread">
        Beranda · Katalog · <b>{ayam.nama}</b>
      </div>

      <div className="pv-grid">
        {/* galeri publik */}
        <div className="pv-gal">
          <GalleryView
            namaAyam={ayam.nama}
            images={ayam.images}
            sold={sold}
            statusJual={ayam.statusJual}
            overlayRight={ayam.kategori?.nama ?? undefined}
            overlayBottom={ayam.kodeRing ?? undefined}
          />
        </div>

        {/* info publik */}
        <div className="pv-info">
          <span className="pv-cap">
            {ayam.kategori?.nama ?? "Belum berkategori"} · {isBetina ? "Betina" : "Jantan"}
          </span>
          <h2 className="pv-name">{ayam.nama}</h2>
          <div className="pv-ring">
            {[ayam.kodeRing ?? "Tanpa nomor ring", ayam.kategori?.nama].filter(Boolean).join(" · ")}
          </div>

          <dl className="pv-spec">
            {spec.map(([k, v]) => (
              <div className="pv-srow" key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>

          <div className="pv-rekap">
            <span className="pv-rek-lbl">Rekap laga</span>
            {isBetina ? (
              <span className="pv-betina">Indukan — bukan ayam laga, tidak diadu</span>
            ) : rekap.total > 0 ? (
              <>
                <span className="pv-w">Menang <b>{rekap.menang}</b></span>
                <span className="pv-l">Kalah <b>{rekap.kalah}</b></span>
                <span className="pv-d">Seri <b>{rekap.seri}</b></span>
                <span className="pv-total">Total {rekap.total} laga</span>
              </>
            ) : (
              <span className="pv-betina">Belum ada catatan laga</span>
            )}
          </div>

          <div className="pv-foot">
            <div className={`pv-price${!ayam.harga ? " ask" : ""}`}>
              {ayam.harga ? formatRupiah(ayam.harga) : sold ? "Terjual" : "Hubungi kami"}
              {ayam.harga && <small>nego terbuka</small>}
            </div>
            {!sold && (
              <a
                className="btn btn-primary btn-sm"
                href={waLinkDari(site.waNumber, `Halo, saya tertarik dengan ${ayam.nama} (${ayam.kodeRing ?? ayam.slug}) di situs Anda.`)}
                target="_blank"
                rel="noopener"
              >
                Hubungi via WhatsApp
              </a>
            )}
          </div>

          <p className="pv-visit">Kunjungan kandang wajib reservasi (janji temu) — lihat halaman Lokasi.</p>

          {publik && (
            <a className="pv-ext" href={`/ayam/${ayam.slug}`} target="_blank" rel="noopener">
              Buka di situs publik ↗
            </a>
          )}
          {ayam.statusTampil === "DRAFT" && <span className="pv-st-draft">Belum dipublikasikan (draf)</span>}
          {ayam.isArsip && <span className="pv-st-draft">Diarsipkan — tidak tampil publik</span>}
        </div>
      </div>

      {imagesNote(ayam)}
    </div>
  );
}

function imagesNote(ayam: AyamFull) {
  const ada = new Set(ayam.images.map((i) => i.jenisFoto).filter(Boolean) as string[]);
  const wajib = ["FULL_BADAN", "KEPALA", "KAKI"];
  const kurang = wajib.filter((w) => !ada.has(w));
  return (
    <div className="pv-gnote">
      Galeri publik menampilkan {ayam.images.length} foto
      {ayam.images.map((im, i) => (
        <span key={im.id} className="pv-tag">
          {im.isPrimary ? "Foto utama" : i === 0 ? "" : ""} {labelJenisFoto(im.jenisFoto)}
        </span>
      ))}
      {kurang.length > 0 && (
        <span className="pv-miss"> — jenis wajib belum lengkap: {kurang.map((k) => labelJenisFoto(k)).join(", ")}</span>
      )}
    </div>
  );
}
