import { Location } from "@/services/apis/locations/types/location";

export type SideBarItem = {
  name: string;
  label?: string;
  link: string;
  description?: string;
  qrImage?: { node: { sourceUrl: string } };
  logo: { node: { sourceUrl: string } };
  notice: string;
};

export type SideBar = SideBarItem[];

export type FaqItem = {
  faqKey: string;
  faqValue?: string;
};

export type Faq = FaqItem[];

export type HomeSliderItem = {
  imageItem: {
    node: {
      id: string;
      altText?: string;
      caption?: string;
      date?: string;
      description?: string;
      link?: string;
      sourceUrl?: string;
      title?: string;
      sizes?: string;
    };
  };
  postUrl: string;
};

export type HomeSlider = HomeSliderItem[];

export type HomeHighLightItem = {
  title: string;
  description: string;
  imageItem: {
    node: {
      id: string;
      altText?: string;
      caption?: string;
      date?: string;
      description?: string;
      link?: string;
      sourceUrl?: string;
      title?: string;
    };
  };
};

export type HomeHighLight = HomeHighLightItem[];

export type ContactRightsideItem = {
  tooltip: string;
  text: string;
  link: string;
  isshow: boolean;
};

export type ContactHeaderIconsItem = {
  text: string;
  link: string;
  image: string;
};

export type ContactRightside = {
  facebook: ContactRightsideItem;
  phoneNumber: ContactRightsideItem;
  zalo: ContactRightsideItem;
  map: ContactRightsideItem;
  liveChat: boolean;
};

export type ImageLinkTypeItem = {
  image_link: string;
  partnerImg: {
    node: {
      id: string;
      altText?: string;
      caption?: string;
      date?: string;
      description?: string;
      link?: string;
      sourceUrl?: string;
      title?: string;
    };
  };
};

export type HighlightRouteItem = {
  departure_name: string;
  destination_name: string;
  routeId: string;
};

export type HighlightRoute = HighlightRouteItem[];

export type HighlightRouteMain = {
  selectedDeparture?: Location;
  selectedDestination?: Location;
  departure_name?: string;
  destination_name?: string;
  departure_abbreviation?: string;
  destination_abbreviation?: string;
  routeId?: string;
};

export type ImageLinkType = ImageLinkTypeItem[];

export type BlockCustom = {
  blockCustom: {
    blockAllFields: {
      sideBar: SideBar;
      faq: Faq;
      homepageHeroTitle: string;
      homepageSlider: HomeSlider;
      homePageHighlight: HomeHighLight;
      contactRightSide: ContactRightside;
      contactHeaderIcons: ContactHeaderIconsItem[];
      partners: ImageLinkType;
      highlightRoutes: HighlightRoute;
      routeIdDefault: string;
      disableRoutes: DisableRoute[];
      displayVoucherSuggestion: boolean;
    };
  };
};

export type DisableRoute = {
  text: string;
  routeId: string;
  linkPost: string;
};

export type NotFoundImage = {
  blockCustom: {
    blockAllFields: {
      logo: { node: { sourceUrl: string } };
    };
  };
};

export type FaviconImage = {
  blockCustom: {
    blockAllFields: {
      favicon: { node: { sourceUrl: string } };
    };
  };
};
