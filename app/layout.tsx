import type { Metadata } from "next";
import { Great_Vibes, Montserrat, Playfair_Display } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { site } from "@/lib/data";
import "./globals.css";

const script = Great_Vibes({ weight: "400", subsets: ["latin"], variable: "--font-great-vibes" });
const sans = Montserrat({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-montserrat" });
const serif = Playfair_Display({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-playfair" });

export const metadata: Metadata = {
  title: { default: `${site.name} — Restaurant & plage au bord de l'Oubangui`, template: `%s · ${site.name}` },
  description:
    "Royal Beach Mbocko : restaurant, bar et plage au bord de l'Oubangui en République centrafricaine. Grillades, cuisine centrafricaine, terrasses, aire de jeux et soirées.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${script.variable} ${sans.variable} ${serif.variable}`}>
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
