import type { Metadata, Viewport } from "next";
import { Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { TopNav } from "@/components/TopNav";
import { ToastProvider } from "@/components/ToastProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ghosts.spot2.mx — Leads SS perdidos del chatbot",
  description:
    "$1.3M MXN en comisiones evaporadas en 3 meses. 643 conversaciones reales con intención que nunca llegaron a un broker.",
  metadataBase: new URL("https://ghosts.spot2.mx"),
  openGraph: {
    title: "ghosts.spot2.mx",
    description:
      "$1.3M MXN evaporados en 3 meses. 643 conversaciones reales que nunca llegaron a un broker.",
    type: "website",
    locale: "es_MX",
  },
  icons: {
    icon: "/favicon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0b",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body
        className={`${inter.variable} ${plexMono.variable} font-sans antialiased min-h-screen bg-bg text-ink`}
      >
        <ToastProvider>
          <TopNav />
          <main className="pt-14">{children}</main>
        </ToastProvider>
      </body>
    </html>
  );
}
