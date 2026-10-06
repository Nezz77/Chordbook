import type { Metadata } from "next";
import "./globals.css";
import "./glass.css";

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
    <html lang="en" data-mode="dark" data-theme="amber" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{__html:`try{var r=document.documentElement,m=localStorage.getItem('chordbook-display-mode'),a=localStorage.getItem('chordbook-color-theme');r.dataset.mode=m==='light'?'light':'dark';if(['amber','forest','ocean','sunset','lavender','slate'].includes(a))r.dataset.theme=a}catch{}`}}/></head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
