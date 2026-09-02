import Link from "next/link";
import PublicLayout from "@/components/PublicLayout";
import AyamCard from "@/components/AyamCard";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const include = { images: true, kategori: true, riwayat: true };

export default async function KatalogPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const get = (k: string) => {
    const v = searchParams[k];
    return typeof v === "string" ? v : "";
  };
  const q = get("q").trim().toLowerCase();
  const kat = get("kat");
  const kel = get("kel");
  const st = get("st") || "tersedia";
  const sort = get("sort") || "terbaru";

  const kategori = await prisma.kategori.findMany({ orderBy: { urutan: "asc" } });

  let list = await prisma.ayam.findMany({
    where: { isArsip: false, statusTampil: "PUBLIKASI" },
    include,
  });

  // filter
  if (st === "tersedia") list = list.filter((a) => a.statusJual !== "TERJUAL");
  else if (st === "dipesan") list = list.filter((a) => a.statusJual === "DIPESAN");
  else if (st === "terjual") list = list.filter((a) => a.statusJual === "TERJUAL");
  if (kat) list = list.filter((a) => a.kategori?.slug === kat);
  if (kel) list = list.filter((a) => a.jenisKelamin === kel.toUpperCase());
  if (q)
    list = list.filter((a) =>
      [a.nama, a.kodeRing ?? "", a.kategori?.nama ?? ""].join(" ").toLowerCase().includes(q)
    );

  // urutkan
  if (sort === "termahal") list.sort((a, b) => (b.harga ?? -1) - (a.harga ?? -1));
  else if (sort === "termurah") list.sort((a, b) => (a.harga ?? 1e12) - (b.harga ?? 1e12));
  else if (sort === "nama") list.sort((a, b) => a.nama.localeCompare(b.nama, "id"));
  else list.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));

  const base = (extra: Record<string, string>) => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (kat) p.set("kat", kat);
    if (kel) p.set("kel", kel);
    if (st) p.set("st", st);
    if (sort) p.set("sort", sort);
    for (const [k, v] of Object.entries(extra)) p.set(k, v);
    const s = p.toString();
    return s ? `?${s}` : "";
  };

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
              Seluruh koleksi yang sedang ditampilkan — dapat disaring menurut golongan, jenis kelamin, dan status ketersediaan.
            </p>
          </div>
        </section>
      }
    >
      <div className="wrap">
        <form className="toolbar" method="get" action="/katalog">
          <div className="field grow">
            <label>Cari nama / kode</label>
            <input type="search" name="q" defaultValue={q} placeholder="mis. Rajawali, BKT-007…" />
          </div>
          <div className="field">
            <label>Kategori</label>
            <select name="kat" defaultValue={kat}>
              <option value="">Semua kategori</option>
              {kategori.map((k) => (
                <option key={k.id} value={k.slug}>{k.nama}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Jenis kelamin</label>
            <select name="kel" defaultValue={kel}>
              <option value="">Semua</option>
              <option value="JANTAN">Jantan</option>
              <option value="BETINA">Betina</option>
            </select>
          </div>
          <div className="field">
            <label>Status</label>
            <select name="st" defaultValue={st}>
              <option value="tersedia">Tersedia</option>
              <option value="semua">Semua status</option>
              <option value="dipesan">Dipesan</option>
              <option value="terjual">Terjual</option>
            </select>
          </div>
          <div className="field">
            <label>Urutkan</label>
            <select name="sort" defaultValue={sort}>
              <option value="terbaru">Terbaru</option>
              <option value="termahal">Termahal</option>
              <option value="termurah">Termurah</option>
              <option value="nama">Nama A–Z</option>
            </select>
          </div>
          <button className="btn btn-primary" type="submit">Terapkan</button>
          <span className="res">Menampilkan {list.length} ekor</span>
        </form>
      </div>

      <div className="block" style={{ paddingTop: 0 }}>
        <div className="wrap">
          {list.length === 0 ? (
            <p style={{ textAlign: "center", color: "var(--ink-muted)", fontStyle: "italic", padding: "30px 0" }}>
              Tidak ada ayam yang cocok dengan filter ini.
            </p>
          ) : (
            <div className="cards">
              {list.map((a) => (
                <AyamCard key={a.id} ayam={a} />
              ))}
            </div>
          )}
          {list.length > 0 && (
            <nav className="pager">
              <Link className="btn btn-sec btn-sm" href={base({})}>Reset filter</Link>
            </nav>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}
