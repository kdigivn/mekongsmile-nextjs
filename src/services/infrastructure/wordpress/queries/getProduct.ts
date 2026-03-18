import { graphqlFetcher } from "@/services/graphql/fetcher";
import {
  Product,
  ProductByPostResponse,
  ProductResponse,
  ProductSlugResponse,
} from "../types/product";
import { toCamelCase } from "@/lib/utils";
import { FeaturedProducts, Post } from "../types/post";

export type ProductProps = {
  slug: string;
};

export async function getProduct({ slug }: ProductProps) {
  const query = `query getProductSlug {
  product(id: "${slug}", idType: SLUG) {
    id
    content
    excerpt
    link
    slug
    productId
    title
    uri
    date
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
    excerpt
    productSlideImages {
      productSlideImages {
        nodes {
          id
          altText
          caption
          date
          description
          link
          sourceUrl
          title
        }
      }
    }
    productSlideVideo {
      productSlideVideo
    }
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
    productCategory {
      nodes {
        id
        name
	      uri 
        slug       
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
    vetau {
      routeid
      notice
      isdisabled
    }
    fakeBookNumber {
      fake_book_number
    }
  }
}`;
  const response = await graphqlFetcher<ProductResponse>(query);
  return response.data?.product ?? null;
}

export type ProductSlugProps = {
  limit?: number;
  order?: "ASC" | "DESC";
  pagination?: boolean;
  numberPerPages?: number;
  fieldOrder?: string;
};

export async function getProductSlug({
  order = "DESC",
  limit = 4,
  fieldOrder = "DATE",
}: ProductSlugProps) {
  const query = `{
  allProduct(first: ${limit}, where: { orderby: { field: ${fieldOrder}, order: ${order} } }) {
    nodes {
      slug
      uri
      modified
      seo {
        robots
      }
      sitemapValue {
        priority
      }
    }
  }
}`;
  const response = await graphqlFetcher<ProductSlugResponse>(query);

  return response.data?.allProduct.nodes ?? [];
}

export async function getProductRelatedByPost(
  slug: string,
  isProduct: boolean
) {
  const query = `fragment ProductFragment on Product {
  id
  content
  excerpt
  link
  slug
  productId
  title
  uri
  date
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
  diemDen {
    nodes {
      name
    }
  }
}

query MyQuery4 {
  ${isProduct ? "product" : "post"}(id: "${slug}", idType: SLUG) {
    id
    hang {
      nodes {
        product(first: 20, where: {orderby: {field: DATE, order: DESC}}) {
          nodes {
            ...ProductFragment
          }
        }
      }
    }
    diemDen {
      nodes {
        product(first: 20, where: {orderby: {field: DATE, order: DESC}}) {
          nodes {
            ...ProductFragment
          }
        }
      }
    }
  }
}
`;
  const response = await graphqlFetcher<ProductByPostResponse>(query);

  const extractProducts = (arr: { product: { nodes: Product[] } }[]) =>
    arr.flatMap((item) => item.product.nodes);

  let combinedProducts: Product[] = [];

  if (isProduct) {
    const diemDenProduct = response.data?.product.diemDen.nodes ?? [];
    const hangProduct = response.data?.product.hang.nodes ?? [];
    combinedProducts = [
      ...extractProducts(diemDenProduct),
      ...extractProducts(hangProduct),
    ];
  } else {
    const diemDenProduct = response.data?.post.diemDen.nodes ?? [];
    const hangProduct = response.data?.post.hang.nodes ?? [];
    combinedProducts = [
      ...extractProducts(diemDenProduct),
      ...extractProducts(hangProduct),
    ];
  }

  // combinedProducts.map((item) => console.log(item.slug));
  const uniqueProducts = Array.from(
    new Map(combinedProducts.map((product) => [product.slug, product])).values()
  );

  const limitedProducts = uniqueProducts.slice(0, 12);

  return limitedProducts ?? [];
}

export async function getProductsByTerm(
  term: string,
  uri: string,
  order: string = "DESC",
  limit: number = 12
) {
  term = toCamelCase(term);
  const haveProduct = ["productCategory", "khoiHanhTu", "diemDen", "hang"];
  if (!haveProduct.includes(term)) return [];
  const query = `query getPostsByTerm {
    ${term}(id: "${uri}", idType: URI) {
        product(where: {orderby: {field: MODIFIED, order: ${order}}}, first: ${limit}) {
        nodes {
            id
    content
    link
    slug
    title
    excerpt
    uri
    date
    productId
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
    productCategory {
      nodes {
        name
        slug
        uri
      }
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
        }
        }
    }
    }`;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const response = await graphqlFetcher<any>(query);
  return response.data[term].product.nodes ?? [];
}

export async function getFeaturedProducts() {
  const query = `query getProducts {
  blockCustom {
    blockAllFields {
      featuredProducts {
        featured_product {
          nodes {
            link
            slug
            uri
            date
            ... on Product {
              id
              title
              excerpt
              title
              featuredImage {
                node {
                  sourceUrl
                  altText
                }
              }
              productCategory {
                nodes {
                  productCategoryId
                  name
                  slug
                  uri
                }
              }
              productId
            }
          }
        }
      }
    }
  }
}
`;

  const response = await graphqlFetcher<FeaturedProducts>(query);

  return (
    response.data?.blockCustom.blockAllFields.featuredProducts
      ?.map((features) =>
        features.featured_product ? features.featured_product.nodes[0] : null
      )
      .filter((item): item is Post => !!item) ?? []
  );
}
