"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getBuiltApis } from "@/lib/nasa-catalog";

const linkLabels: Record<string, string> = {
  exoplanet: "Exoplanets",
  images: "Images",
  neows: "NeoWs",
};

const navLinks = [
  { href: "/", label: "Overview" },
  { href: "/catalog", label: "Catalog" },
  ...getBuiltApis().map((api) => ({
    href: `/${api.slug}`,
    label: linkLabels[api.slug] ?? api.title,
  })),
];

function isActivePath(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}?`);
}

export default function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="site-header sticky top-0 z-20">
      <div className="site-header-shell">
        <Link className="site-header-brand" href="/">
          <span className="brand-dot" />
          <span className="site-header-brand-name">NASA Signal Desk</span>
        </Link>

        <nav className="site-header-nav" aria-label="Primary">
          {navLinks.map((link) => {
            const active = isActivePath(pathname, link.href);

            return (
              <Link
                key={link.href}
                aria-current={active ? "page" : undefined}
                className={`site-header-link ${active ? "is-active" : ""}`}
                href={link.href}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
