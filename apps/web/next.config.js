/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    // This will help with hydration issues
    optimizeCss: true,
    // Improved client-side navigation
    scrollRestoration: true,
  },
}

module.exports = nextConfig
