"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    supabaseBrowser.auth.getSession().then(({ data }) => {
      const email = data.session?.user?.email;
      const anonId = searchParams.get("anon_id");

      if (email && anonId) {
        fetch("/api/claim-articles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ anonId, email }),
        }).finally(() => router.replace("/"));
      } else {
        router.replace("/");
      }
    });
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
      <div className="h-8 w-8 rounded-full border-2 border-[#5e6ad2] border-t-transparent animate-spin" />
    </div>
  );
}
