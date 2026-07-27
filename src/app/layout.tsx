import type { Metadata } from "next";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

export const metadata: Metadata = {
  title: "PixTime 云端收银台",
  description: "PixTime cloud POS & timed billing system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col font-[ui-sans-serif,system-ui,sans-serif]">
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
