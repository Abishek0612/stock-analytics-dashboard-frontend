/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "**",
      },
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  },
  // Performance optimizations
  poweredByHeader: false,
  compress: true,
  swcMinify: true,
  optimizeFonts: true,

  // Add these options for better development performance
  onDemandEntries: {
    // period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 60 * 60 * 1000,
    // number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 5,
  },

  // Enhanced production optimization
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
    // Add these options
    turbotrace: {
      logLevel: "error",
    },
    optimizePackageImports: ["react-icons", "date-fns", "echarts-for-react"],
  },

  // Static output optimization
  output: "standalone",
};

module.exports = nextConfig;
