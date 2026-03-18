export type BankApp = {
  appId?: string;
  appLogo?: string;
  appName?: string;
  bankName?: string;
  monthlyInstall?: number;
  deeplink?: string;
  autofill?: number;
};

export type deepLinkAppResponse = {
  apps: BankApp[];
};
