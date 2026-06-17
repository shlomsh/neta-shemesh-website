import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Doctor Avalon — Couples Therapist",
};

import ScrollAnimator from "@/components/ScrollAnimator";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="/canva-fonts.css" />
        <link rel="stylesheet" href="/styles.css" />
      </head>
      <body>
        {children}
        <ScrollAnimator />
      </body>
    </html>
  );
}
