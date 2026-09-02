// Peta skematis inline (SVG) — selalu tampil, offline-friendly.
export function MapSvg({ w = 320, h = 176 }: { w?: number; h?: number }) {
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="map-svg" role="img" aria-label="Peta lokasi HW Catalog, Pedan Klaten"
      style={{ width: "100%", height: "auto" }}>
      <rect width={w} height={h} fill="#efe3c4" rx="8" />
      <rect x="12" y="12" width={w * 0.55} height={h * 0.4} rx="3" fill="#eadab4" />
      <rect x={w * 0.66} y={h * 0.57} width={w * 0.3} height={h * 0.36} rx="3" fill="#e7d5ae" />
      <rect x="14" y="16" width="56" height="38" rx="6" fill="#d6e1c9" />
      <path d="M22 24h40M22 33h28M22 42h40" stroke="#c3d2b2" strokeWidth="1.4" strokeDasharray="4 4" />
      <rect x={w * 0.6} y={0} width="8" height={h} fill="#c8a77e" />
      <line x1={w * 0.625} y1="0" x2={w * 0.625} y2={h} stroke="#f7ecd2" strokeWidth="1.3" strokeDasharray="7 6" />
      <rect x="0" y={h * 0.5} width={w} height="8" fill="#c8a77e" />
      <line x1="0" y1={h * 0.523} x2={w} y2={h * 0.523} stroke="#f7ecd2" strokeWidth="1.3" strokeDasharray="7 6" />
      <text x="16" y={h * 0.46} fontSize="9.5" letterSpacing="1.5" fill="#6f4a24" paintOrder="stroke" stroke="#efe3c4" strokeWidth="3">JL. PEDAN RAYA</text>
      <text x={w * 0.88} y={h * 0.62} fontSize="8.6" letterSpacing="1" fill="#6f4a24" transform={`rotate(90 ${w * 0.88} ${h * 0.62})`}>JL. KLATEN</text>
      <path d={`M${w * 0.78} ${h * 0.84}c0-1.5-17-26-17-40a17 17 0 1 1 34 0c0 14-17 38.5-17 38.5z`} fill="#8a1e1a" />
      <circle cx={w * 0.78} cy={h * 0.5} r="6.2" fill="#fbf0da" />
      <ellipse cx={w * 0.78} cy={h * 0.9} rx="15" ry="4" fill="#c9a67b" opacity=".45" />
      <text x="14" y={h - 6} fontSize="9.5" fontStyle="italic" fill="#7a5a38">Kawasan Pedan · Kab. Klaten</text>
    </svg>
  );
}
