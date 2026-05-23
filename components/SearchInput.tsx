"use client";

import { useState, useRef, type FormEvent, type KeyboardEvent } from "react";

interface SearchInputProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
  onBulkToggle?: () => void;
}

export default function SearchInput({
  onSearch,
  isLoading = false,
  onBulkToggle,
}: SearchInputProps) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || isLoading) return;
    onSearch(trimmed);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      const trimmed = value.trim();
      if (!trimmed || isLoading) return;
      onSearch(trimmed);
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit}>
        <div
          className="flex items-center gap-3 rounded-xl border border-[#252525] bg-[#111111] px-4 py-3 transition-colors focus-within:border-[#5e6ad2] focus-within:shadow-[0_0_0_3px_#5e6ad215]"
          style={{ transition: "border-color 0.15s, box-shadow 0.15s" }}
        >
          {/* Search icon */}
          <svg
            className="shrink-0 text-[#6b6b6b]"
            width="18"
            height="18"
            viewBox="0 0 20 20"
            fill="none"
          >
            <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.6" />
            <path
              d="M13.5 13.5L17 17"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>

          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter a keyword or paste a URL…"
            disabled={isLoading}
            autoFocus
            className="flex-1 bg-transparent text-[15px] text-[#ededed] placeholder:text-[#6b6b6b] outline-none disabled:opacity-50"
          />

          {isLoading ? (
            <div className="shrink-0 h-5 w-5 animate-spin rounded-full border-2 border-[#252525] border-t-[#5e6ad2]" />
          ) : value.trim() ? (
            <button
              type="submit"
              className="shrink-0 rounded-lg bg-[#5e6ad2] px-3 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-[#6b77e0] active:scale-95"
              style={{ transition: "background-color 0.1s, transform 0.1s" }}
            >
              Analyze
            </button>
          ) : null}
        </div>
      </form>

      <div className="mt-3 flex items-center justify-between px-1">
        <p className="text-[12px] text-[#6b6b6b]">
          Try: &quot;email marketing&quot;, &quot;best crm software&quot;, &quot;how to lose weight&quot;
        </p>
        <button
          type="button"
          onClick={onBulkToggle}
          className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[12px] text-[#6b6b6b] transition-colors hover:bg-[#1a1a1a] hover:text-[#ededed]"
        >
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
            <rect x="1" y="3" width="14" height="1.5" rx="0.75" fill="currentColor" />
            <rect x="1" y="7.25" width="10" height="1.5" rx="0.75" fill="currentColor" />
            <rect x="1" y="11.5" width="12" height="1.5" rx="0.75" fill="currentColor" />
          </svg>
          Bulk CSV
        </button>
      </div>
    </div>
  );
}
