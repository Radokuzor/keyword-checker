import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: false,
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "KeywordIQ — Instant Keyword Intelligence",
  description:
    "Enter any keyword and instantly get difficulty score, monthly search volume, intent, CPC, and a step-by-step ranking plan. AI-powered keyword research.",
  keywords: ["keyword research", "SEO tool", "keyword difficulty", "search volume", "keyword analysis"],
  authors: [{ name: "KeywordIQ" }],
  openGraph: {
    type: "website",
    siteName: "KeywordIQ",
    title: "KeywordIQ — Instant Keyword Intelligence",
    description:
      "AI-powered keyword research. Difficulty, volume, intent, CPC, and a ranking action plan — instantly.",
    url: process.env.NEXT_PUBLIC_BASE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "KeywordIQ — Instant Keyword Intelligence",
    description:
      "AI-powered keyword research. Difficulty, volume, intent, CPC, and a ranking action plan — instantly.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} h-full`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `try{if(localStorage.getItem('kiq_theme')==='dark'){document.documentElement.classList.add('dark')}}catch(e){}` }} />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
