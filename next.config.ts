import type { NextConfig } from "next";

// Build remote patterns dynamically from NEXT_PUBLIC_SUPABASE_URL
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const remotePatterns: Array<{ protocol: 'https'; hostname: string; pathname: string }> = []

if (supabaseUrl) {
  try {
    const { hostname } = new URL(supabaseUrl)
    remotePatterns.push({
      protocol: 'https',
      hostname,
      pathname: '/storage/v1/object/public/candidate-photos/**',
    })
  } catch {}
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns,
  },
};

export default nextConfig;
