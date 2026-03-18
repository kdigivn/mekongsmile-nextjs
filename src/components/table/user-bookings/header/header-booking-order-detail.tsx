import { useTranslation } from "@/services/i18n/client";
import { memo } from "react";

function HeaderBookingOrderDetail() {
  const { t } = useTranslation("user/bookings");

  return <>{t("table.header.order-detail")}</>;
}

export default memo(HeaderBookingOrderDetail);
