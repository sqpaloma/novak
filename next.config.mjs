/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    turbo: {
      resolveAlias: {
        '@/components': './components',
        '@/lib': './lib',
        '@/hooks': './hooks',
      },
    },
  },
}

export default nextConfig
