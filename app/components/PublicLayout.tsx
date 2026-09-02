import { ReactNode } from "react";
import Link from "next/link";
import { Logo } from "./Logo";
import { MapSvg } from "./MapSvg";
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
          <div className="foot-in">
            <div>
              <Logo light />
              <p style={{ marginTop: 16 }}>
                Etalase satu kandang ayam bangkok pilihan di Kota Surakarta. Melayani kolektor &amp; penyuka ayam laga dari seluruh Indonesia.
              </p>
            </div>
            <div>
              <h4>Jelajahi</h4>
              <Link className="dim" href="/">Beranda</Link>
              <Link className="dim" href="/katalog">Katalog Ayam</Link>
              <a className="dim" href="/#lokasi">Lokasi &amp; Kunjungan</a>
              <a className="dim" href={waLink()}>Kontak WhatsApp</a>
            </div>
            <div>
              <h4>Hubungi Kami</h4>
              <a className="dim" href={waLink()} target="_blank" rel="noopener">{SITE.waDisplay} (WhatsApp)</a>
              <a className="dim" href={`mailto:${SITE.email}`}>{SITE.email}</a>
              <a className="dim" href="/#lokasi">Kunjungan: wajib reservasi dulu</a>
            </div>
            <div>
              <h4>Lokasi &amp; Alamat</h4>
              <div className="foot-map"><MapSvg /></div>
              <div className="foot-addr">
                <b>{SITE.nama}</b>
                <span>
                  {SITE.alamatBaris1}
                  <br />
                  {SITE.alamatBaris2}
                </span>
                <a className="gmap" href={SITE.mapsUrl} target="_blank" rel="noopener">Buka peta &amp; rute di Google Maps</a>
              </div>
              <div className="resv">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /><path d="M12 13.5v3l2 1.6" /></svg>
                <span><b>Kunjungan wajib reservasi.</b> Chat WhatsApp dulu untuk mencocokkan jadwal — tanpa janji, mohon tidak datang langsung.</span>
              </div>
            </div>
          </div>
          <div className="foot-bottom">
            <span>© {new Date().getFullYear()} {SITE.nama}. Seluruh hak cipta.</span>
            <span>Desain merah bata &amp; krem — warisan Nusantara.</span>
          </div>
        </div>
      </footer>
    </>
  );
}
