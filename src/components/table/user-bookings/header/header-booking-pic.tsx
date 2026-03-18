import { useTranslation } from "@/services/i18n/client";
import { memo } from "react";

function HeaderBookingPIC() {
  const { t } = useTranslation("user/bookings");

  return <>{t("table.header.pic-name")}</>;
}

export default memo(HeaderBookingPIC);
