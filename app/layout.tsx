import type { Metadata, Viewport } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://theoxbloodedit.com").replace(/\/$/, "");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "The Oxblood Edit — Dark Romance Fashion US & UK",
    template: "%s · The Oxblood Edit"
  },
  description:
    "Vamp romantic fashion, British autumn formulas, dark beauty and moody interiors. True elegance does not shout.",
  openGraph: {
    siteName: "The Oxblood Edit",
    type: "website",
    title: "The Oxblood Edit — Dark Romance Fashion US & UK",
    description:
      "Vamp romantic fashion, British autumn formulas and dark elegance, edited for US & UK wardrobes.",
    images: [
      {
        url: "/images/editorial/villainess-hero-16x9.jpg",
        width: 1920,
        height: 1080,
        alt: "A woman in a black velvet cape lined in oxblood satin, in a candlelit gallery"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "The Oxblood Edit — Dark Romance Fashion US & UK",
    description: "True elegance does not shout. Vamp romantic fashion, beauty and interiors."
  }
};

export const viewport: Viewport = {
  themeColor: "#0B0A08",
  colorScheme: "dark"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-nearblack text-parchment">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
