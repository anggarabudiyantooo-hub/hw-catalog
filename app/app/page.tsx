import Link from "next/link";
import PublicLayout from "@/components/PublicLayout";
import AyamCard from "@/components/AyamCard";
import { MapSvg } from "@/components/MapSvg";
import { prisma } from "@/lib/prisma";
import { SITE, waLink } from "@/lib/config";
import { formatTanggal } from "@/lib/format";

const include = {
  images: true,
  kategori: true,
  riwayat: true,
};

// Halaman publik memakai ISR: konten di-cache di CDN Vercel dan
// diperbarui saat ada perubahan data (revalidatePath di panel).
export const revalidate = 60;

export default async function HomePage() {
  const featured = await prisma.ayam.findMany({
    where: { isFeatured: true, isArsip: false, statusTampil: "PUBLIKASI" },
    include,
    orderBy: { updatedAt: "desc" },
    take: 3,
  });
  const [tersedia, dipesan, totalPublik, kategori] = await Promise.all([
    prisma.ayam.count({ where: { statusJual: "TERSEDIA", isArsip: false, statusTampil: "PUBLIKASI" } }),
    prisma.ayam.count({ where: { statusJual: "DIPESAN", isArsip: false, statusTampil: "PUBLIKASI" } }),
    prisma.ayam.count({ where: { isArsip: false, statusTampil: "PUBLIKASI" } }),
    prisma.kategori.findMany({ orderBy: { urutan: "asc" }, include: { _count: { select: { ayam: true } } } }),
  ]);

  const stats: [string, string][] = [
    [`${totalPublik}+`, "Ayam dipajang"],
    [`${tersedia}`, "Siap dijual"],
    [`${kategori.length}`, "Golongan ayam"],
  ];

  return (
    <PublicLayout>
      {/* ===== HERO ===== */}
      <section className="hero">
        <div className="wrap hero-in">
          <div className="hero-copy">
            <div className="hero-kicker">{SITE.sejak ? `Kandang Juara · Sejak ${SITE.sejak}` : "Kandang Juara"} · Klaten</div>
            <h1>
              Ayam Bangkok <em>Berkelas</em>,
              <br />
              Warisan Darah Juara.
            </h1>
            <div className="orn">
              <span></span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0l3 9 9 3-9 3-3 9-3-9-9-3 9-3z" /></svg>
              <span style={{ transform: "scaleX(-1)" }}></span>
            </div>
            <p className="lede">
              Setiap ekor yang kami tampilkan melewati seleksi postur, tulang, dan garis keturunan.
              Dibesarkan dengan disiplin — dipersembahkan untuk kolektor yang menghargai ketangguhan sejati.
            </p>
            <div className="hero-cta">
              <Link className="btn btn-primary" href="/katalog">Jelajahi Katalog</Link>
              <a className="btn btn-ghost" href={waLink(`Halo ${SITE.pemilik}, saya ingin bertanya tentang ayam Bangkok di ${SITE.nama}.`)} target="_blank" rel="noopener">Hubungi Kandang</a>
            </div>
            <div className="stats">
              {stats.map(([n, l]) => (
                <div className="stat" key={l}>
                  <b>{n}</b>
                  <span>{l}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="wrap"><div className="band"><span className="l"></span><span className="d"></span><span className="r"></span></div></div>

      {/* ===== UNGGULAN ===== */}
      <section className="block">
        <div className="wrap">
          <div className="sec-head">
            <span className="cap">Pilihan Kandang</span>
            <h2>Si Unggulan Saat Ini</h2>
            <p>Kami hadirkan ayam dengan postur &amp; prestasi terbaik bulan ini.</p>
          </div>
          {featured.length > 0 ? (
            <div className="cards">
              {featured.map((a) => (
                <AyamCard key={a.id} ayam={a} />
              ))}
            </div>
          ) : (
            <p style={{ textAlign: "center", color: "var(--ink-muted)", fontStyle: "italic" }}>
              Belum ada ayam yang ditandai unggulan — lihat <Link href="/katalog" style={{ color: "var(--bata-700)" }}>katalog lengkap</Link>.
            </p>
          )}
        </div>
      </section>

      {/* ===== KATEGORI ===== */}
      <section className="block kat-sec">
        <div className="wrap">
          <div className="sec-head">
            <span className="cap">Telusuri Koleksi</span>
            <h2>Menurut Garis &amp; Golongan</h2>
            <p>Setiap garis memiliki watak dan keunggulannya sendiri.</p>
          </div>
          <div className="kat-grid">
            {kategori.map((k) => (
              <Link className="kat-tile" href={`/katalog?kat=${k.slug}`} key={k.id}>
                <b>{k.nama}</b>
                <span className="count">{k._count.ayam} ekor</span>
                {k.deskripsi && <p>{k.deskripsi}</p>}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== KUTIPAN ===== */}
      <section className="block quote-sec">
        <div className="wrap">
          <figure className="quote">
            <span className="qmark">“</span>
            <blockquote>
              Seekor ayam yang baik bukan sekadar menang di laga — ia membawa nama baik pemiliknya. Maka kami memelihara dengan kehormatan.
            </blockquote>
            <figcaption>
              <span className="who">{SITE.pemilik}</span> · <span className="role">Pemilik {SITE.nama}, Klaten</span>
            </figcaption>
          </figure>
        </div>
      </section>

      {/* ===== LOKASI ===== */}
      <section className="block loc-sec" id="lokasi">
        <div className="wrap">
          <div className="sec-head">
            <span className="cap">Sebelum Berkunjung</span>
            <h2>Lokasi &amp; Kunjungan Kandang</h2>
            <p>Kandang berada di Pedan, Klaten. Supaya Anda tidak sia-sia datang, kunjungan kami layani dengan janji temu.</p>
          </div>
          <div className="loc-grid">
            <div className="loc-stack">
              <div className="loc-card loc-addr">
                <h3>Alamat</h3>
                <address>
                  <b>{SITE.nama}</b>
                  <br />
                  {SITE.alamatBaris1}
                  <br />
                  {SITE.alamatBaris2}
                </address>
                <ul className="loc-list">
                  <li>Terletak di Kec. Pedan, Kab. Klaten — mudah diakses dari jalur Solo–Yogyakarta.</li>
                  <li>Parkir di halaman kandang — cukup untuk mobil kecil.</li>
                  <li>Dapat dijangkau ojek online / kendaraan pribadi (tujuan: Pedan, Klaten).</li>
                </ul>
                <a className="btn btn-outline btn-sm" href={SITE.mapsUrl} target="_blank" rel="noopener">Buka Peta di Google Maps</a>
              </div>
              <div className="loc-card loc-rule">
                <h3>Syarat Kunjungan: Reservasi Dulu</h3>
                <p>
                  Kami melayani kunjungan hanya bagi yang <b>sudah membuat janji (reservasi)</b> terlebih dahulu, agar jadwal pemilik cocok dan Anda didampingi sepenuhnya.
                </p>
                <ol>
                  <li>Chat WhatsApp, sebut ayam yang ingin dilihat &amp; tanggal kunjungan.</li>
                  <li>Pemilik mengonfirmasi jadwal (umumnya &lt; 1×24 jam).</li>
                  <li>Datang sesuai jam yang disepakati — jam layanan {SITE.jamLayanan}.</li>
                </ol>
              </div>
            </div>
            <div className="loc-card loc-map-card">
              <MapSvg />
            </div>
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="block">
        <div className="wrap">
          <div className="cta-panel">
            <div>
              <h3>Berminat memiliki ayam juara?</h3>
              <p>Sampaikan kriteria Anda — kami bantu pilihkan yang paling cocok dari kandang.</p>
            </div>
            <Link className="btn btn-primary" href="/katalog">Lihat Katalog</Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
