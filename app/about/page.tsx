import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About FourthWatch Tech — The Story Behind Rank Number 1",
  description:
    "I'm Rad, founder of FourthWatch Tech. I spent years mastering SEO and got tired of paying hundreds a month just to research keywords — so I built Rank Number 1.",
  openGraph: {
    type: "website",
    title: "About FourthWatch Tech — Rank Number 1",
    description:
      "I'm Rad, founder of FourthWatch Tech. I mastered SEO the hard way and built the tool I always wished existed.",
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/about`,
  },
};

const base = process.env.NEXT_PUBLIC_BASE_URL ?? "https://ranknumber1.com";

const aboutJsonLd = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  url: `${base}/about`,
  name: "About FourthWatch Tech — Rank Number 1",
  description:
    "Founded by Rad, owner of FourthWatch Tech. He mastered SEO and was tired of paying $100+/month for tools that were overbuilt for small businesses.",
  mainEntity: {
    "@type": "Organization",
    name: "FourthWatch Tech",
    url: base,
    foundingDate: "2024",
    description:
      "FourthWatch Tech builds affordable SEO intelligence tools for small business owners, solopreneurs, and entrepreneurs. Our flagship product, Rank Number 1, delivers keyword difficulty, search volume, intent, CPC, and AI-generated ranking plans without enterprise pricing.",
    knowsAbout: [
      "Search Engine Optimization",
      "Keyword Research",
      "Content Strategy",
      "Local SEO",
      "Small Business Marketing",
    ],
    product: {
      "@type": "SoftwareApplication",
      name: "Rank Number 1",
      applicationCategory: "BusinessApplication",
      url: base,
    },
  },
};

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(aboutJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      {/* Header */}
      <header className="flex items-center justify-between border-b border-[var(--color-border)] px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-[var(--color-accent)] flex items-center justify-center">
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
              <circle cx="6" cy="6" r="4" stroke="white" strokeWidth="1.5" />
              <path d="M9.5 9.5L12 12" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <span className="text-[14px] font-semibold text-[var(--color-fg)] tracking-tight">
            Rank Number 1
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/blog"
            className="text-[12px] font-medium text-[var(--color-muted)] hover:text-[var(--color-fg)] transition-colors"
          >
            Blog
          </Link>
          <Link
            href="/"
            className="rounded-lg bg-[var(--color-accent)] px-3 py-1.5 text-[12px] font-medium text-white hover:bg-[var(--color-accent-hover)] transition-colors"
          >
            Try the Tool Free
          </Link>
        </div>
      </header>

      <main className="flex-1 px-4 py-14 sm:py-20">
        <div className="max-w-2xl mx-auto">

          {/* Eyebrow */}
          <p className="text-[12px] font-medium uppercase tracking-wider text-[var(--color-accent)] mb-4">
            About FourthWatch Tech
          </p>

          {/* Headline */}
          <h1 className="text-[30px] sm:text-[38px] font-semibold text-[var(--color-fg)] leading-snug tracking-tight mb-6">
            I got tired of paying $130/month just to look up a keyword. So I built something better.
          </h1>

          {/* Divider */}
          <div className="h-px w-16 bg-[var(--color-accent)] mb-8 opacity-60" />

          {/* Story */}
          <div className="space-y-5 text-[15px] text-[var(--color-muted)] leading-relaxed">
            <p>
              Hey — I'm Rad, the founder of FourthWatch Tech. I've spent years building businesses online, and for most of that time, SEO was the channel that moved the needle the most. But I didn't learn it from a course or an agency. I learned it the hard way.
            </p>

            <p>
              I had browser tabs open at midnight, reading documentation, running tests, watching what Google rewarded and punished. Slowly, I figured out which metrics actually predicted whether a page would rank, which keyword patterns brought in buyers instead of browsers, and which tactics ate months of effort for zero return.
            </p>

            <p>
              Eventually, I got good at it. My sites ranked. Traffic came in without paying for ads. And then I ran into a wall I couldn't ignore: every time I wanted to research a keyword properly, I had to open Semrush at $130/month or Ahrefs at $99/month. Tools built for agencies managing 30 client websites — when I just needed to check if a keyword was worth targeting.
            </p>

            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-5 my-8">
              <p className="text-[16px] font-medium text-[var(--color-fg)] leading-relaxed">
                "I kept asking myself why there was no tool that just gave you the data you actually needed, without the $100+ monthly subscription. Eventually I realized the answer was that nobody had built it for people like me — so I did."
              </p>
              <p className="mt-3 text-[13px] text-[var(--color-muted)]">
                — Rad, Founder of FourthWatch Tech
              </p>
            </div>

            <p>
              That's how Rank Number 1 was born. Enter any keyword and instantly get what actually matters: difficulty score, monthly search volume, search intent, cost per click, and a concrete step-by-step ranking plan — generated by AI, grounded in real ranking patterns. No bloated dashboards. No features you'll never use. No subscription draining your account every month whether you log in or not.
            </p>

            <p>
              I built FourthWatch Tech around one belief: SEO intelligence shouldn't require an enterprise budget. A bakery owner in Denver, a freelance consultant in Chicago, a boutique founder in Atlanta — they all deserve access to the same data that big brands use to dominate search results. The playing field should be level. It isn't yet. That's what I'm fixing.
            </p>
          </div>

          {/* Values */}
          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            {[
              {
                title: "Built for builders",
                body: "I made this for the people actually doing the work — not for agencies billing it out at $200/hour.",
              },
              {
                title: "Pay for what you use",
                body: "No subscriptions. No auto-renewals. Credits that don't expire. Your budget, your pace.",
              },
              {
                title: "Honest data",
                body: "I show you the real difficulty, not an inflated number designed to make you feel like you need more features.",
              },
            ].map((v) => (
              <div
                key={v.title}
                className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
              >
                <h3 className="text-[14px] font-semibold text-[var(--color-fg)] mb-2">
                  {v.title}
                </h3>
                <p className="text-[13px] text-[var(--color-muted)] leading-relaxed">
                  {v.body}
                </p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-12 rounded-xl border border-[var(--color-accent)] bg-[var(--color-surface)] px-6 py-8 text-center">
            <h2 className="text-[18px] font-semibold text-[var(--color-fg)] mb-2">
              Ready to stop guessing which keywords to target?
            </h2>
            <p className="text-[14px] text-[var(--color-muted)] mb-5 max-w-sm mx-auto leading-relaxed">
              Get your first keyword analysis free — difficulty, volume, intent, CPC, and your ranking plan in under 30 seconds.
            </p>
            <Link
              href="/"
              className="inline-block rounded-lg bg-[var(--color-accent)] px-5 py-2.5 text-[13px] font-medium text-white hover:bg-[var(--color-accent-hover)] transition-colors"
            >
              Try Rank Number 1 Free
            </Link>
          </div>

          {/* Contact */}
          <div className="mt-8 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-6">
            <h2 className="text-[16px] font-semibold text-[var(--color-fg)] mb-1">
              Get in touch
            </h2>
            <p className="text-[14px] text-[var(--color-muted)] leading-relaxed mb-4">
              Questions, feedback, or partnership ideas — I read every email personally.
            </p>
            <a
              href="mailto:admin@fourthwatchtech.com"
              className="inline-flex items-center gap-2 text-[13px] font-medium text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <rect x="1" y="3" width="14" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
                <path d="M1 5l7 5 7-5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              admin@fourthwatchtech.com
            </a>
          </div>
        </div>
      </main>

      <footer className="border-t border-[var(--color-border)] px-6 py-4 mt-8">
        <div className="flex items-center justify-center gap-4 text-[12px] text-[var(--color-muted)]">
          <Link href="/" className="hover:text-[var(--color-fg)] transition-colors">
            Rank Number 1
          </Link>
          <span>·</span>
          <Link href="/blog" className="hover:text-[var(--color-fg)] transition-colors">
            Blog
          </Link>
          <span>·</span>
          <Link href="/about" className="hover:text-[var(--color-fg)] transition-colors">
            About
          </Link>
        </div>
      </footer>
    </div>
  );
}
