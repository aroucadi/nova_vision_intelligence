import type { Metadata } from "next";
import "./globals.css";

// Use a high-quality system font stack instead of external Google Fonts to ensure build stability in offline/restricted environments.
const interVariable = "--font-geist-sans";
const jetbrainsMonoVariable = "--font-geist-mono";

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
      <head>
        <style dangerouslySetInnerHTML={{
          __html: `
          :root {
            ${interVariable}: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            ${jetbrainsMonoVariable}: 'JetBrains Mono', 'Fira Code', 'Ubuntu Mono', 'Courier New', monospace;
          }
        `}} />
      </head>
      <body
        className={`antialiased bg-zinc-950 text-white`}
        style={{ fontFamily: `var(${interVariable})` }}
      >
        <GlobalPathwayProvider>
          {children}
          <Toaster />
        </GlobalPathwayProvider>
      </body>
    </html>
  );
}
