import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  
  // Image optimization configuration
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
        pathname: '/static/**',
      },
    ],
  },
  
  // Proxy static files to Flask backend during development
  async rewrites() {
    return [
      {
        source: '/static/:path*',
        destination: 'http://localhost:5000/static/:path*',
      },
    ];
  },
};

export default nextConfig;
