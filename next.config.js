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

  // Performance optimizations
  poweredByHeader: false,
  compress: true,
  swcMinify: true,
  optimizeFonts: true,

  onDemandEntries: {
    maxInactiveAge: 60 * 60 * 1000,
    pagesBufferLength: 5,
  },

  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
    // Add these options
    turbotrace: {
      logLevel: "error",
    },
    optimizePackageImports: ["react-icons", "date-fns", "echarts-for-react"],
  },

  output: "standalone",
};

module.exports = nextConfig;
