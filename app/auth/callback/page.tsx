"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    // Supabase handles the token exchange from the URL hash automatically.
    // Calling getSession() ensures it's complete before we redirect.
    supabaseBrowser.auth.getSession().then(() => {
      router.replace("/");
    });
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
      <div className="h-8 w-8 rounded-full border-2 border-[#5e6ad2] border-t-transparent animate-spin" />
    </div>
  );
}
