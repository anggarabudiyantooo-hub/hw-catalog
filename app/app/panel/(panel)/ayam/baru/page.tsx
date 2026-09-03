import { redirect } from "next/navigation";
import { cekModulHalaman } from "@/lib/izin";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import PanelPilihFoto from "@/components/PanelPilihFoto";

export const dynamic = "force-dynamic";

export default async function AyamBaruPage({
  searchParams,
}: {
  searchParams: { err?: string };
}) {
  if (!(await cekModulHalaman("ayam"))) redirect("/panel");

  const kategori = await prisma.kategori.findMany({ orderBy: { urutan: "asc" } });

  return (
    <>
      <div className="topbar">
        <div>
          <h1>Tambah Ayam</h1>
          <div className="crumb">Panel Pengelola → Data Ayam → Tambah</div>
        </div>
        <div className="right">
          <Link className="btn btn-sec" href="/panel/ayam">← Kembali</Link>
        </div>
      </div>

      {searchParams.err && <p className="flash flash-err">{searchParams.err}</p>}

      <form method="post" action="/api/panel/ayam" encType="multipart/form-data">
        <div className="card">
          <div className="card-h">
            <h2>Data Ayam</h2>
            <span className="sub">Bintang * = wajib</span>
          </div>
          <div className="card-body">
            <div className="fgrid">
              <div className="f">
                <label>Nama / Julukan <i>*</i></label>
                <input name="nama" placeholder="mis. Rajawali" required />
              </div>
              <div className="f">
                <label>Kode / Nomor ring</label>
                <input name="kodeRing" placeholder="mis. BKT-022 / 2026-SLO-01" />
              </div>
              <div className="f">
                <label>Kategori</label>
                <select name="kategoriId">
                  <option value="">— pilih —</option>
                  {kategori.map((k) => (
                    <option key={k.id} value={k.id}>{k.nama}</option>
                  ))}
                </select>
              </div>
              <div className="f">
                <label>Jenis kelamin <i>*</i></label>
                <div className="radios">
                  <label><input type="radio" name="jenisKelamin" value="JANTAN" defaultChecked /> Jantan</label>
                  <label><input type="radio" name="jenisKelamin" value="BETINA" /> Betina</label>
                </div>
              </div>
              <div className="f">
                <label>Tanggal menetas (perkiraan) <i>*</i></label>
                <input type="date" name="tanggalMenetas" required />
                <span className="hint">Usia dihitung otomatis dari tanggal ini — selalu terbaru.</span>
              </div>
              <div className="f">
                <label>Berat badan kg <i>*</i></label>
                <input name="beratKg" type="text" inputMode="decimal" placeholder="mis. 3.6" required />
              </div>
              <div className="f full">
                <label>Ukuran &amp; ciri yang lazim ditanya pembeli (opsional)</label>
              </div>
              <div className="f">
                <label>Postur / ukuran badan</label>
                <input name="postur" placeholder="mis. Besar &amp; kekar, dada bidang" />
              </div>
              <div className="f">
                <label>Tinggi punggung (± cm)</label>
                <input name="tinggiCm" type="text" inputMode="decimal" placeholder="mis. 52" />
              </div>
              <div className="f">
                <label>Kaki &amp; sisik</label>
                <input name="kakiSisik" placeholder="mis. sisik halus rapat, kering" />
              </div>
              <div className="f">
                <label>Jalu</label>
                <select name="jalu">
                  <option value="">— pilih —</option>
                  <option value="BELUM">Belum tumbuh</option>
                  <option value="TUNGGAL">Tunggal</option>
                  <option value="GANDA">Ganda</option>
                </select>
              </div>
              <div className="f full">
                <label>Warna bulu</label>
                <input name="warnaBulu" placeholder="mis. Hitam legam, dada merah bata" />
              </div>
              <div className="f full">
                <label>Keunggulan (satu per baris)</label>
                <textarea name="keunggulan" rows={3} placeholder={"Postur tegak, tulang besar\nPukulan keras & sambung rapat"} />
              </div>
              <div className="f full">
                <label>Deskripsi / catatan kandang</label>
                <textarea name="deskripsi" rows={3} placeholder="Kisah ayam, riwayat, catatan kesehatan…" />
              </div>
              <div className="f">
                <label>Harga (Rp) — kosongkan bila “Hubungi kami”</label>
                <input name="harga" inputMode="numeric" placeholder="mis. 3500000" />
              </div>
              <div className="f">
                <label>Status jual <i>*</i></label>
                <select name="statusJual" defaultValue="TERSEDIA">
                  <option value="TERSEDIA">Tersedia</option>
                  <option value="DIPESAN">Dipesan</option>
                  <option value="TERJUAL">Terjual</option>
                </select>
                <span className="hint">Pilih “Terjual” → foto otomatis hitam-putih (file asli tetap berwarna).</span>
              </div>
              <div className="f full">
                <label>Status tampil</label>
                <div className="radios">
                  <label><input type="radio" name="statusTampil" value="DRAFT" defaultChecked /> Simpan sebagai Draf</label>
                  <label><input type="radio" name="statusTampil" value="PUBLIKASI" /> Publikasi di katalog</label>
                  <label style={{ marginLeft: 4 }}><input type="checkbox" name="isFeatured" /> Jadikan unggulan beranda (maks. 3)</label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-h">
            <h2>Galeri Foto</h2>
            <span className="sub">Bisa beberapa file sekaligus · JPG/PNG/WebP · maks. 5 MB per file</span>
          </div>
          <div className="card-body">
            <PanelPilihFoto />
            <div className="req-note">
              Syarat publikasi — jenis foto wajib terpenuhi:
              <span className="tag miss">Full badan</span>
              <span className="tag miss">Kepala</span>
              <span className="tag miss">Kaki</span>
              <span className="tag">Bulu / ekor</span>
              <span className="tag">Lainnya</span>
            </div>
            <div className="form-actions">
              <button className="btn btn-primary" type="submit">Simpan Ayam</button>
              <Link className="btn btn-sec" href="/panel/ayam">Batalkan</Link>
            </div>
          </div>
        </div>
      </form>

      <div className="tips">
        <b>Panduan singkat</b>
        <ul>
          <li>Usia dihitung sistem dari tanggal menetas — tak perlu mengisi umur manual.</li>
          <li>Ayam berstatus <b>Terjual</b> tampil hitam-putih otomatis di katalog.</li>
          <li>Kolom ukuran/ciri (postur, tinggi, kaki &amp; sisik, jalu) opsional namun dianjurkan diisi karena lazim ditanyakan pembeli.</li>
        </ul>
      </div>
    </>
  );
}
