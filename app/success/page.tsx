"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { setStoredEmail } from "@/lib/searchLimit";

type Status = "loading" | "success" | "error";

const PLAN_LABELS: Record<string, string> = {
  starter: "Starter — 20 searches",
  pro: "Pro — 100 searches",
  unlimited: "Unlimited — 500 searches",
};

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<Status>("loading");
  const [planLabel, setPlanLabel] = useState("");

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    if (!sessionId) {
      router.replace("/");
      return;
    }

    fetch(`/api/checkout?session_id=${encodeURIComponent(sessionId)}`)
      .then((r) => r.json())
      .then(({ email, planId }) => {
        if (email) {
          setStoredEmail(email);
          setPlanLabel(PLAN_LABELS[planId] ?? planId);
          setStatus("success");
          setTimeout(() => router.replace("/"), 4000);
        } else {
          setStatus("error");
        }
      })
      .catch(() => setStatus("error"));
  }, [searchParams, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 bg-[#0a0a0a]">
      {status === "loading" && (
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 rounded-full border-2 border-[#5e6ad2] border-t-transparent animate-spin" />
          <p className="text-[14px] text-[#6b6b6b]">Confirming your payment…</p>
        </div>
      )}

      {status === "success" && (
        <div className="text-center max-w-sm">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#4caf6e15] border border-[#4caf6e30] mb-5">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M5 13l4 4L19 7" stroke="#4caf6e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="text-[22px] font-semibold text-[#ededed] tracking-tight">
            You&apos;re all set!
          </h1>
          {planLabel && (
            <p className="mt-2 text-[14px] text-[#6b6b6b]">{planLabel} unlocked</p>
          )}
          <p className="mt-4 text-[13px] text-[#3a3a3a]">
            Redirecting you back to KeywordIQ…
          </p>
        </div>
      )}

      {status === "error" && (
        <div className="text-center max-w-sm">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#e5534b15] border border-[#e5534b30] mb-5">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <circle cx="11" cy="11" r="9" stroke="#e5534b" strokeWidth="1.5" />
              <path d="M11 7v5" stroke="#e5534b" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="11" cy="15" r="0.75" fill="#e5534b" />
            </svg>
          </div>
          <h1 className="text-[20px] font-semibold text-[#ededed]">Something went wrong</h1>
          <p className="mt-2 text-[13px] text-[#6b6b6b]">
            Your payment was processed but we couldn&apos;t confirm it. Please email{" "}
            <a href="mailto:radianceokuzor@gmail.com" className="text-[#5e6ad2] underline">
              support
            </a>{" "}
            with your receipt and we&apos;ll sort it out.
          </p>
          <button
            onClick={() => router.replace("/")}
            className="mt-6 rounded-lg bg-[#111111] border border-[#252525] px-4 py-2 text-[13px] text-[#ededed] hover:border-[#353535] transition-colors"
          >
            Back to home
          </button>
        </div>
      )}
    </div>
  );
}
