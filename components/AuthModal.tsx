"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

interface AuthModalProps {
  onClose: () => void;
}

export default function AuthModal({ onClose }: AuthModalProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");

    const { error } = await supabaseBrowser.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });

    if (error) {
      setErrorMsg(error.message);
      setStatus("error");
    } else {
      setStatus("sent");
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-sm mx-4 rounded-2xl border border-[#252525] bg-[#111111] p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-[#6b6b6b] hover:text-[#ededed] transition-colors"
          aria-label="Close"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>

        {status === "sent" ? (
          <div className="text-center py-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#5e6ad215] border border-[#5e6ad230] mb-4">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path d="M3 7l9 6 9-6" stroke="#5e6ad2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <rect x="1" y="5" width="20" height="14" rx="2" stroke="#5e6ad2" strokeWidth="1.5" />
              </svg>
            </div>
            <h2 className="text-[17px] font-semibold text-[#ededed]">Check your inbox</h2>
            <p className="mt-2 text-[13px] text-[#6b6b6b] leading-relaxed">
              We sent a sign-in link to{" "}
              <span className="text-[#ededed]">{email}</span>.
              <br />
              Click it to sign in — no password needed.
            </p>
            <button
              onClick={onClose}
              className="mt-5 text-[12px] text-[#6b6b6b] hover:text-[#ededed] transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-[17px] font-semibold text-[#ededed] tracking-tight">
              Sign in to KeywordIQ
            </h2>
            <p className="mt-1.5 text-[13px] text-[#6b6b6b]">
              Get a magic link — no password required. Access your credits on any device.
            </p>

            <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoFocus
                className="w-full rounded-lg border border-[#252525] bg-[#0a0a0a] px-4 py-2.5 text-[14px] text-[#ededed] placeholder-[#3a3a3a] outline-none focus:border-[#5e6ad2] transition-colors"
              />
              {status === "error" && (
                <p className="text-[12px] text-[#e5534b]">{errorMsg}</p>
              )}
              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full rounded-lg bg-[#5e6ad2] py-2.5 text-[14px] font-medium text-white hover:bg-[#4f5bc3] disabled:opacity-60 transition-colors cursor-pointer"
              >
                {status === "loading" ? "Sending…" : "Send magic link"}
              </button>
            </form>

            <p className="mt-4 text-center text-[11px] text-[#3a3a3a]">
              Use the email you checked out with to restore existing credits.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
