import { useTranslation } from "@/services/i18n/client";
import { memo } from "react";

type Props = {
  t: string;
};
function HeaderVoyageTable(props: Props) {
  const { t } = useTranslation("home");

  return <>{t(props.t)}</>;
}

export default memo(HeaderVoyageTable);
