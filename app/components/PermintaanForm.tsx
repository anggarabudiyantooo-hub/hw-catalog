"use client";
import { useState, type FormEvent } from "react";
import { waLinkDari, SITE } from "@/lib/config";

export default function PermintaanForm({ ayamId, namaAyam, waNumber }: { ayamId: number; namaAyam: string; waNumber?: string }) {
  const [state, setState] = useState<"idle" | "ok" | "err">("idle");
  const [msg, setMsg] = useState("");

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("ayamId", String(ayamId));
    const nama = String(fd.get("namaPengunjung") || "").trim();
    const noWa = String(fd.get("noWa") || "").trim();
    if (!nama || !noWa) {
      setState("err");
      setMsg("Nama dan nomor WhatsApp wajib diisi.");
      return;
    }
    setState("idle");
    try {
      const r = await fetch("/api/permintaan", { method: "POST", body: fd });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error || "Gagal");
      setState("ok");
      setMsg(data?.wa ? "" : "");
      if (data?.wa && window.confirm("Permintaan terkirim. Lanjut chat WhatsApp pemilik?")) {
        window.open(data.wa, "_blank");
      } else if (!data?.wa) {
        (e.target as HTMLFormElement).reset();
      }
    } catch (err) {
      setState("err");
      setMsg(err instanceof Error ? err.message : "Gagal mengirim.");
    }
  }

  return (
    <form onSubmit={submit}>
      <div className="fgrid">
        <div className="f">
          <label>Nama Anda <i>*</i></label>
          <input name="namaPengunjung" placeholder="mis. Budi Santoso" required />
        </div>
        <div className="f">
          <label>Nomor WhatsApp <i>*</i></label>
          <input name="noWa" type="tel" placeholder="08xx-xxxx-xxxx" required />
        </div>
        <div className="f">
          <label>Kota / Domisili</label>
          <input name="kota" placeholder="mis. Surabaya" />
        </div>
        <div className="f">
          <label>Tawaran / Pesan</label>
          <input name="pesan" placeholder="mis. ingin survei kandang dulu" />
        </div>
      </div>
      <div className="form-foot">
        <button className="btn btn-primary" type="submit">Kirim Minat</button>
        <span className="hint">Data Anda hanya dipakai untuk keperluan penjualan ini.</span>
      </div>
      {state === "ok" && (
        <p className="ok-note">
          Terima kasih — permintaan Anda untuk <b>{namaAyam}</b> terkirim ke pemilik. Beliau akan menghubungi Anda lewat WhatsApp.{" "}
          <a href={waLinkDari(waNumber ?? SITE.waNumber, `Halo, saya tertarik dengan ${namaAyam} dan baru saja mengirim formulir minat di website.`)} target="_blank" rel="noopener" style={{ color: "var(--bata-700)" }}>
            Atau langsung chat WhatsApp
          </a>.
        </p>
      )}
      {state === "err" && <p className="flash flash-err">{msg}</p>}
    </form>
  );
}
