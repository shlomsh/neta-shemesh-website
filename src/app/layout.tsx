import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Doctor Avalon — Couples Therapist",
};

import ScrollAnimator from "@/components/ScrollAnimator";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <link rel="stylesheet" href="/canva-fonts.css" precedence="default" />
        <link rel="stylesheet" href="/styles.css" precedence="default" />
        {children}
        <ScrollAnimator />
      </body>
    </html>
  );
}
