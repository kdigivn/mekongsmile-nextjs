import { useTranslation } from "@/services/i18n/client";
import { memo } from "react";

function HeaderBookingId() {
  const { t } = useTranslation("user/bookings");

  return <>{t("table.header.id")}</>;
}

export default memo(HeaderBookingId);
