/* eslint-disable @arthurgeron/react-usememo/require-memo */
import type { Metadata } from "next";
import { getServerTranslation } from "@/services/i18n";
import Payment from "./page-content";

type Params = {
  slug: string; // Định nghĩa slug là một thuộc tính
  language: string; // Giữ thuộc tính language nếu cần thiết
};

type Props = {
  params: Params; // Sử dụng kiểu Params cho props
  searchParams: Record<string, string | string[]>; // Có thể điều chỉnh tùy thuộc vào cấu trúc searchParams bạn cần
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { t } = await getServerTranslation(params.language, "booking");

  return {
    title: t("payment.offline.title"),
  };
}

export default async function Page({ params, searchParams }: Props) {
  return (
    <>
      <Payment params={params} searchParams={searchParams} />
    </>
  );
}
