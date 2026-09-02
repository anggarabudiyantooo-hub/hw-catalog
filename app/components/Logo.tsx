import { SITE } from "@/lib/config";

/** Emblem merek (logo PNG transparan) dalam bingkai merah-bata. */
export function LogoMark({ size = 44 }: { size?: number }) {
  return (
    <span
      className="brand-mark"
      style={{ width: size, height: size, borderRadius: "50%", overflow: "hidden", padding: Math.round(size * 0.08) }}
      aria-hidden="true"
    >
      <img
        src="/brand/hw-logo.png"
        alt=""
        style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
      />
    </span>
  );
}

/** Tanda merek lengkap: emblem + nama & tagline dari konfigurasi. */
export function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className="brand">
      <LogoMark />
      <span>
        <span className="brand-name" style={light ? { color: "#F2E4C6" } : undefined}>{SITE.brand}</span>
        <span className="brand-sub" style={light ? { color: "#B99F78" } : undefined}>{SITE.tagline}</span>
      </span>
    </span>
  );
}
