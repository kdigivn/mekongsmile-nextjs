import { useTranslation } from "@/services/i18n/client";
import { memo } from "react";

function HeaderBookingTotalPrice() {
  const { t } = useTranslation("user/bookings");

  return <>{t("table.header.total")}</>;
}

export default memo(HeaderBookingTotalPrice);
