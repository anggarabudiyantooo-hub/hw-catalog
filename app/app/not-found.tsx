import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{ minHeight: "70vh", display: "grid", placeItems: "center", textAlign: "center", padding: 40 }}>
      <div>
        <div style={{ fontSize: 60, color: "var(--bata-700)", fontFamily: "var(--serif)" }}>404</div>
        <h1 style={{ fontSize: 26, margin: "8px 0" }}>Halaman tidak ditemukan</h1>
        <p style={{ color: "var(--ink-muted)", fontStyle: "italic", marginBottom: 22 }}>
          Sepertinya ayam ini sedang tidak berada di kandang halaman ini.
        </p>
        <Link className="btn btn-primary" href="/">Kembali ke Beranda</Link>
      </div>
    </div>
  );
}
