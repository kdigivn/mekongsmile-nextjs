/* eslint-disable @arthurgeron/react-usememo/require-usememo */
import AppAuthInitializer from "@/components/app-auth-initializer";
// import ResponsiveAppBar from "@/components/app-bar";
// import BackToTopButton from "@/components/button/back-to-top";
import ConfirmDialogProvider from "@/components/confirm-dialog/confirm-dialog-provider";
// import Footer from "@/components/footer/footer";
import MobileBottomNavProvider from "@/components/footer/footer-mobile-contact-buttons/mobile-bottom-nav-provider";
import SearchDialogProvider from "@/components/search/context/search-dialog-provider";
import ThemeProvider from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import AuthProvider from "@/services/auth/auth-provider";
import { getServerTranslation } from "@/services/i18n";
import "@/services/i18n/config";
import { languages } from "@/services/i18n/config";
import StoreLanguageProvider from "@/services/i18n/store-language-provider";
import { MenuLocationEnum } from "@/services/infrastructure/wordpress/enums/menu-locations";
import {
  getContactHeaderIcons,
  getContactRightsideSection,
  getDisplayVoucherSuggestion,
  getFooterInformation,
} from "@/services/infrastructure/wordpress/queries/getBlockCustom";
import {
  getEnvIntegrationSetting,
  getEnvWebsiteSettings,
} from "@/services/infrastructure/wordpress/queries/getEnvSettings";
import { getLogo } from "@/services/infrastructure/wordpress/queries/getLogo";
import {
  getFooterMenuLocation,
  getMenuItemsByLocation,
} from "@/services/infrastructure/wordpress/queries/getMenu";
import { getHighLightPosts } from "@/services/infrastructure/wordpress/queries/getPosts";
import { EnvWebsiteSettingEnum } from "@/services/infrastructure/wordpress/types/env-group.enum";
import { Logo } from "@/services/infrastructure/wordpress/types/logo";
import { Menus } from "@/services/infrastructure/wordpress/types/menu";
import { ContactRightside } from "@/services/infrastructure/wordpress/types/sideBar";
import LeavePageProvider from "@/services/leave-page/leave-page-provider";
import QueryProvider from "@/services/react-query/query-provider";
import FacebookAuthProvider from "@/services/social-auth/facebook/facebook-auth-provider";
import GoogleAuthProvider from "@/services/social-auth/google/google-auth-provider";
import { GoogleAnalytics, GoogleTagManager } from "@next/third-parties/google";
import { dir } from "i18next";
import type { Metadata } from "next";
import Script from "next/script";
import { Suspense } from "react";
import "./globals.css";
import AppThemeInitializer from "@/components/app-theme-initializer";
import { Inter } from "next/font/google";
import dynamic from "next/dynamic";
import { getServerSideMeilisearchClient } from "@/services/infrastructure/meilisearch/meilisearch-client";
import OrgProvider from "@/services/apis/organizations/context/org-provider";
import { EnvIntegrationSetting } from "@/services/infrastructure/wordpress/types/env-group";
import PageTracker from "@/components/page-tracker/page-tracker";
import SchemaMarkup from "@/components/schema-markup/schema-markup";
import PermateTracker from "@/components/permate/permate-tracker";
import NextTopLoader from "nextjs-toploader";

/** Validate CMS menu data has expected shape (not just truthy — [] bypasses null checks) */
function isValidMenus(data: unknown): data is Menus {
  return (
    !!data &&
    typeof data === "object" &&
    !Array.isArray(data) &&
    "menus" in data &&
    !!(data as Menus).menus?.nodes?.[0]
  );
}

/** Validate CMS logo data has expected shape */
function isValidLogo(data: unknown): data is Logo {
  return (
    !!data &&
    typeof data === "object" &&
    !Array.isArray(data) &&
    "siteLogo" in data
  );
}

const ResponsiveAppBar = dynamic(() => import("@/components/app-bar"), {
  loading: () => <div className="w-full bg-white" style={{ height: "60px" }} />,
});

// Provide min-height to prevent CLS when footer lazy-loads
const Footer = dynamic(() => import("@/components/footer/footer"), {
  loading: () => <div style={{ minHeight: "400px" }} />,
});

// Load ReactQueryDevtools only in development — removes ~300KB from production bundle
const ReactQueryDevtools =
  process.env.NODE_ENV === "development"
    ? dynamic(() =>
        import("@tanstack/react-query-devtools").then(
          (m) => m.ReactQueryDevtools
        )
      )
    : () => null;

