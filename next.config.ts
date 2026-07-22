import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.arenavirtual.net" },
      { protocol: "https", hostname: "spaces.arenavirtual.net" },
      { protocol: "https", hostname: "cdn.sofifa.com" },
    ],
  },
};

export default nextConfig;
