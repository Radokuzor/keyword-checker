"use client";

import { useState, useEffect, useCallback } from "react";
import SearchInput from "@/components/SearchInput";
import BulkInput from "@/components/BulkInput";
import ResultCards from "@/components/KeywordCard";
import RecommendedKeywords from "@/components/RecommendedKeywords";
import PaywallOverlay from "@/components/PaywallOverlay";
import AuthModal from "@/components/AuthModal";
import type { KeywordData } from "@/lib/types";
import {
  FREE_SEARCH_LIMIT,
  getSearchesUsed,
  incrementSearchesUsed,
  getStoredEmail,
  setStoredEmail,
} from "@/lib/searchLimit";
import { supabaseBrowser } from "@/lib/supabase-browser";
import type { Session } from "@supabase/supabase-js";

export default function Home() {
  const [data, setData] = useState<KeywordData | null>(null);
  const [activeKeyword, setActiveKeyword] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bulkMode, setBulkMode] = useState(false);
  const [sidebarKeywords, setSidebarKeywords] = useState<string[]>([]);

  // Paywall + auth state
  const [showPaywall, setShowPaywall] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [searchesUsed, setSearchesUsed] = useState(0);

  // Auth session
  const [session, setSession] = useState<Session | null>(null);
  const [credits, setCredits] = useState<number | null>(null);

  const effectiveEmail = session?.user?.email ?? getStoredEmail();

  const fetchCredits = useCallback(async (email: string) => {
    try {
      const res = await fetch(`/api/credits?email=${encodeURIComponent(email)}`);
      if (res.ok) {
        const body = await res.json();
        setCredits(body.credits ?? 0);
      }
    } catch {
      // non-critical
    }
  }, []);

  useEffect(() => {
    setSearchesUsed(getSearchesUsed());

    // Restore Supabase session on load
    supabaseBrowser.auth.getSession().then(({ data }) => {
      if (data.session) {
        setSession(data.session);
        const email = data.session.user?.email;
        if (email) {
          setStoredEmail(email);
          fetchCredits(email);
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
        fetchCredits(email);
      } else if (!sess) {
        setCredits(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchCredits]);

  async function handleSearch(query: string) {
    const email = session?.user?.email ?? getStoredEmail();

    // Gate: free limit exceeded and no paid account
    if (searchesUsed >= FREE_SEARCH_LIMIT && !email) {
      setShowPaywall(true);
      return;
    }

    setIsLoading(true);
    setError(null);
    setShowPaywall(false);
    setActiveKeyword(query);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: query, email }),
      });

      if (res.status === 402) {
        setShowPaywall(true);
        return;
      }

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

      if (!email) {
        incrementSearchesUsed();
        setSearchesUsed(getSearchesUsed());
      } else {
        // Refresh credit count after deduction
        fetchCredits(email);
      }

      if (!bulkMode) setSidebarKeywords(result.recommended);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSelectPlan(planId: string) {
    setCheckoutLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch {
      setCheckoutLoading(false);
    }
  }

  async function handleSignOut() {
    await supabaseBrowser.auth.signOut();
    localStorage.removeItem("kiq_email");
    setSession(null);
    setCredits(null);
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
    setData(null);
    setError(null);
    setActiveKeyword("");
    setShowPaywall(false);
  }

  const hasPaidAccount = !!effectiveEmail;

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-[#1a1a1a] px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-[#5e6ad2] flex items-center justify-center">
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
              <circle cx="6" cy="6" r="4" stroke="white" strokeWidth="1.5" />
              <path d="M9.5 9.5L12 12" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <span className="text-[14px] font-semibold text-[#ededed] tracking-tight">
            KeywordIQ
          </span>
        </div>

        <div className="flex items-center gap-3">
          {hasPaidAccount ? (
            <>
              {credits !== null && (
                <div className="flex items-center gap-1.5 text-[12px] text-[#6b6b6b]">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      credits > 0 ? "bg-[#4caf6e]" : "bg-[#e5534b]"
                    }`}
                  />
                  {credits} credit{credits !== 1 ? "s" : ""} remaining
                </div>
              )}
              {session && (
                <button
                  onClick={handleSignOut}
                  className="text-[12px] text-[#6b6b6b] hover:text-[#ededed] border border-[#252525] rounded-lg px-3 py-1.5 transition-colors"
                >
                  Sign out
                </button>
              )}
            </>
          ) : (
            <>
              <div className="flex items-center gap-1.5 text-[12px] text-[#6b6b6b]">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    searchesUsed >= FREE_SEARCH_LIMIT ? "bg-[#e5534b]" : "bg-[#4caf6e]"
                  }`}
                />
                {searchesUsed >= FREE_SEARCH_LIMIT
                  ? "Free search used"
                  : `${FREE_SEARCH_LIMIT - searchesUsed} free search remaining`}
              </div>
              <button
                onClick={() => setShowAuthModal(true)}
                className="text-[12px] text-[#6b6b6b] hover:text-[#ededed] border border-[#252525] rounded-lg px-3 py-1.5 transition-colors"
              >
                Sign in
              </button>
            </>
          )}
        </div>
      </header>

      {/* Main */}
      <main className="flex flex-1 flex-col items-center px-4 py-16 sm:py-24">

        {/* Standalone paywall — shown when paywall is triggered but no results exist yet */}
        {showPaywall && !data && !isLoading && (
          <div className="w-full max-w-lg">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#5e6ad215] border border-[#5e6ad230] mb-3">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect x="3" y="7" width="10" height="8" rx="1.5" stroke="#5e6ad2" strokeWidth="1.5" />
                  <path d="M5 7V5a3 3 0 016 0v2" stroke="#5e6ad2" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <h2 className="text-[20px] font-semibold text-[#ededed] tracking-tight">
                You&apos;ve used your free search
              </h2>
              <p className="mt-1.5 text-[13px] text-[#6b6b6b]">
                Get more searches to continue your research
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: "starter", name: "Starter", price: "$5", searches: "20 searches", note: "One-time" },
                { id: "pro", name: "Pro", price: "$12.99", searches: "100 searches", note: "One-time", highlighted: true },
                { id: "unlimited", name: "Unlimited", price: "$25", searches: "500 searches", note: "One-time" },
              ].map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={checkoutLoading}
                  className={`relative flex flex-col rounded-xl border p-4 text-left transition-all disabled:opacity-60 cursor-pointer ${
                    plan.highlighted
                      ? "border-[#5e6ad2] bg-[#5e6ad210] hover:bg-[#5e6ad218]"
                      : "border-[#252525] bg-[#111111] hover:border-[#353535]"
                  }`}
                >
                  {plan.highlighted && (
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-[#5e6ad2] px-2.5 py-0.5 text-[10px] font-semibold text-white uppercase tracking-wider whitespace-nowrap">
                      Popular
                    </span>
                  )}
                  <p className="text-[10px] uppercase tracking-widest text-[#6b6b6b] font-medium">{plan.name}</p>
                  <p className="mt-2 text-[26px] font-semibold text-[#ededed] leading-none">{plan.price}</p>
                  <p className="mt-2 text-[12px] font-medium text-[#ededed]">{plan.searches}</p>
                  <p className="mt-1 text-[11px] text-[#6b6b6b]">{plan.note}</p>
                  <div className={`mt-3 rounded-lg py-1.5 text-center text-[12px] font-medium ${
                    plan.highlighted ? "bg-[#5e6ad2] text-white" : "bg-[#1a1a1a] text-[#ededed]"
                  }`}>
                    {checkoutLoading ? "..." : "Get started →"}
                  </div>
                </button>
              ))}
            </div>
            <p className="mt-4 text-center text-[11px] text-[#3a3a3a]">
              Secure payment via Stripe · No subscription
            </p>
            <button
              onClick={() => setShowPaywall(false)}
              className="mt-4 block mx-auto text-[12px] text-[#3a3a3a] hover:text-[#6b6b6b] transition-colors"
            >
              ← Back to search
            </button>
          </div>
        )}

        {/* Hero — only before first search and not in paywall */}
        {!data && !isLoading && !bulkMode && !showPaywall && (
          <div className="mb-10 text-center">
            <h1 className="text-[32px] sm:text-[40px] font-semibold tracking-tight text-[#ededed] leading-tight">
              Keyword intelligence,
              <br />
              <span className="text-[#6b6b6b]">instantly.</span>
            </h1>
            <p className="mt-3 text-[15px] text-[#6b6b6b] max-w-md mx-auto">
              Enter any keyword to see difficulty, volume, intent, CPC, and a
              step-by-step ranking plan.
            </p>
          </div>
        )}

        {/* Input area */}
        {!showPaywall && (
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
                <div className="flex items-center gap-2 text-[13px] text-[#6b6b6b]">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <rect x="1" y="3" width="14" height="1.5" rx="0.75" fill="currentColor" />
                    <rect x="1" y="7.25" width="10" height="1.5" rx="0.75" fill="currentColor" />
                    <rect x="1" y="11.5" width="12" height="1.5" rx="0.75" fill="currentColor" />
                  </svg>
                  Bulk mode · {sidebarKeywords.length} keywords
                </div>
                <button
                  onClick={exitBulkMode}
                  className="text-[12px] text-[#6b6b6b] hover:text-[#ededed] transition-colors"
                >
                  ← Single search
                </button>
              </div>
            )}
          </>
        )}

        {/* Error state */}
        {error && !isLoading && (
          <div className="mt-10 w-full max-w-xl rounded-xl border border-[#3a1f1f] bg-[#1a0f0f] px-5 py-4 flex items-start gap-3">
            <svg className="mt-0.5 shrink-0 text-[#e5534b]" width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
              <path d="M8 5v3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="8" cy="11" r="0.75" fill="currentColor" />
            </svg>
            <p className="text-[13px] text-[#e5534b]">{error}</p>
          </div>
        )}

        {/* Loading skeleton */}
        {isLoading && (
          <div className="mt-10 w-full max-w-5xl">
            <div className="flex flex-col lg:flex-row-reverse lg:items-start lg:gap-6">
              <div className="flex-1 min-w-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`rounded-xl border border-[#252525] bg-[#111111] p-5 h-[140px] animate-pulse ${
                        i === 4 ? "sm:col-span-2 lg:col-span-2" : ""
                      }`}
                    >
                      <div className="h-2.5 w-24 rounded bg-[#1f1f1f] mb-3" />
                      <div className="h-7 w-20 rounded bg-[#1f1f1f]" />
                    </div>
                  ))}
                </div>
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

        {/* Results */}
        {data && !isLoading && (
          <div className="mt-10 w-full max-w-5xl flex flex-col gap-6">
            {/* Current keyword label */}
            <div className="flex items-center gap-2">
              <span className="text-[13px] text-[#6b6b6b]">Results for</span>
              <span className="rounded-full border border-[#252525] bg-[#111111] px-3 py-1 text-[13px] font-medium text-[#ededed]">
                {data.keyword}
              </span>
              {showPaywall && (
                <span className="ml-auto text-[12px] text-[#6b6b6b]">
                  Upgrade to search more keywords
                </span>
              )}
            </div>

            <div className="flex flex-col lg:flex-row-reverse lg:items-start lg:gap-6">
              {/* Cards — blurred when paywall is active */}
              <div className="flex-1 min-w-0">
                <div className="relative">
                  <div className={showPaywall ? "blur-sm pointer-events-none select-none" : ""}>
                    <ResultCards data={data} />
                  </div>
                  {showPaywall && (
                    <PaywallOverlay
                      onSelectPlan={handleSelectPlan}
                      isLoading={checkoutLoading}
                    />
                  )}
                </div>
              </div>

              {/* Sidebar */}
              <div className="mt-6 lg:mt-0 lg:w-[260px] lg:shrink-0 lg:max-h-[calc(100vh-120px)] lg:overflow-y-auto">
                <RecommendedKeywords
                  keywords={sidebarKeywords}
                  activeKeyword={activeKeyword}
                  onSelect={showPaywall ? () => setShowPaywall(true) : handleSidebarClick}
                  label={bulkMode ? "Your Keywords" : "Related Keywords"}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1a1a1a] px-6 py-4">
        <p className="text-center text-[12px] text-[#6b6b6b]">
          Powered by AI · Data is estimated and for strategic guidance only
        </p>
      </footer>

      {/* Auth modal */}
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </div>
  );
}
