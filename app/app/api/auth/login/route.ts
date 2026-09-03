import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { setSessionCookie, redirectLocal, createSession } from "@/lib/auth";
import { infodari } from "@/lib/requestinfo";
import { firebaseAktif, firebaseSignIn, firebaseSyncSandi } from "@/lib/firebase";

export async function POST(req: Request) {
  const fd = await req.formData();
  const email = String(fd.get("email") || "").trim().toLowerCase();
  const password = String(fd.get("password") || "");
  const meta = infodari(req);

  const user = await prisma.user.findUnique({ where: { email } });

  // ---- Periksa sandi: Firebase bila aktif, jika tidak bcrypt lokal ----
  let sandiCocok = false;
  let via = "lokal";

  if (user) {
    if (firebaseAktif()) {
      const r = await firebaseSignIn(email, password);
      if (r.ok) {
        sandiCocok = true;
        via = "firebase";
      } else if (r.pesan === "kredensial") {
        // Firebase menolak. Mungkin akun belum dimigrasikan ke Firebase —
        // beri kesempatan sekali: cocokkan sandi lokal, lalu sinkron otomatis.
        if (await bcrypt.compare(password, user.passwordHash)) {
          sandiCocok = true;
          via = "lokal+migrasi";
        }
      }
      // pesan "jaringan"/"api": jangan kunci pengguna — jatuh ke pemeriksaan lokal
      if (!sandiCocok && (r.pesan === "jaringan" || r.pesan === "api")) {
        if (await bcrypt.compare(password, user.passwordHash)) {
          sandiCocok = true;
          via = "lokal";
        }
      }
    } else {
      sandiCocok = await bcrypt.compare(password, user.passwordHash);
    }
  }

  if (!user || !sandiCocok) {
    // Catat percobaan gagal (email + IP + perangkat) — tanpa bocorkan ada/tidaknya akun.
    await prisma.log.create({
      data: {
        aksi: "LOGIN_GAGAL",
        entitas: "auth",
        detail: `Percobaan login gagal (${user ? "sandi salah" : "email tidak terdaftar"})`,
        email,
        ip: meta.ip,
        negara: meta.negara,
        kota: meta.kota,
        perangkat: meta.perangkat,
        browser: meta.browser,
        os: meta.os,
        userId: user?.id ?? null,
      },
    }).catch(() => {});
    return redirectLocal("/panel/login?err=1");
  }

  if (!user.aktif) {
    await prisma.log.create({
      data: {
        aksi: "LOGIN_GAGAL",
        entitas: "auth",
        detail: "Login ditolak — akun dinonaktifkan",
        email,
        ip: meta.ip,
        negara: meta.negara,
        kota: meta.kota,
        perangkat: meta.perangkat,
        browser: meta.browser,
        os: meta.os,
        userId: user.id,
      },
    }).catch(() => {});
    return redirectLocal("/panel/login?err=2");
  }

  // Migrasi otomatis: sandi lokal cocok & Firebase aktif, tapi akun belum ada
  // di Firebase (atau sandinya berbeda) → selaraskan supaya login berikutnya
  // memakai Firebase. Gagal sinkron tidak menghalangi login.
  if (via === "lokal+migrasi" && firebaseAktif()) {
    await firebaseSyncSandi(email, password);
  }

  // tetap set cookie (berfungsi normal di tab/domain standar), lalu bawa token
  // di URL sebagai fallback bila cookie diblokir (iframe lintas-situs).
  await setSessionCookie(user.id);
  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } }).catch(() => {});

  const asal = via.startsWith("firebase") || via === "lokal+migrasi" ? " · Firebase" : "";
  await prisma.log.create({
    data: {
      aksi: "LOGIN",
      entitas: "auth",
      entitasId: user.id,
      detail: `Login: ${user.nama} (${user.role === "PEMILIK" ? "Pemilik" : "Admin"})${asal}`,
      email: user.email,
      ip: meta.ip,
      negara: meta.negara,
      kota: meta.kota,
      perangkat: meta.perangkat,
      browser: meta.browser,
      os: meta.os,
      userId: user.id,
    },
  }).catch(() => {});

  return redirectLocal(`/panel?s=${createSession(user.id)}`);
}
