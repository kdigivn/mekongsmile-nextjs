"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { memo } from "react";
import { useTranslation } from "@/services/i18n/client";
import { IssueTicketSpeedEnum } from "@/services/apis/operators/enums/issue-ticket-speed.enum";
import {
  TooltipResponsive,
  TooltipResponsiveTrigger,
  TooltipResponsiveContent,
} from "../tooltip-responsive";

interface TicketSpeedBadgeProps {
  speed: IssueTicketSpeedEnum;
  className?: string;
}

function TicketSpeedBadge({ speed, className }: TicketSpeedBadgeProps) {
  const { t } = useTranslation("home");

  const config = {
    [IssueTicketSpeedEnum.INSTANT]: {
      label: t("table.cell.issue-ticket-speed.instant.label"),
      description: t("table.cell.issue-ticket-speed.instant.description"),
      subLabel: "",
      textColor: "text-red-600",
      bgColor: "bg-red-600",
      borderColor: "border-red-600",
    },
    [IssueTicketSpeedEnum.FAST]: {
      label: t("table.cell.issue-ticket-speed.fast.label"),
      description: t("table.cell.issue-ticket-speed.fast.description"),
      subLabel: "2h",
      textColor: "text-orange-600",
      bgColor: "bg-orange-600",
      borderColor: "border-error-600",
    },
    [IssueTicketSpeedEnum.STANDARD]: {
      label: t("table.cell.issue-ticket-speed.standard.label"),
      description: t("table.cell.issue-ticket-speed.standard.description"),
      subLabel: "4h",
      textColor: "text-orange-400",
      bgColor: "bg-orange-400",
      borderColor: "border-orange-400",
    },
    [IssueTicketSpeedEnum.SLOW]: {
      label: t("table.cell.issue-ticket-speed.slow.label"),
      description: t("table.cell.issue-ticket-speed.slow.description"),
      subLabel: "1d",
      textColor: "text-warning-500",
      bgColor: "bg-warning-600",
      borderColor: "border-warning-600",
    },
  };

  const { label, description, subLabel, textColor, bgColor, borderColor } =
    config[speed];

  const BadgeContent = () => (
    <div
      className={cn(
        "flex items-center rounded-none border border-solid p-0 text-xs",
        borderColor,
        className
      )}
    >
      <div className={cn("w-full px-0.5 text-white", bgColor)}>{label}</div>
      {subLabel && (
        <div className={cn("h-full bg-white px-0.5 font-light", textColor)}>
          {subLabel}
        </div>
      )}
    </div>
  );

  return (
    <TooltipResponsive>
      <TooltipResponsiveTrigger asChild>
        <Button variant="ghost" className="h-auto p-0">
          <BadgeContent />
        </Button>
      </TooltipResponsiveTrigger>
      <TooltipResponsiveContent className="w-auto max-w-[80vw] p-2">
        <p className="text-sm">{description}</p>
      </TooltipResponsiveContent>
    </TooltipResponsive>
  );
}

export default memo(TicketSpeedBadge);
