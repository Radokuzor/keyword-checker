"use client";

import { useState, useEffect, useCallback } from "react";
import Dashboard from "@/components/Dashboard";
import SearchInput from "@/components/SearchInput";
import BulkInput from "@/components/BulkInput";
import ResultCards from "@/components/KeywordCard";
import UrlCards from "@/components/UrlCards";
import RecommendedKeywords from "@/components/RecommendedKeywords";
import RelatedSites from "@/components/RelatedSites";
import AuthModal from "@/components/AuthModal";
import PaywallOverlay from "@/components/PaywallOverlay";
import ArticleCard, { type Article } from "@/components/ArticleCard";
import ArticleGenerating, { CyclingLoader } from "@/components/ArticleGenerating";
import { useTheme } from "@/components/ThemeProvider";
import type { KeywordData, UrlData } from "@/lib/types";
import { isUrl } from "@/lib/isUrl";
import {
  getStoredEmail,
  setStoredEmail,
} from "@/lib/searchLimit";
import { getAnonId } from "@/lib/anonId";
import { supabaseBrowser } from "@/lib/supabase-browser";
import type { Session } from "@supabase/supabase-js";

export default function Home() {
  const { theme, toggle } = useTheme();
  const [data, setData] = useState<KeywordData | null>(null);
  const [urlData, setUrlData] = useState<UrlData | null>(null);
  const [activeKeyword, setActiveKeyword] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bulkMode, setBulkMode] = useState(false);
  const [sidebarKeywords, setSidebarKeywords] = useState<string[]>([]);
  const [sidebarSites, setSidebarSites] = useState<string[]>([]);

  // Auth state
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);

  // Article state
  const [article, setArticle] = useState<Article | null>(null);
  const [isGeneratingArticle, setIsGeneratingArticle] = useState(false);
  const [pendingDownload, setPendingDownload] = useState<(() => void) | null>(null);

  // URL tracking state
  const [trackState, setTrackState] = useState<"idle" | "saving" | "saved">("idle");
  const [trackedSites, setTrackedSites] = useState<Set<string>>(new Set());
  const [pendingTrackUrl, setPendingTrackUrl] = useState<string | null>(null);

  // Keyword tracking state
  const [kwTrackState, setKwTrackState] = useState<"idle" | "saving" | "saved">("idle");
  const [trackedKeywords, setTrackedKeywords] = useState<Set<string>>(new Set());
  const [pendingTrackKeyword, setPendingTrackKeyword] = useState<string | null>(null);

  // Auth session
  const [session, setSession] = useState<Session | null>(null);
  const [credits, setCredits] = useState<number | null>(null);
  const [plan, setPlan] = useState<string | null>(null);

  // Paywall
  const [showPaywall, setShowPaywall] = useState(false);
  const [paywallMinPlanId, setPaywallMinPlanId] = useState<"pro" | "unlimited">("pro");
  const [paywallFeature, setPaywallFeature] = useState<string | undefined>(undefined);
  const [paywallLoading, setPaywallLoading] = useState(false);

  // Plan gates (DB ids: "pro"=Starter display, "unlimited"=Pro display, "starter"=Unlimited display)
  const hasStarterPlan = plan === "pro" || plan === "unlimited" || plan === "starter";
  const hasProPlan = plan === "unlimited" || plan === "starter";

  function openPaywall(minPlanId: "pro" | "unlimited", feature: string) {
    setPaywallMinPlanId(minPlanId);
    setPaywallFeature(feature);
    setShowPaywall(true);
  }

