import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getOwner, userFromToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { boleh, type KunciModul } from "@/lib/izin";
import ConfirmInit from "@/components/ConfirmInit";
import PanelSession from "@/components/PanelSession";
import PanelNavDrawer from "@/components/PanelNavDrawer";
import { LogoMark } from "@/components/Logo";
import { SITE } from "@/lib/config";

interface ItemNav { group?: string; href?: string; label?: string; icon?: string; exact?: boolean; mod?: string; pill?: string; pemilikOnly?: boolean }
const NAV: ItemNav[] = [
  { group: "Ringkasan" },
  { href: "/panel", label: "Dashboard", icon: "M3 3h8v10H3zM13 3h8v6h-8zM13 11h8v10h-8zM3 15h8v6H3z", exact: true },
  { href: "/panel/profil", label: "Profil Saya", icon: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm0 2c-4.4 0-8 2.2-8 5v2h16v-2c0-2.8-3.6-5-8-5z" },
  { group: "Data Kandang" },
  { href: "/panel/ayam", label: "Data Ayam", icon: "M12 21s-7-5.3-7-11a7 7 0 1 1 14 0c0 5.7-7 11-7 11zM12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z", exact: false, mod: "ayam" },
  { href: "/panel/kategori", label: "Kategori", icon: "M4 5h16M4 12h16M4 19h10", exact: false, mod: "kategori" },
  { href: "/panel/riwayat", label: "Riwayat Tarung", icon: "M4 17 16 5h-9M6.5 17a1.6 1.6 0 1 0 0-3.2 1.6 1.6 0 0 0 0 3.2z", exact: false, mod: "riwayat" },
  { group: "Pantauan" },
  { href: "/panel/permintaan", label: "Permintaan Masuk", icon: "M21 11.5a8.4 8.4 0 0 1-9 8.4 8.6 8.6 0 0 1-3.7-.8L3 20l1-5.2a8.4 8.4 0 1 1 17-3.3z", mod: "permintaan", pill: "permintaan" },
  { href: "/panel/laporan", label: "Laporan Katalog", icon: "M6 21V4M6 4h10l-1.8 3.3L16 11H6", mod: "laporan", pill: "laporan" },
  { group: "Catatan" },
  { href: "/panel/log", label: "Log Aktivitas", icon: "M3 5h18v16H3zM3 9h18M8 3v4M16 3v4", exact: false, mod: "log" },
  { group: "Kelola" },
  { href: "/panel/pengguna", label: "Pengguna & Hak Akses", icon: "M12 5.5a3 3 0 1 1 0 6 3 3 0 0 1 0-6zM5 20c.8-2.7 3.6-4 7-4s6.2 1.3 7 4", pemilikOnly: true },
];

/** Filter menu sesuai peran & izin: grup kosong dibuang, item pemilik disembunyikan utk admin. */
function filterNav(nav: ItemNav[], user: { role: string; izin: string[] }): ItemNav[] {
  const out: ItemNav[] = [];
  let pending: ItemNav | null = null;
  for (const it of nav) {
    if (it.group) { pending = it; continue; }
    if (it.mod && !boleh(user, it.mod as KunciModul)) continue;
    if (it.pemilikOnly && user.role !== "PEMILIK") continue;
    if (pending) { out.push(pending); pending = null; }
    out.push(it);
  }
  return out;
}

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
          <LogoMark size={42} />
          <span>
            <span className="brand-name" style={{ fontSize: 17 }}>{SITE.brand}</span>
            <span className="brand-sub">Panel Pengelola</span>
          </span>
        </Link>
        <PanelNavDrawer />
        <nav className="side-nav">
          {filterNav(NAV, user).map((item) =>
            item.group ? (
              <div className="side-group" key={item.group}>{item.group}</div>
            ) : (
              <Link key={item.href} href={item.href!}>
                <svg viewBox="0 0 24 24">{item.icon}</svg>
                {item.label}
                {item.pill === "permintaan" && countPermintaan > 0 && (
                  <span className="pill">{countPermintaan}</span>
                )}
                {item.pill === "laporan" && countLaporan > 0 && (
                  <span className="pill">{countLaporan}</span>
                )}
              </Link>
            )
          )}
        </nav>
        <div className="side-user">
          <Link href="/panel/profil" className="avatar av-link" title="Ubah foto profil">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt="Foto profil" />
            ) : (
              user.nama.charAt(0)
            )}
          </Link>
          <span>
            <b>{user.nama}</b>
            <span>{user.role === "PEMILIK" ? "Pemilik" : "Admin"} &amp; Pengelola</span>
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
