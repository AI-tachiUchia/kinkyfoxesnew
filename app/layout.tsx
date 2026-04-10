import type { Metadata } from "next";
import { Press_Start_2P } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "./context/LanguageContext";
import { SpeedInsights } from "@vercel/speed-insights/next";

const pixelFont = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pixel",
  display: "swap",
});

export const metadata: Metadata = {
  title: "KinkyFox Games",
  description: "NSFW Game Generator",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`antialiased bg-background text-foreground min-h-screen ${pixelFont.variable}`}>
        <LanguageProvider>
          {children}
        </LanguageProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}