import Link from "next/link";
import { redirect } from "next/navigation";
import { getOwner } from "@/lib/auth";
import { LogoMark } from "@/components/Logo";
import { SITE } from "@/lib/config";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { err?: string; ok?: string };
}) {
  const user = await getOwner();
  if (user) redirect("/panel");

  return (
    <div className="login-wrap">
      <div className="login-top">
        <Link href="/" className="login-back">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><path d="M19 12H5M11 18l-6-6 6-6" /></svg>
          Kembali ke Beranda
        </Link>
        <Link href="/" className="login-brand" aria-label={`${SITE.brand} — kembali ke beranda`}>
          <LogoMark size={26} />
          <span>{SITE.brand}</span>
        </Link>
      </div>
      <div className="login-card">
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <LogoMark />
          <div>
            <div style={{ fontSize: 20, letterSpacing: ".3em", fontWeight: 600, color: "var(--bata-700)" }}>JALU</div>
            <div style={{ fontSize: 10, letterSpacing: ".22em", textTransform: "uppercase", color: "var(--ink-muted)" }}>
              Panel Pengelola
            </div>
          </div>
        </div>
        <h1 style={{ fontSize: 21 }}>Masuk</h1>
        <p className="sub">Halaman ini khusus pemilik kandang. Login untuk mengelola katalog ayam.</p>

        {searchParams.err && <p className="flash flash-err">Email atau kata sandi salah.</p>}

        <form method="post" action="/api/auth/login">
          <div className="f" style={{ marginBottom: 14 }}>
            <label>Email</label>
            <input type="email" name="email" defaultValue="admin@jalu.id" required autoComplete="username" />
          </div>
          <div className="f" style={{ marginBottom: 18 }}>
            <label>Kata sandi</label>
            <input type="password" name="password" required autoComplete="current-password" />
          </div>
          <button className="btn btn-primary btn-block" type="submit">Masuk ke Panel</button>
        </form>
        <p style={{ marginTop: 16, fontSize: 12, color: "var(--ink-faint)", fontStyle: "italic" }}>
          Demo: admin@jalu.id / jalu1234 (dapat diubah di halaman Data Pengguna/seed).
        </p>
      </div>
    </div>
  );
}
