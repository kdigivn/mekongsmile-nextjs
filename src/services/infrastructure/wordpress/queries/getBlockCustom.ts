import { graphqlFetcher } from "@/services/graphql/fetcher";
import { BlockCustom, FaviconImage, NotFoundImage } from "../types/sideBar";
import { FooterInfoResponse } from "../types/footer";

export async function getFooterInformation() {
  const query = `
query getFooterInformation {
  blockCustom {
    blockAllFields {
      footerInformation {
        address {
          link
          text
        }
        subfooter
        ecosystem {
          name
          link
          logo {
            node {
              sourceUrl
            }
          }
        }
      }
    }
  }
}
  `;
  try {
    const { data } = await graphqlFetcher<FooterInfoResponse>(query);

    return data?.blockCustom?.blockAllFields?.footerInformation ?? null;
  } catch (error) {
    console.error("Error fetching footer subsection data:", error);
    return null;
  }
}

export async function getSideBarItem() {
  const query = `
   query NewQuery {
  blockCustom {
    blockAllFields {
      sideBar {
        name
        label
        link
        description
        qrImage {
          node {
            sourceUrl(size: LARGE)
          }
        }
        logo {
          node {
            sourceUrl(size: LARGE)
          }
        }
        notice
      }
    }
  }
}
  `;
  try {
    const { data } = await graphqlFetcher<BlockCustom>(query);
    const sideBar = data?.blockCustom.blockAllFields.sideBar[0] ?? null;
    return sideBar;
  } catch (error) {
    console.error("Error fetching footer subsection data:", error);
    return null;
  }
}

export async function getFaqSubsection() {
  const query = `
    query Faq {
  blockCustom {
    blockAllFields {
      faq {
        faqKey
        faqValue
      }
    }
  }
}
  `;
  try {
    const { data } = await graphqlFetcher<BlockCustom>(query);
    const faq = data?.blockCustom.blockAllFields.faq ?? [];
    return faq ?? [];
  } catch (error) {
    console.error("Error fetching faq data:", error);
    return [];
  }
}

export async function getContactRightsideSection() {
  const query = `
     query ContactRightside {
  blockCustom {
    blockAllFields {
       contactRightSide {
        facebook {
          link
          isshow
          text
          tooltip
        }
        liveChat
        map {
          isshow
          link
          text
          tooltip
        }
        phoneNumber {
          isshow
          link
          text
          tooltip
        }
        zalo {
          link
          isshow
          text
          tooltip
        }
      }
    }
  }
}
  `;
  try {
    const { data } = await graphqlFetcher<BlockCustom>(query);
    const contactRightSide =
      data?.blockCustom.blockAllFields.contactRightSide ?? {};
    return contactRightSide ?? [];
  } catch (error) {
    console.error("Error fetching Contact Rightside data:", error);
    return [];
  }
}

export async function getContactHeaderIcons() {
  const query = `query getContactHeaderIcons {
  blockCustom {
    blockAllFields {
      contactHeaderIcons {
        image
        link
        text
      }
    }
  }
}`;
  try {
    const { data } = await graphqlFetcher<BlockCustom>(query);
    const contactHeaderIcons =
      data?.blockCustom.blockAllFields.contactHeaderIcons ?? [];
    return contactHeaderIcons ?? [];
  } catch (error) {
    console.error("Error fetching Contact Header Icons data:", error);
    return [];
  }
}

export async function getHomePageHeroTitle() {
  const query = `
  query QueryCustomBlocks {
    blockCustom {
      blockAllFields {
        homepageHeroTitle
      }
    }
  }
  `;
  try {
    const { data } = await graphqlFetcher<BlockCustom>(query);
    const homepageHeroTitle =
      data?.blockCustom.blockAllFields.homepageHeroTitle ??
      "Vé tàu cao tốc online";
    return homepageHeroTitle;
  } catch (error) {
    console.error("Error fetching faq data:", error);
    return "Vé tàu cao tốc online";
  }
}

export async function getHomePageSliderItems() {
  const query = `
  query QueryCustomBlocks {
    blockCustom {
      blockAllFields {
        homepageSlider {
          imageItem {
            node {
              id
              altText
              caption
              date
              description
              link
              sourceUrl
              title
              sizes
            }
          }
          postUrl 
        }
      }
    }
  }
  `;
  try {
    const { data } = await graphqlFetcher<BlockCustom>(query);
    const homepageSlider =
      data?.blockCustom.blockAllFields.homepageSlider ?? [];
    return homepageSlider ?? [];
  } catch (error) {
    console.error("Error fetching faq data:", error);
    return [];
  }
}

