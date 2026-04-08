/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "pvtzjxmnntmtjbytfwld.supabase.co" },
    ],
  },
};

module.exports = nextConfig;