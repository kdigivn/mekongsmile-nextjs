import { Post } from "./post";

export type Hang = {
  description: string;
  name: string;
  taxonomyName: string;
  uri: string;
  slug: string;
  posts?: {
    nodes: Post[];
  };
  operatorInfo: OperatorInfo;
};

export type OperatorInfo = {
  operatorId?: string;
  operator_image: {
    node: {
      id: string;
      altText: string;
      caption: string;
      date: string;
      description: string;
      link: string;
      sourceUrl: string;
      title: string;
    };
  };
  operatorNote?: string;
  routeId?: string;
};

export type HangsResponse = {
  allHang: {
    nodes: Hang[];
  };
};
