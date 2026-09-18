import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import PublicLayout from "@/components/PublicLayout";
import PermintaanForm from "@/components/PermintaanForm";
import LaporTrigger from "@/components/LaporTrigger";
import GalleryView from "@/components/GalleryView";
import { prisma } from "@/lib/prisma";
import { formatRupiah, formatTanggal, usiaInfo, rekapDari } from "@/lib/format";
import { waLinkDari } from "@/lib/config";
import { getSite } from "@/lib/site";

const include = { images: true, kategori: true, riwayat: true };

// ISR: di-cache Vercel, disegarkan otomatis saat panel mengubah data.
export const revalidate = 60;

export async function generateStaticParams() {
  const rows = await prisma.ayam.findMany({
    where: { isArsip: false, statusTampil: "PUBLIKASI" },
    select: { slug: true },
  });
  return rows.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const [a, site] = await Promise.all([
    prisma.ayam.findUnique({ where: { slug: params.slug }, include: { kategori: true } }),
    getSite(),
  ]);
  return {
    title: a ? `${a.nama} (${a.kodeRing ?? "ayam bangkok"})` : "Ayam tidak ditemukan",
    description: a ? `Detail ${a.kodeRing ?? a.nama} · ${a.kategori?.nama ?? "Ayam bangkok"} di ${site.nama}.` : undefined,
  };
}

