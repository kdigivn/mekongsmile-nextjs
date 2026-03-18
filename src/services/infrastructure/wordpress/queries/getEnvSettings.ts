import { graphqlFetcher } from "@/services/graphql/fetcher";
import { PageGroupEnvKeyEnum } from "../enums/page-group-env-key-enum";
import { EnvIntegrationSetting, EnvSetting } from "../types/env-group";

export async function getEnvPageGroup() {
  const query = `query getAllENVPageGroup {
    envSetting {
      envgroup {
        pagegroup {
          envkey
          page {
            nodes {
              id
              uri
              slug
              isFrontPage
              isPostsPage
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
              ... on Page {
                id
                title
                content(format: RENDERED)
              }
            }
          }
        }
      }
    }
  }
  `;

  const response = await graphqlFetcher<EnvSetting>(query);

  const pages =
    response.data?.envSetting.envgroup.pagegroup
      .map((item) => {
        if (item.page.nodes.length === 0) {
          return null;
        }
        return item.page.nodes[0];
      })
      .filter((item) => item !== null) ?? [];

  return pages ?? [];
}

export async function getEnvPage(envKey: PageGroupEnvKeyEnum) {
  const query = `query getAllENVPageGroup {
    envSetting {
      envgroup {
        pagegroup {
          envkey
          page {
            nodes {
              id
              uri
              slug
              isFrontPage
              isPostsPage
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
              ... on Page {
                id
                title
                content(format: RENDERED)
              }
            }
          }
        }
      }
    }
  }
  `;

  const response = await graphqlFetcher<EnvSetting>(query);

  const pages =
    response.data?.envSetting.envgroup.pagegroup.find(
      (item) => item.envkey === envKey
    )?.page.nodes ?? [];
  if (pages.length === 0) {
    return null;
  }

  return pages[0];
}

export async function getEnvWebsiteSettings() {
  const query = `query getEnvWebsiteSettings {
    envSetting {
      envgroup {
        websiteSetting {
        envkey
        value
        }
      }
    }
  }
  `;

  try {
    const response = await graphqlFetcher<EnvSetting>(query);

    const websiteSetting = response.data?.envSetting.envgroup.websiteSetting;

    return websiteSetting;
  } catch (error) {
    if (error instanceof Error) {
      console.log("getEnvWebsiteSettings error: ", error.message.toString());
    }
    return [];
  }
}

export async function getEnvManifestSetting() {
  const query = `query getManifestSetting {
  envSetting {
    envgroup {
      manifestSetting {
        display
        icon {
          sizes
          type
          src {
            node {
              sourceUrl
            }
          }
        }
        name
        short_name
        start_url
        scope
        description
      }
    }
  }
}
  `;

  try {
    const response = await graphqlFetcher<EnvSetting>(query);

    const manifestSetting = response.data?.envSetting.envgroup.manifestSetting;

    return manifestSetting;
  } catch (error) {
    if (error instanceof Error) {
      console.log("manifestSetting error: ", error.message.toString());
    }
    return undefined;
  }
}

export async function getEnvIntegrationSetting() {
  const query = `query getIntegrationSetting {
  envSetting {
    envgroup {
      integration {
        ga4Id
        gtmId
        microsoftClarityId
      }
    }
  }
}`;

  try {
    const response = await graphqlFetcher<EnvSetting>(query);

    const integrationSetting: EnvIntegrationSetting =
      response.data?.envSetting.envgroup.integration ?? {};

    return integrationSetting;
  } catch (error) {
    if (error instanceof Error) {
      console.log("getIntegrationSetting error: ", error.message.toString());
    }
    return {};
  }
}
