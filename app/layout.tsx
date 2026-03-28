import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KinkyFox Games",
  description: "NSFW Game Generator",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-background text-foreground min-h-screen">
        {children}
      </body>
    </html>
  );
}
