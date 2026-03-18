import { useMobileBottomNavActions } from "@/components/footer/footer-mobile-contact-buttons/use-mobile-bottom-nav-actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Route } from "@/services/apis/routes/types/route";
import { useEffect } from "react";

type Props = {
  isOpen: boolean;
  onAgree: () => void;
  route: Route;
};
function ModalRouteForVietnamese({ isOpen, onAgree, route }: Props) {
  const { hideNav, showNav } = useMobileBottomNavActions();

  useEffect(() => {
    if (isOpen) {
      hideNav();
    } else {
      showNav();
    }
  }, [hideNav, isOpen, showNav]);

  return (
    <Dialog open={isOpen}>
      <DialogContent className="">
        <DialogTitle>Lưu ý / Attention</DialogTitle>
        <DialogDescription className="sr-only">{`Tuyến tàu ${route.departure_name}-${route.destination_name} này chỉ dành cho công dân Việt Nam`}</DialogDescription>
        <div>
          <p>
            Tuyến tàu{" "}
            <b>{`${route.departure_name}-${route.destination_name}`}</b> này chỉ
            cho phép công dân Việt Nam đặt vé!
          </p>
          <p>
            The route{" "}
            <b>{`${route.departure_name}–${route.destination_name}`}</b> is only
            available for booking by Vietnamese citizens!
          </p>
        </div>
        <DialogFooter className="">
          <Button onClick={onAgree}>OK</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ModalRouteForVietnamese;
