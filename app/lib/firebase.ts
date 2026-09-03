/**
 * Firebase Auth — LAPISAN OPSIONAL, hanya untuk autentikasi saat login.
 *
 * Aktif hanya bila semua variabel berikut terisi di environment:
 *   FIREBASE_API_KEY, FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
 * Jika belum diisi (kosong), seluruh alur login kembali ke sandi lokal (bcrypt)
 * seperti sebelumnya — tanpa perilaku berubah sama sekali.
 *
 * Saat aktif, login memakai Firebase (email + sandi) sebagai pemeriksa utama.
 * Akun admin tetap disimpan di database lokal (peran & izin modul), sehingga
 * pembuatan / reset sandi / hapus admin lewat panel otomatis disinkronkan ke
 * Firebase agar kedua sisi selalu cocok.
 */
import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

function apiKey() {
  return (process.env.FIREBASE_API_KEY || "").trim();
}
function projectId() {
  return (process.env.FIREBASE_PROJECT_ID || "").trim();
}
function clientEmail() {
  return (process.env.FIREBASE_CLIENT_EMAIL || "").trim();
}
function privateKey() {
  const raw = process.env.FIREBASE_PRIVATE_KEY || "";
  return raw ? raw.replace(/\\n/g, "\n") : "";
}

/** true bila Firebase terkonfigurasi lengkap. */
export function firebaseAktif(): boolean {
  return Boolean(apiKey() && projectId() && clientEmail() && privateKey());
}

let _app: App | null = null;
function app(): App | null {
  if (!firebaseAktif()) return null;
  if (!_app) {
    _app = getApps().length
      ? getApps()[0]
      : initializeApp(
          {
            credential: cert({
              projectId: projectId(),
              clientEmail: clientEmail(),
              privateKey: privateKey(),
            }),
          },
          "hw-catalog-admin"
        );
  }
  return _app;
}

export interface HasilSignIn {
  ok: boolean;
  /** alasan gagal: "kredensial" | "nonaktif" | "jaringan" | "api" */
  pesan?: string;
}

/**
 * Periksa email + sandi ke Firebase (REST Identity Toolkit memakai Web API key).
 * Tidak pernah melempar — selalu mengembalikan hasil.
 */
export async function firebaseSignIn(
  email: string,
  password: string
): Promise<HasilSignIn> {
  if (!firebaseAktif()) return { ok: false, pesan: "api" };
  try {
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${encodeURIComponent(
        apiKey()
      )}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, returnSecureToken: true }),
      }
    );
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      const m = String(j?.error?.message || "").toLowerCase();
      if (m.includes("invalid-login-credentials")) return { ok: false, pesan: "kredensial" };
      if (m.includes("email-not-found")) return { ok: false, pesan: "kredensial" };
      if (m.includes("invalid-password")) return { ok: false, pesan: "kredensial" };
      if (m.includes("user-disabled")) return { ok: false, pesan: "nonaktif" };
      return { ok: false, pesan: "api" };
    }
    return { ok: true };
  } catch {
    return { ok: false, pesan: "jaringan" };
  }
}

/**
 * Sinkronkan sandi ke Firebase — buat akun bila belum ada, ubah bila sudah ada.
 * Dipakai saat: migrasi login pertama (bcrypt cocok tapi akun Firebase belum ada),
 * reset sandi lewat panel, dan pembuatan admin baru.
 * Mengembalikan: "ok" | "exists" | "gagal" | "nonaktif" (semua tanpa melempar).
 */
export async function firebaseSyncSandi(
  email: string,
  password: string
): Promise<"ok" | "exists" | "gagal"> {
  const a = app();
  if (!a) return "gagal";
  try {
    const auth = getAuth(a);
    const ada = await auth.getUserByEmail(email).catch(() => null);
    if (ada) {
      await auth.updateUser(ada.uid, { password });
      return "exists";
    }
    await auth.createUser({ email, password });
    return "ok";
  } catch {
    return "gagal";
  }
}

/**
 * Hapus akun dari Firebase (dipakai saat admin dihapus lewat panel).
 * Jika akun Firebase belum ada, dianggap berhasil (tidak perlu tindakan).
 */
export async function firebaseHapusAkun(email: string): Promise<boolean> {
  const a = app();
  if (!a) return false;
  try {
    const auth = getAuth(a);
    const ada = await auth.getUserByEmail(email).catch(() => null);
    if (ada) await auth.deleteUser(ada.uid);
    return true;
  } catch {
    return false;
  }
}
