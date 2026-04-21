import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: false,
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