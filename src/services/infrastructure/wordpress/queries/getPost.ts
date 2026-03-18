import { graphqlFetcher } from "@/services/graphql/fetcher";
import { PostResponse } from "../types/post";

export type PostProps = {
  slug: string;
};

export async function getPost({ slug }: PostProps) {
  const query = `query getPostSlug {
  post(id: "${slug}", idType: SLUG) {
    id
    content
    link
    slug
    postId
    title
    uri
    date
    tags {
      nodes {
        id
        name
        uri
        slug
      }
    }
    hang {
      nodes {
        id
        name
        uri
        slug
      }
    }
    diemDen {
      nodes {
        id
        name
        uri
        slug
      }
    }
    categories {
      nodes {
        categoryId
        slug
        name
        uri
        parent {
          node {
            name
            categoryId
          }
        }
        children {
          nodes {
            categoryId
            name
            slug
          }
        }
      }
    }
    featuredImage {
      node {
        title
        sourceUrl(size: LARGE)
        altText
      }
    }
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
    author {
      node {
        avatar {
          url
          width
          height
        }
        name
        slug
        email
      }
    }
    commentCount
    comments {
      nodes {
        author {
          node {
            email
            avatar {
              url
              height
              width
            }
            name
            url
            email
          }
        }
        content
        date
      }
    }
    kkStarRating {
      avg
      count
      ratings
    }
    productPrice {
      productPrice {
        ... on ProductPriceProductPriceThemGiaSanPhamLayout {
          giaBanDau
          giaHienTai
        }
      }
    }
    baivietchuyentau {
      routeId
      isDisabled
    }
  }
}`;
  const response = await graphqlFetcher<PostResponse>(query);
  return response.data?.post ?? null;
}
