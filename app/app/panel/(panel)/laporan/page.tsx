import Link from "next/link";
import { prisma } from "@/lib/prisma";
import AutoFormSelect from "@/components/AutoFormSelect";

export const dynamic = "force-dynamic";

const JENIS_LABEL: Record<string, string> = {
  INFO_TIDAK_UPDATE: "Info tidak diperbarui",
  MASIH_TAMPIL_PADAHAL_TERJUAL: "Masih tampil padahal terjual",
  DATA_KELIRU: "Foto / data keliru",
  LAINNYA: "Lainnya",
};
const ST: Record<string, { cls: string; label: string }> = {
  BARU: { cls: "draft", label: "Baru" },
  DITINDAKLANJUTI: { cls: "dipesan", label: "Ditindaklanjuti" },
  SELESAI: { cls: "tersedia", label: "Selesai" },
  TUTUP: { cls: "terjual", label: "Tutup" },
};

export default async function LaporanPage({
  searchParams,
}: {
  searchParams: { ok?: string; err?: string };
}) {
  const rows = await prisma.laporan.findMany({
    include: { ayam: { select: { id: true, nama: true, slug: true, kodeRing: true } } },
    orderBy: { createdAt: "desc" },
    take: 200,
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
          <h1>Laporan Katalog</h1>
          <div className="crumb">Dari pengunjung yang menemukan info tidak update / keliru</div>
        </div>
      </div>
      {flash}

      <div className="card">
        <div className="card-h">
          <h2>Daftar Laporan</h2>
          <span className="sub">Tidak mengubah data otomatis — hanya pemberitahuan untuk Anda periksa</span>
        </div>
        <table className="data">
          <thead>
            <tr><th>Waktu</th><th>Ayam terkait</th><th>Jenis</th><th>Keterangan</th><th>Status</th></tr>
          </thead>
          <tbody>
            {rows.map((l) => {
              const st = ST[l.status] ?? { cls: "draft", label: l.status };
              return (
                <tr key={l.id}>
                  <td style={{ whiteSpace: "nowrap" }}>
                    {new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(l.createdAt)}
                  </td>
                  <td>
                    {l.ayam ? (
                      <Link href={`/panel/ayam/${l.ayam.id}`} style={{ color: "var(--bata-700)" }}>{l.ayam.nama}</Link>
                    ) : (
                      <span style={{ color: "var(--ink-faint)", fontStyle: "italic" }}>Umum / telah dihapus</span>
                    )}
                  </td>
                  <td>{JENIS_LABEL[l.jenis] ?? l.jenis}</td>
                  <td style={{ color: "var(--ink-muted)", fontSize: 12.5, maxWidth: 260 }}>{l.isi || "—"}</td>
                  <td>
                    <form action={`/api/panel/laporan/${l.id}`} method="post">
                      <AutoFormSelect name="status" defaultValue={l.status} style={{ padding: "4px 6px", fontSize: 12, border: "1px solid var(--krem-300)", borderRadius: 5, background: "var(--paper)" }}>
                        <option value="BARU">Baru</option>
                        <option value="DITINDAKLANJUTI">Ditindaklanjuti</option>
                        <option value="SELESAI">Selesai</option>
                        <option value="TUTUP">Tutup</option>
                      </AutoFormSelect>
                    </form>
                    <span className={`st ${st.cls}`} style={{ marginTop: 6 }}><i />{st.label}</span>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr><td colSpan={5}><div className="empty">Belum ada laporan dari pengunjung.</div></td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
