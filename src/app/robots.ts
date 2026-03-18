import type { MetadataRoute } from "next";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const isDisableRobots =
    process.env.NEXT_PUBLIC_DISABLE_ROBOTS === "true" || false;

  if (isDisableRobots) {
    return {
      rules: [
        {
          userAgent: "*",
          disallow: ["/"],
        },
      ],
      sitemap: [],
    };
  }

  const disallowLists = [
    "/booking/",
    "/confirm-email/",
    "/forgot-password/",
    "/password-change/",
    "/profile/",
    "/sign-in/",
    "/sign-up/",
    "/ticket-detail/",
    "/user/bookings/",
    "/user/cancel-ticket-requests/",
    "/transactions/",
    // "/schedules/",
    "/profile/",
    "/user/",
    "/payment-gateway/",
    "/_next/",
    "/api/",
    "/private/",
    "/admin/",
    "/*.js$",
    "/*.map$",
    "/404",
    "/500",
    "/*?*",
    "/*&*",
  ];

  // Temporary disable this robots from CMS data

  // const pageData: {
  //   isFrontPage: boolean;
  //   seo: {
  //     robots: string[];
  //   };
  //   uri: string;
  // }[] = await getPageSlugs();

  // pageData.forEach((page) => {
  //   if (page.isFrontPage && page.seo.robots.includes("noindex")) {
  //     disallowLists.push("/");
  //   }

  //   if (page.seo.robots.includes("noindex")) {
  //     disallowLists.push(page.uri);
  //   }
  // });

  // const limit = 100;
  // const order = "DESC";

  // const postData: {
  //   uri: string;
  //   seo: {
  //     robots: string[];
  //   };
  // }[] = await getLatestPostsSlug({
  //   order,
  //   limit,
  // });

  // postData.forEach((post) => {
  //   if (post.seo.robots.includes("noindex")) {
  //     disallowLists.push(post.uri);
  //   }
  // });

  // const productData: {
  //   uri: string;
  //   seo: {
  //     robots: string[];
  //   };
  // }[] = await getProductSlug({
  //   order,
  //   limit,
  // });
  // productData.forEach((product) => {
  //   if (product.seo.robots.includes("noindex")) {
  //     disallowLists.push(product.uri);
  //   }
  // });

  // const termSlugs = await getTerms();

  // termSlugs.forEach((item) => {
  //   if (item.seo.robots.includes("noindex")) {
  //     disallowLists.push(item.uri);
  //   }
  // });

  // for (let i = 0; i < termSlugs.length; i++) {
  //   const item = termSlugs[i];
  //   const segments = item.uri.split("/").filter((segment) => segment !== "");
  //   let totalItem = 0;
  //   if (segments.length < 2 || item.taxonomyName === "category") {
  //     totalItem = (await getTotalItem(item.taxonomyName, item.uri)) || 0;
  //   } else {
  //     totalItem = (await getTotalItem(segments[0], item.uri)) || 0;
  //   }
  //   const numberPostsPerPages = Number(process.env.POSTS_PER_PAGES) || 20;
  //   const totalPage = Math.ceil(totalItem / numberPostsPerPages);
  //   const paginationConfig = ["category", "tag"];
  //   if (
  //     paginationConfig.includes(item.taxonomyName) &&
  //     item.seo.robots.includes("noindex")
  //   ) {
  //     disallowLists.push(
  //       ...Array.from({ length: totalPage }).map(
  //         (_, index) =>
  //           `/${[...segments, "page", (index + 1).toString()].join("/")}/`
  //       )
  //     );
  //   }
  // }

  return {
    rules: [
      // Search Engine Bots - Allow all
      {
        userAgent: "Googlebot",
        allow: ["/"],
      },
      {
        userAgent: "bingbot",
        allow: ["/"],
      },
      // AI Search & Assistant Bots - Allow for visibility
      {
        userAgent: "PerplexityBot",
        allow: ["/"],
      },
      {
        userAgent: "Perplexity-User",
        allow: ["/"],
      },
      {
        userAgent: "ClaudeBot",
        allow: ["/"],
      },
      {
        userAgent: "Claude-SearchBot",
        allow: ["/"],
      },
      {
        userAgent: "Claude-User",
        allow: ["/"],
      },
      {
        userAgent: "GPTBot",
        allow: ["/"],
      },
      {
        userAgent: "ChatGPT-User",
        allow: ["/"],
      },
      {
        userAgent: "OAI-SearchBot",
        allow: ["/"],
      },
      {
        userAgent: "Applebot",
        allow: ["/"],
      },
      {
        userAgent: "FacebookBot",
        allow: ["/"],
      },
      {
        userAgent: "meta-externalagent",
        allow: ["/"],
      },
      {
        userAgent: "meta-externalfetcher",
        allow: ["/"],
      },
      {
        userAgent: "Amazonbot",
        allow: ["/"],
      },
      {
        userAgent: "Google-CloudVertexBot",
        allow: ["/"],
      },
      {
        userAgent: "DuckAssistBot",
        allow: ["/"],
      },
      {
        userAgent: "MistralAI-User",
        allow: ["/"],
      },
      // Questionable Bots - Consider blocking for training
      {
        userAgent: "Bytespider",
        disallow: ["/"],
      },
      {
        userAgent: "CCBot",
        disallow: ["/"],
      },
      {
        userAgent: "PetalBot",
        disallow: ["/"],
      },
      // Other bots mentioned
      {
        userAgent: "Anchor Browser",
        allow: ["/"],
      },
      {
        userAgent: "archive.org_bot",
        allow: ["/"],
      },
      {
        userAgent: "Novellum",
        allow: ["/"],
      },
      {
        userAgent: "ProRataInc",
        allow: ["/"],
      },
      {
        userAgent: "Timpibot",
        allow: ["/"],
      },
      // Default - Allow all other bots with specific disallows
      {
        userAgent: "*",
        allow: ["/"],
        disallow: disallowLists,
      },
    ],
    sitemap: [
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3001"}/sitemap.xml`,
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3001"}/post-sitemap.xml`,
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3001"}/product-sitemap.xml`,
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3001"}/category-sitemap.xml`,
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3001"}/page-sitemap.xml`,
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3001"}/term-sitemap.xml`,
    ],
  };
}
