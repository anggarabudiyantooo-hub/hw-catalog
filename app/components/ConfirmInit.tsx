"use client";
import { useEffect } from "react";

/** Menambahkan konfirmasi pada semua form ber-atribut data-confirm (panel). */
export default function ConfirmInit() {
  useEffect(() => {
    const handler = (e: SubmitEvent) => {
      const form = e.target as HTMLFormElement;
      const msg = form.getAttribute("data-confirm");
      if (msg && !window.confirm(msg)) {
        e.preventDefault();
      }
    };
    document.addEventListener("submit", handler);
    return () => document.removeEventListener("submit", handler);
  }, []);
  return null;
}
