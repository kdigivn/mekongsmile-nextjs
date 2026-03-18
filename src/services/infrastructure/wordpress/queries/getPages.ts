import { graphqlFetcher } from "@/services/graphql/fetcher";
import { WordpressPage } from "@/services/infrastructure/wordpress/types/page";

import { excludeNextJsPage } from "@/lib/utils";
import { PageStatus } from "../enums/status";
import { Page, Pages, Slugs, WordpressPages } from "../types/page";
/**
 * Fetch pages
 */
export async function getPages() {
  const query = `
   {
      pages(first: 1000) {
        nodes {
          id
          slug
          title
        }
      }
    }
    `;

  const response = await graphqlFetcher<Pages>(query);
  return response.data || [];
}

export async function getPageSlugs(status: PageStatus = PageStatus.PUBLISH) {
  const query = `query getPageSlugs {
  pages(where: {status: ${status}}, first: 1000) {
    nodes {
      slug
      isFrontPage
      isPostsPage
      modified
      seo {
        robots
      }
      uri
      sitemapValue {
        priority
      }
    }
  }
}
`;

  const response = await graphqlFetcher<Slugs>(query);

  return excludeNextJsPage(response.data?.pages.nodes ?? []);
}

export async function getPageBySlug(slug: string) {
  const query = `query getPageByURI {
  page(id: "/${slug}/", idType: URI) {
    id
    uri
    title
    slug
    date
    isFrontPage
    isPostsPage
    content(format: RENDERED)
    seo {
      description
      jsonLd {
        raw
      }
      openGraph {
        description
        locale
        siteName
        title
        type
        image {
          url
          height
          width
          secureUrl
          type
        }
        twitterMeta {
          card
          image
          title
          description
        }
        url
        updatedTime
        articleMeta {
          publishedTime
          modifiedTime
        }
      }
      title
      robots
      breadcrumbTitle
      breadcrumbs {
        url
        text
        isHidden
      }
      focusKeywords
    }
    featuredImage {
      node {
        sourceUrl
      }
    }
  }
}`;

  const response = await graphqlFetcher<Page>(query);

  return response.data?.page ?? null;
}

export async function getFrontPage() {
  const query = `query getFrontPage {
  pages(where: {status: ${PageStatus.PUBLISH}}, first: 1000) {
    nodes {
    isFrontPage
    slug
    seo {
      description
      jsonLd {
        raw
      }
      openGraph {
        description
        locale
        siteName
        title
        type
        image {
          url
          height
          width
          secureUrl
          type
        }
        twitterMeta {
          card
          image
          title
          description
        }
        url
        updatedTime
        articleMeta {
          publishedTime
          modifiedTime
        }
      }
      title
      robots
      breadcrumbTitle
      breadcrumbs {
        url
        text
        isHidden
      }
      focusKeywords
    }
    }
  }
}`;

  const response = await graphqlFetcher<WordpressPages>(query);

  return (
    response.data?.pages.nodes.filter(
      (page: WordpressPage) => page.isFrontPage
    )[0] ?? null
  );
}