const fetchCredits = useCallback(async (email: string) => {
    try {
      const res = await fetch(`/api/credits?email=${encodeURIComponent(email)}`);
      if (res.ok) {
        const body = await res.json();
        setCredits(body.credits ?? 0);
        setPlan(body.plan ?? null);
      }
    } catch {
      // non-critical
    }
  }, []);

  const fetchPendingArticle = useCallback(async (email: string) => {
    try {
      const res = await fetch(`/api/articles?email=${encodeURIComponent(email)}`);
      if (!res.ok) return;
      const body = await res.json();
      if (body.article) setArticle(body.article);
    } catch {
      // non-critical
    }
  }, []);

  useEffect(() => {
    // Restore Supabase session on load
    supabaseBrowser.auth.getSession().then(({ data }) => {
      if (data.session) {
        setSession(data.session);
        const email = data.session.user?.email;
        if (email) {
          setStoredEmail(email);
          fetchCredits(email);
          fetchPendingArticle(email);
        }
      } else {
        // Fallback: localStorage email from prior purchase
        const lsEmail = getStoredEmail();
        if (lsEmail) fetchCredits(lsEmail);
      }
    });

    const {
      data: { subscription },
    } = supabaseBrowser.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
      const email = sess?.user?.email;
      if (email) {
        setStoredEmail(email);
        fetchPendingArticle(email);
        // Fetch plan first, then resolve any pending tracked actions
        fetch(`/api/credits?email=${encodeURIComponent(email)}`)
          .then((r) => (r.ok ? r.json() : Promise.reject()))
          .then((body) => {
            const userPlan: string | null = body.plan ?? null;
            setCredits(body.credits ?? 0);
            setPlan(userPlan);
            const userHasStarter = userPlan === "pro" || userPlan === "unlimited" || userPlan === "starter";
            const userHasPro = userPlan === "unlimited" || userPlan === "starter";

            setPendingTrackKeyword((pending) => {
              if (pending) {
                if (!userHasStarter) {
                  setPaywallMinPlanId("pro");
                  setPaywallFeature("Save keywords to track your rankings over time");
                  setShowPaywall(true);
                } else {
                  setKwTrackState("saving");
                  fetch("/api/track-keyword", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ keyword: pending, email }),
                  }).then(() => {
                    setTrackedKeywords((prev) => new Set(prev).add(pending));
                    setKwTrackState("saved");
                  }).catch(() => setKwTrackState("idle"));
                }
              }
              return null;
            });

            setPendingTrackUrl((pending) => {
              if (pending) {
                if (!userHasPro) {
                  setPaywallMinPlanId("unlimited");
                  setPaywallFeature("Save websites to get notified when their rankings change");
                  setShowPaywall(true);
                } else {
                  setTrackState("saving");
                  fetch("/api/track-url", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ url: pending, email }),
                  }).then(() => {
                    setTrackedSites((prev) => new Set(prev).add(pending));
                    setTrackState("saved");
                  }).catch(() => setTrackState("idle"));
                }
              }
              return null;
            });
          })
          .catch(() => {
            fetchCredits(email);
            setPendingTrackKeyword(null);
            setPendingTrackUrl(null);
          });
      } else if (!sess) {
        setCredits(null);
        setPlan(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchCredits, fetchPendingArticle]);

  async function handleSearch(query: string) {
    const email = session?.user?.email ?? getStoredEmail();
    const anonId = !email ? getAnonId() : undefined;

    setIsLoading(true);
    setError(null);
    setActiveKeyword(query);
    setData(null);
    setUrlData(null);
    setTrackState("idle");
    setKwTrackState("idle");

    const queryIsUrl = isUrl(query);

    try {
      if (queryIsUrl) {
        const res = await fetch("/api/analyze-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: query, email, anonId }),
        });

        if (res.status === 429) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? "Daily search limit reached. Try again tomorrow.");
        }
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? "Something went wrong. Please try again.");
        }

        const result: UrlData = await res.json();
        setUrlData(result);
        setSidebarSites(result.relatedSites ?? []);
      } else {
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ keyword: query, email, anonId }),
        });

        if (res.status === 429) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? "Daily search limit reached. Try again tomorrow.");
        }
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? "Something went wrong. Please try again.");
        }

        const result: KeywordData = await res.json();
        setData(result);
        if (!bulkMode) setSidebarKeywords(result.recommended);
      }

      if (email) fetchCredits(email);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }

