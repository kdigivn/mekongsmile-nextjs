import { useMemo } from "react";
import { useTranslation } from "@/services/i18n/client";

const useTourSteps = () => {
  const { t: ticketDetailTranslation } = useTranslation("ticket-detail");
  const steps = useMemo(
    () => [
      {
        selector: ".first-step",
        content: (
          <p className="text-sm">
            {ticketDetailTranslation("steps.first-step")}
          </p>
        ),
      },
      // Các bước khác
    ],
    [ticketDetailTranslation]
  );

  return steps;
};

export default useTourSteps;
