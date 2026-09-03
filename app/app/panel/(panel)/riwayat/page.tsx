import { redirect } from "next/navigation";
import { cekModulHalaman } from "@/lib/izin";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatTanggal } from "@/lib/format";
import AutoFormSelect from "@/components/AutoFormSelect";

export const dynamic = "force-dynamic";

export default async function RiwayatPage({
  searchParams,
}: {
  searchParams: { ayam?: string; ok?: string; err?: string };
}) {
  if (!(await cekModulHalaman("riwayat"))) redirect("/panel");

  const rows = await prisma.riwayatTarung.findMany({
    include: { ayam: { include: { kategori: true } } },
    orderBy: { tanggal: "desc" },
    take: 200,
  });
  const filterAyam = searchParams.ayam ? Number(searchParams.ayam) : null;
  const filtered = filterAyam ? rows.filter((r) => r.ayamId === filterAyam) : rows;

  const ayamList = await prisma.ayam.findMany({ where: { isArsip: false }, orderBy: { nama: "asc" } });
  const flash = searchParams.ok ? (
    <p className="flash flash-ok">{searchParams.ok}</p>
  ) : searchParams.err ? (
    <p className="flash flash-err">{searchParams.err}</p>
  ) : null;

  return (
    <>
      <div className="topbar">
        <div>
          <h1>Riwayat Tarung</h1>
          <div className="crumb">Panel Pengelola → Riwayat Tarung</div>
        </div>
        <div className="right">
          <form method="get" action="/panel/riwayat">
            <AutoFormSelect name="ayam" defaultValue={filterAyam ? String(filterAyam) : ""} style={{ padding: "8px 10px", fontSize: 13, border: "1px solid var(--krem-300)", borderRadius: 5, background: "var(--paper)" }}>
              <option value="">Semua ayam</option>
              {ayamList.map((a) => (
                <option key={a.id} value={a.id}>{a.nama}</option>
              ))}
            </AutoFormSelect>
          </form>
        </div>
      </div>
      {flash}

      <div className="card">
        <div className="card-h">
          <h2>Daftar Hasil Laga</h2>
          <span className="sub">Rekap Menang/Kalah/Seri dihitung otomatis dari catatan ini</span>
        </div>
        <table className="data">
          <thead>
            <tr><th>Tanggal</th><th>Ayam</th><th>Lawan</th><th>Jenis</th><th>Ronde</th><th>Hasil</th><th>Catatan</th><th></th></tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id}>
                <td>{formatTanggal(r.tanggal)}</td>
                <td>
                  <Link href={`/panel/ayam/${r.ayamId}`} style={{ color: "var(--bata-700)" }}><b>{r.ayam?.nama ?? `#${r.ayamId}`}</b></Link>
                  <small style={{ display: "block", color: "var(--ink-faint)" }}>{r.ayam?.kodeRing}</small>
                </td>
                <td>
                  {r.namaLawan || "—"}
                  {r.beratLawan != null && <small style={{ color: "var(--ink-faint)" }}> · {String(r.beratLawan).replace(".", ",")} kg</small>}
                </td>
                <td>{r.jenisLaga === "ADU_RESMI" ? "Adu resmi" : "Uji terbatas"}</td>
                <td>{r.ronde ?? "—"}</td>
                <td>
                  <span className={`res ${r.hasil === "MENANG" ? "win" : r.hasil === "KALAH" ? "loss" : "draw"}`}>
                    {r.hasil === "MENANG" ? "Menang" : r.hasil === "KALAH" ? "Kalah" : "Seri"}
                  </span>
                </td>
                <td style={{ color: "var(--ink-muted)", fontSize: 12.5, maxWidth: 240 }}>{r.catatan || "—"}</td>
                <td>
                  <form action={`/api/panel/riwayat/${r.id}`} method="post" data-confirm="Hapus catatan laga ini?" style={{ display: "inline" }}>
                    <input type="hidden" name="act" value="hapus" />
                    <button className="btn btn-danger btn-xs" type="submit">Hapus</button>
                  </form>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={8}><div className="empty">Belum ada catatan laga. Tambahkan lewat halaman kelola ayam.</div></td></tr>
            )}
          </tbody>
        </table>
        <div className="t-note">
          Untuk menambah hasil laga, buka halaman <b>Data Ayam → Kelola</b> pada ayam bersangkutan (form “Catat Hasil” di seksi Riwayat Tarung).
        </div>
      </div>
    </>
  );
}
