import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable experimental optimizations
  experimental: {
    // Optimize CSS
    optimizeCss: true,
    // Optimize package imports to reduce bundle size
    optimizePackageImports: [
      '@heroicons/react',
      'date-fns',
      'lucide-react',
      'framer-motion'
    ],
  },

  // Enable compression
  compress: true,

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Server-only packages that should not be bundled for the client
  serverExternalPackages: ['opik'],

  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    // Externalize opik and its dependencies on server side
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        'opik': 'commonjs opik',
        'fsevents': 'commonjs fsevents',
        'chokidar': 'commonjs chokidar',
      });
    }

    if (!dev && !isServer) {
      // Enable tree shaking
      config.optimization = {
        ...config.optimization,
        usedExports: true,
        
        // Optimize chunk splitting
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            // Common code shared across pages
            commons: {
              name: 'commons',
              chunks: 'all',
              minChunks: 2,
            },
            // Vendor libraries
            lib: {
              test: /[\\/]node_modules[\\/]/,
              name(module: any) {
                const packageName = module.context.match(
                  /[\\/]node_modules[\\/](.*?)([\\/]|$)/
                )?.[1];
                return `npm.${packageName?.replace('@', '') || 'vendor'}`;
              },
              priority: 10,
            },
            // React and React-DOM in separate chunk
            react: {
              test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
              name: 'react',
              priority: 20,
            },
            // Heavy dependencies in separate chunks
            pusher: {
              test: /[\\/]node_modules[\\/](pusher-js)[\\/]/,
              name: 'pusher',
              priority: 15,
            },
            charts: {
              test: /[\\/]node_modules[\\/](framer-motion)[\\/]/,
              name: 'animations',
              priority: 15,
            },
          },
        },
      };
    }
    return config;
  },

  // Production source maps for debugging (optional, can be disabled for smaller builds)
  productionBrowserSourceMaps: false,
};

export default nextConfig;
