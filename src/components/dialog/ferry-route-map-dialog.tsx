import { memo, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslation } from "@/services/i18n/client";
import { Route } from "@/services/apis/routes/types/route";
import { useMobileBottomNavActions } from "../footer/footer-mobile-contact-buttons/use-mobile-bottom-nav-actions";
import { Skeleton } from "../ui/skeleton";
import dynamic from "next/dynamic";
import { useGetLocations } from "@/services/apis/locations/locations.service";

type Props = {
  open: boolean;
  handleClose: () => void;
  selectedRoute?: Route;
};

const FerryMap = dynamic(() => import("@/components/map"), {
  loading: () => <Skeleton className="h-full w-full bg-neutral-200"></Skeleton>,
  ssr: false,
});

function FerryRouteMapDialog({ open, handleClose, selectedRoute }: Props) {
  const { t: filterTranslation } = useTranslation("search/filter-and-sort");
  const { locations } = useGetLocations();
  const { hideNav, showNav } = useMobileBottomNavActions();

  useEffect(() => {
    if (open) {
      hideNav();
    } else {
      showNav();
    }
  }, [hideNav, open, showNav]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="h-full max-w-2xl !rounded-none md:h-auto md:!rounded-lg">
        <DialogTitle className="hidden">map</DialogTitle>
        <DialogDescription
          className="!hidden"
          aria-describedby="map"
        ></DialogDescription>
        <div className="flex flex-col gap-2">
          <p className="text-base font-semibold">
            {filterTranslation("map-modal.title", {
              departLocationName: selectedRoute?.departure_name,
              destiLocationName: selectedRoute?.destination_name,
            })}
          </p>

          {/* <Button
            className={cn(
              "flex h-9 w-9 flex-row items-center justify-center gap-1 rounded-lg bg-primary-100 p-2"
            )}
            onClick={handleClose}
          >
            <MdClose className="h-6 w-6 text-primary-800" />
          </Button> */}

          {open && (
            <FerryMap
              mapId="map_dialog"
              className="h-full md:h-[300px]"
              classNameTooltip="z-[1000]"
              selectedRoute={selectedRoute}
              locations={locations}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default memo(FerryRouteMapDialog);
