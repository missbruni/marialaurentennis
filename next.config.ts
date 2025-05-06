import type { NextConfig } from 'next';

const nextConfig = {
  webpack: (config) => {
    // This is to handle the Firebase SDK in Next.js
    config.externals = [...(config.externals || []), { encoding: 'encoding' }];
    return config;
  }
} as NextConfig;

export default nextConfig;
