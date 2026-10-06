import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com" }],
  },
  experimental: {
    // Envoi de photos depuis le back-office (redimensionnées dans le navigateur).
    serverActions: { bodySizeLimit: "4mb" },
  },
};

export default nextConfig;