async function handleSignOut() {
    await supabaseBrowser.auth.signOut();
    localStorage.removeItem("kiq_email");
    setSession(null);
    setCredits(null);
  }

  async function handleSelectPlan(planId: string) {
    setPaywallLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      if (res.ok) {
        const { url } = await res.json();
        window.location.href = url;
      }
    } catch {
      // silent
    } finally {
      setPaywallLoading(false);
    }
  }

  async function generateArticle(keyword: string, advice: string, email?: string) {
    setIsGeneratingArticle(true);
    try {
      const anonId = getAnonId();
      const res = await fetch("/api/generate-article", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword, advice, anonId, email }),
      });
      if (!res.ok) return;
      const result = await res.json();
      setArticle(result);
    } catch {
      // silent
    } finally {
      setIsGeneratingArticle(false);
    }
  }

  function handleCreateArticle() {
    if (!data && !urlData) return;
    if (!session?.user?.email) {
      setShowAuthModal(true);
      return;
    }
    if (!hasStarterPlan) {
      openPaywall("pro", "Generate articles from your keyword research");
      return;
    }
    const keyword = data ? data.keyword : urlData!.url;
    const advice = data ? data.cta.advice : urlData!.cta.advice;
    generateArticle(keyword, advice, session.user.email);
  }

  async function trackKeyword(keyword: string) {
    const email = session?.user?.email;
    if (!email) {
      setPendingTrackKeyword(keyword);
      setShowAuthModal(true);
      return;
    }
    if (!hasStarterPlan) {
      openPaywall("pro", "Save keywords to track your rankings over time");
      return;
    }
    setKwTrackState("saving");
    try {
      await fetch("/api/track-keyword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword, email }),
      });
      setTrackedKeywords((prev) => new Set(prev).add(keyword));
      setKwTrackState("saved");
    } catch {
      setKwTrackState("idle");
    }
  }

  async function trackUrl(url: string) {
    const email = session?.user?.email;
    if (!email) {
      setPendingTrackUrl(url);
      setShowAuthModal(true);
      return;
    }
    if (!hasProPlan) {
      openPaywall("unlimited", "Save websites to get notified when their rankings change");
      return;
    }
    setTrackState("saving");
    try {
      await fetch("/api/track-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, email }),
      });
      setTrackedSites((prev) => new Set(prev).add(url));
      setTrackState("saved");
    } catch {
      setTrackState("idle");
    }
  }

  function handleBulkSubmit(keywords: string[]) {
    setBulkMode(true);
    setSidebarKeywords(keywords);
    handleSearch(keywords[0]);
  }

  function handleSidebarClick(keyword: string) {
    handleSearch(keyword);
  }

  function exitBulkMode() {
    setBulkMode(false);
    setSidebarKeywords([]);
    setSidebarSites([]);
    setData(null);
    setUrlData(null);
    setError(null);
    setActiveKeyword("");
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-[var(--color-border)] px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-[var(--color-accent)] flex items-center justify-center">
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
              <circle cx="6" cy="6" r="4" stroke="white" strokeWidth="1.5" />
              <path d="M9.5 9.5L12 12" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <span className="text-[14px] font-semibold text-[var(--color-fg)] tracking-tight">
            Rank Number 1
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Blog link — always visible */}
          <a
            href="/blog"
            className="flex items-center gap-1.5 text-[12px] font-medium text-[var(--color-muted)] hover:text-[var(--color-fg)] transition-colors px-1"
          >
            Blog
          </a>

          {session ? (
            <>
              <div className="flex items-center gap-1.5 text-[12px] text-[var(--color-muted)]">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    plan ? "bg-[var(--color-success)]" : "bg-[var(--color-muted)]"
                  }`}
                />
                {plan
                  ? plan === "pro" ? "Starter" : plan === "unlimited" ? "Pro" : plan === "starter" ? "Unlimited" : plan.charAt(0).toUpperCase() + plan.slice(1)
                  : "Free user"}
              </div>
              <button
                onClick={() => setShowDashboard((v) => !v)}
                className="flex items-center gap-1.5 text-[12px] font-medium border border-[var(--color-border)] rounded-lg px-3 py-1.5 transition-colors"
                style={{
                  background: showDashboard ? "var(--color-accent)" : "transparent",
                  color: showDashboard ? "white" : "var(--color-muted)",
                  borderColor: showDashboard ? "var(--color-accent)" : "var(--color-border)",
                }}
              >
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                  <rect x="1" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4" />
                  <rect x="8" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4" />
                  <rect x="1" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4" />
                  <rect x="8" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4" />
                </svg>
                Dashboard
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="rounded-lg bg-[var(--color-accent)] px-3 py-1.5 text-[12px] font-medium text-white hover:bg-[var(--color-accent-hover)] active:scale-95 transition-all"
            >
              Sign in / Sign up
            </button>
          )}

          {/* Theme toggle */}
          <button
            onClick={toggle}
            aria-label="Toggle theme"
            className="flex items-center justify-center w-8 h-8 rounded-lg border border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-fg)] hover:bg-[var(--color-surface-raised)] transition-colors"
          >
            {theme === "dark" ? (
              <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="4" stroke="currentColor" strokeWidth="1.6" />
                <path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.93 4.93l1.41 1.41M13.66 13.66l1.41 1.41M4.93 15.07l1.41-1.41M13.66 6.34l1.41-1.41" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* Dashboard panel */}
      {showDashboard && session?.user?.email && (
        <div className="relative z-40">
          <Dashboard
            email={session.user.email}
            credits={credits}
            plan={plan}
            onClose={() => setShowDashboard(false)}
            onSignOut={() => { handleSignOut(); setShowDashboard(false); }}
            onSearch={(q) => { handleSearch(q); setShowDashboard(false); }}
          />
        </div>
      )}

      {/* Main */}
      <main className="flex flex-1 flex-col items-center px-4 py-16 sm:py-24">

        {/* Hero — only before first search */}
        {!data && !urlData && !isLoading && !bulkMode && (
          <div className="mb-10 text-center">
            <h1 className="text-[32px] sm:text-[40px] font-semibold tracking-tight text-[var(--color-fg)] leading-tight">
              Rank Number 1
              <br />
              <span className="text-[var(--color-muted)]">Faster</span>
            </h1>
            <p className="mt-3 text-[15px] text-[var(--color-muted)] max-w-md mx-auto">
              Enter a keyword for search metrics, or paste a URL to see traffic,
              authority, competitors, and ranking opportunities.
            </p>
            <a
              href="/blog"
              className="mt-4 inline-block text-[13px] text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] transition-colors"
            >
              Read our SEO guides for small businesses →
            </a>
          </div>
        )}

        {/* Input area */}
        <>
            {bulkMode && !data && !isLoading ? (
              <BulkInput onSubmit={handleBulkSubmit} onClose={exitBulkMode} />
            ) : !bulkMode ? (
              <SearchInput
                onSearch={handleSearch}
                isLoading={isLoading}
                onBulkToggle={() => setBulkMode(true)}
              />
            ) : (
              <div className="w-full max-w-5xl flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-[13px] text-[var(--color-muted)]">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <rect x="1" y="3" width="14" height="1.5" rx="0.75" fill="currentColor" />
                    <rect x="1" y="7.25" width="10" height="1.5" rx="0.75" fill="currentColor" />
                    <rect x="1" y="11.5" width="12" height="1.5" rx="0.75" fill="currentColor" />
                  </svg>
                  Bulk mode · {sidebarKeywords.length} keywords
                </div>
                <button
                  onClick={exitBulkMode}
                  className="text-[12px] text-[var(--color-muted)] hover:text-[var(--color-fg)] transition-colors"
                >
                  ← Single search
                </button>
              </div>
            )}
        </>

        {/* Error state */}
        {error && !isLoading && (
          <div className="mt-10 w-full max-w-xl rounded-xl border border-[var(--color-error-border)] bg-[var(--color-error-bg)] px-5 py-4 flex items-start gap-3">
            <svg className="mt-0.5 shrink-0 text-[var(--color-danger)]" width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
              <path d="M8 5v3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="8" cy="11" r="0.75" fill="currentColor" />
            </svg>
            <p className="text-[13px] text-[var(--color-danger)]">{error}</p>
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="mt-10 w-full max-w-5xl">
            <div className="flex flex-col lg:flex-row-reverse lg:items-start lg:gap-6">
              <div className="flex-1 min-w-0 flex items-center justify-center py-16">
                <CyclingLoader
                  messages={
                    isUrl(activeKeyword)
                      ? [
                          "Fetching site data…",
                          "Estimating organic traffic…",
                          "Calculating traffic value…",
                          "Identifying top competitors…",
                          "Analyzing backlink authority…",
                          "Clustering ranking intent…",
                          "Finding content gaps…",
                        ]
                      : [
                          "Fetching search data…",
                          "Analyzing keyword difficulty…",
                          "Estimating monthly volume…",
                          "Detecting search intent…",
                          "Calculating cost per click…",
                          "Writing your ranking plan…",
                          "Finding related keywords…",
                        ]
                  }
                  duration={20}
                />
              </div>
              {bulkMode && sidebarKeywords.length > 0 && (
                <div className="mt-6 lg:mt-0 lg:w-[260px] lg:shrink-0 lg:max-h-[calc(100vh-120px)] lg:overflow-y-auto">
                  <RecommendedKeywords
                    keywords={sidebarKeywords}
                    activeKeyword={activeKeyword}
                    onSelect={handleSidebarClick}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Keyword results */}
        {data && !isLoading && (
          <div className="mt-10 w-full max-w-5xl flex flex-col gap-6">
            <div className="flex items-center gap-2">
              <span className="text-[13px] text-[var(--color-muted)]">Results for</span>
              <span className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1 text-[13px] font-medium text-[var(--color-fg)]">
                {data.keyword}
              </span>
            </div>

            <div className="flex flex-col lg:flex-row-reverse lg:items-start lg:gap-6">
              <div className="flex-1 min-w-0">
                <ResultCards
                  data={data}
                  onCreateArticle={handleCreateArticle}
                  onTrack={() => trackKeyword(data.keyword)}
                  trackState={trackedKeywords.has(data.keyword) ? "saved" : kwTrackState}
                />
              </div>
              <div className="mt-6 lg:mt-0 lg:w-[260px] lg:shrink-0 lg:max-h-[calc(100vh-120px)] lg:overflow-y-auto">
                <RecommendedKeywords
                  keywords={sidebarKeywords}
                  activeKeyword={activeKeyword}
                  onSelect={handleSidebarClick}
                  label={bulkMode ? "Your Keywords" : "Related Keywords"}
                  onAdd={(kw) => trackKeyword(kw)}
                  trackedKeywords={trackedKeywords}
                />
              </div>
            </div>
          </div>
        )}

        {/* URL analytics results */}
        {urlData && !isLoading && (
          <div className="mt-10 w-full max-w-5xl flex flex-col gap-6">
            <div className="flex items-center gap-2">
              <span className="text-[13px] text-[var(--color-muted)]">Analysis for</span>
              <span className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1 text-[13px] font-medium text-[var(--color-fg)] max-w-[400px] truncate">
                {urlData.url}
              </span>
            </div>

            <div className="flex flex-col lg:flex-row-reverse lg:items-start lg:gap-6">
              <div className="flex-1 min-w-0">
                <UrlCards
                  data={urlData}
                  onCreateArticle={handleCreateArticle}
                  onTrack={() => trackUrl(urlData.url)}
                  trackState={trackedSites.has(urlData.url) ? "saved" : trackState}
                />
              </div>
              <div className="mt-6 lg:mt-0 lg:w-[260px] lg:shrink-0 lg:max-h-[calc(100vh-120px)] lg:overflow-y-auto">
                <RelatedSites
                  sites={sidebarSites}
                  activeSite={activeKeyword}
                  onSelect={handleSidebarClick}
                  onAdd={(site) => trackUrl(`https://${site}`)}
                  trackedSites={trackedSites}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--color-border)] px-6 py-4">
        <div className="flex items-center justify-center gap-4 text-[12px] text-[var(--color-muted)]">
          <span>Rank Number 1</span>
          <span>·</span>
          <a href="/blog" className="hover:text-[var(--color-fg)] transition-colors">
            Blog
          </a>
          <span>·</span>
          <a href="/about" className="hover:text-[var(--color-fg)] transition-colors">
            About
          </a>
        </div>
      </footer>

      {/* Paywall modal */}
      {showPaywall && (
        <PaywallOverlay
          minPlanId={paywallMinPlanId}
          feature={paywallFeature}
          isLoading={paywallLoading}
          onSelectPlan={handleSelectPlan}
          onClose={() => setShowPaywall(false)}
        />
      )}

      {/* Auth modal */}
      {showAuthModal && (
        <AuthModal
          onClose={() => { setShowAuthModal(false); setPendingDownload(null); }}
          anonId={getAnonId()}
          onEmailSent={pendingDownload ?? undefined}
        />
      )}

      {/* Article generating overlay */}
      {isGeneratingArticle && <ArticleGenerating />}

      {/* Article card */}
      {article && !isGeneratingArticle && (
        <ArticleCard
          article={article}
          onClose={() => setArticle(null)}
          userEmail={session?.user?.email}
          onUnauthDownload={(downloadFn) => {
            setPendingDownload(() => downloadFn);
            setArticle(null);
            setShowAuthModal(true);
          }}
        />
      )}
    </div>
  );
}
