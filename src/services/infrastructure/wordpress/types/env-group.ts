import { EnvWebsiteSettingEnum } from "./env-group.enum";
import { WordpressPage } from "./page";

export type EnvSetting = {
  envSetting: {
    envgroup: {
      pagegroup: EnvPageEntry[];
      websiteSetting: EnvWebsiteSetting[];
      manifestSetting: ManifestSetting;
      integration: EnvIntegrationSetting;
    };
  };
};

export type EnvPageEntry = {
  envkey: string;
  page: {
    nodes: WordpressPage[];
  };
};

export type EnvWebsiteSetting = {
  envkey: EnvWebsiteSettingEnum;
  value: string;
};

export type ManifestSetting = {
  display: string;
  icon: Icon[];
  name: string;
  short_name: string;
  start_url: string;
  scope: string;
  description: string;
};

export type Icon = {
  sizes: string;
  type: string;
  src: {
    node: {
      sourceUrl: string;
    };
  };
};

export type EnvIntegrationSetting = {
  ga4Id?: string;
  gtmId?: string;
  microsoftClarityId?: string;
};
