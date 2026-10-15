import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Production optimization
  compress: true,

  async rewrites() {
    return { beforeFiles: [
      '/election-2026/:path*', '/history/:path*', '/coverage/columns/:path*',
      '/api/election/:path*', '/api/v1/fact-checks/:path*', '/api/v1/candidates/:path*',
      '/api/v1/parties/:path*', '/api/v1/manifestos/:path*', '/api/v1/snapshot/:path*', '/api/v1/history/:path*',
      '/api/admin/perplexity-ingest/:path*', '/api/admin/content-import/:path*', '/api/admin/election-results/:path*',
      '/api/admin/election-vote-counts/:path*', '/api/admin/election-articles/:path*', '/api/admin/fact-checks/:path*',
      '/api/admin/history/:path*', '/api/admin/column-articles/:path*', '/api/admin/social-sources/:path*',
      '/api/admin/social-posts/:path*', '/api/v1/auth/studio-attention/:path*', '/api/seed', '/api/auth/debug', '/api/special-days', '/api/admin/access-requests/:path*',
    ].map(source => ({source,destination:'/api/retired'})) };
  },

  // Image optimization
  images: {
    formats: ['image/webp'],
    minimumCacheTTL: 86400,
    deviceSizes: [640, 828, 1080, 1920],
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
    proxyClientMaxBodySize: '25mb',
    serverActions: { bodySizeLimit: '25mb' },
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
  webpack: (config, { isServer, dev }) => {
    // Optimize bundle splitting for client-side
    if (!isServer && !dev) {
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
const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

export default withBundleAnalyzer(nextConfig);
