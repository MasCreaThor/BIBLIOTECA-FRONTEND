/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'books.google.com'],
  },
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://107.190.135.66:3000/api',
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  eslint: {
    dirs: ['src'],
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  output: 'standalone',
}

module.exports = nextConfig