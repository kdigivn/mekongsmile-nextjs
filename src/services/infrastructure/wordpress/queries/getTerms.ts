import { graphqlFetcher } from "@/services/graphql/fetcher";
import { TermResponse, TermsResponse } from "../types/term";
import { toCamelCase } from "@/lib/utils";

export async function getTerms() {
  const query = `query getTerms {
  terms(first: 1000) {
    nodes {
      name
      slug
      uri
      taxonomyName
      termTaxonomyId
      description
      ... on Hang {
        id
        name
        operatorInfo {
          operatorId
          routeId
        }
      }
      ... on KhoiHanhTu {
        id
        name
        locationInfo {
          locationId
        }
      }
      ... on DiemDen {
        id
        name
        locationInfo {
          locationId
        }
      }
      seo {
        robots
      }
    }
  }
}`;

  const response = await graphqlFetcher<TermsResponse>(query);

  return response.data?.terms.nodes ?? [];
}

export async function getTermByUri(uri: string) {
  const query = `query getTermBySlug {
  termNode(id: "${uri}", idType: URI) {
    id
    name
    slug
    uri
    taxonomyName
    termTaxonomyId
    description
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
    ... on Hang {
      id
      name
      operatorInfo {
        operatorId
        routeId
      }
    }
    ... on KhoiHanhTu {
      id
      name
      locationInfo {
        locationId
      }
    }
    ... on DiemDen {
      id
      name
      locationInfo {
        locationId
      }
    }
    ... on ProductCategory {
      id
      name
      setting {
        typeOfProduct
      }
    }
  }
}`;

  const response = await graphqlFetcher<TermResponse>(query);

  return response.data?.termNode;
}

export async function getTotalItem(term: string, uri: string) {
  term = toCamelCase(term);
  const notHavePosts = ["productCategory", "khoiHanhTu"];
  const type = notHavePosts.includes(term) ? "product" : "posts";
  const query = `query getTotalItemByTerm {
  ${term}(id: "${uri}", idType: URI) {
    ${type} {
      pageInfo {
        offsetPagination {
          total
        }
      }
    }
  }
}`;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const response = await graphqlFetcher<any>(query);

  return response.data[term][type].pageInfo.offsetPagination.total ?? 0;
}

export async function getPostsByTerm(
  term: string,
  uri: string,
  order: string = "DESC",
  limit: number = 12
) {
  term = toCamelCase(term);
  const notHavePosts = ["productCategory", "khoiHanhTu"];
  if (notHavePosts.includes(term)) return [];
  const query = `query getPostsByTerm {
  ${term}(id: "${uri}", idType: URI) {
    posts(where: {orderby: {field: MODIFIED, order: ${order}}}, first: ${limit}) {
      nodes {
        id
        link
        slug
        title
        excerpt
        uri
        date
        postId
        tags {
          nodes {
            name
            link
            tagId
            uri
          }
        }
        featuredImage {
          node {
            title
            sourceUrl(size: LARGE)
            altText
          }
        }
        categories {
          nodes {
            categoryId
            name
            slug
            uri
          }
        }
      }
    }
  }
}`;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const response = await graphqlFetcher<any>(query);
  return response.data[term].posts.nodes ?? [];
}
