"use client";

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
  onUnauthDownload?: (downloadFn: () => void) => void;
}

export default function ArticleCard({ article, onClose, userEmail, onUnauthDownload }: ArticleCardProps) {
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
    const downloadFn = format === "txt" ? triggerDownloadTxt : triggerDownloadHtml;
    if (userEmail) {
      downloadFn();
    } else {
      onUnauthDownload?.(downloadFn);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div
        className="relative w-full max-w-2xl flex flex-col rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl"
        style={{ maxHeight: "80vh" }}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-[var(--color-border)] shrink-0">
          <div>
            <p className="text-[11px] uppercase tracking-widest text-[var(--color-accent)] font-medium mb-1">
              Article Ready
            </p>
            <h2 className="text-[16px] font-semibold text-[var(--color-fg)] leading-tight">
              {article.keyword}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="text-[var(--color-muted)] hover:text-[var(--color-fg)] transition-colors ml-4 mt-0.5 shrink-0"
            aria-label="Close"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Article preview */}
        <div className="flex-1 overflow-y-auto px-6 py-5 text-[13px] leading-[1.8] text-[var(--color-muted)] whitespace-pre-wrap min-h-0">
          {article.plain_text}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-6 py-4 border-t border-[var(--color-border)] shrink-0">
          <p className="text-[12px] text-[var(--color-muted)] mr-auto">Download your article</p>
          <button
            onClick={() => handleDownloadClick("txt")}
            className="flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3.5 py-2 text-[12px] font-medium text-[var(--color-fg)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors"
          >
            Download (.txt)
          </button>
          <button
            onClick={() => handleDownloadClick("html")}
            className="flex items-center gap-1.5 rounded-lg bg-[var(--color-accent)] px-3.5 py-2 text-[12px] font-medium text-white hover:bg-[var(--color-accent-hover)] transition-colors"
          >
            Download (.html)
          </button>
        </div>
      </div>
    </div>
  );
}
