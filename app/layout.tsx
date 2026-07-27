import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono, DM_Serif_Display } from "next/font/google";
import "./globals.css";
import { PushNotificationsClient } from "@/components/PushNotificationsClient";
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/next"

const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["500", "600"],
});

// Kept for any legacy screens that still reference the serif display token.
const dmSerif = DM_Serif_Display({
  variable: "--font-dm-serif",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "ABC Synthese",
  description: "Surgical prosthetics command management dashboard",
};

// Restore the saved theme / accent before first paint to avoid a flash.
const themeScript = `(function(){try{var r=document.documentElement;var t=localStorage.getItem('abc-theme')||'light';var a=localStorage.getItem('abc-accent')||'teal';r.setAttribute('data-theme',t);r.setAttribute('data-accent',a);if(t==='dark'){r.classList.add('dark');}}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="light" data-accent="teal" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${plexSans.variable} ${plexMono.variable} ${dmSerif.variable} antialiased`}>
        <PushNotificationsClient />
        {children}
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
