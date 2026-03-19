/* eslint-disable @arthurgeron/react-usememo/require-usememo */
import ConfirmDialogProvider from "@/components/confirm-dialog/confirm-dialog-provider";
import ThemeProvider from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getServerTranslation } from "@/services/i18n";
import "@/services/i18n/config";
import { fallbackLanguage } from "@/services/i18n/config";
import StoreLanguageProvider from "@/services/i18n/store-language-provider";
import { getLayoutData } from "@/services/wordpress/site-service";
import QueryProvider from "@/services/react-query/query-provider";
import { GoogleAnalytics } from "@next/third-parties/google";
import { dir } from "i18next";
import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { Be_Vietnam_Pro, Noto_Sans_SC, Playfair_Display } from "next/font/google";
import dynamic from "next/dynamic";
import NextTopLoader from "nextjs-toploader";

const ResponsiveAppBar = dynamic(() => import("@/components/app-bar"), {
  loading: () => <div className="w-full bg-white" style={{ height: "60px" }} />,
});

// Provide min-height to prevent CLS when footer lazy-loads
const Footer = dynamic(() => import("@/components/footer/footer"), {
  loading: () => <div style={{ minHeight: "400px" }} />,
});

// Load ReactQueryDevtools only in development
const ReactQueryDevtools =
  process.env.NODE_ENV === "development"
    ? dynamic(() =>
        import("@tanstack/react-query-devtools").then(
          (m) => m.ReactQueryDevtools
        )
      )
    : () => null;

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerTranslation(fallbackLanguage, "common");

  return {
    title: t("title"),
    description: "Signature Mekong Delta Tour — Mekong Smile",
    other: {
      version: process.env.npm_package_version ?? "",
    },
  };
}

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  variable: "--font-be-vietnam-pro",
  weight: ["400", "500", "600", "700"],
});

const notoSansSC = Noto_Sans_SC({
  subsets: ["latin"],
  variable: "--font-noto-sans-sc",
  weight: ["400", "500", "700"],
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin", "vietnamese"],
  variable: "--font-playfair",
  weight: ["400", "500", "600", "700"],
});

async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const language = fallbackLanguage;
  // Fetch layout data (settings + menus) in a single GraphQL query
  const layoutData = await getLayoutData().catch(() => null);

  const primaryMenu =
    layoutData?.menus?.nodes?.find((m) => m.locations.includes("PRIMARY")) ??
    null;
  const secondaryMenu =
    layoutData?.menus?.nodes?.find((m) => m.locations.includes("SECONDARY")) ??
    null;
  const siteSettings = layoutData?.generalSettings ?? null;

  return (
    <html
      lang={language}
      dir={dir(language)}
      className={`${beVietnamPro.variable} ${notoSansSC.variable} ${playfairDisplay.variable}`}
    >
      <head>
        {/* Preconnect to WordPress media */}
        <link rel="preconnect" href="https://mekongsmile.com" />
      </head>
      <body className="bg-pageBackground">
        <NextTopLoader
          color="#2D5A27"
          height={3}
          showSpinner={false}
          shadow={false}
        />
        <QueryProvider>
          <ReactQueryDevtools initialIsOpen={false} />
          <ThemeProvider>
            <StoreLanguageProvider>
              <ConfirmDialogProvider>
                <TooltipProvider delayDuration={200}>
                  {primaryMenu && (
                    <ResponsiveAppBar
                      primaryMenu={primaryMenu}
                      siteTitle={siteSettings?.title ?? "Mekong Smile"}
                    />
                  )}
                  <Toaster
                    visibleToasts={5}
                    position="top-right"
                    theme="light"
                  />
                  <main>{children}</main>
                  {secondaryMenu && siteSettings && (
                    <Footer menu={secondaryMenu} siteSettings={siteSettings} />
                  )}
                </TooltipProvider>
              </ConfirmDialogProvider>
            </StoreLanguageProvider>
          </ThemeProvider>
        </QueryProvider>
        {process.env.NEXT_PUBLIC_GA4_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA4_ID} />
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
