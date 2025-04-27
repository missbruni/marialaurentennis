import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  webpack: (config) => {
    // This is to handle the Firebase SDK in Next.js
    config.externals = [...(config.externals || []), { encoding: 'encoding' }];
    return config;
  }
};

export default nextConfig;
