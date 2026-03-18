export type FooterInfo = {
  address: [SocialItem];
  subfooter: string;
  ecosystem: [Ecosystem];
};

export type SocialItem = {
  link: string;
  text: string;
};

export type FooterInfoResponse = {
  blockCustom: {
    blockAllFields: { footerInformation: FooterInfo };
  };
};

export type Ecosystem = {
  name: string;
  link: string;
  logo: {
    node: {
      sourceUrl: string;
    };
  };
};
