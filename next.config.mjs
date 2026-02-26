/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  basePath: '/troubleonmondays',
  assetPrefix: '/troubleonmondays',
  images: {
    unoptimized: true
  },
  serverExternalPackages: ['better-sqlite3'],
};

export default nextConfig;
