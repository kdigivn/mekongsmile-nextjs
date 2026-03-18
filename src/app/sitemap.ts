import { getLatestPostsSlug } from "@/services/infrastructure/wordpress/queries/getLatestPosts";
import { getPageSlugs } from "@/services/infrastructure/wordpress/queries/getPages";
import { getProductSlug } from "@/services/infrastructure/wordpress/queries/getProduct";
import {
  getTerms,
  getTotalItem,
} from "@/services/infrastructure/wordpress/queries/getTerms";
import { Term } from "@/services/infrastructure/wordpress/types/term";
import { format } from "date-fns";
import type { MetadataRoute } from "next";

export async function generateSitemaps() {
  // Fetch the total number of products and calculate the number of sitemaps needed
  return [
    { id: "posts" },
    { id: "pages" },
    { id: "products" },
    { id: "categories" },
    { id: "terms" },
    // { id: "tags" },
  ];
}

export default async function sitemap({
  id,
}: {
  id: string;
}): Promise<MetadataRoute.Sitemap> {
  if (id === "pages") {
    const pageData: {
      slug: string;
      modified: string;
      isFrontPage: boolean;
      sitemapValue: {
        priority?: number;
      };
    }[] = await getPageSlugs();

    return pageData.map((page) => {
      if (page.isFrontPage) {
        return {
          url: `${process.env.NEXT_PUBLIC_BASE_URL}/`,
          lastModified: format(new Date(page.modified), "yyyy-MM-dd"),
          priority: 1,
        };
      }

      if (page.sitemapValue?.priority) {
        return {
          url: `${process.env.NEXT_PUBLIC_BASE_URL}/${page.slug}/`,
          lastModified: format(new Date(page.modified), "yyyy-MM-dd"),
          priority: page.sitemapValue.priority,
        };
      }

      return {
        url: `${process.env.NEXT_PUBLIC_BASE_URL}/${page.slug}/`,
        lastModified: format(new Date(page.modified), "yyyy-MM-dd"),
        priority: 0.6,
      };
    });
  }
  const limit = 1000;
  const order = "DESC";

  if (id === "posts") {
    const postData: {
      slug: string;
      modified: string;
      sitemapValue: {
        priority?: number;
      };
    }[] = await getLatestPostsSlug({
      limit,
    });

    return postData.map((post) => {
      if (post.sitemapValue?.priority) {
        return {
          url: `${process.env.NEXT_PUBLIC_BASE_URL}/${post.slug}/`,
          lastModified: format(new Date(post.modified), "yyyy-MM-dd"),
          priority: post.sitemapValue.priority,
        };
      }

      return {
        url: `${process.env.NEXT_PUBLIC_BASE_URL}/${post.slug}/`,
        lastModified: format(new Date(post.modified), "yyyy-MM-dd"),
        priority: 0.7,
      };
    });
  }

  if (id === "products") {
    const productData: {
      slug: string;
      uri: string;
      modified: string;
      sitemapValue: {
        priority?: number;
      };
    }[] = await getProductSlug({
      order,
      limit,
    });
    return productData.map((product) => {
      if (product.sitemapValue?.priority) {
        return {
          url: `${process.env.NEXT_PUBLIC_BASE_URL}/product/${product.slug}/`,
          lastModified: format(new Date(product.modified), "yyyy-MM-dd"),
          priority: product.sitemapValue.priority,
        };
      }
      return {
        url: `${process.env.NEXT_PUBLIC_BASE_URL}/product/${product.slug}/`,
        lastModified: format(new Date(product.modified), "yyyy-MM-dd"),
        priority: 0.8,
      };
    });
  }

  const termSlugs = await getTerms();

  const buildSitemapUrl = (uri: string): string => {
    return `${process.env.NEXT_PUBLIC_BASE_URL}/${uri
      .split("/")
      .filter((segment) => segment !== "")
      .join("/")}/`;
  };

  const paginate = async (
    item: Term,
    numberPostsPerPages: number,
    taxonomyName: string
  ) => {
    const segments = item.uri
      .split("/")
      .filter((segment: string) => segment !== "");
    if (taxonomyName === "post_tag") taxonomyName = segments[0];
    const totalItem = (await getTotalItem(taxonomyName, item.uri)) || 0;
    const totalPage = Math.ceil(totalItem / numberPostsPerPages);

    return Array.from({ length: totalPage }).map((_, index) => ({
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/${[...segments, "page", (index + 1).toString()].join("/")}/`,
      priority: 0.6,
    }));
  };

  const paginationConfig = ["category", "post_tag"];

  const generateSitemap = async (
    filterTerm: string
  ): Promise<MetadataRoute.Sitemap> => {
    const sitemap: MetadataRoute.Sitemap = [];
    const numberPostsPerPages = Number(process.env.POSTS_PER_PAGES) || 20;

    for (const item of termSlugs) {
      if (item.taxonomyName === filterTerm) {
        sitemap.push({ url: buildSitemapUrl(item.uri), priority: 0.6 });

        if (paginationConfig.includes(item.taxonomyName)) {
          const paginatedUrls = await paginate(
            item,
            numberPostsPerPages,
            item.taxonomyName
          );
          sitemap.push(...paginatedUrls);
        }
      }
    }

    return sitemap;
  };

  switch (id) {
    case "categories":
      return await generateSitemap("category");

    case "tags":
      return await generateSitemap("post_tag");

    default:
      const sitemap: MetadataRoute.Sitemap = termSlugs
        .filter(
          (item) =>
            item.taxonomyName !== "category" && item.taxonomyName !== "post_tag"
        )
        .map((item) => ({ url: buildSitemapUrl(item.uri), priority: 0.6 }));
      return sitemap;
  }
}
