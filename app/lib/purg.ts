import { revalidatePath } from "next/cache";

/**
 * Bersihkan cache halaman publik (ISR) setelah ada perubahan data lewat panel.
 * "layout" pada "/" ikut membuang cache seluruh rute di bawahnya
 * (beranda, katalog, halaman detail) sehingga konten baru langsung tampil.
 */
export async function purgPublik() {
  try {
    await revalidatePath("/", "layout");
  } catch (e) {
    console.error("gagal revalidate cache publik:", e);
  }
}
