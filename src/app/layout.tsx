import type { Metadata, Viewport } from "next";
import { Space_Grotesk, IBM_Plex_Mono, Archivo_Black } from "next/font/google";
import "./globals.css";
import Image from "next/image";

// In the root layout, add this to the top of body/main elements:
<div className="flex items-center gap-2">
  <Image src="/logo.svg" alt="SWAPHAUS" width={32} height={32} />
  <span className="font-display font-bold text-paper hidden sm:inline">SWAPHAUS</span>
</div>

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["400", "500", "600", "700"],
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-plex-mono",
  weight: ["400", "500"],
});

const archivoBlack = Archivo_Black({
  subsets: ["latin"],
  variable: "--font-archivo-black",
  weight: "400",
});

export const metadata: Metadata = {
  title: "SWAPHAUS — Swap Your Closet",
  description:
    "Trade clothes, not cash. Upload what you're done with, swap for what's next.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#12151A",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${spaceGrotesk.variable} ${plexMono.variable} ${archivoBlack.variable} font-body antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
