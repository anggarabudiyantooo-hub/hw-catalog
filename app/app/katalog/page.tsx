import Link from "next/link";
import PublicLayout from "@/components/PublicLayout";
import KatalogBrowser from "@/components/KatalogBrowser";
import { prisma } from "@/lib/prisma";

const include = { images: true, kategori: true, riwayat: true };

// ISR: konten di-cache Vercel, disegarkan saat panel mengubah data.
export const revalidate = 60;

export default async function KatalogPage() {
  const [kategori, items] = await Promise.all([
    prisma.kategori.findMany({
      orderBy: { urutan: "asc" },
      select: { id: true, nama: true, slug: true },
    }),
    prisma.ayam.findMany({
      where: { isArsip: false, statusTampil: "PUBLIKASI" },
      include,
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  return (
    <PublicLayout
      phead={
        <section className="phead">
          <div className="wrap">
            <div className="crumb">
              <Link href="/">Beranda</Link> / Katalog Ayam
            </div>
            <h1>Katalog Ayam Bangkok</h1>
            <p>
              Seluruh koleksi yang sedang ditampilkan — saring menurut
              golongan, jenis kelamin, dan status ketersediaan langsung tanpa
              memuat ulang.
            </p>
          </div>
        </section>
      }
    >
      <KatalogBrowser items={items} kategori={kategori} />
    </PublicLayout>
  );
}
