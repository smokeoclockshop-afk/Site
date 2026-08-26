import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [360, 640, 768, 1024, 1280, 1536, 1920],
    imageSizes: [64, 96, 128, 256, 384, 512],
    qualities: [60, 68, 72, 75, 80],
  },
  compress: true,
  poweredByHeader: false,
  async redirects() {
    // Old restaurant-template routes → the new maker routes.
    return [
      { source: '/menu', destination: '/vyroby', permanent: true },
      { source: '/about', destination: '/maister', permanent: true },
      { source: '/catering', destination: '/b2b', permanent: true },
      { source: '/gift-cards', destination: '/b2b', permanent: true },
      { source: '/contact', destination: '/kontakty', permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: '/images/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/media/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
