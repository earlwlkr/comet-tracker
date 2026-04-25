"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getBuiltApis } from "@/lib/nasa-catalog";

const linkLabels: Record<string, string> = {
  exoplanet: "Exoplanets",
  images: "Images",
  neows: "NeoWs",
};

const allDataViews = getBuiltApis();

const navLinks = [
  { href: "/", label: "Overview" },
  { href: "/apod", label: "APOD" },
  { href: "/eonet", label: "Earth" },
  { href: "/donki", label: "Space weather" },
  { href: "/neows", label: "Objects" },
  { href: "/catalog", label: "Catalog" },
];

const navHrefs = new Set(navLinks.map((link) => link.href));
const menuDataViews = allDataViews.filter((api) => !navHrefs.has(`/${api.slug}`));
const menuLinks: { href: string; label: string; source?: string }[] = [
  ...navLinks,
  ...menuDataViews.map((api) => ({
    href: `/${api.slug}`,
    label: linkLabels[api.slug] ?? api.title,
    source: api.source,
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
          <span>
            <span className="site-header-brand-name">NASA Signal Desk</span>
            <span className="hidden font-mono text-[0.68rem] uppercase tracking-[0.14em] text-white/42 sm:block">
              Live astronomy and mission data
            </span>
          </span>
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

        <details className="site-header-menu">
          <summary className="site-header-link">Menu</summary>
          <div className="site-header-menu-panel">
            {menuLinks.map((link) => {
              const active = isActivePath(pathname, link.href);

              return (
                <Link
                  key={`${link.href}-${link.label}`}
                  aria-current={active ? "page" : undefined}
                  className={`site-header-menu-link ${active ? "is-active" : ""}`}
                  href={link.href}
                >
                  <span className="font-medium">{link.label}</span>
                  {link.source ? (
                    <span className="font-mono text-[0.68rem] uppercase tracking-[0.1em] text-white/42">
                      {link.source}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </div>
        </details>
      </div>
    </header>
  );
}
