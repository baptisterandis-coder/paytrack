import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "pvtzjxmnntmtjbytfwld.supabase.co" },
    ],
  },
};

export default nextConfig;
