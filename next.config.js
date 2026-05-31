/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    domains: [],
  },
  experimental: {
    serverComponentsExternalPackages: ['argon2'],
  },
}

module.exports = nextConfig
