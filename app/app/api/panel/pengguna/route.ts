import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { guardPemilik } from "@/lib/izin";
import { infodari } from "@/lib/requestinfo";
import { reqBase, redirectLocal } from "@/lib/auth";
import { SEMUA_MODUL } from "@/lib/izin";
import { firebaseAktif, firebaseSyncSandi } from "@/lib/firebase";

export async function POST(req: Request) {
  const BASE = reqBase(req);
  const { user: owner, res } = await guardPemilik(req);
  if (res) return res;

  const fd = await req.formData();
  const nama = String(fd.get("nama") || "").trim();
  const email = String(fd.get("email") || "").trim().toLowerCase();
  const password = String(fd.get("password") || "");
  const izin = fd.getAll("izin").map((v) => String(v).trim()).filter((k) =>
    (SEMUA_MODUL as readonly string[]).includes(k)
  );

  const ref = req.headers.get("referer") || `${BASE}/panel/pengguna`;
  const go = (ok?: string, err?: string) => {
    const u = new URL(ref, BASE);
    if (ok) u.searchParams.set("ok", ok);
    if (err) u.searchParams.set("err", err);
    const sTok = new URL(req.url).searchParams.get("s");
    if (sTok) u.searchParams.set("s", sTok);
    return redirectLocal(u.pathname + u.search);
  };

  if (!nama) return go(undefined, "Nama wajib diisi.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return go(undefined, "Email tidak valid.");
  if (password.length < 6) return go(undefined, "Kata sandi minimal 6 karakter.");

  const ada = await prisma.user.findUnique({ where: { email } });
  if (ada) return go(undefined, "Email sudah terdaftar.");

  // Bila Firebase aktif, daftarkan juga di Firebase (email + sandi sama).
  // Kegagalan sinkron Firebase TIDAK menggagalkan pembuatan akun lokal —
  // login pertama tetap bisa lewat jalur migrasi otomatis.
  if (firebaseAktif()) {
    await firebaseSyncSandi(email, password);
  }

  await prisma.user.create({
    data: {
      nama,
      email,
      passwordHash: await bcrypt.hash(password, 10),
      role: "ADMIN", // akun baru selalu berperan Admin; izin diatur oleh pemilik
      izin,
    },
  });

  await prisma.log.create({
    data: {
      ...infodari(req), userId: owner!.id, aksi: "CREATE", entitas: "pengguna",
      detail: `Tambah admin "${nama}" (${email}) — izin: ${izin.length ? izin.join(", ") : "(belum ada)"}`,
    },
  }).catch(() => {});

  return go(`Admin "${nama}" ditambahkan. Beri tahu sandi awal lewat saluran aman.`);
}
