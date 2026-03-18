import { graphqlFetcher } from "@/services/graphql/fetcher";
import { Logo } from "../types/logo";
/**
 * Fetch pages
 */
export async function getLogo() {
  const query = `
        query getLogo {
          siteLogo {
            id
            title
            sourceUrl
          }
        }
    `;

  const response = await graphqlFetcher<Logo>(query);
  return response.data || [];
}
