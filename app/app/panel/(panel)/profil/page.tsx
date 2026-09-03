import Link from "next/link";
import { getOwner } from "@/lib/auth";
import { MODUL } from "@/lib/izin";

export const dynamic = "force-dynamic";

export default async function ProfilPage({
  searchParams,
}: {
  searchParams: { ok?: string; err?: string };
}) {
  const user = await getOwner();
  if (!user) return null; // layout akan redirect ke login

  const ringkasanIzin =
    user.role === "PEMILIK"
      ? "Pemilik — semua akses (kelola data, admin, log)."
      : user.izin.length
        ? MODUL.filter((m) => user.izin.includes(m.kunci)).map((m) => m.label).join(", ")
        : "Belum ada izin modul — hubungi pemilik.";

  return (
    <>
      <div className="topbar">
        <div>
          <h1>Profil Saya</h1>
          <div className="crumb">Panel Pengelola → Profil</div>
        </div>
        <div className="right">
          <Link className="btn btn-sec" href="/panel">← Dashboard</Link>
        </div>
      </div>

      {searchParams.ok && <p className="flash flash-ok">{searchParams.ok}</p>}
      {searchParams.err && <p className="flash flash-err">{searchParams.err}</p>}

      <div className="fgrid" style={{ gridTemplateColumns: "minmax(0,0.9fr) minmax(0,1.1fr)", gap: 20, alignItems: "start" }}>
        {/* Foto profil */}
        <div className="card">
          <div className="card-h"><h2>Foto Profil</h2></div>
          <div className="card-body" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            <div style={{
              width: 120, height: 120, borderRadius: "50%", overflow: "hidden",
              display: "grid", placeItems: "center",
              background: "linear-gradient(135deg, var(--marun-800), var(--bata-700))",
              color: "var(--emas-300)", fontSize: 46, fontWeight: 700,
              border: "2px solid rgba(224,188,108,.5)", flex: "none",
            }}>
              {user.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.avatarUrl} alt="Foto profil" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              ) : (
                user.nama.charAt(0)
              )}
            </div>
            <form method="post" action="/api/panel/profil" encType="multipart/form-data" style={{ width: "100%", display: "flex", flexDirection: "column", gap: 10 }}>
              <input type="hidden" name="act" value="avatar" />
              <input type="file" name="avatar" accept="image/jpeg,image/png,image/webp" required
                style={{ fontFamily: "var(--sans)", fontSize: 13 }} />
              <button className="btn btn-primary" type="submit" style={{ width: "100%" }}>Simpan Foto Profil</button>
              <small style={{ color: "var(--ink-faint)", fontSize: 11.5, textAlign: "center" }}>
                JPG/PNG/WebP, maks. 5 MB. Bila belum ada foto, tampil huruf inisial.
              </small>
            </form>
          </div>
        </div>

        {/* Identitas */}
        <div className="card">
          <div className="card-h"><h2>Identitas &amp; Akses</h2></div>
          <div className="card-body">
            <form method="post" action="/api/panel/profil" encType="multipart/form-data">
              <input type="hidden" name="act" value="nama" />
              <div className="f" style={{ marginBottom: 14 }}>
                <label>Nama tampilan</label>
                <input name="nama" defaultValue={user.nama} required />
              </div>
              <button className="btn btn-sec" type="submit">Simpan Nama</button>
            </form>

            <div style={{ marginTop: 22, borderTop: "1px dashed var(--krem-300)", paddingTop: 16 }}>
              <div className="f" style={{ marginBottom: 12 }}>
                <label>Email login</label>
                <input value={user.email} readOnly disabled style={{ background: "var(--krem-100)", color: "var(--ink-muted)" }} />
              </div>
              <div className="f" style={{ marginBottom: 12 }}>
                <label>Peran</label>
                <input value={user.role === "PEMILIK" ? "Pemilik (pemilik kandang)" : "Admin"} readOnly disabled style={{ background: "var(--krem-100)", color: "var(--ink-muted)" }} />
              </div>
              <div className="f">
                <label>Hak akses modul</label>
                <p style={{ fontSize: 13.5, color: "var(--ink)", margin: 0, lineHeight: 1.6 }}>{ringkasanIzin}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
