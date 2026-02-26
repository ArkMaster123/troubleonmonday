/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: 'dist',
  trailingSlash: true,
  basePath: '/troubleonmondays',
  assetPrefix: '/troubleonmondays',
  images: {
    unoptimized: true
  }
};

export default nextConfig;
