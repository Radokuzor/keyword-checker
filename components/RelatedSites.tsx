"use client";

interface RelatedSitesProps {
  sites: string[];
  activeSite?: string;
  onSelect: (site: string) => void;
  onAdd?: (site: string) => void;
  trackedSites?: Set<string>;
}

export default function RelatedSites({ sites, activeSite, onSelect, onAdd, trackedSites }: RelatedSitesProps) {
  if (!sites.length) return null;

  return (
    <div className="w-full">
      <p className="mb-3 text-[11px] uppercase tracking-widest text-[var(--color-muted)] font-medium">
        Related Sites
      </p>
      <div className="rounded-xl border border-[var(--color-border)] overflow-hidden">
        <div className="grid grid-cols-[28px_1fr] gap-3 px-4 py-2.5 border-b border-[var(--color-border)] bg-[var(--color-surface-sunken)]">
          <span className="text-[11px] uppercase tracking-widest text-[var(--color-muted-2)] font-medium">#</span>
          <span className="text-[11px] uppercase tracking-widest text-[var(--color-muted-2)] font-medium">Domain</span>
        </div>

        {sites.map((site, i) => {
          const isActive = site === activeSite;
          const isTracked = trackedSites?.has(site) ?? false;
          return (
            <div
              key={site}
              className="grid grid-cols-[28px_1fr_auto] gap-2 px-4 py-3 border-b border-[var(--color-border)] last:border-b-0 items-center"
              style={{ background: isActive ? "#5e6ad210" : "transparent" }}
              onMouseEnter={(e) => {
                if (!isActive)
                  (e.currentTarget as HTMLDivElement).style.background = "var(--color-row-hover)";
              }}
              onMouseLeave={(e) => {
                if (!isActive)
                  (e.currentTarget as HTMLDivElement).style.background = "transparent";
              }}
            >
              <span
                className="text-[13px] font-medium tabular-nums"
                style={{ color: isActive ? "var(--color-accent)" : "var(--color-muted-2)" }}
              >
                {i + 1}
              </span>
              <button
                type="button"
                onClick={() => onSelect(site)}
                className="text-left text-[13px] font-medium truncate"
                style={{ color: isActive ? "var(--color-fg)" : "var(--color-muted)" }}
              >
                {site}
                {isActive && (
                  <span className="ml-2 text-[11px] font-normal text-[var(--color-accent)]">
                    viewing
                  </span>
                )}
              </button>
              {onAdd && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onAdd(site); }}
                  disabled={isTracked}
                  title={isTracked ? "Already tracking" : "Track this site"}
                  className="flex items-center justify-center w-6 h-6 rounded-md transition-colors disabled:opacity-40"
                  style={{
                    background: isTracked ? "#4caf6e15" : "var(--color-surface-raised)",
                    color: isTracked ? "#4caf6e" : "var(--color-muted)",
                    border: `1px solid ${isTracked ? "#4caf6e40" : "var(--color-border)"}`,
                  }}
                >
                  {isTracked ? (
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                      <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
