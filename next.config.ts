import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/__clerk/:path*",
        destination: "https://clerk.personal-finance-coach-six.vercel.app/:path*",
      },
    ];
  },
};

export default nextConfig;