export async function getDisableRoutes() {
  const query = `
  query QueryCustomBlocks {
    blockCustom {
      blockAllFields {
        disableRoutes {
          linkPost
          text
          routeId
        }
      }
    }
  }
  `;
  try {
    const { data } = await graphqlFetcher<BlockCustom>(query);
    const disableRoutes = data?.blockCustom.blockAllFields.disableRoutes ?? [];
    return disableRoutes ?? [];
  } catch (error) {
    console.error("Error fetching disable routes data:", error);
    return [];
  }
}

export async function getHomePageHighLightItems() {
  const query = `
  query QueryCustomBlocksHomeHighlight {
    blockCustom {
      blockAllFields {
        homePageHighlight {
          title
          description
          imageItem {
            node {
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
      }
    }
  }
  `;
  try {
    const { data } = await graphqlFetcher<BlockCustom>(query);
    const homePageHighlight =
      data?.blockCustom.blockAllFields.homePageHighlight ?? [];
    return homePageHighlight ?? [];
  } catch (error) {
    console.error("Error fetching faq data:", error);
    return [];
  }
}

export async function getAllOperators() {
  const query = `
  query getPartnerImages {
  blockCustom {
    blockAllFields {
      partners {
        image_link
        partnerImg {
          node {
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
    }
  }
}
  `;
  try {
    const { data } = await graphqlFetcher<BlockCustom>(query);
    const imageLinkType = data?.blockCustom.blockAllFields.partners ?? [];
    return imageLinkType ?? [];
  } catch (error) {
    console.error("Error fetching Image Link Type data:", error);
    return [];
  }
}

export async function getHighlightRoutes() {
  const query = `
  query getHighlightRoutes {
  blockCustom {
    blockAllFields {
      
highlightRoutes {
  departure_name
  destination_name
  routeId
}
    }
  }
}
  `;
  try {
    const { data } = await graphqlFetcher<BlockCustom>(query);
    const highlightRoutes =
      data?.blockCustom.blockAllFields.highlightRoutes ?? [];
    return highlightRoutes ?? [];
  } catch (error) {
    console.error("Error fetching Highlight Routes data:", error);
    return [];
  }
}

export async function getRouteIdDefault() {
  const query = `
  query getRouteIdDefault {
  blockCustom {
    blockAllFields {
      routeIdDefault
    }
  }
}
  `;
  try {
    const { data } = await graphqlFetcher<BlockCustom>(query);
    const routeIdDefault =
      data?.blockCustom.blockAllFields.routeIdDefault ?? "";
    return routeIdDefault ?? "";
  } catch (error) {
    console.error("Error fetching Route ID default:", error);
    return "";
  }
}

export async function getNotFoundImage() {
  const query = `
  query getLogoNoText {
  blockCustom {
    blockAllFields {
      logo {
        node {
          sourceUrl
        }
      }
    }
  }
}
  `;
  try {
    const { data } = await graphqlFetcher<NotFoundImage>(query);
    const routeIdDefault =
      data?.blockCustom.blockAllFields.logo.node.sourceUrl ?? "";
    return routeIdDefault ?? "";
  } catch (error) {
    console.error("Error fetching Route ID default:", error);
    return "";
  }
}

export async function getFavicon() {
  const query = `
  query getFavicon {
  blockCustom {
    blockAllFields {
      favicon {
        node {
          sourceUrl
        }
      }
    }
  }
}
  `;
  try {
    const { data } = await graphqlFetcher<FaviconImage>(query);
    const favicon =
      data?.blockCustom.blockAllFields.favicon.node.sourceUrl ?? "";
    return favicon ?? "";
  } catch (error) {
    console.error("Error fetching favicon", error);
    return "";
  }
}

export async function getDisplayVoucherSuggestion() {
  const query = `
  query getDisplayVoucherSuggestion {
 blockCustom {
    blockAllFields {
      displayVoucherSuggestion
    }
  }
}
  `;
  try {
    const { data } = await graphqlFetcher<BlockCustom>(query);
    const displayVoucherSuggestion =
      data?.blockCustom.blockAllFields.displayVoucherSuggestion ?? false;
    return displayVoucherSuggestion ?? false;
  } catch (error) {
    console.error("Error fetching display voucher suggestion:", error);
    return false;
  }
}
