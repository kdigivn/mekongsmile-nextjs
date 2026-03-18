"use client";
import { objectToArray } from "@/services/helpers/objectUtils";
import { memo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { RiArrowRightLine } from "react-icons/ri";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/services/i18n/client";
import {
  LocalFormKey,
  LocalSelectedTicketFormData,
} from "@/services/form/types/form-types";
import { TicketDetailParams } from "@/services/apis/tickets/types/ticket-detail-params";
import { Voyage, VoyageItem } from "@/services/apis/voyages/types/voyage";

type Props = {
  departVoyage: VoyageItem;
  customizeSelectAction?: (voyage: VoyageItem) => void;
};
function SearchVoyage({ departVoyage, customizeSelectAction }: Props) {
  const router = useRouter();
  const { t } = useTranslation("home");

  const handleGoToTicketDetail = useCallback(
    (selectVoyage: Voyage) => {
      // When user is at departure tab
      const queryParams: TicketDetailParams = {};

      const ticketFormData: LocalSelectedTicketFormData = {
        selectedVoyages: {
          departVoyage: selectVoyage,
        },
        numberOfPassengers: 1,
      };
      queryParams.departVoyageId = selectVoyage.id;
      localStorage.setItem(
        LocalFormKey.selectedTicketData,
        JSON.stringify(ticketFormData)
      );
      queryParams.numberOfPassengers = 1;

      // Create query path. Add a timestamp to trigger API fetch when click search button
      const path = `/ticket-detail?${objectToArray(queryParams)
        .filter((item) => item.value)
        .map((item) => `${item.key}=${item.value}`)
        .join("&")}`;
      router.push(path);
    },
    [router]
  );

  const handleOnClick = useCallback(() => {
    if (customizeSelectAction) {
      customizeSelectAction(departVoyage);
    } else {
      handleGoToTicketDetail(departVoyage.voyage);
    }
  }, [customizeSelectAction, departVoyage, handleGoToTicketDetail]);

  return (
    <>
      <Button
        className="choose-voyage-button flex h-auto w-fit justify-center gap-2 bg-primary-600"
        id={`btn-choose-voyage-${departVoyage.voyage.id}`}
        onClick={handleOnClick}
      >
        <span>{t("table.action")}</span>
        <RiArrowRightLine className="hidden text-lg lg:block" />
      </Button>
    </>
  );
}

export default memo(SearchVoyage);
