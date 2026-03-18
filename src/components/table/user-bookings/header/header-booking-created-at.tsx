import { useTranslation } from "@/services/i18n/client";
import { memo } from "react";

function HeaderBookingCreatedAt() {
  const { t } = useTranslation("user/bookings");

  return <>{t("table.header.created-date")}</>;
}

export default memo(HeaderBookingCreatedAt);
