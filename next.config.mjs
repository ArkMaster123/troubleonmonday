/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  serverExternalPackages: ['better-sqlite3'],
  async redirects() {
    return [
      {
        source: '/troubleonmondays',
        destination: '/',
        permanent: true,
      },
      {
        source: '/troubleonmondays/:path*',
        destination: '/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
