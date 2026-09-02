"use client";
import { useEffect } from "react";

/**
 * Fallback sesi DEMO untuk lingkungan yang memblokir cookie (mis. iframe
 * lintas-situs). Menyimpan token ?s= lalu menyisipkannya ke setiap tautan dan
 * submit form di dalam /panel sehingga sesi tetap terbawa antar permintaan.
 * Bila cookie bekerja normal, komponen ini tidak mengganggu.
 */
const KEY = "jalu_s";

function hasParam(u: string, name: string) {
  const q = u.includes("?") ? u.slice(u.indexOf("?") + 1) : "";
  return q.split("&").some((x) => x.split("=")[0] === name);
}

function addParam(u: string, name: string, value: string) {
  const [base, q] = u.split("?");
  const params = (q || "")
    .split("&")
    .filter(Boolean)
    .filter((x) => !x.startsWith(`${name}=`));
  params.push(`${name}=${encodeURIComponent(value)}`);
  return `${base}?${params.join("&")}`;
}

export default function PanelSession() {
  useEffect(() => {
    // 1) Tangkap token dari URL saat pertama masuk (?s=...), simpan di sessionStorage
    let token = new URLSearchParams(window.location.search).get("s") || "";
    if (token) {
      try {
        sessionStorage.setItem(KEY, token);
      } catch {
        /* storage tak tersedia */
      }
      // bersihkan URL agar token tidak terlihat/tersimpan di riwayat
      try {
        window.history.replaceState(null, "", window.location.pathname + window.location.hash);
      } catch {
        /* biarkan apa adanya */
      }
    } else {
      try {
        token = sessionStorage.getItem(KEY) || "";
      } catch {
        token = "";
      }
    }

    if (!token) return;

    const read = () => {
      try {
        return sessionStorage.getItem(KEY) || token;
      } catch {
        return token;
      }
    };

    // 2) Klik tautan internal /panel: pastikan ?s terbawa
    const onClick = (e: MouseEvent) => {
      const el = e.target as Element | null;
      const a = el?.closest?.("a") as HTMLAnchorElement | null;
      if (!a) return;
      let href = a.getAttribute("href") || "";
      const t = read();
      if (!t || !href.startsWith("/panel")) return;
      if (!hasParam(href, "s")) {
        e.preventDefault();
        const target = addParam(href, "s", t);
        window.location.assign(target);
      }
    };

    // 3) Submit form panel/API: sisipkan ?s agar route handler mengenali sesi
    const onSubmit = (e: Event) => {
      const f = e.target as HTMLFormElement | null;
      if (!f || typeof f.action !== "string") return;
      const t = read();
      if (!t) return;
      const act = f.action || window.location.href;
      const path = (() => {
        try {
          return new URL(act).pathname;
        } catch {
          return act;
        }
      })();
      const isLogout = path.endsWith("/api/auth/logout");
      if (isLogout) {
        try {
          sessionStorage.removeItem(KEY);
        } catch {
          /* abaikan */
        }
        return; // biarkan logout normal (tanpa s)
      }
      // Semua aksi internal panel (/panel halaman & /api/panel mutasi) wajib
      // membawa ?s bila cookie diblokir — kalau tidak, simpan/hapus akan
      // dianggap belum login dan dilempar ke /panel/login.
      const isInternal =
        path.startsWith("/panel") || path.startsWith("/api/panel");
      if (!isInternal) return;
      if (!hasParam(act, "s")) {
        f.setAttribute("action", addParam(act, "s", t));
      }
    };

    document.addEventListener("click", onClick, true);
    document.addEventListener("submit", onSubmit, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("submit", onSubmit, true);
    };
  }, []);

  return null;
}
