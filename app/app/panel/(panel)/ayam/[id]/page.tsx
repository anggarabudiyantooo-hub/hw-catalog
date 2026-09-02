import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { rekapDari, formatTanggal, labelJenisFoto } from "@/lib/format";
import PublicPreview from "@/components/PublicPreview";
import PublicPreviewContent from "@/components/PublicPreviewContent";

export const dynamic = "force-dynamic";

export default async function AyamEditPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { ok?: string; err?: string };
}) {
  const id = Number(params.id);
  const ayam = await prisma.ayam.findUnique({
    where: { id },
    include: { images: { orderBy: { urutan: "asc" } }, kategori: true, riwayat: true },
  });
  if (!ayam) notFound();
  const kategori = await prisma.kategori.findMany({ orderBy: { urutan: "asc" } });

  const images = [...ayam.images].sort((a, b) =>
    a.isPrimary === b.isPrimary ? a.urutan - b.urutan : a.isPrimary ? -1 : 1
  );
  const rekap = rekapDari(ayam.riwayat);
  const riwayat = [...ayam.riwayat].sort((a, b) => +new Date(b.tanggal) - +new Date(a.tanggal));
  const flash = searchParams.ok ? (
    <p className="flash flash-ok">{searchParams.ok}</p>
  ) : searchParams.err ? (
    <p className="flash flash-err">{searchParams.err}</p>
  ) : null;

  const badge: Record<string, { cls: string; label: string }> = {
    TERSEDIA: { cls: "tersedia", label: "Tersedia" },
    DIPESAN: { cls: "dipesan", label: "Dipesan" },
    TERJUAL: { cls: "terjual", label: "Terjual" },
  };
  const b = badge[ayam.statusJual] ?? { cls: "draft", label: ayam.statusJual };
  const isoLocal = (d: Date | null) => {
    if (!d) return "";
    const p = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  };

  return (
    <>
      <div className="topbar">
        <div>
          <h1>Kelola: {ayam.nama}</h1>
          <div className="crumb">
            <Link href="/panel/ayam" style={{ color: "var(--bata-700)" }}>Data Ayam</Link> → {ayam.kodeRing || "tanpa ring"} ·{" "}
            <span className={`st ${b.cls}`}><i />{b.label}</span>
          </div>
        </div>
        <div className="right">
          <PublicPreview
            note={
              ayam.statusTampil === "PUBLIKASI" && !ayam.isArsip
                ? undefined
                : "Draf / arsip — belum tampil di situs publik."
            }
          >
            <PublicPreviewContent ayam={ayam} />
          </PublicPreview>
        </div>
      </div>

      {flash}

      <form method="post" action={`/api/panel/ayam/${ayam.id}`} encType="multipart/form-data">
        <div className="card">
          <div className="card-h">
            <h2>Ubah Data</h2>
            <span className="sub">Usia dihitung otomatis dari tanggal menetas</span>
          </div>
          <div className="card-body">
            <div className="fgrid">
              <div className="f">
                <label>Nama / Julukan <i>*</i></label>
                <input name="nama" defaultValue={ayam.nama} required />
              </div>
              <div className="f">
                <label>Kode / Nomor ring</label>
                <input name="kodeRing" defaultValue={ayam.kodeRing ?? ""} />
              </div>
              <div className="f">
                <label>Kategori</label>
                <select name="kategoriId" defaultValue={ayam.kategoriId ?? ""}>
                  <option value="">— tanpa kategori —</option>
                  {kategori.map((k) => (
                    <option key={k.id} value={k.id}>{k.nama}</option>
                  ))}
                </select>
              </div>
              <div className="f">
                <label>Jenis kelamin</label>
                <select name="jenisKelamin" defaultValue={ayam.jenisKelamin}>
                  <option value="JANTAN">Jantan</option>
                  <option value="BETINA">Betina</option>
                </select>
              </div>
              <div className="f">
                <label>Tanggal menetas (perkiraan)</label>
                <input type="date" name="tanggalMenetas" defaultValue={isoLocal(ayam.tanggalMenetas)} />
              </div>
              <div className="f">
                <label>Berat kg <i>*</i></label>
                <input name="beratKg" defaultValue={String(ayam.beratKg).replace(".", ",")} required />
              </div>
              <div className="f">
                <label>Postur / ukuran badan</label>
                <input name="postur" defaultValue={ayam.postur ?? ""} />
              </div>
              <div className="f">
                <label>Tinggi punggung (± cm)</label>
                <input name="tinggiCm" inputMode="decimal" defaultValue={ayam.tinggiCm != null ? String(ayam.tinggiCm) : ""} />
              </div>
              <div className="f">
                <label>Kaki &amp; sisik</label>
                <input name="kakiSisik" defaultValue={ayam.kakiSisik ?? ""} />
              </div>
              <div className="f">
                <label>Jalu</label>
                <select name="jalu" defaultValue={ayam.jalu ?? ""}>
                  <option value="">— pilih —</option>
                  <option value="BELUM">Belum tumbuh</option>
                  <option value="TUNGGAL">Tunggal</option>
                  <option value="GANDA">Ganda</option>
                </select>
              </div>
              <div className="f full">
                <label>Warna bulu</label>
                <input name="warnaBulu" defaultValue={ayam.warnaBulu ?? ""} />
              </div>
              <div className="f full">
                <label>Keunggulan (satu per baris)</label>
                <textarea name="keunggulan" rows={3} defaultValue={ayam.keunggulan ?? ""} />
              </div>
              <div className="f full">
                <label>Deskripsi / catatan kandang</label>
                <textarea name="deskripsi" rows={3} defaultValue={ayam.deskripsi ?? ""} />
              </div>
              <div className="f">
                <label>Harga (Rp) — kosongkan bila “Hubungi kami”</label>
                <input name="harga" inputMode="numeric" defaultValue={ayam.harga != null ? String(ayam.harga) : ""} />
              </div>
              <div className="f">
                <label>Status jual</label>
                <select name="statusJual" defaultValue={ayam.statusJual}>
                  <option value="TERSEDIA">Tersedia</option>
                  <option value="DIPESAN">Dipesan</option>
                  <option value="TERJUAL">Terjual</option>
                </select>
                <span className="hint">Pilih “Terjual” → foto otomatis hitam-putih.</span>
              </div>
              <div className="f full">
                <label>Status tampil</label>
                <div className="radios">
                  <label><input type="radio" name="statusTampil" value="DRAFT" defaultChecked={ayam.statusTampil === "DRAFT"} /> Draf</label>
                  <label><input type="radio" name="statusTampil" value="PUBLIKASI" defaultChecked={ayam.statusTampil === "PUBLIKASI"} /> Publikasi</label>
                  <label style={{ marginLeft: 4 }}><input type="checkbox" name="isFeatured" defaultChecked={ayam.isFeatured} /> Unggulan beranda</label>
                </div>
              </div>
            </div>
            <div className="form-actions">
              <button className="btn btn-primary" type="submit">Simpan Perubahan</button>
            </div>
          </div>
        </div>
      </form>

      {/* ================= GALERI ================= */}
      <div className="card">
        <div className="card-h">
          <h2>Galeri Foto</h2>
          <span className="sub">{images.length} foto · klik “Jadikan utama” untuk foto kartu</span>
        </div>
        <div className="card-body">
          {images.length > 0 ? (
            <div className="up-pre" style={{ marginBottom: 18 }}>
              {images.map((im) => (
                <div className={`up-chip ${im.isPrimary ? "prim" : ""}`} key={im.id}>
                  <img src={im.filePath} alt={im.altText || ""} style={ayam.statusJual === "TERJUAL" ? { filter: "grayscale(1)" } : undefined} />
                  <span className="tag">{im.isPrimary ? "Foto utama" : `Urutan ${im.urutan}`}</span>
                  <form action={`/api/panel/ayam/${ayam.id}/images`} method="post" data-confirm={`Hapus foto ini dari ${ayam.nama}?`}>
                    <input type="hidden" name="imageId" value={im.id} />
                    <input type="hidden" name="act" value="hapus" />
                    <button className="del" type="submit" aria-label="Hapus">×</button>
                  </form>
                  <select className="jf" name="jf" defaultValue={im.jenisFoto ?? ""} disabled style={{ opacity: 0.55 }} title="Atur jenis lewat tombol Simpan jenis">
                    <option value="">Jenis foto…</option>
                    {["FULL_BADAN", "KEPALA", "KAKI", "BULU", "LAINNYA"].map((j) => (
                      <option key={j} value={j}>{labelJenisFoto(j)}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ marginBottom: 14, color: "var(--ink-muted)", fontStyle: "italic" }}>Belum ada foto — tambahkan di bawah.</p>
          )}

          {images.length > 0 && (
            <table className="data" style={{ marginBottom: 16 }}>
              <thead>
                <tr><th>Foto</th><th>Jenis</th><th>Aksi</th></tr>
              </thead>
              <tbody>
                {images.map((im) => (
                  <tr key={im.id}>
                    <td>
                      <div className="t-ayam">
                        <img src={im.filePath} alt="" style={{ width: 40, height: 40, filter: ayam.statusJual === "TERJUAL" ? "grayscale(1)" : undefined }} />
                        {im.isPrimary ? "Foto utama" : `Urutan ${im.urutan}`}
                      </div>
                    </td>
                    <td>
                      <form action={`/api/panel/ayam/${ayam.id}/images`} method="post" style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        <input type="hidden" name="imageId" value={im.id} />
                        <input type="hidden" name="act" value="jenis" />
                        <select name="jenis" defaultValue={im.jenisFoto ?? ""} style={{ padding: "5px 8px", fontSize: 12.5, border: "1px solid var(--krem-300)", borderRadius: 5, background: "var(--paper)" }}>
                          <option value="">Belum diatur</option>
                          {["FULL_BADAN", "KEPALA", "KAKI", "BULU", "LAINNYA"].map((j) => (
                            <option key={j} value={j}>{labelJenisFoto(j)}</option>
                          ))}
                        </select>
                        <button className="btn btn-sec btn-xs" type="submit">Simpan jenis</button>
                      </form>
                    </td>
                    <td>
                      <form action={`/api/panel/ayam/${ayam.id}/images`} method="post">
                        <input type="hidden" name="imageId" value={im.id} />
                        <input type="hidden" name="act" value="primary" />
                        <button className="btn btn-sec btn-xs" type="submit" disabled={im.isPrimary}>
                          {im.isPrimary ? "Foto utama" : "Jadikan utama"}
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <form method="post" action={`/api/panel/ayam/${ayam.id}`} encType="multipart/form-data">
            <label htmlFor="newImg" className="dz" style={{ marginBottom: 10, cursor: "pointer", display: "block", position: "relative" }}>
              <input
                type="file"
                name="newImages"
                multiple
                accept="image/*"
                id="newImg"
                style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer", zIndex: 2 }}
              />
              <svg viewBox="0 0 24 24"><path d="M12 16V4M6 10l6-6 6 6" /><path d="M4 20h16" /></svg>
              <div><b>Klik untuk memilih foto</b> — bisa beberapa sekaligus (JPG/PNG/WebP, maks. 5 MB)</div>
              <small>Setelah memilih, pilih jenis foto di bawah lalu tekan “Unggah + Simpan Data”.</small>
            </label>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              <select name="newJenis" style={{ padding: "8px 11px", fontSize: 13.5, border: "1px solid var(--krem-300)", borderRadius: 5, background: "var(--paper)" }}>
                <option value="FULL_BADAN">Full badan</option>
                <option value="KEPALA">Kepala</option>
                <option value="KAKI">Kaki</option>
                <option value="BULU">Bulu / ekor</option>
                <option value="LAINNYA">Lainnya</option>
              </select>
              <button className="btn btn-sec" type="submit">Unggah + Simpan Data</button>
              <span className="hint" style={{ fontSize: 12, color: "var(--ink-faint)" }}>
                Unggahan ini hanya menambah foto — data di atas disimpan lewat tombol “Simpan Perubahan”.
              </span>
            </div>
          </form>
          <div className="req-note">
            Syarat publikasi: <span className="tag ok">Full badan ✓</span><span className="tag ok">Kepala ✓</span><span className="tag ok">Kaki ✓</span>
            <span className="tag">Bulu / ekor</span><span className="tag">Lainnya</span> — pastikan masing-masing minimal satu foto berjenis tersebut.
          </div>
        </div>
      </div>

      {/* ================= RIWAYAT TARUNG ================= */}
      <div className="card">
        <div className="card-h">
          <h2>Riwayat Tarung</h2>
          <span className="sub">Rekap dihitung otomatis → tampil di kartu &amp; halaman publik</span>
          <div className="tools">
            <Link className="btn btn-sec btn-sm" href="/panel/riwayat">Semua Riwayat</Link>
          </div>
        </div>
        <div className="sum-tarung">
          <span className="w">Menang <b>{rekap.menang}</b></span>
          <span className="l">Kalah <b>{rekap.kalah}</b></span>
          <span className="d">Seri <b>{rekap.seri}</b></span>
          <span style={{ color: "var(--ink)" }}>Total <b style={{ color: "var(--ink)" }}>{rekap.total} laga</b></span>
          <span className="note">Rasio kemenangan {rekap.total ? Math.round((rekap.menang / rekap.total) * 100) : 0}%</span>
        </div>

        <form method="post" action="/api/panel/riwayat" style={{ padding: "0 20px 16px", display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end", background: "#FBF3DF", borderBottom: "1px solid var(--krem-300)" }}>
          <input type="hidden" name="ayamId" value={ayam.id} />
          {[
            ["tanggal", "Tanggal", "date", null],
            ["namaLawan", "Lawan (mis. Bima Solo)", "text", "3,40 kg — tulis lengkap"],
            ["beratLawan", "Berat lawan kg", "text", "3.4"],
            ["ronde", "Ronde", "number", null],
          ].map(([n, l, t, ph]) => (
            <div className="f" key={n as string} style={{ flex: 1, minWidth: 130 }}>
              <label>{l as string}</label>
              <input type={t as string} name={n as string} placeholder={(ph as string) || undefined} />
            </div>
          ))}
          <div className="f" style={{ minWidth: 120 }}>
            <label>Jenis laga</label>
            <select name="jenisLaga" defaultValue="UJI_TERBATAS" style={{ padding: "9px 10px", fontSize: 13, border: "1px solid var(--krem-300)", borderRadius: 5, background: "var(--paper)" }}>
              <option value="UJI_TERBATAS">Uji terbatas</option>
              <option value="ADU_RESMI">Adu resmi</option>
            </select>
          </div>
          <div className="f" style={{ minWidth: 100 }}>
            <label>Hasil <i>*</i></label>
            <select name="hasil" defaultValue="MENANG" style={{ padding: "9px 10px", fontSize: 13, border: "1px solid var(--krem-300)", borderRadius: 5, background: "var(--paper)" }}>
              <option value="MENANG">Menang</option>
              <option value="KALAH">Kalah</option>
              <option value="SERI">Seri</option>
            </select>
          </div>
          <div className="f" style={{ flex: 1, minWidth: 160 }}>
            <label>Catatan (opsional)</label>
            <input name="catatan" placeholder="mis. dihentikan ronde 4, kondisi aman" />
          </div>
          <button className="btn btn-primary" type="submit">Catat Hasil</button>
        </form>

        {riwayat.length > 0 ? (
          <table className="data">
            <thead>
              <tr><th>Tanggal</th><th>Lawan</th><th>Jenis</th><th>Ronde</th><th>Hasil</th><th>Catatan</th><th></th></tr>
            </thead>
            <tbody>
              {riwayat.map((r) => (
                <tr key={r.id}>
                  <td>{formatTanggal(r.tanggal)}</td>
                  <td>
                    {r.namaLawan || "—"}
                    {r.beratLawan != null && <small style={{ color: "var(--ink-faint)" }}> · {String(r.beratLawan).replace(".", ",")} kg</small>}
                  </td>
                  <td>{r.jenisLaga === "ADU_RESMI" ? "Adu resmi" : "Uji terbatas"}</td>
                  <td>{r.ronde ?? "—"}</td>
                  <td>
                    <span className={`res ${r.hasil === "MENANG" ? "win" : r.hasil === "KALAH" ? "loss" : "draw"}`}>
                      {r.hasil === "MENANG" ? "Menang" : r.hasil === "KALAH" ? "Kalah" : "Seri"}
                    </span>
                  </td>
                  <td style={{ color: "var(--ink-muted)", fontSize: 12.5 }}>{r.catatan || "—"}</td>
                  <td>
                    <form action={`/api/panel/riwayat/${r.id}`} method="post" data-confirm="Hapus catatan laga ini? Rekap akan diperbarui.">
                      <input type="hidden" name="act" value="hapus" />
                      <button className="btn btn-danger btn-xs" type="submit">Hapus</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="empty">Belum ada catatan laga. {ayam.jenisKelamin === "BETINA" ? "Ayam betina umumnya bukan ayam laga." : "Tambahkan hasil uji/laga pertama di atas."}</p>
        )}
        <div className="t-note">
          Hanya catat laga yang benar-benar terjadi dengan hasil jelas (menang/kalah/seri). Angka rekap pada kartu &amp; halaman publik dihitung otomatis dari daftar ini.
        </div>
      </div>

      {/* ================= ZONA BERISIKO ================= */}
      <div className="card">
        <div className="card-h">
          <h2>Arsip / Hapus</h2>
          <span className="sub">Hati-hati — penghapusan permanen tidak bisa dibatalkan</span>
        </div>
        <div className="card-body" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {!ayam.isArsip ? (
            <form action={`/api/panel/ayam/${ayam.id}/action`} method="post" data-confirm={`Arsipkan ${ayam.nama}? Ayam tidak lagi tampil publik.`}>
              <input type="hidden" name="act" value="arsip" />
              <button className="btn btn-sec" type="submit">Arsipkan Ayam</button>
            </form>
          ) : (
            <form action={`/api/panel/ayam/${ayam.id}/action`} method="post">
              <input type="hidden" name="act" value="pulih" />
              <button className="btn btn-sec" type="submit">Pulihkan dari Arsip</button>
            </form>
          )}
          <form action={`/api/panel/ayam/${ayam.id}/action`} method="post" data-confirm={`HAPUS PERMANEN ${ayam.nama} beserta semua foto & riwayatnya? Ketik lanjut di kolom konfirmasi (simulasi: cukup konfirmasi).`}>
            <input type="hidden" name="act" value="permanen" />
            <button className="btn btn-danger" type="submit">Hapus Permanen</button>
          </form>
        </div>
      </div>
    </>
  );
}
