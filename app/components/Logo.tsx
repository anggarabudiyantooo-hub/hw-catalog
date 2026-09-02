export function LogoMark({ size = 40 }: { size?: number }) {
  return (
    <span className="brand-mark" style={{ width: size, height: size }}>
      <svg viewBox="0 0 24 24" width={size * 0.55} height={size * 0.55} fill="none" stroke="currentColor" strokeWidth="1.4">
        <path d="M12 2 22 12 12 22 2 12Z" />
        <path d="M12 7.5 16.5 12 12 16.5 7.5 12Z" strokeWidth="1" />
      </svg>
    </span>
  );
}

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className="brand" style={{ color: "inherit" }}>
      <LogoMark />
      <span>
        <span className="brand-name" style={light ? { color: "#F2E4C6" } : undefined}>JALU</span>
        <span className="brand-sub" style={light ? { color: "#B99F78" } : undefined}>Galeri Ayam Bangkok · Solo</span>
      </span>
    </span>
  );
}
