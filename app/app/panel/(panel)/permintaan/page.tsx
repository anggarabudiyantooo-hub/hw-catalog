import { redirect } from "next/navigation";
import { cekModulHalaman } from "@/lib/izin";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { waLinkDari } from "@/lib/config";
import { getSite } from "@/lib/site";
import AutoFormSelect from "@/components/AutoFormSelect";
import { formatWaktu } from "@/lib/format";

export const dynamic = "force-dynamic";

const ST: Record<string, { cls: string; label: string }> = {
  BARU: { cls: "draft", label: "Baru" },
  DIHUBUNGI: { cls: "dipesan", label: "Dihubungi" },
  DEAL: { cls: "tersedia", label: "Deal" },
  BATAL: { cls: "terjual", label: "Batal" },
};

export default async function PermintaanPage({
  searchParams,
}: {
  searchParams: { ok?: string; err?: string; st?: string };
}) {
  if (!(await cekModulHalaman("permintaan"))) redirect("/panel");

  const [site, rows] = await Promise.all([
    getSite(),
    prisma.permintaan.findMany({
      include: { ayam: { select: { id: true, nama: true, slug: true, kodeRing: true } } },
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
  ]);
  const filter = searchParams.st || "";
  const data = filter ? rows.filter((r) => r.status === filter) : rows;
  const flash = searchParams.ok ? (
    <p className="flash flash-ok">{searchParams.ok}</p>
  ) : searchParams.err ? (
    <p className="flash flash-err">{searchParams.err}</p>
  ) : null;

  return (
    <>
      <div className="topbar">
        <div>
          <h1>Permintaan Masuk</h1>
          <div className="crumb">Minat pembeli dari form “Saya Tertarik”</div>
        </div>
        <div className="right">
          <form method="get" action="/panel/permintaan">
            <AutoFormSelect name="st" defaultValue={filter} style={{ padding: "8px 10px", fontSize: 13, border: "1px solid var(--krem-300)", borderRadius: 5, background: "var(--paper)" }}>
              <option value="">Semua status</option>
              <option value="BARU">Baru</option>
              <option value="DIHUBUNGI">Dihubungi</option>
              <option value="DEAL">Deal</option>
              <option value="BATAL">Batal</option>
            </AutoFormSelect>
          </form>
        </div>
      </div>
      {flash}

      <div className="card">
        <div className="card-h">
          <h2>Daftar Permintaan</h2>
          <span className="sub">Hubungi lewat WhatsApp lalu ubah statusnya</span>
        </div>
        <table className="data">
          <thead>
            <tr><th>Waktu (WIB)</th><th>Pembeli</th><th>Ayam diminati</th><th>Pesan</th><th>Status</th><th>Aksi</th></tr>
          </thead>
          <tbody>
            {data.map((p) => {
              const st = ST[p.status] ?? { cls: "draft", label: p.status };
              return (
                <tr key={p.id}>
                  <td style={{ whiteSpace: "nowrap" }}>
                    {formatWaktu(p.createdAt, { tahun: true })}
                  </td>
                  <td>
                    <b>{p.namaPengunjung}</b>
                    <small style={{ display: "block", color: "var(--ink-faint)" }}>{p.noWa}{p.kota ? ` · ${p.kota}` : ""}</small>
                  </td>
                  <td>
                    {p.ayam ? (
                      <Link href={`/panel/ayam/${p.ayam.id}`} style={{ color: "var(--bata-700)" }}>{p.ayam.nama}</Link>
                    ) : (
                      <span style={{ color: "var(--ink-faint)", fontStyle: "italic" }}>Ayam telah dihapus</span>
                    )}
                  </td>
                  <td style={{ color: "var(--ink-muted)", fontSize: 12.5, maxWidth: 240 }}>{p.pesan || "—"}</td>
                  <td><span className={`st ${st.cls}`}><i />{st.label}</span></td>
                  <td>
                    <div className="aksi" style={{ alignItems: "center" }}>
                      <a className="u" href={waLinkDari(site.waNumber, `Halo ${p.namaPengunjung}, saya ${site.pemilik} dari ${site.nama} — menanggapi minat Anda untuk ${p.ayam?.nama ?? "ayam"} di website.`)} target="_blank" rel="noopener" style={{ color: "#2f6b4f" }}>WA</a>
                      <form action={`/api/panel/permintaan/${p.id}`} method="post" style={{ display: "inline" }}>
                        <AutoFormSelect name="status" defaultValue={p.status} style={{ padding: "4px 6px", fontSize: 12, border: "1px solid var(--krem-300)", borderRadius: 5, background: "var(--paper)" }}>
                          <option value="BARU">Baru</option>
                          <option value="DIHUBUNGI">Dihubungi</option>
                          <option value="DEAL">Deal</option>
                          <option value="BATAL">Batal</option>
                        </AutoFormSelect>
                      </form>
                    </div>
                  </td>
                </tr>
              );
            })}
            {data.length === 0 && (
              <tr><td colSpan={6}><div className="empty">Belum ada permintaan masuk.</div></td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
