"use client";

import { useState, useRef, type DragEvent, type ChangeEvent } from "react";
import Papa from "papaparse";

interface BulkInputProps {
  onSubmit: (keywords: string[]) => void;
  onClose: () => void;
}

type Tab = "upload" | "paste";

function parseKeywordsFromText(raw: string): string[] {
  return raw
    .split(/[\n,]+/)
    .map((k) => k.trim().replace(/^["']|["']$/g, ""))
    .filter((k) => k.length > 0 && k.length <= 200)
    .slice(0, 500);
}

export default function BulkInput({ onSubmit, onClose }: BulkInputProps) {
  const [tab, setTab] = useState<Tab>("upload");
  const [pasteText, setPasteText] = useState("");
  const [preview, setPreview] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    if (!file.name.endsWith(".csv") && file.type !== "text/csv" && file.type !== "text/plain") {
      alert("Please upload a .csv file");
      return;
    }
    setFileName(file.name);
    Papa.parse<string[]>(file, {
      complete: (results) => {
        const keywords = results.data
          .flat()
          .map((v) => String(v ?? "").trim())
          .filter((v) => v.length > 0 && v.toLowerCase() !== "keyword")
          .slice(0, 500);
        setPreview(keywords);
      },
      skipEmptyLines: true,
    });
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleFileInput(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function handlePasteChange(val: string) {
    setPasteText(val);
    setPreview(parseKeywordsFromText(val));
  }

  function handleSubmit() {
    const keywords = tab === "paste" ? parseKeywordsFromText(pasteText) : preview;
    if (keywords.length === 0) return;
    onSubmit(keywords);
  }

  const canSubmit = preview.length > 0;

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-[15px] font-semibold text-[#ededed]">Bulk Keyword Analysis</h2>
          <p className="text-[12px] text-[#6b6b6b] mt-0.5">Upload a CSV or paste keywords separated by commas</p>
        </div>
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 text-[12px] text-[#6b6b6b] hover:text-[#ededed] transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M10 4L4 10M4 4l6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Single search
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 rounded-lg border border-[#252525] bg-[#0e0e0e] p-1">
        {(["upload", "paste"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setPreview([]); setFileName(null); setPasteText(""); }}
            className="flex-1 rounded-md py-1.5 text-[13px] font-medium transition-colors"
            style={{
              background: tab === t ? "#1a1a1a" : "transparent",
              color: tab === t ? "#ededed" : "#6b6b6b",
            }}
          >
            {t === "upload" ? "Upload CSV" : "Paste Keywords"}
          </button>
        ))}
      </div>

      {/* Upload tab */}
      {tab === "upload" && (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onClick={() => fileInputRef.current?.click()}
          className="cursor-pointer rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-3 py-12 transition-colors"
          style={{
            borderColor: isDragging ? "#5e6ad2" : "#252525",
            background: isDragging ? "#5e6ad210" : "#0e0e0e",
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv,text/plain"
            className="hidden"
            onChange={handleFileInput}
          />
          <svg className="text-[#6b6b6b]" width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M12 16V8M12 8l-3 3M12 8l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M3 15v3a2 2 0 002 2h14a2 2 0 002-2v-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          {fileName ? (
            <div className="text-center">
              <p className="text-[13px] font-medium text-[#ededed]">{fileName}</p>
              <p className="text-[12px] text-[#6b6b6b] mt-0.5">Click to replace</p>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-[13px] font-medium text-[#ededed]">Drop your CSV here</p>
              <p className="text-[12px] text-[#6b6b6b] mt-0.5">or click to browse · one keyword per row</p>
            </div>
          )}
        </div>
      )}

      {/* Paste tab */}
      {tab === "paste" && (
        <textarea
          value={pasteText}
          onChange={(e) => handlePasteChange(e.target.value)}
          placeholder={"email marketing, content strategy, SEO audit,\nbest CRM software, keyword research tools..."}
          rows={6}
          className="w-full rounded-xl border border-[#252525] bg-[#0e0e0e] px-4 py-3 text-[13px] text-[#ededed] placeholder:text-[#4a4a4a] outline-none resize-none focus:border-[#5e6ad2] transition-colors"
        />
      )}

      {/* Preview count + submit */}
      <div className="mt-4 flex items-center justify-between">
        <span className="text-[12px] text-[#6b6b6b]">
          {preview.length > 0
            ? `${preview.length} keyword${preview.length === 1 ? "" : "s"} ready · first will load automatically`
            : "No keywords yet"}
        </span>
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="rounded-lg px-4 py-2 text-[13px] font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          style={{
            background: canSubmit ? "#5e6ad2" : "#1a1a1a",
            color: canSubmit ? "#fff" : "#6b6b6b",
          }}
        >
          Analyze Keywords
        </button>
      </div>
    </div>
  );
}
