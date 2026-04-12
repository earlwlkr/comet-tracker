import type { Metadata } from "next";
import { IBM_Plex_Mono, Space_Grotesk } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "NASA Signal Desk",
  description: "Focused NASA data views for astronomy, Earth observation, hazards, and Mars weather.",
};

const htmlClassName = `${spaceGrotesk.variable} ${ibmPlexMono.variable} h-full antialiased`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={htmlClassName}>
      <body className="min-h-full bg-background text-foreground">
        <div className="mx-auto flex min-h-screen w-full max-w-[1320px] flex-col px-5 pb-10 sm:px-7 lg:px-10">
          <header className="sticky top-0 z-20 border-b border-white/10 bg-[rgba(7,12,18,0.78)] backdrop-blur">
            <div className="flex flex-col gap-5 px-1 py-5 sm:flex-row sm:items-end sm:justify-between sm:px-2 sm:py-6">
              <div className="pr-4">
                <Link href="/" className="text-sm font-medium tracking-[0.32em] text-white/70 uppercase">
                  NASA Signal Desk
                </Link>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-white/52">
                  Focused views for astronomy media, Earth observation, hazards, and Mars weather.
                </p>
              </div>
              <nav className="flex flex-wrap gap-3 text-sm text-white/72">
                <Link className="nav-chip" href="/">
                  Overview
                </Link>
                <Link className="nav-chip" href="/catalog">
                  Catalog
                </Link>
                <Link className="nav-chip" href="/apod">
                  APOD
                </Link>
                <Link className="nav-chip" href="/eonet">
                  EONET
                </Link>
                <Link className="nav-chip" href="/donki">
                  DONKI
                </Link>
                <Link className="nav-chip" href="/epic">
                  EPIC
                </Link>
                <Link className="nav-chip" href="/gibs">
                  GIBS
                </Link>
                <Link className="nav-chip" href="/insight">
                  Insight
                </Link>
              </nav>
            </div>
          </header>
          <div className="flex-1 pt-6 sm:pt-8">{children}</div>
        </div>
      </body>
    </html>
  );
}
