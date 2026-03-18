import { TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "@/services/i18n/client";
import React, { memo, useCallback } from "react";

type Props = {
  tabValue: number;
  onTabClick?: (tabValue: string) => void;
};
function BoatLayoutTabTrigger({ tabValue, onTabClick }: Props) {
  const { t } = useTranslation("ticket-detail");

  const handleOnTabClick = useCallback(() => {
    if (onTabClick) {
      onTabClick(tabValue.toString());
    }
  }, [tabValue, onTabClick]);

  return (
    <TabsTrigger
      key={tabValue}
      value={tabValue.toString()}
      onClick={handleOnTabClick}
      className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
    >
      {tabValue === 0 ? "Tầng trệt" : `${t("boat-layout.floor")} ${tabValue}`}
    </TabsTrigger>
  );
}

export default memo(BoatLayoutTabTrigger);
