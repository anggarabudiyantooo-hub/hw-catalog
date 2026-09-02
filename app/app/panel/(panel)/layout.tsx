import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getOwner, userFromToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ConfirmInit from "@/components/ConfirmInit";
import PanelSession from "@/components/PanelSession";

const NAV = [
  { group: "Ringkasan" },
  { href: "/panel", label: "Dashboard", icon: "M3 3h8v10H3zM13 3h8v6h-8zM13 11h8v10h-8zM3 15h8v6H3z", exact: true },
  { group: "Data Kandang" },
  { href: "/panel/ayam", label: "Data Ayam", icon: "M12 21s-7-5.3-7-11a7 7 0 1 1 14 0c0 5.7-7 11-7 11zM12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z", exact: false },
  { href: "/panel/kategori", label: "Kategori", icon: "M4 5h16M4 12h16M4 19h10", exact: false },
  { href: "/panel/riwayat", label: "Riwayat Tarung", icon: "M4 17 16 5h-9M6.5 17a1.6 1.6 0 1 0 0-3.2 1.6 1.6 0 0 0 0 3.2z", exact: false },
  { group: "Pantauan" },
  { href: "/panel/permintaan", label: "Permintaan Masuk", icon: "M21 11.5a8.4 8.4 0 0 1-9 8.4 8.6 8.6 0 0 1-3.7-.8L3 20l1-5.2a8.4 8.4 0 1 1 17-3.3z", pill: "permintaan" },
  { href: "/panel/laporan", label: "Laporan Katalog", icon: "M6 21V4M6 4h10l-1.8 3.3L16 11H6", pill: "laporan" },
  { group: "Catatan" },
  { href: "/panel/log", label: "Log Aktivitas", icon: "M3 5h18v16H3zM3 9h18M8 3v4M16 3v4", exact: false },
];

export default async function PanelLayout({ children }: { children: ReactNode }) {
  // fallback demo: bila cookie diblokir, izinkan sesi lewat token ?s= di URL
  const xp = headers().get("x-path") || "";
  const sTok = xp.includes("?") ? new URLSearchParams(xp.slice(xp.indexOf("?") + 1)).get("s") : null;
  let user = await getOwner();
  if (!user && sTok) user = await userFromToken(sTok);
  if (!user) redirect("/panel/login");

  const [countPermintaan, countLaporan, countAyam] = await Promise.all([
    prisma.permintaan.count({ where: { status: "BARU" } }),
    prisma.laporan.count({ where: { status: "BARU" } }),
    prisma.ayam.count(),
  ]);

  return (
    <div className="shell">
      <aside className="side">
        <Link href="/panel" className="brand">
          <span className="brand-mark">
            <svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M12 2 22 12 12 22 2 12Z" /><path d="M12 7.5 16.5 12 12 16.5 7.5 12Z" strokeWidth="1" /></svg>
          </span>
          <span>
            <span className="brand-name" style={{ fontSize: 19 }}>JALU</span>
            <span className="brand-sub">Panel Pengelola</span>
          </span>
        </Link>
        <nav className="side-nav">
          {NAV.map((item) =>
            item.group ? (
              <div className="side-group" key={item.group}>{item.group}</div>
            ) : (
              <Link key={item.href} href={item.href!}>
                <svg viewBox="0 0 24 24">{item.icon}</svg>
                {item.label}
                {(item as { pill?: string }).pill === "permintaan" && countPermintaan > 0 && (
                  <span className="pill">{countPermintaan}</span>
                )}
                {(item as { pill?: string }).pill === "laporan" && countLaporan > 0 && (
                  <span className="pill">{countLaporan}</span>
                )}
              </Link>
            )
          )}
        </nav>
        <div className="side-user">
          <span className="avatar">{user.nama.charAt(0)}</span>
          <span>
            <b>{user.nama}</b>
            <span>Pemilik &amp; Pengelola</span>
          </span>
          <form action="/api/auth/logout" method="post">
            <button type="submit" className="out" style={{ background: "none", border: 0, cursor: "pointer" }}>Keluar</button>
          </form>
        </div>
      </aside>
      <main className="panel-main">{children}</main>
      <ConfirmInit />
      <PanelSession />
    </div>
  );
}
