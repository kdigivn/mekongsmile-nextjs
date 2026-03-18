import { useTranslation } from "@/services/i18n/client";
import { MdOutlineWarning } from "react-icons/md";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { IoCloseOutline } from "react-icons/io5";
import { memo } from "react";

function ToasterMaxSeat({ toastId }: { toastId: string | number }) {
  const { t: ticketDetailTranslation } = useTranslation("ticket-detail");
  return (
    <div className="flex items-center justify-center gap-3 rounded-lg bg-background p-1 shadow-md">
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-danger-100">
        <MdOutlineWarning className="h-6 w-6 text-danger" />{" "}
      </div>
      <p className="text-sm font-semibold">
        {ticketDetailTranslation("selected-seats.limit")}
      </p>
      <Button
        className="flex h-7 w-7 items-center justify-center p-0"
        variant={"ghost"}
        // eslint-disable-next-line @arthurgeron/react-usememo/require-usememo
        onClick={() => toast.dismiss(toastId)}
      >
        <IoCloseOutline className="h-6 w-6" />
      </Button>
    </div>
  );
}

export default memo(ToasterMaxSeat);
