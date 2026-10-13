import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = {
  title: "The Oxblood Edit — Dark Romance Fashion US & UK",
  description: "Vamp romantic fashion, British autumn formulas and dark elegance."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body><Header /><main>{children}</main><Footer /></body></html>;
}
