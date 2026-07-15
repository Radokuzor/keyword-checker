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
  title: "Rank Number 1 — Rank Number 1 Faster",
  description:
    "Enter any keyword and instantly get difficulty score, monthly search volume, intent, CPC, and a step-by-step ranking plan. AI-powered keyword research.",
  keywords: ["keyword research", "SEO tool", "keyword difficulty", "search volume", "keyword analysis"],
  authors: [{ name: "Rank Number 1" }],
  openGraph: {
    type: "website",
    siteName: "Rank Number 1",
    title: "Rank Number 1 — Rank Number 1 Faster",
    description:
      "AI-powered keyword research. Difficulty, volume, intent, CPC, and a ranking action plan — instantly.",
    url: process.env.NEXT_PUBLIC_BASE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "Rank Number 1 — Rank Number 1 Faster",
    description:
      "AI-powered keyword research. Difficulty, volume, intent, CPC, and a ranking action plan — instantly.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://ranknumber1.com";

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${BASE_URL}/#website`,
      url: BASE_URL,
      name: "Rank Number 1",
      description:
        "AI-powered keyword research for small business owners. Keyword difficulty, search volume, intent, CPC, and a step-by-step ranking plan — instantly.",
      publisher: { "@id": `${BASE_URL}/#organization` },
      potentialAction: {
        "@type": "SearchAction",
        target: { "@type": "EntryPoint", urlTemplate: `${BASE_URL}/?q={search_term_string}` },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "Organization",
      "@id": `${BASE_URL}/#organization`,
      name: "FourthWatch Tech",
      url: BASE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${BASE_URL}/favicon.ico`,
      },
      sameAs: [],
      description:
        "FourthWatch Tech builds affordable SEO tools for small business owners. Rank Number 1 gives you keyword difficulty, search volume, intent, CPC, and an AI ranking plan without the enterprise price tag.",
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${BASE_URL}/#app`,
      name: "Rank Number 1",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: BASE_URL,
      description:
        "AI-powered keyword research tool. Enter any keyword or URL and get difficulty, volume, intent, CPC, and a step-by-step Google ranking plan.",
      offers: [
        {
          "@type": "Offer",
          name: "Starter",
          price: "5.00",
          priceCurrency: "USD",
          description: "20 keyword research credits — one-time purchase, no subscription.",
        },
        {
          "@type": "Offer",
          name: "Pro",
          price: "12.99",
          priceCurrency: "USD",
          description: "100 keyword research credits — one-time purchase, no subscription.",
        },
        {
          "@type": "Offer",
          name: "Unlimited",
          price: "25.00",
          priceCurrency: "USD",
          description: "500 keyword research credits — one-time purchase, no subscription.",
        },
      ],
    },
  ],
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteJsonLd).replace(/</g, "\\u003c"),
          }}
        />
        <link rel="me" href={`${BASE_URL}/about`} />
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
