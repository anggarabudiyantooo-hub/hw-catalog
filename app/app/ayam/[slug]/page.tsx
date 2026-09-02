import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import PublicLayout from "@/components/PublicLayout";
import PermintaanForm from "@/components/PermintaanForm";
import LaporTrigger from "@/components/LaporTrigger";
import GalleryView from "@/components/GalleryView";
import { prisma } from "@/lib/prisma";
import {
  formatRupiah,
  formatTanggal,
  usiaInfo,
  rekapDari,
} from "@/lib/format";
import { waLink, SITE } from "@/lib/config";

export const dynamic = "force-dynamic";

const include = { images: true, kategori: true, riwayat: true };

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const a = await prisma.ayam.findUnique({ where: { slug: params.slug }, include: { kategori: true } });
  return {
    title: a ? `${a.nama} (${a.kodeRing ?? "ayam bangkok"})` : "Ayam tidak ditemukan",
    description: a ? `Detail ${a.kodeRing ?? a.nama} · ${a.kategori?.nama ?? "Ayam bangkok"} di ${SITE.nama}.` : undefined,
  };
}

export default async function DetailPage({ params }: { params: { slug: string } }) {
  const ayam = await prisma.ayam.findUnique({
    where: { slug: params.slug },
    include,
  });
  if (!ayam || ayam.isArsip || ayam.statusTampil !== "PUBLIKASI") notFound();

  const images = [...ayam.images].sort((a, b) =>
    a.isPrimary === b.isPrimary ? a.urutan - b.urutan : a.isPrimary ? -1 : 1
  );
  const main = images[0] ?? null;
  const usia = usiaInfo(ayam.tanggalMenetas);
  const rekap = rekapDari(ayam.riwayat);
  const riwayatSorted = [...ayam.riwayat].sort((a, b) => +new Date(b.tanggal) - +new Date(a.tanggal));
  const sold = ayam.statusJual === "TERJUAL";
  const isBetina = ayam.jenisKelamin === "BETINA";

  const lain = await prisma.ayam.findMany({
    where: { id: { not: ayam.id }, isArsip: false, statusTampil: "PUBLIKASI", statusJual: { not: "TERJUAL" } },
    include,
    take: 3,
    orderBy: { updatedAt: "desc" },
  });

  const spec: [string, ReactNode][] = [
    ["Jenis kelamin", <b key="k">{isBetina ? "Betina" : "Jantan"}</b>],
    ["Tanggal menetas", ayam.tanggalMenetas ? <span key="m">{formatTanggal(ayam.tanggalMenetas, true)} <small className="auto">perkiraan pencatatan kandang</small></span> : "Belum dicatat"],
    ["Usia saat ini", usia ? <span key="u">± {usia.bulan} bulan <small className="auto">dihitung otomatis dari tanggal menetas — selalu terbaru</small></span> : "—"],
    ["Berat badan", `${String(ayam.beratKg).replace(".", ",")} kg`],
    ["Postur / ukuran badan", ayam.postur ?? null],
    ["Tinggi punggung", ayam.tinggiCm != null ? `± ${ayam.tinggiCm} cm` : null],
    ["Kaki & sisik", ayam.kakiSisik ?? null],
    ["Jalu", ayam.jalu ? ({ BELUM: "Belum tumbuh", TUNGGAL: "Tunggal", GANDA: "Ganda" } as Record<string, string>)[ayam.jalu] : null],
    ["Warna bulu", ayam.warnaBulu ?? null],
    ["Nomor ring", ayam.kodeRing ? `${ayam.kodeRing} (terdaftar)` : "Belum ber-ring"],
  ];
  const terisi = spec.filter(([, v]) => v !== null && v !== undefined);

  return (
    <PublicLayout>
      <div className="wrap">
        <p className="crumb" style={{ paddingTop: 24, color: "var(--ink-muted)", fontSize: 13 }}>
          <Link href="/">Beranda</Link> / <Link href="/katalog">Katalog</Link> /{" "}
          <span style={{ color: "var(--ink)", fontStyle: "italic" }}>{ayam.nama}</span>
        </p>

        <div className="detailgrid">
          {/* ===== galeri (klik untuk perbesar) ===== */}
          <GalleryView
            namaAyam={ayam.nama}
            images={images}
            sold={sold}
            statusJual={ayam.statusJual}
          />

          {/* ===== info ===== */}
          <div className="info">
            <span className="cap">{ayam.kategori?.nama ?? "Belum berkategori"} · {isBetina ? "Betina" : "Jantan"}</span>
            <h1>{ayam.nama}</h1>
            <div className="code">
              {[ayam.kodeRing ?? "Tanpa nomor ring", ayam.kategori?.nama].filter(Boolean).join(" · ")}
            </div>
            <div className="orn">
              <span className="ln"></span>
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0l3 9 9 3-9 3-3 9-3-9-9-3 9-3z" /></svg>
              <span className="ln"></span>
            </div>

            <dl className="spec">
              {terisi.map(([k, v], i) => (
                <div className="cell" key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
            <p className="spec-note">Kolom opsional (postur, tinggi, kaki &amp; sisik, jalu) hanya tampil bila diisi — mewakili hal yang lazim ditanyakan pembeli.</p>

            {ayam.keunggulan && (
              <div className="keung">
                <h3>Keunggulan</h3>
                <ul>
                  {ayam.keunggulan.split("\n").map((b, i) => b.trim() && <li key={i}>{b.trim()}</li>)}
                </ul>
              </div>
            )}

            {ayam.deskripsi && (
              <div className="desc">
                <h3>Catatan Kandang</h3>
                <p>{ayam.deskripsi}</p>
              </div>
            )}

            {/* ===== rekap laga ===== */}
            {!isBetina && (
              <div className="laga">
                <div className="laga-h">
                  <h3>Rekap Pertarungan</h3>
                  <span>
                    {rekap.total > 0 ? `${rekap.total} laga tercatat · rekap otomatis` : "belum ada laga tercatat"}
                  </span>
                </div>
                {rekap.total > 0 ? (
                  <>
                    <div className="laga-sum">
                      <div className="s"><div className="n w">{rekap.menang}</div><div className="t">Menang</div></div>
                      <div className="s"><div className="n l">{rekap.kalah}</div><div className="t">Kalah</div></div>
                      <div className="s"><div className="n d">{rekap.seri}</div><div className="t">Seri</div></div>
                    </div>
                    <div className="laga-rate">
                      Rasio kemenangan <b>{rekap.total ? Math.round((rekap.menang / rekap.total) * 100) : 0}%</b> · dihitung otomatis dari daftar laga. Seluruh uji bersifat terbatas/ramah ayam.
                    </div>
                    <div className="laga-list">
                      {riwayatSorted.map((r) => (
                        <div className="lrow" key={r.id}>
                          <div className="dt">{formatTanggal(r.tanggal)}</div>
                          <div className="dd">
                            <b>{r.namaLawan || "Lawan tidak dicatat"}{r.beratLawan != null && ` (${String(r.beratLawan).replace(".", ",")} kg)`}</b>
                            <span>
                              {(r.jenisLaga === "ADU_RESMI" ? "Adu resmi" : "Uji terbatas")}
                              {r.ronde != null ? ` · ronde ${r.ronde}` : ""}
                            </span>
                            {r.catatan && <div className="ct">{r.catatan}</div>}
                          </div>
                          <span className={`res ${r.hasil === "MENANG" ? "win" : r.hasil === "KALAH" ? "loss" : "draw"}`}>
                            {r.hasil === "MENANG" ? "Menang" : r.hasil === "KALAH" ? "Kalah" : "Seri"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="laga-empty">Belum ada riwayat laga yang dicatat. Hubungi pemilik untuk info lebih lanjut.</div>
                )}
                <div className="laga-note">Hasil ditulis apa adanya oleh pemilik sebagai poin penilaian — silakan tanyakan detail via WhatsApp.</div>
              </div>
            )}

            {/* ===== harga ===== */}
            <div className="buy">
              <div className="lbl">{sold ? "Status" : "Harga yang diminta"}</div>
              <div className="price">{ayam.harga ? formatRupiah(ayam.harga) : "Hubungi kami"}</div>
              <small>
                {sold
                  ? "Ayam ini telah terjual dan ditampilkan sebagai riwayat koleksi."
                  : `Termasuk surat ring & sertifikat asal kandang. Tawar-menawar dapat dibicarakan.`}
              </small>
              {!sold && (
                <>
                  <div className="cta">
                    <a className="btn btn-primary" href="#minat">Saya Tertarik</a>
                    <a className="btn btn-ghost" href={waLink(`Halo ${SITE.pemilik}, saya tertarik dengan ${ayam.nama} (${ayam.kodeRing ?? ayam.slug}) di katalog Anda.`)} target="_blank" rel="noopener">
                      Tanya via WhatsApp
                    </a>
                  </div>
                  <div className="note">Biasanya dibalas dalam 1×24 jam pada jam kerja (08.00–17.00 WIB).</div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ===== form minat ===== */}
      {!sold && (
        <section className="wrap" id="minat" style={{ paddingTop: 8 }}>
          <div className="panel">
            <h2>Saya Tertarik pada {ayam.nama}</h2>
            <p className="sub">Isi singkat di bawah — permintaan langsung tersimpan dan kami balas lewat WhatsApp Anda.</p>
            <PermintaanForm ayamId={ayam.id} namaAyam={ayam.nama} />
          </div>
        </section>
      )}

      {/* ===== laporan halus ===== */}
      <LaporTrigger ayamId={ayam.id} nama={ayam.nama} variant="link" />

      {/* ===== ayam lain ===== */}
      {lain.length > 0 && (
        <section className="block" style={{ paddingTop: 24 }}>
          <div className="wrap">
            <div className="sec-head" style={{ marginBottom: 22 }}>
              <h2 style={{ fontSize: 24 }}>Masih Menimbang? Ayam Lain dari Kandang</h2>
            </div>
            <div className="mini-grid">
              {lain.map((x) => {
                const xi = x.images.find((i) => i.isPrimary) || x.images[0];
                return (
                  <div className="mini-card" key={x.id}>
                    {xi && <img src={xi.filePath} alt={x.nama} />}
                    <div>
                      <b>{x.nama}</b>
                      <span>{x.kategori?.nama} · {usiaInfo(x.tanggalMenetas)?.label ?? ""}</span>
                      <div className="pr">{x.harga ? formatRupiah(x.harga) : "Hubungi kami"}</div>
                    </div>
                    <Link href={`/ayam/${x.slug}`}>Lihat</Link>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </PublicLayout>
  );
}
