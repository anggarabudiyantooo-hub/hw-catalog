import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const AK = new Set([
  "LOGIN", "CREATE", "UPDATE", "DELETE", "ARSIP", "PULIHKAN", "UBAH_STATUS", "KELOLA_KATEGORI", "LAINNYA",
]);

export default async function LogPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const q = (searchParams.q || "").toLowerCase();
  const logs = await prisma.log.findMany({
    include: { user: { select: { nama: true, email: true } } },
    orderBy: { createdAt: "desc" },
    take: 300,
  });
  const data = q
    ? logs.filter((l) => [l.aksi, l.entitas, l.detail, l.user?.nama ?? ""].join(" ").toLowerCase().includes(q))
    : logs;

  return (
    <>
      <div className="topbar">
        <div>
          <h1>Log Aktivitas</h1>
          <div className="crumb">Jejak perubahan yang dilakukan pemilik</div>
        </div>
        <div className="right">
          <form method="get" action="/panel/log">
            <input name="q" defaultValue={q} placeholder="Cari log…" style={{ padding: "8px 11px", fontSize: 13, border: "1px solid var(--krem-300)", borderRadius: 5, background: "var(--paper)" }} />
            <button className="btn btn-sec btn-sm" type="submit">Cari</button>
          </form>
        </div>
      </div>

      <div className="card">
        <div className="card-h">
          <h2>300 catatan terakhir</h2>
          <span className="sub">Bersifat catatan (append) — tidak bisa diubah lewat antarmuka</span>
        </div>
        <table className="data">
          <thead>
            <tr><th>Waktu</th><th>Pelaku</th><th>Aksi</th><th>Entitas</th><th>Detail</th></tr>
          </thead>
          <tbody>
            {data.map((l) => (
              <tr key={l.id}>
                <td style={{ whiteSpace: "nowrap", color: "var(--ink-muted)", fontSize: 12.5 }}>
                  {new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(l.createdAt)}
                </td>
                <td>{l.user?.nama ?? "—"}</td>
                <td>
                  <span className={`res ${l.aksi === "DELETE" || l.aksi === "ARSIP" ? "loss" : l.aksi === "CREATE" ? "win" : "draw"}`}>
                    {l.aksi}
                  </span>
                </td>
                <td>{l.entitas}{l.entitasId ? ` #${l.entitasId}` : ""}</td>
                <td style={{ color: "var(--ink-muted)", fontSize: 12.5 }}>{l.detail || "—"}</td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr><td colSpan={5}><div className="empty">Belum ada catatan.</div></td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
