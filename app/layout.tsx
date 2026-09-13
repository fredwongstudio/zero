import type { Metadata } from "next";
import { description } from "@/lib/hotelConfig";
import "./globals.css";

export const metadata: Metadata = {
  title: "ZERO — Dial 0. Just ask.",
  description,
  icons: { icon: "/icon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
