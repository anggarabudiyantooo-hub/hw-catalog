import { redirect } from "next/navigation";
import { getOwner } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatWaktu } from "@/lib/format";

export const dynamic = "force-dynamic";

/**
 * Papan Pengumuman — pita peringatan/iklan/info yang muncul paling atas di
 * seluruh halaman pengunjung. Hanya pemilik yang mengelola.
 * Modular: bisa dipakai untuk peringatan mendesak, iklan/promo, atau info;
 * pilih jenis, isi judul + pesan, lalu aktifkan/nonaktifkan kapan saja.
 */

const JENIS: Record<string, { label: string; ket: string }> = {
  PERINGATAN: { label: "Peringatan", ket: "Jendela peringatan di TENGAH layar (gaya dialog Windows): judul merah di tengah + pesan + tombol OK. Muncul setiap kali halaman dimuat ulang." },
  IKLAN: { label: "Iklan / Promo", ket: "Pita krem-emas di bagian atas halaman — untuk promosi / penawaran." },
  INFO: { label: "Info", ket: "Pita netral terang di bagian atas halaman — untuk kabar biasa (jam layanan, libur, dsb.)." },
};

export default async function PapanPage({
  searchParams,
}: {
  searchParams: { ok?: string; err?: string };
}) {
  const me = await getOwner();
  if (!me) return null; // layout sudah redirect
  if (me.role !== "PEMILIK") redirect("/panel");

  const items = await prisma.papanInfo.findMany({
    orderBy: [{ urutan: "asc" }, { updatedAt: "desc" }],
  });
  const aktif = items.filter((i) => i.aktif).length;
  const flash = searchParams.ok ? (
    <p className="flash flash-ok">{searchParams.ok}</p>
  ) : searchParams.err ? (
    <p className="flash flash-err">{searchParams.err}</p>
  ) : null;

  const input = { padding: "8px 10px", fontSize: 13.5, border: "1px solid var(--krem-300)", borderRadius: 6, width: "100%", background: "var(--paper)" };

  return (
    <>
      <div className="topbar">
        <div>
          <h1>Papan Pengumuman</h1>
          <div className="crumb">Panel Pengelola → Papan Pengumuman</div>
        </div>
      </div>
      {flash}

      <div className="card">
        <div className="card-h">
          <h2>Tambah Papan</h2>
          <span className="sub">Peringatan tampil sebagai jendela di tengah layar saat situs dibuka; Iklan/Info tampil sebagai pita di atas halaman</span>
        </div>
        <div className="card-body">
          <form method="post" action="/api/panel/papan" style={{ display: "grid", gap: 12 }}>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <div className="f" style={{ flex: "1 1 220px" }}>
                <label>Jenis papan <i>*</i></label>
                <select name="jenis" defaultValue="PERINGATAN" style={input}>
                  {Object.entries(JENIS).map(([v, j]) => (
                    <option key={v} value={v}>{j.label}</option>
                  ))}
                </select>
              </div>
              <div className="f" style={{ width: 110 }}>
                <label>Urutan</label>
                <input name="urutan" type="number" defaultValue={0} style={input} />
              </div>
            </div>
            <div className="f">
              <label>Judul <i>*</i></label>
              <input name="judul" placeholder="mis. Waspada Penipuan" required style={input} />
            </div>
            <div className="f">
              <label>Pesan</label>
              <textarea name="pesan" rows={2} placeholder="mis. Transaksi resmi hanya melalui nomor WhatsApp di situs ini." style={{ ...input, resize: "vertical" }} />
            </div>
            <div style={{ display: "flex", gap: 22, flexWrap: "wrap", alignItems: "center" }}>
              <label style={{ display: "flex", gap: 7, alignItems: "center", fontSize: 13, cursor: "pointer" }}>
                <input type="checkbox" name="kedip" defaultChecked /> Titik indikator kedap-kedip
              </label>
              <label style={{ display: "flex", gap: 7, alignItems: "center", fontSize: 13, cursor: "pointer" }}>
                <input type="checkbox" name="aktif" /> Langsung aktifkan
              </label>
              <button className="btn btn-primary" type="submit">Simpan Papan</button>
            </div>
            <small style={{ color: "var(--ink-faint)" }}>
              Jenis <b>Peringatan</b>: pita gelap dengan titik emas berkedip. <b>Iklan/Promo</b>: pita krem-emas. <b>Info</b>: pita netral terang.
              Pengunjung bisa menutup papan (muncul lagi pada kunjungan berikutnya).
            </small>
          </form>
        </div>
      </div>

      <div className="card">
        <div className="card-h">
          <h2>Daftar Papan</h2>
          <span className="sub">{aktif} dari {items.length} papan aktif — papan aktif urutan kecil tampil paling atas</span>
        </div>
        {items.length === 0 ? (
          <div className="card-body">
            <p style={{ color: "var(--ink-muted)", fontSize: 13.5, margin: 0 }}>
              Belum ada papan. Buat satu di form atas — misalnya peringatan waspada penipuan untuk pencobaan pertama.
            </p>
          </div>
        ) : (
          <table className="data">
            <thead>
              <tr><th>Papan</th><th>Jenis</th><th>Status</th><th>Kedip</th><th>Diubah</th><th>Aksi</th></tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.id}>
                  <td style={{ maxWidth: 360 }}>
                    <b>{p.judul}</b>
                    {p.pesan ? (
                      <div style={{ color: "var(--ink-muted)", fontSize: 12.5, marginTop: 2 }}>{p.pesan}</div>
                    ) : null}
                    <div style={{ color: "var(--ink-faint)", fontSize: 11.5, marginTop: 2 }}>urutan {p.urutan}</div>
                  </td>
                  <td><span className={`st ${p.jenis === "PERINGATAN" ? "peringatan" : p.jenis === "IKLAN" ? "iklan" : "info"}`}><i />{JENIS[p.jenis]?.label ?? p.jenis}</span></td>
                  <td>
                    <form method="post" action={`/api/panel/papan/${p.id}`} style={{ display: "inline" }}>
                      <input type="hidden" name="act" value="aktif" />
                      <button className={`btn btn-xs ${p.aktif ? "btn-sec" : "btn-primary"}`} type="submit">
                        {p.aktif ? "Nonaktifkan" : "Aktifkan"}
                      </button>
                    </form>
                  </td>
                  <td>
                    <form method="post" action={`/api/panel/papan/${p.id}`} style={{ display: "inline" }}>
                      <input type="hidden" name="act" value="kedip" />
                      <button className="btn btn-sec btn-xs" type="submit">{p.kedip ? "Ya — matikan" : "Tidak — nyalakan"}</button>
                    </form>
                  </td>
                  <td style={{ color: "var(--ink-muted)", fontSize: 12.5, whiteSpace: "nowrap" }}>{formatWaktu(p.updatedAt)}</td>
                  <td>
                    <details>
                      <summary className="u" style={{ cursor: "pointer", fontSize: 12, color: "#8f6a1f" }}>Ubah / Hapus</summary>
                      <form method="post" action={`/api/panel/papan/${p.id}`} style={{ display: "grid", gap: 8, marginTop: 8, minWidth: 300 }}>
                        <input type="hidden" name="act" value="update" />
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          <select name="jenis" defaultValue={p.jenis} style={{ ...input, width: 150 }}>
                            {Object.entries(JENIS).map(([v, j]) => (
                              <option key={v} value={v}>{j.label}</option>
                            ))}
                          </select>
                          <input name="urutan" type="number" defaultValue={p.urutan} style={{ ...input, width: 80 }} title="Urutan" />
                        </div>
                        <input name="judul" defaultValue={p.judul} required style={input} />
                        <textarea name="pesan" rows={2} defaultValue={p.pesan} style={{ ...input, resize: "vertical" }} />
                        <label style={{ display: "flex", gap: 7, alignItems: "center", fontSize: 12.5, cursor: "pointer" }}>
                          <input type="checkbox" name="kedip" defaultChecked={p.kedip} /> Titik kedap-kedip
                        </label>
                        <label style={{ display: "flex", gap: 7, alignItems: "center", fontSize: 12.5, cursor: "pointer" }}>
                          <input type="checkbox" name="aktif" defaultChecked={p.aktif} /> Aktif
                        </label>
                        <button className="btn btn-sec btn-xs" type="submit">Simpan Perubahan</button>
                      </form>
                      <form method="post" action={`/api/panel/papan/${p.id}`} data-confirm={`Hapus papan "${p.judul}"?`} style={{ marginTop: 6 }}>
                        <input type="hidden" name="act" value="hapus" />
                        <button className="btn btn-danger btn-xs" type="submit">Hapus</button>
                      </form>
                    </details>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
