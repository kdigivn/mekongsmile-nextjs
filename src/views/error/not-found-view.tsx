"use client";

import { Button } from "@/components/ui/button";
import { buildApiPath } from "@/services/apis/build-api-path";
import { FerryTicketApiEndpoints } from "@/services/apis/endpoints";
import { useTranslation } from "@/services/i18n/client";
import { Image, Link } from "@heroui/react";
import { useEffect, useState } from "react";
// ----------------------------------------------------------------------

type Props = {
  messageTitle?: string;
  messageDesription?: string;
};
function NotFoundView({
  messageTitle = "trang",
  messageDesription = "Xin lỗi, chúng tôi không thể tìm thấy trang bạn đang tìm kiếm. Có lẽ bạn đã gõ nhầm URL? Hãy chắc chắn kiểm tra chính tả của bạn!",
}: Props) {
  const { t } = useTranslation("booking");
  const [notFoundImagePath, setNotFoundImagePath] = useState(
    "/static-img/empty-search.svg"
  );

  useEffect(() => {
    async function getNotFoundImage() {
      const fetchUrl = buildApiPath(
        FerryTicketApiEndpoints.cms.getNotFoundImage
      );
      const response = await fetch(fetchUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json", // Adjust the content type as needed
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      setNotFoundImagePath(data);
    }

    getNotFoundImage();
  }, []);

  return (
    <div className="flex h-svh min-h-screen items-center justify-center rounded-lg bg-white">
      <div className="flex h-full max-w-96 flex-col items-center justify-center gap-4 text-center">
        <Image
          src={notFoundImagePath}
          alt="Empty blog"
          height={200}
          width={200}
          loading="lazy"
          className="h-60 w-60 !rounded-none object-cover"
        />
        <h2 className="text-center text-xl font-semibold md:text-2xl lg:text-3xl">
          {t("error.sorry")},{" "}
          <span className="text-primary">{t("error.not-found")}</span>{" "}
          {messageTitle}!
        </h2>
        <p className="text-sm font-normal sm:text-base lg:text-lg">
          {messageDesription}
        </p>
        <Button
          asChild
          className="h-9 text-sm font-semibold sm:h-10 md:text-base lg:h-12"
        >
          <Link href="/">{t("error.return-home")}</Link>
        </Button>
      </div>
    </div>
  );
}

export default NotFoundView;
