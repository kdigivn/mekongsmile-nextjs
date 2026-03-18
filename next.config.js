// eslint-disable-next-line @typescript-eslint/no-var-requires
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  images: {
    // Serve AVIF first (25% smaller than WebP), fallback to WebP
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.vietqr.io",
        port: "",
        pathname: "/image/**",
      },
{
        protocol: "https",
        hostname: "cdn.condao.express",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cms.condao.express",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn.phuquoc.express",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cms.phuquoc.express",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn.vetaucaotoc.net",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn.honson.express",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn.ferryvn.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "secure.gravatar.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn.ferry.vn",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "api.vietqr.io",
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
        source: "/product-sitemap.xml",
        destination: "/sitemap/products.xml",
      },
      {
        source: "/page-sitemap.xml",
        destination: "/sitemap/pages.xml",
      },
      {
        source: "/category-sitemap.xml",
        destination: "/sitemap/categories.xml",
      },
      {
        source: "/term-sitemap.xml",
        destination: "/sitemap/terms.xml",
      },
      {
        source: "/tag-sitemap.xml",
        destination: "/sitemap/tags.xml",
      },
    ];
  },
  // skipTrailingSlashRedirect: true,
  trailingSlash: true,
  async redirects() {
    return [
      {
        source: "/product",
        destination: "/diem-den/con-dao/",
        permanent: true,
      },
    ];
  },
};

module.exports = withBundleAnalyzer(nextConfig);

// Injected content via Sentry wizard below
const { withSentryConfig } = require("@sentry/nextjs");

module.exports = withSentryConfig(module.exports, {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  org: "ferryvn",
  project: "frontend-vetaucaotoc",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Automatically annotate React components to show their full name in breadcrumbs and session replay
  reactComponentAnnotation: {
    enabled: true,
  },

  // Tunnel route disabled — server cannot reach sentry.io (ETIMEDOUT), causing
  // unhandled AggregateError that crashes the process. Browser sends events directly.
  // tunnelRoute: "/monitoring",

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  sourcemaps: {
    // We don't want to serve source maps to our users
    deleteSourcemapsAfterUpload: true,
  },

  // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
  // See the following for more information:
  // https://docs.sentry.io/product/crons/
  // https://vercel.com/docs/cron-jobs
  // automaticVercelMonitors: true,
});

