/**
 * Bantuan mencatat informasi permintaan (IP, lokasi perkiraan, perangkat,
 * browser, sistem operasi) ke dalam Log — dipakai oleh route login/logout
 * dan seluruh aksi panel. Parsing User-Agent memakai pola sederhana tanpa
 * dependensi eksternal.
 */

export interface InfoReq {
  ip: string | null;
  negara: string | null;
  kota: string | null;
  perangkat: string | null; // ringkas: "HP · Android" | "PC · Windows"
  browser: string | null;
  os: string | null;
}

export function infodari(req: Request): InfoReq {
  const h = (k: string) => req.headers.get(k);
  const ua = h("user-agent") || "";

  // IP: Vercel memakai x-forwarded-for / x-real-ip; juga x-vercel-*.
  const ff = h("x-forwarded-for");
  const ip =
    (ff ? ff.split(",")[0].trim() : null) ||
    h("x-real-ip") ||
    (h("x-vercel-forwarded-for") ? h("x-vercel-forwarded-for")!.split(",")[0].trim() : null);

  const negara = h("x-vercel-ip-country")?.toUpperCase() || null;
  const region = h("x-vercel-ip-country-region") || null;
  const kota = h("x-vercel-ip-city") || null;

  // Browser
  let browser: string | null = null;
  if (/edg\//i.test(ua)) browser = "Edge";
  else if (/chrome|crios/i.test(ua)) browser = "Chrome";
  else if (/firefox|fxios/i.test(ua)) browser = "Firefox";
  else if (/safari/i.test(ua)) browser = "Safari";
  else if (/opr\//i.test(ua)) browser = "Opera";
  else if (/micromessenger/i.test(ua)) browser = "WeChat";
  else if (/bot|spider|crawl/i.test(ua)) browser = "Bot";
  else browser = null;

  // Sistem operasi
  let os: string | null = null;
  if (/windows/i.test(ua)) os = "Windows";
  else if (/android/i.test(ua)) os = "Android";
  else if (/iphone|ipad|ipod/i.test(ua)) os = /ipad/i.test(ua) ? "iPadOS" : "iOS";
  else if (/mac os x|macintosh/i.test(ua)) os = "macOS";
  else if (/linux/i.test(ua)) os = "Linux";
  else os = null;

  const hp = /mobile|android|iphone|ipad|ipod/i.test(ua) || ua.includes("Mobile");
  const perangkat = hp ? `HP · ${os ?? "seluler"}` : `PC · ${os ?? "desktop"}`;

  return { ip, negara, kota, perangkat, browser, os };
}

/** Lokasi untuk tampilan, mis. "ID · Klaten" atau "ID" atau "—". */
export function tampilLokasi(n: Pick<InfoReq, "negara" | "kota">): string {
  if (!n.negara && !n.kota) return "—";
  return [n.kota, n.negara].filter(Boolean).join(" · ") as string;
}

/** Ringkas perangkat+browser utk tampilan, mis. "HP · Android — Chrome". */
export function tampilPerangkat(n: Pick<InfoReq, "perangkat" | "browser">): string {
  if (!n.perangkat && !n.browser) return "—";
  return [n.perangkat, n.browser].filter(Boolean).join(" — ") as string;
}
