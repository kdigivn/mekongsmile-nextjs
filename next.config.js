// eslint-disable-next-line @typescript-eslint/no-var-requires
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  eslint: {
    // Lint separately via `npm run lint`; skip during build for speed
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Type check separately via `npx tsc --noEmit`; skip during build for speed
    ignoreBuildErrors: false,
  },
  images: {
    // Serve AVIF first (25% smaller than WebP), fallback to WebP
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "mekongsmile.com",
        port: "",
        pathname: "/wp-content/**",
      },
      {
        protocol: "https",
        hostname: "secure.gravatar.com",
        port: "",
        pathname: "/**",
      },
    ],
    minimumCacheTTL: 2592000, // 30 days — fixes PageSpeed "efficient cache" for optimized images
  },
  experimental: {
    optimizePackageImports: [
      "@heroui/react",
      "date-fns",
      "react-icons",
      "framer-motion",
      "@radix-ui/react-select",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-popover",
      "@radix-ui/react-navigation-menu",
      "@radix-ui/react-accordion",
      "@radix-ui/react-tooltip",
    ],
    instrumentationHook: process.env.NODE_ENV !== "development",
    cssChunking: "strict",
  },
  async headers() {
    return [
      // Hashed build assets — immutable forever
      {
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      // Custom static scripts (cookie banner, etc.)
      {
        source: '/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      // Static images — long cache with revalidation
      {
        source: '/static-img/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      // Root-level static assets (favicons, manifest icons, markers)
      {
        source: '/:file(.*\\.(?:png|jpg|jpeg|webp|svg|ico|gif|woff2|woff|ttf))',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=2592000, stale-while-revalidate=86400' },
        ],
      },
      // /_next/image caching handled by images.minimumCacheTTL in config above
    ];
  },
  async rewrites() {
    return [
      {
        source: "/post-sitemap.xml",
        destination: "/sitemap/posts.xml",
      },
      {
        source: "/tour-sitemap.xml",
        destination: "/sitemap/tours.xml",
      },
      {
        source: "/page-sitemap.xml",
        destination: "/sitemap/pages.xml",
      },
      {
        source: "/destination-sitemap.xml",
        destination: "/sitemap/destinations.xml",
      },
      {
        source: "/category-sitemap.xml",
        destination: "/sitemap/categories.xml",
      },
    ];
  },
  // skipTrailingSlashRedirect: true,
  trailingSlash: true,
  async redirects() {
    return [
      {
        source: "/product/:slug*",
        destination: "/tour/:slug*",
        permanent: true,
      },
      {
        source: "/shop/",
        destination: "/tours/",
        permanent: true,
      },
    ];
  },
};

module.exports = withBundleAnalyzer(nextConfig);

