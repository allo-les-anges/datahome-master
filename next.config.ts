import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: false, // Ajoute cette ligne pour stabiliser les URLs
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