export default async function DetailPage({ params }: { params: { slug: string } }) {
  const [ayam, site] = await Promise.all([
    prisma.ayam.findUnique({
      where: { slug: params.slug },
      include,
    }),
    getSite(),
  ]);
  if (!ayam || ayam.isArsip || ayam.statusTampil !== "PUBLIKASI") notFound();

  const images = [...ayam.images].sort((a, b) =>
    a.isPrimary === b.isPrimary ? a.urutan - b.urutan : a.isPrimary ? -1 : 1
  );
  const usia = usiaInfo(ayam.tanggalMenetas);
  const rekap = rekapDari(ayam.riwayat);
  const riwayatSorted = [...ayam.riwayat].sort((a, b) => +new Date(b.tanggal) - +new Date(a.tanggal));
  const sold = ayam.statusJual === "TERJUAL";
  const isBetina = ayam.jenisKelamin === "BETINA";
  const katNama = ayam.kategori?.nama ?? "Ayam Bangkok";

  const lain = await prisma.ayam.findMany({
    where: { id: { not: ayam.id }, isArsip: false, statusTampil: "PUBLIKASI", statusJual: { not: "TERJUAL" } },
    include,
    take: 3,
    orderBy: { updatedAt: "desc" },
  });

  const spec: [string, ReactNode, boolean][] = [
    ["Kategori", `${katNama} · ${isBetina ? "Betina" : "Jantan"}`, false],
    ["Nomor Ring", ayam.kodeRing ? `${ayam.kodeRing}` : "Belum ber-ring", false],
    ["Jenis Kelamin", isBetina ? "Betina" : "Jantan", false],
    ["Tetas Estimasi", ayam.tanggalMenetas ? formatTanggal(ayam.tanggalMenetas) : "Belum dicatat", false],
    ["Usia", usia ? `± ${usia.bulan} bulan` : "—", true],
    ["Berat", `${String(ayam.beratKg).replace(".", ",")} kg`, false],
    ["Postur", ayam.postur ?? null, false],
    ["Tinggi Punggung", ayam.tinggiCm != null ? `± ${ayam.tinggiCm} cm` : null, false],
    ["Sisik / Kaki", ayam.kakiSisik ?? null, false],
    ["Taji / Jalu", ayam.jalu ? ({ BELUM: "Belum tumbuh", TUNGGAL: "Tunggal", GANDA: "Ganda" } as Record<string, string>)[ayam.jalu] : null, false],
    ["Warna Bulu", ayam.warnaBulu ?? null, false],
  ].filter(([, v]) => v !== null && v !== undefined) as [string, ReactNode, boolean][];

  const keunggulan = (ayam.keunggulan || "")
    .split("\n")
    .map((b) => b.trim())
    .filter(Boolean);

  const menang = rekap.menang;
  const kalah = rekap.kalah;
  const seri = rekap.seri;
  const winRate = rekap.total ? Math.round((menang / rekap.total) * 100) : 0;

  return (
    <PublicLayout>
      {/* ── Breadcrumb ── */}
      <div className="wrap pd-bread">
        <Link href="/">Beranda</Link>
        <span>/</span>
        <Link href="/katalog">Katalog</Link>
        <span>/</span>
        <span className="cur">{ayam.nama}</span>
      </div>

      {/* ── Produk: galeri + info ── */}
      <section className="wrap pd-main">
        <div className="detailgrid">
          {/* Galeri (sticky) */}
          <div className="pd-gal">
            <GalleryView
              namaAyam={ayam.nama}
              images={images}
              sold={sold}
              statusJual={ayam.statusJual}
              overlayRight={katNama}
              overlayBottom={ayam.kodeRing ?? undefined}
            />
          </div>

          {/* Info produk */}
          <div className="pd-info">
            <span className="pd-cap">{isBetina ? "Betina" : "Jantan"} · {katNama}</span>
            <h1>{ayam.nama}</h1>
            <p className="pd-sub">
              Ayam {katNama}{ayam.kodeRing ? ` · Ring No. ${ayam.kodeRing}` : ""}
            </p>

            {/* Harga */}
            <div className="pd-price">
              <span className="pd-price-lbl">{sold ? "Status" : "Harga Penawaran"}</span>
              {sold ? (
                <p className="pd-price-val">Terjual</p>
              ) : (
                <p className="pd-price-val">{ayam.harga ? formatRupiah(ayam.harga) : "Hubungi kami"}</p>
              )}
              <p className="pd-price-note">
                {sold
                  ? "Ayam ini telah terjual dan ditampilkan sebagai riwayat koleksi."
                  : "Termasuk surat ring & sertifikat asal kandang. Harga dapat dinegosiasi."}
              </p>
            </div>

            {/* Catatan kandang */}
            {ayam.deskripsi && (
              <div className="pd-note">
                <span className="pd-note-lbl">Catatan Kandang</span>
                <p className="pd-note-txt">“{ayam.deskripsi}”</p>
              </div>
            )}

            {/* CTA */}
            {!sold && (
              <>
                <div className="pd-cta">
                  <a
                    className="btn pd-wa"
                    href={waLinkDari(site.waNumber, `Halo ${site.pemilik}, saya tertarik dengan ${ayam.nama} (${ayam.kodeRing ?? ayam.slug}) di katalog Anda.`)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Tanya via WhatsApp
                  </a>
                  <a className="btn pd-minat" href="#minat">Saya Tertarik</a>
                </div>
                <p className="pd-reply">
                  Biasanya dibalas dalam 1×24 jam kerja · 08:00–17:00 WIB
                </p>
              </>
            )}

            {/* Spesifikasi */}
            <div className="pd-spec">
              <h2>Spesifikasi</h2>
              <div className="spec">
                {spec.map(([k, v, otomatis]) => (
                  <div className="cell" key={String(k)}>
                    <dt>{k}</dt>
                    <dd>
                      {v}
                      {otomatis && (
                        <small className="auto">dihitung otomatis dari tanggal menetas — selalu terbaru</small>
                      )}
                    </dd>
                  </div>
                ))}
              </div>
            </div>

            {/* Keunggulan */}
            {keunggulan.length > 0 && (
              <div className="pd-keung">
                <h2>Keunggulan</h2>
                <ul>
                  {keunggulan.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Laporkan */}
            <div className="pd-report">
              <LaporTrigger ayamId={ayam.id} nama={ayam.nama} variant="link" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Rekam Jejak ── */}
      {!isBetina && (
        <section className="wrap pd-fight">
          <div className="fr-card">
            <div className="fr-head">
              <div>
                <h2>Rekam Jejak Pertarungan</h2>
                <p className="fr-sub">
                  {rekap.total} pertandingan · Win rate {winRate}%
                </p>
              </div>
              {rekap.total > 0 && (
                <div className="fr-stats">
                  <div><b className="w">{menang}</b><span>Menang</span></div>
                  <i />
                  <div><b className="d">{seri}</b><span>Seri</span></div>
                  <i />
                  <div><b className="l">{kalah}</b><span>Kalah</span></div>
                </div>
              )}
            </div>

            <div className="fr-disclaimer">
              Semua pertarungan tercatat adalah uji terbatas / persahabatan, bukan pertandingan resmi yang
              memperebutkan taruhan.
            </div>

            {rekap.total > 0 ? (
              <div className="fr-table">
                <table>
                  <thead>
                    <tr>
                      <th>Tanggal</th>
                      <th>Lawan</th>
                      <th>Berat Lawan</th>
                      <th>Tipe</th>
                      <th>Catatan</th>
                      <th>Hasil</th>
                    </tr>
                  </thead>
                  <tbody>
                    {riwayatSorted.map((r) => (
                      <tr key={r.id}>
                        <td className="dt">{formatTanggal(r.tanggal)}</td>
                        <td className="strong">{r.namaLawan || "Lawan tidak dicatat"}</td>
                        <td>{r.beratLawan != null ? `${String(r.beratLawan).replace(".", ",")} kg` : "—"}</td>
                        <td>
                          {r.jenisLaga === "ADU_RESMI" ? "Adu resmi" : "Uji terbatas"}
                          {r.ronde != null ? ` · ronde ${r.ronde}` : ""}
                        </td>
                        <td>{r.catatan || "—"}</td>
                        <td>
                          <span className={`fr-res ${r.hasil === "MENANG" ? "win" : r.hasil === "KALAH" ? "loss" : "draw"}`}>
                            {r.hasil === "MENANG" ? "Menang" : r.hasil === "KALAH" ? "Kalah" : "Seri"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="fr-empty">
                Belum ada riwayat laga yang dicatat — hubungi pemilik untuk info lebih lanjut.
              </p>
            )}
          </div>
        </section>
      )}

      {/* ── Saya Tertarik ── */}
      {!sold && (
        <section id="minat" className="wrap pd-minat">
          <div className="minat-grid">
            <div>
              <h2>
                Saya Tertarik pada<br />
                {ayam.nama}
              </h2>
              <p className="minat-sub">
                Isi form di bawah dan kami akan menghubungi Anda via WhatsApp. Harga bisa
                dinegosiasi untuk pembeli serius.
              </p>
              <ul className="minat-list">
                <li><span>📋</span> Surat ring & sertifikat asal disertakan</li>
                <li><span>🚚</span> Pengiriman ke seluruh Indonesia (koordinasi)</li>
                <li><span>🤝</span> Negosiasi terbuka untuk pembeli serius</li>
                <li><span>📍</span> Kunjungan langsung wajib janjian terlebih dahulu</li>
              </ul>
            </div>
            <div className="minat-form">
              <PermintaanForm ayamId={ayam.id} namaAyam={ayam.nama} waNumber={site.waNumber} />
            </div>
          </div>
        </section>
      )}

      {/* ── Masih Menimbang? ── */}
      {lain.length > 0 && (
        <section className="wrap pd-related">
          <div className="rel-head">
            <h2>Masih Menimbang?</h2>
            <Link href="/katalog">Lihat semua →</Link>
          </div>
          <div className="rel-grid">
            {lain.map((x) => {
              const xi = x.images.find((i) => i.isPrimary) || x.images[0];
              return (
                <Link className="rel-card" href={`/ayam/${x.slug}`} key={x.id}>
                  <span className="rel-badge">{x.kodeRing || "HW"}</span>
                  {xi && <img src={xi.filePath} alt={x.nama} loading="lazy" decoding="async" />}
                  <div className="rel-body">
                    <b>{x.nama}</b>
                    <span className="rel-meta">
                      {x.kategori?.nama ?? "Ayam Bangkok"} · {usiaInfo(x.tanggalMenetas)?.label ?? ""}
                    </span>
                    <span className="rel-foot">
                      <em>{x.harga ? formatRupiah(x.harga) : "Hubungi kami"}</em>
                      <i>Lihat →</i>
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </PublicLayout>
  );
}
