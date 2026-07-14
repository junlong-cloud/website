import type { Metadata } from "next";
import { Geist_Mono, Patrick_Hand, Silkscreen, Space_Grotesk } from "next/font/google";
import "./globals.css";

const sans = Space_Grotesk({ variable: "--font-sans", subsets: ["latin"] });
const mono = Geist_Mono({ variable: "--font-mono", subsets: ["latin"] });
const pixel = Silkscreen({ variable: "--font-pixel", weight: ["400", "700"], subsets: ["latin"] });
const hand = Patrick_Hand({ variable: "--font-hand", weight: "400", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "马俊龙 — AI 产品经理",
  description: "8 年业务一线与增长实战，专注 AI 产品，用 AI 把真实需求做成可验证产品。",
  openGraph: {
    title: "马俊龙 — AI 产品经理",
    description: "8 年业务一线与增长实战，专注 AI 产品，用 AI 把真实需求做成可验证产品。",
    type: "website",
    locale: "zh_CN",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" className={`${sans.variable} ${mono.variable} ${pixel.variable} ${hand.variable}`}>
      <body>{children}</body>
    </html>
  );
}
