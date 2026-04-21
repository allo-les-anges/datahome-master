import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: false,
  eslint: { ignoreDuringBuilds: true },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'medianewbuild.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;