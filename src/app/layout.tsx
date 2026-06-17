import type { Metadata } from "next";
import localFont from "next/font/local";
import "../../canva-source/canva-fonts.css";
import "../../canva-source/styles.css";
import "./globals.css";

const dganit = localFont({
  src: "../../public/fonts/Dganit-Medium.woff2",
  variable: "--font-dganit",
  weight: "500",
});

const elamy = localFont({
  src: [
    {
      path: "../../public/fonts/Elamy-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/Elamy-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-elamy",
});

const stanga = localFont({
  src: "../../public/fonts/stanga-regular-aaa.woff2",
  variable: "--font-stanga",
  weight: "400",
});

export const metadata: Metadata = {
  title: "נטע שמש — טיפול זוגי ומשפחתי",
};

import ScrollAnimator from "@/components/ScrollAnimator";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl" className={`${dganit.variable} ${elamy.variable} ${stanga.variable}`}>
      <body>
        {children}
        <ScrollAnimator />
      </body>
    </html>
  );
}
