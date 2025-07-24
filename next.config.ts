import type { NextConfig } from 'next';

const nextConfig = {
  // External packages for server components
  serverExternalPackages: ['firebase-admin'],
  // Enable experimental features for Next.js 15
  experimental: {
    // Enable server actions
    serverActions: {
      allowedOrigins: ['localhost:3000', 'localhost:3001']
    }
  },
  webpack: (config) => {
    // This is to handle the Firebase SDK in Next.js
    config.externals = [...(config.externals || []), { encoding: 'encoding' }];
    return config;
  }
} as NextConfig;

export default nextConfig;
