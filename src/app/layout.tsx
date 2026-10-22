import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Noto_Sans_Sinhala, Noto_Sans_Tamil } from "next/font/google";
import Image from "next/image";
import { FooterNote, LangProvider, LanguageSwitcher, SiteBrand, SkipLink } from "@/components/LangProvider";
import { SiteNav } from "@/components/SiteNav";
import { getLang } from "@/lib/i18n/server";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Geist has no Sinhala or Tamil glyphs; these fill in, self-hosted by next/font.
const notoSinhala = Noto_Sans_Sinhala({ variable: "--font-sinhala", subsets: ["sinhala"] });
const notoTamil = Noto_Sans_Tamil({ variable: "--font-tamil", subsets: ["tamil"] });

export const metadata: Metadata = {
  title: "SLA National Register · Sri Lanka Athletics",
  description:
    "Register as an athlete or coach with Sri Lanka Athletics and receive your SLA ID. In English, Sinhala and Tamil.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // lets the sticky bottom buttons sit above the iPhone home bar (safe-area insets)
  viewportFit: "cover",
  themeColor: "#0607f8",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const lang = await getLang();
  const fonts = [geistSans, geistMono, notoSinhala, notoTamil].map((f) => f.variable).join(" ");

  return (
    <html lang={lang}>
      <body className={`${fonts} flex min-h-dvh flex-col bg-muted/40 font-sans antialiased`}>
        <LangProvider lang={lang}>
          <SkipLink />
          <header className="site-header no-print sticky top-0 z-30 bg-brand text-white shadow-md shadow-brand/20">
            <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
              <SiteBrand />
              <div className="flex items-center gap-2 sm:gap-4">
                <SiteNav />
                <LanguageSwitcher />
              </div>
            </div>
          </header>
          <main id="main" className="flex w-full flex-1 flex-col">{children}</main>
          <footer className="site-footer no-print bg-brand text-white/80">
            <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div className="flex items-center gap-3">
                <Image src="/brand/sla-logo.png" alt="" width={40} height={40} className="size-10 shrink-0 rounded-lg ring-1 ring-gold/40" />
                <FooterNote />
              </div>
              <span className="shrink-0 text-xs text-white/60">© {new Date().getFullYear()} Sri Lanka Athletics</span>
            </div>
          </footer>
        </LangProvider>
      </body>
    </html>
  );
}
