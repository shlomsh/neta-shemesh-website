import type { Metadata } from "next";
import { Montserrat, Della_Respira, Great_Vibes } from "next/font/google";
import "../../public/canva-fonts.css";
import "../../public/styles.css";
import "./globals.css";

const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-montserrat" });
const dellaRespira = Della_Respira({ weight: "400", subsets: ["latin"], variable: "--font-playfair" });
const greatVibes = Great_Vibes({ weight: "400", subsets: ["latin"], variable: "--font-great-vibes" });

export const metadata: Metadata = {
  title: "Doctor Avalon — Couples Therapist",
};

import ScrollAnimator from "@/components/ScrollAnimator";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${montserrat.variable} ${dellaRespira.variable} ${greatVibes.variable}`}>
      <body>
        {children}
        <ScrollAnimator />
      </body>
    </html>
  );
}
