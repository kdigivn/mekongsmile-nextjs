import { useTranslation } from "@/services/i18n/client";
import { memo } from "react";

type Props = {
  t: string;
};
function HeaderBookingDetail(props: Props) {
  const { t } = useTranslation("user/booking-detail");

  return <>{t(props.t)}</>;
}

export default memo(HeaderBookingDetail);
