import { redirect } from "next/navigation";
import { cekModulHalaman } from "@/lib/izin";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function KategoriPage({
  searchParams,
}: {
  searchParams: { ok?: string; err?: string };
}) {
  if (!(await cekModulHalaman("kategori"))) redirect("/panel");

  const kategori = await prisma.kategori.findMany({
    orderBy: { urutan: "asc" },
    include: { _count: { select: { ayam: true } } },
  });
  const flash = searchParams.ok ? (
    <p className="flash flash-ok">{searchParams.ok}</p>
  ) : searchParams.err ? (
    <p className="flash flash-err">{searchParams.err}</p>
  ) : null;

  return (
    <>
      <div className="topbar">
        <div>
          <h1>Kategori</h1>
          <div className="crumb">Panel Pengelola → Kategori</div>
        </div>
      </div>
      {flash}

      <div className="card">
        <div className="card-h">
          <h2>Tambah Kategori</h2>
        </div>
        <div className="card-body">
          <form method="post" action="/api/panel/kategori" style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
            <div className="f" style={{ flex: 1, minWidth: 200 }}>
              <label>Nama <i>*</i></label>
              <input name="nama" placeholder="mis. Bangkok Tulen" required />
            </div>
            <div className="f" style={{ flex: 1, minWidth: 200 }}>
              <label>Deskripsi singkat</label>
              <input name="deskripsi" placeholder="mis. Darah Thailand, seleksi garis juara" />
            </div>
            <div className="f" style={{ width: 90 }}>
              <label>Urutan</label>
              <input name="urutan" type="number" defaultValue={0} />
            </div>
            <button className="btn btn-primary" type="submit">Simpan Kategori</button>
          </form>
        </div>
      </div>

      <div className="card">
        <div className="card-h">
          <h2>Daftar Kategori</h2>
          <span className="sub">Kategori yang masih dipakai ayam tidak bisa dihapus</span>
        </div>
        <table className="data">
          <thead>
            <tr><th>Nama</th><th>Deskripsi</th><th>Urutan</th><th>Jumlah ayam</th><th>Aksi</th></tr>
          </thead>
          <tbody>
            {kategori.map((k) => (
              <tr key={k.id}>
                <td><b>{k.nama}</b></td>
                <td style={{ color: "var(--ink-muted)", fontSize: 12.5 }}>{k.deskripsi || "—"}</td>
                <td>{k.urutan}</td>
                <td>{k._count.ayam} ekor</td>
                <td>
                  <details>
                    <summary className="u" style={{ cursor: "pointer", fontSize: 12, color: "#8f6a1f" }}>Ubah / Hapus</summary>
                    <form method="post" action={`/api/panel/kategori/${k.id}`} style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8, alignItems: "flex-end" }}>
                      <input type="hidden" name="act" value="update" />
                      <input name="nama" defaultValue={k.nama} style={{ padding: "6px 8px", fontSize: 13, border: "1px solid var(--krem-300)", borderRadius: 5, width: 170 }} />
                      <input name="deskripsi" defaultValue={k.deskripsi ?? ""} placeholder="Deskripsi" style={{ padding: "6px 8px", fontSize: 13, border: "1px solid var(--krem-300)", borderRadius: 5, width: 220 }} />
                      <input name="urutan" type="number" defaultValue={k.urutan} style={{ width: 64, padding: "6px 8px", fontSize: 13, border: "1px solid var(--krem-300)", borderRadius: 5 }} />
                      <button className="btn btn-sec btn-xs" type="submit">Simpan</button>
                    </form>
                    {k._count.ayam === 0 ? (
                      <form method="post" action={`/api/panel/kategori/${k.id}`} data-confirm={`Hapus kategori ${k.nama}?`} style={{ marginTop: 6 }}>
                        <input type="hidden" name="act" value="hapus" />
                        <button className="btn btn-danger btn-xs" type="submit">Hapus</button>
                      </form>
                    ) : (
                      <small style={{ color: "var(--ink-faint)", fontStyle: "italic", display: "block", marginTop: 6 }}>
                        Tidak bisa dihapus — dipakai {k._count.ayam} ayam.
                      </small>
                    )}
                  </details>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
