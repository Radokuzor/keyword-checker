"use client";

import { useState, useEffect } from "react";

interface CyclingLoaderProps {
  messages: string[];
  duration: number; // seconds
}

export function CyclingLoader({ messages, duration }: CyclingLoaderProps) {
  const [msgIndex, setMsgIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setProgress(95), 50);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setMsgIndex((i) => (i + 1) % messages.length);
        setVisible(true);
      }, 300);
    }, Math.floor((duration * 1000) / messages.length));

    return () => clearInterval(interval);
  }, [messages, duration]);

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-sm mx-auto px-6">
      <div className="relative flex items-center justify-center">
        <div className="absolute h-16 w-16 rounded-full bg-[#5e6ad2] opacity-10 animate-ping" />
        <div className="h-12 w-12 rounded-full bg-[#5e6ad215] border border-[#5e6ad230] flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M4 6h12M4 10h8M4 14h10" stroke="#5e6ad2" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      <div className="h-5 flex items-center justify-center w-full">
        <p
          className="text-[14px] text-[#ededed] font-medium text-center transition-opacity duration-300"
          style={{ opacity: visible ? 1 : 0 }}
        >
          {messages[msgIndex]}
        </p>
      </div>

      <div className="w-full h-[3px] rounded-full bg-[#1f1f1f] overflow-hidden">
        <div
          className="h-full rounded-full bg-[#5e6ad2]"
          style={{
            width: `${progress}%`,
            transition: `width ${duration}s linear`,
          }}
        />
      </div>

      <p className="text-[12px] text-[#6b6b6b]">This can take up to a minute</p>
    </div>
  );
}

const ARTICLE_MESSAGES = [
  "Analyzing your keyword…",
  "Researching top-ranking content…",
  "Structuring the article outline…",
  "Writing the introduction…",
  "Building out each section…",
  "Optimizing for SEO…",
  "Polishing the final draft…",
];

export default function ArticleGenerating() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <CyclingLoader messages={ARTICLE_MESSAGES} duration={60} />
    </div>
  );
}
