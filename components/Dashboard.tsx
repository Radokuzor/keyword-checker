"use client";

import { useEffect, useState } from "react";
import { planLabel } from "@/lib/planLabels";

interface TrackedUrl {
  url: string;
  created_at: string;
}

interface TrackedKeyword {
  keyword: string;
  created_at: string;
}

interface DashboardProps {
  email: string;
  credits: number | null;
  plan: string | null;
  onClose: () => void;
  onSignOut: () => void;
  onSearch: (query: string) => void;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function EmptyRow({ label }: { label: string }) {
  return (
    <tr>
      <td colSpan={2} className="px-4 py-6 text-center text-[13px] text-[var(--color-muted)]">
        No {label} tracked yet
      </td>
    </tr>
  );
}

export default function Dashboard({ email, credits, plan, onClose, onSignOut, onSearch }: DashboardProps) {
  const [view, setView] = useState<"dashboard" | "profile">("dashboard");
  const [urls, setUrls] = useState<TrackedUrl[]>([]);
  const [keywords, setKeywords] = useState<TrackedKeyword[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/dashboard?email=${encodeURIComponent(email)}`)
      .then((r) => r.json())
      .then((d) => {
        setUrls(d.urls ?? []);
        setKeywords(d.keywords ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [email]);

  const tableHead = "text-[11px] uppercase tracking-widest text-[var(--color-muted)] font-medium px-4 py-2.5 text-left border-b border-[var(--color-border)] bg-[var(--color-surface-sunken)]";
  const tableRow = "border-b border-[var(--color-border)] last:border-b-0 hover:bg-[var(--color-row-hover)] transition-colors cursor-pointer";
  const tableCell = "px-4 py-3 text-[13px]";

  const planLabelText = planLabel(plan);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-30 bg-black/20 backdrop-blur-[1px]"
        style={{ top: "57px" }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="absolute left-0 right-0 z-40 border-b border-[var(--color-border)] bg-[var(--color-surface)] shadow-xl"
        style={{ animation: "slideDown 0.2s ease-out" }}
      >
        <style>{`
          @keyframes slideDown {
            from { opacity: 0; transform: translateY(-8px); }
            to   { opacity: 1; transform: translateY(0); }
          }
        `}</style>

        <div className="max-w-5xl mx-auto px-6 py-5">
          {/* Panel header — shared across both views */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              {view === "profile" && (
                <button
                  onClick={() => setView("dashboard")}
                  className="flex items-center justify-center w-7 h-7 rounded-lg border border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-fg)] hover:bg-[var(--color-surface-raised)] transition-colors mr-1"
                >
                  <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                    <path d="M9 1L3 7l6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              )}
              <button
                onClick={() => setView(view === "profile" ? "dashboard" : "profile")}
                className="flex items-center gap-3 rounded-lg px-2 py-1.5 -mx-2 hover:bg-[var(--color-surface-raised)] transition-colors text-left"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)] text-white text-[12px] font-semibold uppercase">
                  {email[0]}
                </div>
                <div>
                  <p className="text-[13px] font-medium text-[var(--color-fg)]">{email}</p>
                  <p className="text-[11px] text-[var(--color-muted)]">
                    {view === "dashboard"
                      ? `${urls.length} site${urls.length !== 1 ? "s" : ""} · ${keywords.length} keyword${keywords.length !== 1 ? "s" : ""} tracked`
                      : "View profile"}
                  </p>
                </div>
              </button>
            </div>

            <button
              onClick={onClose}
              className="flex items-center justify-center w-7 h-7 rounded-lg border border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-fg)] hover:bg-[var(--color-surface-raised)] transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* Dashboard view */}
          {view === "dashboard" && (
            loading ? (
              <div className="flex items-center justify-center py-10">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-accent)]" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="mb-2 text-[11px] uppercase tracking-widest text-[var(--color-muted)] font-medium">Tracked Sites</p>
                  <div className="rounded-xl border border-[var(--color-border)] overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr>
                          <th className={tableHead}>URL</th>
                          <th className={`${tableHead} text-right`}>Added</th>
                        </tr>
                      </thead>
                      <tbody>
                        {urls.length === 0 ? <EmptyRow label="sites" /> : urls.map((row) => (
                          <tr key={row.url} className={tableRow} onClick={() => { onSearch(row.url); onClose(); }}>
                            <td className={`${tableCell} font-medium text-[var(--color-fg)] max-w-[200px]`}>
                              <span className="block truncate">{row.url.replace(/^https?:\/\//, "")}</span>
                            </td>
                            <td className={`${tableCell} text-right text-[var(--color-muted)] tabular-nums whitespace-nowrap`}>
                              {formatDate(row.created_at)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-[11px] uppercase tracking-widest text-[var(--color-muted)] font-medium">Tracked Keywords</p>
                  <div className="rounded-xl border border-[var(--color-border)] overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr>
                          <th className={tableHead}>Keyword</th>
                          <th className={`${tableHead} text-right`}>Added</th>
                        </tr>
                      </thead>
                      <tbody>
                        {keywords.length === 0 ? <EmptyRow label="keywords" /> : keywords.map((row) => (
                          <tr key={row.keyword} className={tableRow} onClick={() => { onSearch(row.keyword); onClose(); }}>
                            <td className={`${tableCell} font-medium text-[var(--color-fg)]`}>{row.keyword}</td>
                            <td className={`${tableCell} text-right text-[var(--color-muted)] tabular-nums whitespace-nowrap`}>
                              {formatDate(row.created_at)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )
          )}

          {/* Profile view */}
          {view === "profile" && (
            <div className="max-w-sm flex flex-col gap-3">
              <div className="rounded-xl border border-[var(--color-border)] overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)]">
                  <span className="text-[12px] text-[var(--color-muted)]">Plan</span>
                  <span className="rounded-full bg-[#5e6ad215] px-2.5 py-1 text-[12px] font-medium text-[var(--color-accent)]">
                    {planLabelText}
                  </span>
                </div>
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-[12px] text-[var(--color-muted)]">Credits remaining</span>
                  <span
                    className="text-[13px] font-semibold tabular-nums"
                    style={{ color: (credits ?? 0) > 0 ? "var(--color-success)" : "var(--color-danger)" }}
                  >
                    {credits ?? 0}
                  </span>
                </div>
              </div>

              <button
                onClick={onSignOut}
                className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3 text-left text-[13px] font-medium text-[var(--color-danger)] hover:bg-[var(--color-error-bg)] transition-colors"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
