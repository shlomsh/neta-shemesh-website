import type { Metadata } from "next";
import "../../public/canva-fonts.css";
import "../../public/styles.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Doctor Avalon — Couples Therapist",
};

import ScrollAnimator from "@/components/ScrollAnimator";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <ScrollAnimator />
      </body>
    </html>
  );
}
