import type { NextConfig } from "next";

const nextConfig: NextConfig = {
reactCompiler: false,
  // Production optimization
  compress: true,

  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "i.scdn.co",
      },
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
      },
      {
        protocol: "https",
        hostname: "en.wikipedia.org",
      },
      {
        protocol: "https",
        hostname: "annapurnaexpress.prixacdn.net",
      },
      {
        protocol: "https",
        hostname: "photos1.blogger.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },

  // Experimental optimizations
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-avatar',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-navigation-menu',
      '@radix-ui/react-scroll-area',
      '@radix-ui/react-select',
      '@radix-ui/react-separator',
      '@radix-ui/react-slot',
      '@radix-ui/react-tooltip',
      'framer-motion',
      'recharts',
    ],
  },

  // Turbopack configuration (empty to silence webpack warning)
  turbopack: {},

  // Webpack optimization (used when --webpack flag is passed)
  webpack: (config, { isServer }) => {
    // Optimize bundle splitting for client-side
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            // Separate large libraries
            three: {
              name: 'three',
              test: /[\\/]node_modules[\\/](three|@react-three)[\\/]/,
              priority: 40,
              reuseExistingChunk: true,
            },
            animations: {
              name: 'animations',
              test: /[\\/]node_modules[\\/](framer-motion|gsap)[\\/]/,
              priority: 35,
              reuseExistingChunk: true,
            },
            editor: {
              name: 'editor',
              test: /[\\/]node_modules[\\/](@tiptap)[\\/]/,
              priority: 30,
              reuseExistingChunk: true,
            },
            charts: {
              name: 'charts',
              test: /[\\/]node_modules[\\/](recharts)[\\/]/,
              priority: 25,
              reuseExistingChunk: true,
            },
            commons: {
              name: 'commons',
              minChunks: 2,
              priority: 20,
              reuseExistingChunk: true,
            },
          },
        },
      };
    }
    return config;
  },
};

// Bundle analyzer wrapper
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

export default withBundleAnalyzer(nextConfig);

