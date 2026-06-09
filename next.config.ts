import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["lh3.googleusercontent.com", "avatars.githubusercontent.com"],
  },
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client", "bcryptjs"],
  },
};

export default nextConfig;
