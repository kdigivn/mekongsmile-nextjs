/* eslint-disable @arthurgeron/react-usememo/require-usememo */
/* eslint-disable @arthurgeron/react-usememo/require-memo */
import { getServerTranslation } from "@/services/i18n";
import { Metadata } from "next";
import { redirect } from "next/navigation";

type Props = {
  params: { language: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { t } = await getServerTranslation(params.language, "search");

  return {
    title: t("title"),
  };
}

export default async function Page({ params }: Props) {
  redirect(`/${params.language}`);
}
