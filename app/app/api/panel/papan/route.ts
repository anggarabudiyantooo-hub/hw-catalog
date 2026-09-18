import { purgPublik } from "@/lib/purg";
import { prisma } from "@/lib/prisma";
import { guardPemilik } from "@/lib/izin";
import { infodari } from "@/lib/requestinfo";
import { reqBase, redirectLocal } from "@/lib/auth";

/** Tambah papan pengumuman baru (khusus pemilik). */
export async function POST(req: Request) {
  const BASE = reqBase(req);
  const { user, res } = await guardPemilik(req);
  if (res) return res;

  const fd = await req.formData();
  const ref = req.headers.get("referer") || `${BASE}/panel/papan`;
  const go = (ok?: string, err?: string) => {
    const u = new URL(ref, BASE);
    if (ok) u.searchParams.set("ok", ok);
    if (err) u.searchParams.set("err", err);
    return redirectLocal(u.pathname + u.search);
  };

  const judul = String(fd.get("judul") || "").trim();
  const pesan = String(fd.get("pesan") || "").trim();
  const jenis = String(fd.get("jenis") || "PERINGATAN").toUpperCase();
  if (!judul) return go(undefined, "Judul papan wajib diisi.");
  if (!["PERINGATAN", "IKLAN", "INFO"].includes(jenis)) return go(undefined, "Jenis papan tidak dikenal.");

  try {
    await prisma.papanInfo.create({
      data: {
        judul,
        pesan,
        jenis,
        kedip: fd.get("kedip") === "on",
        aktif: fd.get("aktif") === "on",
        urutan: Number(fd.get("urutan")) || 0,
      },
    });
    await prisma.log.create({
      data: { ...infodari(req), userId: user!.id, aksi: "CREATE", entitas: "papan", detail: `Tambah papan "${judul}" (${jenis})` },
    }).catch(() => {});
    await purgPublik();
    return go("Papan ditambahkan.");
  } catch {
    return go(undefined, "Gagal menyimpan papan.");
  }
}
