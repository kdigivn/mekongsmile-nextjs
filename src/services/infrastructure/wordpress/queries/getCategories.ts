import { graphqlFetcher } from "@/services/graphql/fetcher";
import { CategoriesResponse } from "../types/category";

export async function getCategories(limit: number = 12) {
  const query = `query getCategories {
  categories(first: ${limit}) {
    nodes {
      categoryId
      name
      parent {
        node {
          name
          categoryId
        }
      }
      slug
      uri
      children {
        nodes {
          categoryId
          name
          slug
        }
      }
    }
  }
}
`;

  const response = await graphqlFetcher<CategoriesResponse>(query);

  return response.data?.categories.nodes ?? [];
}

export async function getCategoriesBySlug(
  limit: number = 12,
  slug: string = ""
) {
  const query = `query getCategories {
  categories(first: ${limit}, where: { slug: "${slug}" }) {
    nodes {
      categoryId
      name
      parent {
        node {
          name
          categoryId
        }
      }
      slug
      uri
      children {
        nodes {
          categoryId
          name
          slug
        }
      }
    }
  }
}
`;

  const response = await graphqlFetcher<CategoriesResponse>(query);

  return response.data?.categories.nodes ?? [];
}
