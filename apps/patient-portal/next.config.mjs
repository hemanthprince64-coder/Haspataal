import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    '@haspataal/auth',
    '@haspataal/core',
    '@haspataal/db',
    '@haspataal/logger',
    '@haspataal/queue',
    '@haspataal/types'
  ],
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'deqcehtgwbpmwlajsore.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/hospital/:path*',
        destination: `${process.env.HOSPITAL_APP_URL || 'http://localhost:3001'}/hospital/:path*`,
        permanent: true,
      },
      {
        source: '/doctor/:path*',
        destination: `${process.env.HOSPITAL_APP_URL || 'http://localhost:3001'}/doctor/:path*`,
        permanent: true,
      },
      {
        source: '/admin/:path*',
        destination: `${process.env.HOSPITAL_APP_URL || 'http://localhost:3001'}/admin/:path*`,
        permanent: true,
      }
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self), payment=(self)',
          },
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'same-origin',
          },
          {
            key: 'Content-Security-Policy',
            value:
              "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://*.supabase.co; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://images.unsplash.com https://*.supabase.co; connect-src 'self' https://*.supabase.co wss://*.supabase.co; frame-ancestors 'self'; object-src 'none'; base-uri 'self'",
          },
        ],
      },
    ];
  },
  webpack(config, { isServer }) {
    if (isServer) {
      // @prisma/instrumentation (pulled in by @sentry/node) uses dynamic require()
      // expressions that Webpack cannot statically analyze, producing a
      // 'Critical dependency' warning and crashing the worker thread.
      // Resolve them at runtime instead of bundling.
      config.externals.push('@opentelemetry/instrumentation', '@prisma/instrumentation');
    }
    return config;
  },
};

export default withBundleAnalyzer(nextConfig);
