import { Button } from "@/components/ui/button";
import { useTranslation } from "@/services/i18n/client";

import { memo } from "react";
import { MdArrowDownward } from "react-icons/md";

type Props = {
  t: string;
};
function HeaderTransactionTotal(props: Props) {
  const { t } = useTranslation("user/transaction");

  return (
    <div className="flex items-center gap-1">
      <p className="font-bold">{t(props.t)}</p>
      <Button
        className="h-6 w-6 min-w-0 flex-none rounded border-none bg-transparent p-1 text-black shadow-none hover:bg-default-300"
        size={"icon"}
      >
        <MdArrowDownward className="h-6 w-6 font-bold" />
      </Button>
    </div>
  );
}

export default memo(HeaderTransactionTotal);
