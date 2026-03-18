/* eslint-disable @arthurgeron/react-usememo/require-memo */
import type { Metadata } from "next";
import ConfirmEmail from "./page-content";
import { getServerTranslation } from "@/services/i18n";
import { setSeoData, wpURLtoNextURL } from "@/lib/utils";
import { WordpressPage } from "@/services/infrastructure/wordpress/types/page";
import { PageGroupEnvKeyEnum } from "@/services/infrastructure/wordpress/enums/page-group-env-key-enum";
import { getEnvPage } from "@/services/infrastructure/wordpress/queries/getEnvSettings";

type Props = {
  params: { language: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page: WordpressPage | null = await getEnvPage(
    PageGroupEnvKeyEnum.CONFIRM_EMAIL
  );
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "";

  const { t } = await getServerTranslation(params.language, "confirm-email");

  if (page) {
    if (page?.seo) {
      const metaData = setSeoData(page);
      return {
        ...metaData,
        alternates: {
          canonical: baseUrl + "/" + page.slug,
        },
      } as Metadata;
    }

    return {
      // title,
      title: page?.seo.title,
      description: page?.seo.description,
      alternates: {
        canonical: baseUrl + "/" + page.slug,
      },
    } as Metadata;
  }

  return {
    title: t("title"),
  };
}

export default async function Page() {
  const page: WordpressPage | null = await getEnvPage(
    PageGroupEnvKeyEnum.CONFIRM_EMAIL
  );

  return (
    <>
      {/* Add JSON-LD to your page */}
      <div
        dangerouslySetInnerHTML={{
          __html: wpURLtoNextURL(page?.seo.jsonLd.raw ?? ""),
        }}
      />
      <ConfirmEmail />
    </>
  );
}
