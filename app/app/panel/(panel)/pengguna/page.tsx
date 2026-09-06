import Link from "next/link";
import { redirect } from "next/navigation";
import { getOwner } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MODUL } from "@/lib/izin";
import { formatWaktu } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function PenggunaPage({
  searchParams,
}: {
  searchParams: { ok?: string; err?: string };
}) {
  const me = await getOwner();
  if (!me) return null; // layout redirect
  if (me.role !== "PEMILIK") redirect("/panel");

  const users = await prisma.user.findMany({
    orderBy: [{ role: "desc" }, { createdAt: "asc" }],
    select: {
      id: true, nama: true, email: true, role: true, izin: true, aktif: true,
      avatarUrl: true, lastLoginAt: true, createdAt: true,
    },
  });

  return (
    <>
      <div className="topbar">
        <div>
          <h1>Pengguna &amp; Hak Akses</h1>
          <div className="crumb">Khusus Pemilik — kelola akun admin dan izin per modul</div>
        </div>
        <div className="right">
          <Link className="btn btn-sec" href="/panel">← Dashboard</Link>
        </div>
      </div>

      {searchParams.ok && <p className="flash flash-ok">{searchParams.ok}</p>}
      {searchParams.err && <p className="flash flash-err">{searchParams.err}</p>}

      {/* Tambah admin */}
      <div className="card">
        <div className="card-h"><h2>Tambah Admin</h2><span className="sub">Akun baru berperan Admin — hak akses modul ditentukan di bawah.</span></div>
        <div className="card-body">
          <form method="post" action="/api/panel/pengguna">
            <div className="fgrid">
              <div className="f"><label>Nama</label><input name="nama" required placeholder="mis. Budi" /></div>
              <div className="f"><label>Email</label><input name="email" type="email" required placeholder="nama@contoh.com" /></div>
              <div className="f"><label>Sandi awal</label><input name="password" type="text" required minLength={6} placeholder="min. 6 karakter" /></div>
              <div className="f full">
                <label>Izin modul (boleh dikosongkan dulu)</label>
                <div className="izin-chips">
                  {MODUL.map((m) => (
                    <label key={m.kunci}><input type="checkbox" name="izin" value={m.kunci} /> {m.label}</label>
                  ))}
                </div>
              </div>
            </div>
            <div className="form-actions" style={{ marginTop: 14 }}>
              <button className="btn btn-primary" type="submit">Tambah Admin</button>
            </div>
          </form>
        </div>
      </div>

      {/* Daftar pengguna */}
      {users.map((u) => {
        const isOwnerRow = u.role === "PEMILIK";
        const target = `/api/panel/pengguna/${u.id}`;
        return (
          <div className="card" key={u.id} style={{ marginTop: 18 }}>
            <div className="card-h">
              <span className="avatar av-row" style={{ width: 40, height: 40 }}>
                {u.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={u.avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
                ) : u.nama.charAt(0)}
              </span>
              <div style={{ minWidth: 0 }}>
                <b style={{ fontSize: 15, display: "block" }}>{u.nama}</b>
                <span className="sub">{u.email}</span>
              </div>
              <div className="tools" style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <span className={`res ${isOwnerRow ? "win" : "draw"}`}>{isOwnerRow ? "Pemilik" : "Admin"}</span>
                <span className={`res ${u.aktif ? "win" : "loss"}`}>{u.aktif ? "Aktif" : "Nonaktif"}</span>
                <span style={{ fontSize: 11.5, color: "var(--ink-faint)" }}>Login terakhir (WIB): {formatWaktu(u.lastLoginAt, { tahun: true })}</span>
              </div>
            </div>
            <div className="card-body">
              {isOwnerRow ? (
                <p style={{ margin: 0, fontSize: 13, color: "var(--ink-muted)" }}>
                  Akun pemilik memiliki semua akses dan tidak dapat diubah dari halaman ini.
                </p>
              ) : (
                <div style={{ display: "grid", gap: 16 }}>
                  {/* ringkasan izin */}
                  <div>
                    <div style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-muted)", fontWeight: 600, marginBottom: 6 }}>Izin modul sekarang</div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {u.izin.length ? (
                        MODUL.filter((m) => u.izin.includes(m.kunci)).map((m) => (
                          <span key={m.kunci} className="tag" style={{ background: "#e4ecdf", color: "#2c5a3f" }}>{m.label}</span>
                        ))
                      ) : (
                        <span style={{ fontSize: 13, color: "var(--ink-faint)", fontStyle: "italic" }}>Belum ada izin — akun belum bisa mengelola apa pun.</span>
                      )}
                    </div>
                  </div>

                  {/* atur izin */}
                  <form method="post" action={target} className="izin-edit">
                    <input type="hidden" name="act" value="izin" />
                    <div className="izin-chips">
                      {MODUL.map((m) => (
                        <label key={m.kunci}>
                          <input type="checkbox" name="izin" value={m.kunci} defaultChecked={u.izin.includes(m.kunci)} /> {m.label}
                        </label>
                      ))}
                    </div>
                    <button className="btn btn-sec btn-sm" type="submit" style={{ marginTop: 8 }}>Simpan Izin</button>
                  </form>

                  {/* tindakan */}
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", borderTop: "1px dashed var(--krem-300)", paddingTop: 12 }}>
                    <form method="post" action={target} style={{ display: "inline-flex", gap: 6, alignItems: "center" }}
                      data-confirm={`Reset sandi akun ${u.nama}?`}>
                      <input type="hidden" name="act" value="sandi" />
                      <input name="password" type="text" placeholder="Sandi baru (min. 6)" required minLength={6}
                        style={{ padding: "6px 10px", fontSize: 13, border: "1px solid var(--krem-300)", borderRadius: 5, background: "var(--paper)" }} />
                      <button className="btn btn-sec btn-sm" type="submit">Reset Sandi</button>
                    </form>
                    <form method="post" action={target} data-confirm={u.aktif ? `Nonaktifkan akun ${u.nama}? Admin ini tidak bisa login sampai diaktifkan lagi.` : `Aktifkan akun ${u.nama}?`}>
                      <input type="hidden" name="act" value="aktif" />
                      <input type="hidden" name="aktif" value={u.aktif ? "0" : "1"} />
                      <button className="btn btn-sec btn-sm" type="submit">
                        {u.aktif ? "Nonaktifkan" : "Aktifkan"}
                      </button>
                    </form>
                    <form method="post" action={target} data-confirm={`Hapus akun ${u.nama}? Tindakan ini permanen dan tidak bisa dibatalkan.`}>
                      <input type="hidden" name="act" value="hapus" />
                      <button className="btn btn-sec btn-sm" type="submit" style={{ color: "#a83226" }}>Hapus Akun</button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </>
  );
}
