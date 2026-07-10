"use client";

import { useState } from "react";

export interface Article {
  id: string;
  keyword: string;
  plain_text: string;
  html: string;
}

interface ArticleCardProps {
  article: Article;
  onClose: () => void;
  userEmail?: string;
  anonId?: string;
  onEmailCaptured?: (email: string) => void;
}

export default function ArticleCard({ article, onClose, userEmail, anonId, onEmailCaptured }: ArticleCardProps) {
  const [emailGate, setEmailGate] = useState<"txt" | "html" | null>(null);
  const [gateEmail, setGateEmail] = useState("");
  const [gateStatus, setGateStatus] = useState<"idle" | "loading">("idle");

  function markSaved() {
    fetch("/api/articles", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: article.id }),
    }).catch(() => {});
  }

  function handleClose() {
    markSaved();
    onClose();
  }

  function triggerDownloadTxt() {
    markSaved();
    const blob = new Blob([article.plain_text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${article.keyword.replace(/\s+/g, "-").toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function triggerDownloadHtml() {
    markSaved();
    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${article.keyword}</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; line-height: 1.7; color: #1a1a1a; }
    h1 { font-size: 2rem; margin-bottom: 0.5rem; }
    h2 { font-size: 1.4rem; margin-top: 2rem; }
    h3 { font-size: 1.1rem; margin-top: 1.5rem; }
    p { margin: 1rem 0; }
    ul, ol { padding-left: 1.5rem; }
    li { margin: 0.4rem 0; }
  </style>
</head>
<body>
${article.html}
</body>
</html>`;
    const blob = new Blob([fullHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${article.keyword.replace(/\s+/g, "-").toLowerCase()}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleDownloadClick(format: "txt" | "html") {
    if (userEmail) {
      format === "txt" ? triggerDownloadTxt() : triggerDownloadHtml();
    } else {
      setEmailGate(format);
    }
  }

  async function handleGateSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = gateEmail.trim().toLowerCase();
    if (!trimmed) return;
    setGateStatus("loading");

    if (anonId) {
      await fetch("/api/claim-articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ anonId, email: trimmed }),
      }).catch(() => {});
    }

    onEmailCaptured?.(trimmed);
    emailGate === "txt" ? triggerDownloadTxt() : triggerDownloadHtml();
    setEmailGate(null);
    setGateEmail("");
    setGateStatus("idle");
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className="relative w-full max-w-2xl flex flex-col rounded-2xl border border-[#252525] bg-[#111111] shadow-2xl"
        style={{ maxHeight: "80vh" }}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-[#1a1a1a] shrink-0">
          <div>
            <p className="text-[11px] uppercase tracking-widest text-[#5e6ad2] font-medium mb-1">
              Article Ready
            </p>
            <h2 className="text-[16px] font-semibold text-[#ededed] leading-tight">
              {article.keyword}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="text-[#6b6b6b] hover:text-[#ededed] transition-colors ml-4 mt-0.5 shrink-0"
            aria-label="Close"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Article preview */}
        <div className="flex-1 overflow-y-auto px-6 py-5 text-[13px] leading-[1.8] text-[#999] whitespace-pre-wrap min-h-0">
          {article.plain_text}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#1a1a1a] shrink-0">
          {emailGate ? (
            <form onSubmit={handleGateSubmit} className="flex flex-col gap-3">
              <p className="text-[12px] text-[#6b6b6b]">Enter your email to download</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={gateEmail}
                  onChange={(e) => setGateEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoFocus
                  className="flex-1 rounded-lg border border-[#252525] bg-[#0a0a0a] px-3.5 py-2 text-[13px] text-[#ededed] placeholder-[#3a3a3a] outline-none focus:border-[#5e6ad2] transition-colors"
                />
                <button
                  type="submit"
                  disabled={gateStatus === "loading"}
                  className="rounded-lg bg-[#5e6ad2] px-4 py-2 text-[12px] font-medium text-white hover:bg-[#4f5bc3] disabled:opacity-60 transition-colors"
                >
                  {gateStatus === "loading" ? "…" : "Download"}
                </button>
                <button
                  type="button"
                  onClick={() => { setEmailGate(null); setGateEmail(""); }}
                  className="rounded-lg border border-[#252525] px-3 py-2 text-[12px] text-[#6b6b6b] hover:text-[#ededed] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="flex items-center gap-3">
              <p className="text-[12px] text-[#6b6b6b] mr-auto">Download your article</p>
              <button
                onClick={() => handleDownloadClick("txt")}
                className="flex items-center gap-1.5 rounded-lg border border-[#252525] bg-[#0a0a0a] px-3.5 py-2 text-[12px] font-medium text-[#ededed] hover:border-[#5e6ad2] hover:text-[#5e6ad2] transition-colors"
              >
                Download (.txt)
              </button>
              <button
                onClick={() => handleDownloadClick("html")}
                className="flex items-center gap-1.5 rounded-lg bg-[#5e6ad2] px-3.5 py-2 text-[12px] font-medium text-white hover:bg-[#4f5bc3] transition-colors"
              >
                Download (.html)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
