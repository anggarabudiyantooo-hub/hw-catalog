import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const base = { isArsip: false };
  const [tersedia, dipesan, terjual, draft, permintaanBaru, laporanBaru, ayamTerbaru] = await Promise.all([
    prisma.ayam.count({ where: { ...base, statusJual: "TERSEDIA" } }),
    prisma.ayam.count({ where: { ...base, statusJual: "DIPESAN" } }),
    prisma.ayam.count({ where: { statusJual: "TERJUAL" } }),
    prisma.ayam.count({ where: { statusTampil: "DRAFT", isArsip: false } }),
    prisma.permintaan.count({ where: { status: "BARU" } }),
    prisma.laporan.count({ where: { status: "BARU" } }),
    prisma.ayam.findMany({
      where: { isArsip: false },
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { images: true, kategori: true },
    }),
  ]);

  return (
    <>
      <div className="topbar">
        <div>
          <h1>Dashboard</h1>
          <div className="crumb">Ringkasan kandang</div>
        </div>
        <div className="right">
          <Link className="btn btn-primary" href="/panel/ayam/baru">+ Tambah Ayam</Link>
        </div>
      </div>

      <div className="tiles">
        <div className="tile"><b>{tersedia}</b><span>Tersedia</span></div>
        <div className="tile"><b className="o">{dipesan}</b><span>Dipesan</span></div>
        <div className="tile"><b>{terjual}</b><span>Terjual (riwayat)</span></div>
        <div className="tile"><b className="m">{draft}</b><span>Draft / belum publik</span></div>
      </div>

      <div className="tiles" style={{ gridTemplateColumns: "repeat(2,1fr)", marginTop: 4 }}>
        <Link href="/panel/permintaan" className="tile" style={{ borderTopColor: "#2f6b4f" }}>
          <b className="g">{permintaanBaru}</b><span>Permintaan baru (minat pembeli)</span>
        </Link>
        <Link href="/panel/laporan" className="tile" style={{ borderTopColor: "#a83226" }}>
          <b className="k">{laporanBaru}</b><span>Laporan katalog baru</span>
        </Link>
      </div>

      <div className="card">
        <div className="card-h">
          <h2>Ayam Terbaru</h2>
          <span className="sub">6 entri terakhir</span>
          <div className="tools">
            <Link className="btn btn-sec btn-sm" href="/panel/ayam">Lihat Semua</Link>
          </div>
        </div>
        <table className="data">
          <thead>
            <tr>
              <th>Ayam</th>
              <th>Kategori</th>
              <th>Status</th>
              <th>Harga</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {ayamTerbaru.map((a) => {
              const img = a.images.find((i) => i.isPrimary) || a.images[0];
              const badge: Record<string, string> = { TERSEDIA: "tersedia", DIPESAN: "dipesan", TERJUAL: "terjual" };
              const label: Record<string, string> = { TERSEDIA: "Tersedia", DIPESAN: "Dipesan", TERJUAL: "Terjual" };
              return (
                <tr key={a.id}>
                  <td>
                    <div className="t-ayam">
                      {img && <img src={img.filePath} alt={a.nama} className={a.statusJual === "TERJUAL" ? "sold" : ""} />}
                      <span>
                        <b>{a.nama}</b>
                        <small>{a.kodeRing || "tanpa ring"}</small>
                      </span>
                    </div>
                  </td>
                  <td>{a.kategori?.nama ?? "—"}</td>
                  <td>
                    <span className={`st ${badge[a.statusJual]}`}>
                      <i /> {label[a.statusJual]}
                    </span>
                  </td>
                  <td className="money">{a.harga ? "Rp " + a.harga.toLocaleString("id-ID") : <span className="ask">Hubungi kami</span>}</td>
                  <td>
                    <Link className="btn btn-sec btn-xs" href={`/panel/ayam/${a.id}`}>Kelola</Link>
                  </td>
                </tr>
              );
            })}
            {ayamTerbaru.length === 0 && (
              <tr><td colSpan={5} style={{ fontStyle: "italic", color: "var(--ink-muted)" }}>Belum ada ayam. Tambahkan ayam pertama Anda.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
