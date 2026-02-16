import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NovaVision Intelligence | Amazon Nova AI Hackathon",
  description:
    "Multi-Agent Intelligence Platform powered by Amazon Nova 2 Lite, Nova 2 Sonic, Nova Act, and Nova Multimodal Embeddings. Turn any content into actionable intelligence.",
  keywords: [
    "Amazon Nova",
    "AI",
    "Hackathon",
    "Multi-Agent",
    "Document Intelligence",
    "Nova 2 Lite",
  ],
};

import { GlobalPathwayProvider } from "@/context/GlobalPathwayContext";
import { Toaster } from "@/components/ui/sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased bg-zinc-950 text-white`}
      >
        <GlobalPathwayProvider>
          {children}
          <Toaster />
        </GlobalPathwayProvider>
      </body>
    </html>
  );
}
