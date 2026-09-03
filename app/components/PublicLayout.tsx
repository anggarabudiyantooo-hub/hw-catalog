import { ReactNode } from "react";
import Link from "next/link";
import { Logo } from "./Logo";
import NavLinks from "./NavLinks";
import { SITE, waLink } from "@/lib/config";

export function Ornamen() {
  return (
    <div className="wrap">
      <div className="band">
        <span className="l"></span>
        <span className="d"></span>
        <span className="r"></span>
      </div>
    </div>
  );
}

export default function PublicLayout({ children, phead }: { children: ReactNode; phead?: ReactNode }) {
  return (
    <>
      <header className="pub-nav">
        <div className="wrap" style={{ display: "flex", alignItems: "center", gap: 30 }}>
          <Link href="/">
            <Logo />
          </Link>
          <div style={{ marginLeft: "auto", display: "flex", gap: 24, alignItems: "center" }}>
            <NavLinks />
            <a className="btn btn-outline btn-sm" href={waLink(`Halo ${SITE.pemilik}, saya ingin bertanya tentang ayam Bangkok di ${SITE.nama}.`)} target="_blank" rel="noopener">
              Hubungi
            </a>
          </div>
        </div>
      </header>

      {phead}

      <main>{children}</main>

      <footer className="pub-foot">
        <div className="wrap">
          <div className="foot-grid">
            {/* Merek */}
            <div>
              <Logo light />
              <p className="f-about">
                Galeri ayam Bangkok pilihan di Pedan, Klaten. Setiap ekor dikurasi dengan
                standar koleksi.
              </p>
              <a
                className="btn f-visit"
                href={waLink(
                  `Halo ${SITE.pemilik}, saya ingin menjadwalkan kunjungan ke ${SITE.nama} — mohon info jadwal yang memungkinkan.`
                )}
                target="_blank"
                rel="noopener noreferrer"
              >
                Jadwalkan Kunjungan
              </a>
            </div>

            {/* Navigasi */}
            <div>
              <h4>Navigasi</h4>
              <ul className="fnav">
                <li><Link href="/">Beranda</Link></li>
                <li><Link href="/katalog">Katalog Ayam</Link></li>
                <li><a href="/#lokasi">Lokasi &amp; Kunjungan</a></li>
                <li><a href={waLink()} target="_blank" rel="noopener noreferrer">Kontak WhatsApp</a></li>
              </ul>
            </div>

            {/* Kontak */}
            <div>
              <h4>Kontak</h4>
              <div className="fk">
                <div className="frow">
                  <span>Pemilik</span>
                  <b>{SITE.pemilik}</b>
                </div>
                <div className="frow">
                  <span>WhatsApp</span>
                  <a href={waLink()} target="_blank" rel="noopener noreferrer">{SITE.waDisplay}</a>
                </div>
                <div className="frow">
                  <span>Email</span>
                  {SITE.email ? (
                    <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
                  ) : (
                    <em className="soon">segera menyusul</em>
                  )}
                </div>
                <div className="frow">
                  <span>Media Sosial</span>
                  {SITE.sosmed ? (
                    <a href={SITE.sosmed} target="_blank" rel="noopener noreferrer">Ikuti kami</a>
                  ) : (
                    <em className="soon">segera menyusul</em>
                  )}
                </div>
              </div>
            </div>

            {/* Lokasi */}
            <div>
              <h4>Lokasi</h4>
              <p className="f-addr">
                {SITE.alamatBaris1}
                <br />
                {SITE.alamatBaris2}
              </p>
              <a className="f-gmap" href={SITE.mapsUrl} target="_blank" rel="noopener noreferrer">
                Buka peta &amp; rute di Google Maps →
              </a>
              <p className="f-note">Kunjungan wajib reservasi terlebih dahulu via WhatsApp.</p>
            </div>
          </div>

          <div className="foot-bottom">
            <span>© {new Date().getFullYear()} {SITE.nama} · Pedan, Klaten, Jawa Tengah</span>
            <a className="owner" href="/panel/login" title="Login pengelola kandang">Area Pemilik</a>
          </div>
        </div>
      </footer>
    </>
  );
}
