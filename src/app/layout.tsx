import type { Metadata } from "next";
import { IBM_Plex_Mono, Space_Grotesk } from "next/font/google";
import SiteHeader from "@/components/site-header";
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
          <SiteHeader />
          <div className="flex-1 pt-6 sm:pt-8">{children}</div>
        </div>
      </body>
    </html>
  );
}
