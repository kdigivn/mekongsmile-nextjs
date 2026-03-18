import { useTranslation } from "@/services/i18n/client";
import { memo } from "react";

type Props = {
  t: string;
};
function HeaderTransactionTable(props: Props) {
  const { t } = useTranslation("user/transaction");

  return <p className="font-bold">{t(props.t)}</p>;
}

export default memo(HeaderTransactionTable);
