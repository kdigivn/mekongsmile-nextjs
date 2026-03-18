import { TableCell } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Booking } from "@/services/apis/bookings/types/booking";
import { Cell, flexRender } from "@tanstack/react-table";
import React, { memo, useMemo } from "react";

type Props = {
  cell: Cell<Booking, unknown>;
  className?: string;
};
function CellWrapper({ cell, className }: Props) {
  const style = useMemo(
    () => ({ width: cell.column.getSize() }),
    [cell.column]
  );

  return (
    <TableCell
      key={cell.id}
      className={cn("border align-top", className)}
      style={style}
    >
      {flexRender(cell.column.columnDef.cell, cell.getContext())}
    </TableCell>
  );
}

export default memo(CellWrapper);
