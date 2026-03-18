import { Seo } from "./page";

export type TermsResponse = {
  terms: {
    nodes: Term[];
  };
};

export type TermResponse = {
  termNode: Term;
};

export type Term = {
  id: string;
  name: string;
  slug: string;
  uri: string;
  taxonomyName: string;
  termTaxonomyId: number;
  description?: string;
  seo: Seo;
  operatorInfo?: {
    operatorId: string;
    routeId?: string;
  };
  locationInfo?: {
    locationId: string;
  };
  setting?: {
    typeOfProduct?: string[];
  };
};
