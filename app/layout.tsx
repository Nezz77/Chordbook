import type { Metadata } from "next";
import { ThemeSelector } from "./theme-selector";
import "./globals.css";

export const metadata: Metadata = {
  title: "Chordbook | Your guitar songbook",
  description: "Your songs, in your key. A personal guitar songbook with lyrics, transposition and PDF export.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}<ThemeSelector/></body>
    </html>
  );
}
