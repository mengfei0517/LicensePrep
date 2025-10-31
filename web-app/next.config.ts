import type { NextConfig } from "next";

const flaskBackendUrl =
  process.env.FLASK_BACKEND_URL ?? "http://localhost:5000";
const normalizedBackendUrl = flaskBackendUrl.endsWith("/")
  ? flaskBackendUrl.slice(0, -1)
  : flaskBackendUrl;
const backendUrl = new URL(normalizedBackendUrl);

const nextConfig: NextConfig = {
  /* config options here */

  // Image optimization configuration
  images: {
    remotePatterns: [
      {
        protocol: backendUrl.protocol.replace(":", ""),
        hostname: backendUrl.hostname,
        port: backendUrl.port || undefined,
        pathname: "/static/**",
      },
    ],
  },

  // Proxy backend API & assets through Next.js during development
  async rewrites() {
    return [
      {
        source: "/backend/api/:path*",
        destination: `${normalizedBackendUrl}/api/:path*`,
      },
      {
        source: "/backend/static/:path*",
        destination: `${normalizedBackendUrl}/static/:path*`,
      },
      {
        source: "/backend/:path*",
        destination: `${normalizedBackendUrl}/:path*`,
      },
      {
        source: "/static/:path*",
        destination: `${normalizedBackendUrl}/static/:path*`,
      },
    ];
  },
};

export default nextConfig;
