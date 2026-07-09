"use client";

import { useState, useEffect } from "react";

const MESSAGES = [
  "Analyzing your keyword…",
  "Researching top-ranking content…",
  "Structuring the article outline…",
  "Writing the introduction…",
  "Building out each section…",
  "Optimizing for SEO…",
  "Polishing the final draft…",
];

const TOTAL_DURATION = 60; // seconds — progress bar fills over this window

export default function ArticleGenerating() {
  const [msgIndex, setMsgIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  // Trigger progress bar animation after mount
  useEffect(() => {
    const t = setTimeout(() => setProgress(95), 50);
    return () => clearTimeout(t);
  }, []);

  // Cycle messages with a fade
  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setMsgIndex((i) => (i + 1) % MESSAGES.length);
        setVisible(true);
      }, 300);
    }, Math.floor((TOTAL_DURATION * 1000) / MESSAGES.length));

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-6 w-full max-w-sm px-6">

        {/* Pulsing icon */}
        <div className="relative flex items-center justify-center">
          <div className="absolute h-16 w-16 rounded-full bg-[#5e6ad2] opacity-10 animate-ping" />
          <div className="h-12 w-12 rounded-full bg-[#5e6ad215] border border-[#5e6ad230] flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M4 6h12M4 10h8M4 14h10" stroke="#5e6ad2" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Cycling message */}
        <div className="h-5 flex items-center justify-center">
          <p
            className="text-[14px] text-[#ededed] font-medium text-center transition-opacity duration-300"
            style={{ opacity: visible ? 1 : 0 }}
          >
            {MESSAGES[msgIndex]}
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-full h-[3px] rounded-full bg-[#1f1f1f] overflow-hidden">
          <div
            className="h-full rounded-full bg-[#5e6ad2]"
            style={{
              width: `${progress}%`,
              transition: `width ${TOTAL_DURATION}s linear`,
            }}
          />
        </div>

        <p className="text-[12px] text-[#6b6b6b]">This can take up to a minute</p>
      </div>
    </div>
  );
}
