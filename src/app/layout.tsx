import type { Metadata } from "next";
import { Assistant, Frank_Ruhl_Libre } from "next/font/google";
import "../../public/canva-fonts.css";
import "../../public/styles.css";
import "./globals.css";

const assistant = Assistant({ subsets: ["hebrew"], variable: "--font-assistant" });
const frankRuhl = Frank_Ruhl_Libre({ subsets: ["hebrew"], variable: "--font-frank" });

export const metadata: Metadata = {
  title: "Doctor Avalon — Couples Therapist",
};

import ScrollAnimator from "@/components/ScrollAnimator";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl" className={`${assistant.variable} ${frankRuhl.variable}`}>
      <body>
        {children}
        <ScrollAnimator />
      </body>
    </html>
  );
}
