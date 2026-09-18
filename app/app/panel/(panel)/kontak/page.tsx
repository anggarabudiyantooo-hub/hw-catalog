import { redirect } from "next/navigation";
import { getOwner } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatWaktu } from "@/lib/format";
import { SITE } from "@/lib/config";

export const dynamic = "force-dynamic";

/**
 * Kontak & Info Situs — SATU-SATUNYA sumber data kontak yang tampil di
 * halaman pengunjung (header, footer, beranda, katalog, detail ayam, form
 * minat). Ubah di sini, seluruh situs ikut berubah — tanpa menyentuh kode.
 * Hanya pemilik yang mengelola.
 */

export default async function KontakPage({
  searchParams,
}: {
  searchParams: { ok?: string; err?: string };
}) {
  const me = await getOwner();
  if (!me) return null; // layout sudah redirect
  if (me.role !== "PEMILIK") redirect("/panel");

  const row = await prisma.siteSetting.findUnique({ where: { id: 1 } });
  const v = row ?? SITE; // bila belum pernah diisi, tampilkan nilai default
  const flash = searchParams.ok ? (
    <p className="flash flash-ok">{searchParams.ok}</p>
  ) : searchParams.err ? (
    <p className="flash flash-err">{searchParams.err}</p>
  ) : null;

  const input = { padding: "8px 10px", fontSize: 13.5, border: "1px solid var(--krem-300)", borderRadius: 6, width: "100%", background: "var(--paper)" };
  const F = ({ label, name, ph, hint, lebar }: { label: string; name: string; ph?: string; hint?: string; lebar?: number }) => (
    <div className="f" style={{ flex: `1 1 ${lebar ?? 260}px` }}>
      <label>{label}</label>
      <input name={name} defaultValue={(v as Record<string, string>)[name] ?? ""} placeholder={ph} style={input} />
      {hint ? <small style={{ color: "var(--ink-faint)", fontSize: 11.5, display: "block", marginTop: 3 }}>{hint}</small> : null}
    </div>
  );

  return (
    <>
      <div className="topbar">
        <div>
          <h1>Kontak &amp; Info Situs</h1>
          <div className="crumb">Panel Pengelola → Kontak &amp; Info Situs</div>
        </div>
      </div>
      {flash}

      <div className="card">
        <div className="card-h">
          <h2>Data Kontak &amp; Lokasi</h2>
          <span className="sub">
            Satu sumber untuk seluruh halaman pengunjung — footer, beranda, katalog, detail ayam, dan form minat.
            {row ? ` Terakhir diubah ${formatWaktu(row.updatedAt)}.` : " Belum pernah diubah — masih memakai nilai bawaan."}
          </span>
        </div>
        <div className="card-body">
          <form method="post" action="/api/panel/kontak" style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <F label="Nama pemilik" name="pemilik" ph="mis. Nama Anda" lebar={220} />
            <F
              label="Nomor WhatsApp (untuk tautan)"
              name="waNumber"
              ph="62…"
              hint="Format internasional tanpa + ; awalan 08… otomatis diubah jadi 628…"
              lebar={240}
            />
            <F label="Tampilan nomor WA" name="waDisplay" ph="mis. +62 800-0000-0000" lebar={220} />

            <F label="Email" name="email" ph="opsional — kosongkan bila belum ada" hint="Kosong = footer menulis “segera menyusul”." lebar={280} />
            <F label="Tautan media sosial" name="sosmed" ph="https://instagram.com/…" hint="URL lengkap. Kosong = tidak tampil." lebar={320} />

            <F label="Alamat — baris 1" name="alamatBaris1" ph="mis. Pedan, Kab. Klaten," lebar={260} />
            <F label="Alamat — baris 2" name="alamatBaris2" ph="mis. Jawa Tengah, Indonesia" lebar={260} />

            <F label="Tautan Google Maps" name="mapsUrl" ph="https://maps.google.com/…" hint="Buka Google Maps → bagikan → salin tautan." lebar={340} />
            <F label="Jam layanan" name="jamLayanan" ph="mis. 08:00 – 17:00 WIB" lebar={200} />

            <div className="f" style={{ flex: "1 1 100%" }}>
              <label>Catatan kunjungan (footer &amp; info reservasi)</label>
              <textarea
                name="catatanKunjungan"
                rows={3}
                defaultValue={v.catatanKunjungan}
                style={{ ...input, resize: "vertical" }}
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 14, width: "100%" }}>
              <button className="btn btn-primary" type="submit">Simpan Kontak &amp; Info</button>
              <small style={{ color: "var(--ink-faint)" }}>
                Perubahan langsung diterapkan ke seluruh halaman pengunjung setelah disimpan.
              </small>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
