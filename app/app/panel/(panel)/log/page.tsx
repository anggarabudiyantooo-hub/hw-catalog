import { redirect } from "next/navigation";
import { getOwner } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { boleh } from "@/lib/izin";
import { tampilLokasi, tampilPerangkat } from "@/lib/requestinfo";

export const dynamic = "force-dynamic";

function kelasAksi(a: string): string {
  if (a === "LOGIN" || a === "CREATE") return "win";
  if (a === "DELETE" || a === "ARSIP" || a === "LOGIN_GAGAL") return "loss";
  return "draw";
}

export default async function LogPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const user = await getOwner();
  if (!user) return null; // layout redirect
  if (!boleh(user, "log")) redirect("/panel");

  const q = (searchParams.q || "").toLowerCase();
  const logs = await prisma.log.findMany({
    include: { user: { select: { nama: true, email: true } } },
    orderBy: { createdAt: "desc" },
    take: 300,
  });
  const data = q
    ? logs.filter((l) =>
        [l.aksi, l.entitas, l.detail, l.user?.nama ?? "", l.email ?? "", l.ip ?? ""].join(" ").toLowerCase().includes(q)
      )
    : logs;

  return (
    <>
      <div className="topbar">
        <div>
          <h1>Log Aktivitas</h1>
          <div className="crumb">
            Jejak login/logout &amp; seluruh aksi pengelola — termasuk perangkat dan lokasi perkiraan
          </div>
        </div>
        <div className="right">
          <form method="get" action="/panel/log" style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
            <input name="q" defaultValue={q} placeholder="Cari aksi / email / IP…" style={{ padding: "8px 11px", fontSize: 13, border: "1px solid var(--krem-300)", borderRadius: 5, background: "var(--paper)" }} />
            <button className="btn btn-sec btn-sm" type="submit">Cari</button>
          </form>
        </div>
      </div>

      <div className="card">
        <div className="card-h">
          <h2>300 catatan terakhir</h2>
          <span className="sub">
            Login/logout dicatat otomatis; lokasi hanya perkiraan dari IP (negara/kota), bukan GPS.
          </span>
        </div>
        <div className="data-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Waktu</th>
                <th>Pelaku</th>
                <th>Aksi</th>
                <th>Entitas</th>
                <th>Detail</th>
                <th>IP · Lokasi</th>
                <th>Perangkat</th>
              </tr>
            </thead>
            <tbody>
              {data.map((l) => (
                <tr key={l.id}>
                  <td style={{ whiteSpace: "nowrap", color: "var(--ink-muted)", fontSize: 12 }}>
                    {new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(l.createdAt)}
                  </td>
                  <td style={{ maxWidth: 180 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink)", overflowWrap: "anywhere" }}>
                      {l.user?.nama ?? "—"}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--ink-faint)", overflowWrap: "anywhere" }}>
                      {l.email ?? l.user?.email ?? ""}
                    </div>
                  </td>
                  <td>
                    <span className={`res ${kelasAksi(l.aksi)}`}>{l.aksi}</span>
                  </td>
                  <td style={{ whiteSpace: "nowrap", fontSize: 12.5 }}>{l.entitas}{l.entitasId ? ` #${l.entitasId}` : ""}</td>
                  <td style={{ color: "var(--ink-muted)", fontSize: 12.5, minWidth: 180 }}>{l.detail || "—"}</td>
                  <td style={{ whiteSpace: "nowrap", fontSize: 12, color: "var(--ink-muted)" }}>
                    {l.ip || "—"}<br />
                    <span style={{ color: "var(--ink-faint)" }}>{tampilLokasi({ negara: l.negara, kota: l.kota })}</span>
                  </td>
                  <td style={{ whiteSpace: "nowrap", fontSize: 12, color: "var(--ink-muted)" }}>
                    {tampilPerangkat({ perangkat: l.perangkat, browser: l.browser })}
                  </td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr><td colSpan={7}><div className="empty">Belum ada catatan.</div></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
