/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/challenge-instances/:id',
        destination: '/api/challenge-instances/:id',
      },
      {
        source: '/challenge-instances/:id/:path*',
        destination: '/api/challenge-instances/:id/:path*',
      },
    ]
  },
}

module.exports = nextConfig
