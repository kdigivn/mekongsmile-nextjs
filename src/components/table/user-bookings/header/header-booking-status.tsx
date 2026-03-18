import { useTranslation } from "@/services/i18n/client";
import { memo } from "react";

function HeaderBookingStatus() {
  const { t } = useTranslation("user/bookings");

  return <>{t("table.header.status")}</>;
}

export default memo(HeaderBookingStatus);
