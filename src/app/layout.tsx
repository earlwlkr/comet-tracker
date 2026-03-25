import type { Metadata } from "next";
import { IBM_Plex_Mono, Space_Grotesk } from "next/font/google";
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
  title: "Comet Tracker",
  description: "A cinematic dashboard for tracking comet visibility, windows, and observation notes.",
};

const htmlClassName = `${spaceGrotesk.variable} ${ibmPlexMono.variable} h-full antialiased`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={htmlClassName}>
      <body className="min-h-full bg-background text-foreground">{children}</body>
    </html>
  );
}
