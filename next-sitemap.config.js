// eslint-disable-next-line @typescript-eslint/no-require-imports
const { format } = require("date-fns");

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3001",
  generateRobotsTxt: false,
  priority: 0.5,
  sitemapSize: 10000,
  sitemapBaseFileName: "sitemap",
  generateIndexSitemap: true,
  trailingSlash: true,
  exclude: ["/*", "/sitemap/*"],
  transform: async (config, path) => {
    // Handle static pages
    return {
      loc: path, // => this will be exported as http(s)://<config.siteUrl>/<path>
      priority: config.priority,
      lastmod: config.autoLastmod
        ? format(new Date(), "yyyy-MM-dd")
        : undefined,
      alternateRefs: config.alternateRefs ?? [],
    };
  },
  // additionalPaths: async (config) => [
  //   await config.transform(config, "/booking/"),
  //   await config.transform(config, "/confirm-email/"),
  //   await config.transform(config, "/forgot-password/"),
  //   await config.transform(config, "/password-change/"),
  //   await config.transform(config, "/profile/"),
  //   await config.transform(config, "/schedules/"),
  //   await config.transform(config, "/sign-in/"),
  //   await config.transform(config, "/sign-up/"),
  //   await config.transform(config, "/ticket-detail/"),
  //   await config.transform(config, "/user/bookings/"),
  // ],
  robotsTxtOptions: {
    additionalSitemaps: [
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3001"}/post-sitemap.xml`,
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3001"}/product-sitemap.xml`,
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3001"}/category-sitemap.xml`,
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3001"}/page-sitemap.xml`,
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3001"}/term-sitemap.xml`,
    ],
  },
};
