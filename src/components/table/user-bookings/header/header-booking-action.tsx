import { useTranslation } from "@/services/i18n/client";
import { memo } from "react";

function HeaderBookingAction() {
  const { t } = useTranslation("user/bookings");

  return <>{t("table.header.action")}</>;
}

export default memo(HeaderBookingAction);