type Props = {
  params: { language: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { t } = await getServerTranslation(params.language, "common");

  return {
    title: t("title"),
    other: {
      version: process.env.npm_package_version ?? "",
    },
  };
}
export async function generateStaticParams() {
  if (process.env.NODE_ENV === "production") {
    try {
      const client = await getServerSideMeilisearchClient();
      await client.deleteAllDocuments();
    } catch (e) {
      console.warn("[meilisearch] deleteAllDocuments failed:", e);
    }
  }

  return languages.map((language) => ({ language }));
}

const inter = Inter({
  subsets: ["vietnamese"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
});

async function RootLayout({
  children,
  params: { language = "vi" },
}: {
  children: React.ReactNode;
  params: { language: string };
}) {
  // Fetch all CMS data in parallel to minimize TTFB (was sequential: ~500-1100ms added per request)
  // Each call has .catch() fallback so one CMS failure doesn't crash the entire site
  const [
    websiteSettings,
    mainMenu,
    mobileMenu,
    logoData,
    footerMenu,
    footerInfo,
    contactRightSide,
    contactHeaderIcons,
    highLightPosts,
    displayVoucherSuggestion,
    envIntegration,
  ] = await Promise.all([
    getEnvWebsiteSettings().catch(() => null),
    getMenuItemsByLocation(MenuLocationEnum.PRIMARY).catch(() => null),
    getMenuItemsByLocation(MenuLocationEnum.MOBILE_MENU).catch(() => null),
    getLogo().catch(() => null),
    getFooterMenuLocation().catch(() => null),
    getFooterInformation().catch(() => null),
    getContactRightsideSection().catch(() => null),
    getContactHeaderIcons().catch(() => [] as never[]),
    getHighLightPosts().catch(() => [] as never[]),
    getDisplayVoucherSuggestion().catch(() => false),
    getEnvIntegrationSetting().catch(() => null),
  ]);

  const availableThemes = websiteSettings
    ?.find((setting) => setting.envkey === EnvWebsiteSettingEnum.THEMES)
    ?.value.split(",");

  return (
    <html lang={language} dir={dir(language)} className={inter.variable}>
      <head>
        {/* Preconnect to primary CDN only — too many preconnects hurts PageSpeed */}
        <link rel="preconnect" href="https://cdn.vetaucaotoc.net" />
        {/* DNS-prefetch for secondary CDNs (lower priority, no TCP/TLS overhead) */}
        <link rel="dns-prefetch" href="https://cdn.condao.express" />
        <link rel="dns-prefetch" href="https://r2.kdigi.net" />
        <link rel="dns-prefetch" href="https://cdn.phuquoc.express" />
        <link rel="dns-prefetch" href="https://cdn.ferry.vn" />
      </head>
      <body className="bg-pageBackground">
        <NextTopLoader
          color="#2563eb"
          height={3}
          showSpinner={false}
          shadow={false}
        />
        <QueryProvider>
          <ReactQueryDevtools initialIsOpen={false} />
          <AuthProvider>
            <GoogleAuthProvider>
              <FacebookAuthProvider>
                <ThemeProvider availableThemes={availableThemes}>
                  <OrgProvider>
                    <StoreLanguageProvider>
                      <SearchDialogProvider>
                        <MobileBottomNavProvider>
                          <ConfirmDialogProvider>
                            <LeavePageProvider>
                              <TooltipProvider delayDuration={200}>
                                <AppAuthInitializer />
                                <AppThemeInitializer />
                                <SchemaMarkup />
                                {/* Tracker Vistor at each page */}
                                <PageTracker />
                                <Suspense fallback={<></>}>
                                  <PermateTracker />
                                </Suspense>
                                {isValidMenus(mainMenu) &&
                                  isValidMenus(mobileMenu) &&
                                  isValidLogo(logoData) && (
                                    <ResponsiveAppBar
                                      mainMenu={mainMenu}
                                      mobileMenu={mobileMenu}
                                      logoData={logoData}
                                      highLightPosts={highLightPosts ?? []}
                                      contactHeaderIcons={
                                        contactHeaderIcons ?? []
                                      }
                                      displayVoucherSuggestion={
                                        displayVoucherSuggestion ?? false
                                      }
                                    />
                                  )}
                                {/* <PwaInstallPrompt logoData={logoData} /> */}
                                <Toaster
                                  visibleToasts={5}
                                  position="top-right"
                                  theme="light"
                                />
                                <main>{children}</main>
                                {/* <BackToTopButton /> */}
                                {isValidMenus(footerMenu) &&
                                  contactRightSide &&
                                  isValidLogo(logoData) && (
                                    <Footer
                                      language={language}
                                      footerMenu={footerMenu}
                                      footerInfo={footerInfo}
                                      contactRightSide={
                                        contactRightSide as ContactRightside
                                      }
                                      logoData={logoData}
                                    />
                                  )}
                              </TooltipProvider>
                            </LeavePageProvider>
                          </ConfirmDialogProvider>
                        </MobileBottomNavProvider>
                      </SearchDialogProvider>
                    </StoreLanguageProvider>
                  </OrgProvider>
                </ThemeProvider>
              </FacebookAuthProvider>
            </GoogleAuthProvider>
          </AuthProvider>
        </QueryProvider>
        {/* Chat widget — idle callback + 5s delay to avoid blocking PageSpeed metrics */}
        <Script id="smax-script" strategy="lazyOnload">
          {`(function(){function load(){var s=document.createElement('script');s.src='https://chatbox.smax.ai/sdk.min.js';document.body.appendChild(s)}if('requestIdleCallback' in window){requestIdleCallback(function(){setTimeout(load,5000)})}else{setTimeout(load,8000)}})();`}
        </Script>
        {process.env.NODE_ENV === "production" && (
          <>
            {(envIntegration as EnvIntegrationSetting | null)?.ga4Id && (
              <GoogleAnalytics
                gaId={(envIntegration as EnvIntegrationSetting).ga4Id!}
              />
            )}
            {(envIntegration as EnvIntegrationSetting | null)?.gtmId && (
              <GoogleTagManager
                gtmId={(envIntegration as EnvIntegrationSetting).gtmId!}
              />
            )}
            {(envIntegration as EnvIntegrationSetting | null)
              ?.microsoftClarityId && (
              <Script id="clarity-script" strategy="lazyOnload">
                {` (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", "${(envIntegration as EnvIntegrationSetting).microsoftClarityId}");`}
              </Script>
            )}
          </>
        )}
        <Script
          src="/static/cookie-banner/silktide-consent-manager.min.js"
          strategy="lazyOnload"
        />
        <Script
          src="/static/cookie-banner/silktide-configs.min.js"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}

export default RootLayout;
