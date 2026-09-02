import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AyamListPage({
  searchParams,
}: {
  searchParams: { q?: string; st?: string; ok?: string; err?: string };
}) {
  const q = (searchParams.q || "").toLowerCase();
  const st = searchParams.st || "aktif";

  const list = await prisma.ayam.findMany({
    include: { images: true, kategori: true },
    orderBy: { updatedAt: "desc" },
  });
  let rows = list;
  if (st === "aktif") rows = list.filter((a) => !a.isArsip);
  else if (st === "arsip") rows = list.filter((a) => a.isArsip);
  if (q)
    rows = rows.filter((a) =>
      [a.nama, a.kodeRing ?? "", a.kategori?.nama ?? ""].join(" ").toLowerCase().includes(q)
    );

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

  return (
    <>
      <div className="topbar">
        <div>
          <h1>Data Ayam</h1>
          <div className="crumb">Panel Pengelola → Data Ayam</div>
        </div>
        <div className="right">
          <Link className="btn btn-primary" href="/panel/ayam/baru">+ Tambah Ayam</Link>
        </div>
      </div>

      {flash}

      <div className="card">
        <div className="card-h">
          <h2>Daftar Ayam</h2>
          <span className="sub">Arsip &amp; draft disembunyikan dari publik.</span>
          <div className="tools">
            <form method="get" action="/panel/ayam" style={{ display: "flex", gap: 8 }}>
              <input type="text" name="q" defaultValue={searchParams.q || ""} placeholder="Cari nama / ring…" style={{ background: "var(--paper)", border: "1px solid var(--krem-300)", borderRadius: 5, padding: "7px 11px", fontSize: 13 }} />
              <select name="st" defaultValue={st} style={{ background: "var(--paper)", border: "1px solid var(--krem-300)", borderRadius: 5, padding: "7px 8px", fontSize: 13 }}>
                <option value="aktif">Aktif</option>
                <option value="arsip">Arsip</option>
                <option value="semua">Semua</option>
              </select>
              <button className="btn btn-sec btn-sm" type="submit">Cari</button>
            </form>
          </div>
        </div>
        <table className="data">
          <thead>
            <tr>
              <th>Ayam</th>
              <th>Kategori</th>
              <th>Status</th>
              <th>Menetas / Berat</th>
              <th>Harga</th>
              <th>Foto</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((a) => {
              const img = a.images.find((i) => i.isPrimary) || a.images[0];
              const b = badge[a.statusJual] ?? { cls: "draft", label: a.statusJual };
              return (
                <tr key={a.id}>
                  <td>
                    <div className="t-ayam">
                      {img && <img src={img.filePath} alt={a.nama} className={a.statusJual === "TERJUAL" ? "sold" : ""} />}
                      <span>
                        <b>{a.nama}{a.isArsip ? " · arsip" : ""}</b>
                        <small>{a.kodeRing || "tanpa ring"} · {a.statusTampil === "DRAFT" ? "draft" : "publik"}</small>
                      </span>
                    </div>
                  </td>
                  <td>{a.kategori?.nama ?? "—"}</td>
                  <td><span className={`st ${b.cls}`}><i />{b.label}</span></td>
                  <td>
                    {a.tanggalMenetas
                      ? new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(a.tanggalMenetas)
                      : "—"}{" "}
                    · {String(a.beratKg).replace(".", ",")} kg
                  </td>
                  <td className="money">{a.harga ? "Rp " + a.harga.toLocaleString("id-ID") : <span className="ask">Hubungi kami</span>}</td>
                  <td>{a.images.length} foto</td>
                  <td>
                    <div className="aksi">
                      <Link className="u" href={`/panel/ayam/${a.id}`}>Kelola</Link>
                      {a.isArsip ? (
                        <form action={`/api/panel/ayam/${a.id}/action`} method="post">
                          <input type="hidden" name="act" value="pulih" />
                          <button className="a" type="submit">Pulihkan</button>
                        </form>
                      ) : (
                        <form action={`/api/panel/ayam/${a.id}/action`} method="post" data-confirm={`Arsipkan ${a.nama}? (disembunyikan dari publik)`}>
                          <input type="hidden" name="act" value="arsip" />
                          <button className="a" type="submit">Arsip</button>
                        </form>
                      )}
                      <form action={`/api/panel/ayam/${a.id}/action`} method="post" data-confirm={`HAPUS PERMANEN ${a.nama} beserta semua fotonya? Tindakan tidak dapat dibatalkan.`}>
                        <input type="hidden" name="act" value="permanen" />
                        <button className="d" type="submit">Hapus</button>
                      </form>
                    </div>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7}>
                  <div className="empty">Tidak ada ayam yang cocok.</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="t-note">
          Tombol <b>Arsip</b> menyembunyikan ayam dari publik (bisa dipulihkan). Tombol <b>Hapus</b> menghapus permanen dan menuntut konfirmasi — semua perubahan tercatat di Log Aktivitas.
        </div>
      </div>
    </>
  );
}
