/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  transpilePackages: [
    '@haspataal/admin-core',
    '@haspataal/workflows',
    '@haspataal/ui',
    '@haspataal/auth',
    '@haspataal/db',
    '@haspataal/events',
    '@haspataal/types'
  ]
};

export default nextConfig;
