import type { Metadata } from "next";
import localFont from "next/font/local";
import "../../canva-source/canva-fonts.css";
import "./globals.css";


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
  src: [
    {
      path: "../../public/fonts/stanga-light-aaa.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../public/fonts/stanga-regular-aaa.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/stanga-bold-aaa.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-stanga",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://nettashemesh.vercel.app'),
  title: "נטע שמש — טיפול זוגי ומשפחתי",
};

import ScrollAnimator from "@/components/ScrollAnimator";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl" className={`${elamy.variable} ${stanga.variable}`}>
      <body>
        {children}
        <ScrollAnimator />
      </body>
    </html>
  );
}
