# Firebase Auth (Opsional) — hanya autentikasi saat login

Fitur ini menjadikan **Firebase Authentication** sebagai pemeriksa email+sandi
di halaman login panel. Hak akses per-modul, peran, dan status aktif **tetap**
dikelola di database aplikasi (halaman *Pengguna & Hak Akses*). Firebase tidak
menggantikan data akun — ia hanya menambah lapisan autentikasi.

> 🔴 **Belum ingin memakai Firebase?** Cukup jangan isi variabel `FIREBASE_*`.
> Seluruh login otomatis kembali memakai sandi lokal (bcrypt) persis seperti
> sebelumnya — tidak ada perubahan perilaku apa pun.

---

## 1. Siapkan proyek Firebase (sekali, ±5 menit)

1. Buka <https://console.firebase.google.com> → **Add project** → ikuti langkah
   (nama proyek bebas, mis. `hw-katalog`). Google Analytics boleh **tidak**
   diaktifkan.
2. Masuk proyek → menu **Authentication** (kiri) → tab **Sign-in method** →
   aktifkan **Email/Password** → simpan.
3. Ambil **Web API key**:
   * Gear ⚙️ → **Project settings** → tab **General** →
     **Your apps** → jika belum ada aplikasi web, klik ikon `</>` (Web),
     beri nama mis. `panel-login`, lalu salin **Web API key**.
4. Buat **service account** untuk server:
   * Masih di **Project settings** → tab **Service accounts** →
     **Firebase Admin SDK** → **Generate new private key** →
     simpan file JSON (mis. `hw-katalog-firebase-adminsdk.json`).
   * Dari file JSON ambil tiga nilai: `project_id`, `client_email`,
     `private_key`.

## 2. Isi environment (Vercel & lokal)

Nama variabel (lihat `.env.example`):

| Variabel              | Sumber dari Firebase                          |
|-----------------------|-----------------------------------------------|
| `FIREBASE_API_KEY`    | Web API key (langkah 3)                        |
| `FIREBASE_PROJECT_ID` | `project_id` di service account JSON           |
| `FIREBASE_CLIENT_EMAIL` | `client_email` di service account JSON       |
| `FIREBASE_PRIVATE_KEY`  | `private_key` di service account JSON        |

⚠️ `private_key` adalah teks banyak baris. Di environment, tulis **dalam satu
baris** dengan mengganti setiap baris baru menjadi `\n` dan bungkus tanda kutip:

```
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgk...\n...\n-----END PRIVATE KEY-----\n"
```

* **Lokal:** salin ke `app/.env`.
* **Vercel:** dashboard proyek → **Settings → Environment Variables** → tambah
  keempat variabel untuk Production (dan Preview bila perlu) → **Redeploy**.

Setelah empat variabel terisi lengkap, `firebaseAktif()` bernilai `true` dan
login otomatis memakai Firebase.

## 3. Cara kerjanya

* **Login:** halaman login tetap sama (email + sandi). Route `api/auth/login`
  memanggil Firebase `signInWithPassword`. Jika sandi benar → lanjut seperti
  biasa (sesi, log `LOGIN`). Detail log diberi penanda `· Firebase`.
* **Migrasi akun lama:** akun yang dibuat sebelum Firebase diaktifkan (sandinya
  hanya hash lokal) otomatis **didaftarkan ke Firebase pada login pertama yang
  berhasil** dengan sandi yang sama — tanpa langkah manual. Setelah itu login
  memakai Firebase.
* **Pembuatan admin baru** (`Pengguna & Hak Akses`): jika Firebase aktif, akun
  dibuat juga di Firebase dengan email+sandi yang sama.
* **Reset sandi** lewat panel: sandi diubah di database **dan** Firebase.
* **Hapus admin** lewat panel: akun dihapus di database **dan** Firebase.
* Jika layanan Firebase sedang gangguan (`jaringan`/`api`), login tetap mencoba
  sandi lokal agar panel tidak terkunci. Status dinonaktifkan di Firebase
  ditolak seperti akun nonaktif lokal.

> Setiap admin memakai email yang **sama persis** antara akun aplikasi dan
> Firebase (login dicocokkan lewat email). Gunakan halaman *Pengguna & Hak
> Akses* sebagai sumber pengelolaan sandi, bukan konsol Firebase, agar keduanya
> tidak melenceng.

## 4. Memeriksa apakah berhasil

1. Redeploy setelah env diisi.
2. Buka `/panel/login`, masukkan email+sandi salah → tetap muncul pesan salah &
   tercatat `LOGIN_GAGAL`.
3. Masukkan email+sandi benar → masuk panel, dan baris log `LOGIN` muncul.
4. Cek konsol Firebase → **Authentication → Users**: akun yang login muncul di
   daftar (akun lama muncul otomatis setelah login pertama).

## 5. Membatalkan

Cukup hapus keempat variabel `FIREBASE_*` (atau kosongkan) dan redeploy —
semua login kembali ke sandi lokal. Akun yang pernah dibuat di Firebase boleh
dibiarkan atau dihapus dari konsol Firebase; tidak memengaruhi aplikasi.
