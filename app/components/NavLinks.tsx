"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Beranda" },
  { href: "/katalog", label: "Katalog" },
  { href: "/#lokasi", label: "Lokasi & Kunjungan" },
];

export default function NavLinks() {
  const path = usePathname();
  const is = (href: string) =>
    href === "/" ? path === "/" : path.startsWith(href.replace("/#", "/")) && href.startsWith("/katalog") ? path.startsWith("/katalog") : href.startsWith("/#") ? false : path.startsWith(href);
  return (
    <nav>
      {LINKS.map((l) => (
        <Link key={l.href} href={l.href} className={is(l.href) ? "on" : ""}>
          {l.label}
        </Link>
      ))}
    </nav>
  );
}
