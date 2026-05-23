import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Expose SUPABASE_URL to the browser bundle so the client-side Supabase
  // client can use it without needing a separate NEXT_PUBLIC_ duplicate.
  env: {
    SUPABASE_URL: process.env.SUPABASE_URL,
  },
};

export default nextConfig;
