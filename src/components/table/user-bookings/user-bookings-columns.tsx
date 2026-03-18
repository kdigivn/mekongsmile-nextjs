"use client";

import ChipBookingStatus from "@/components/chip/chip-booking-status";
import { Separator } from "@/components/ui/separator";
import { Booking } from "@/services/apis/bookings/types/booking";
import { ColumnDef } from "@tanstack/react-table";
import { formatDate } from "date-fns";
import CellOrderDetail from "./cell/cell-order-detail";
import HeaderBookingId from "./header/header-booking-id";
import HeaderBookingPic from "./header/header-booking-pic";
import HeaderBookingOrderDetail from "./header/header-booking-order-detail";
import HeaderBookingTotalPrice from "./header/header-booking-total-price";
import HeaderBookingStatus from "./header/header-booking-status";
import LinkBase from "@/components/link-base";
import HeaderBookingAction from "./header/header-booking-action";
import CellAction from "./cell/cell-action";
import { OrderStatusEnum } from "@/services/apis/orders/types/order-status-enum";
import { Badge } from "@/components/ui/badge";
import {
  getIssueTicketSpeedLabel,
  IssueTicketSpeedEnum,
} from "@/services/apis/operators/enums/issue-ticket-speed.enum";
import CellTotalAmount from "./cell/cell-total-amount";

export const userBookingColumns: ColumnDef<Booking>[] = [
  {
    accessorKey: "id",
    header: () => <HeaderBookingId />,
    cell: ({ row }) => {
      const { createdAt } = row.original;

      const date = formatDate(createdAt, "HH:mm dd/MM/yyyy");
      return (
        <div className="flex flex-col">
          <LinkBase
            href={`/user/bookings/${row.getValue("id")}`}
            className="tex-md w-[90px] truncate font-semibold text-primary no-underline hover:underline"
          >
            {row.getValue("id")}
          </LinkBase>
          <p className="w-[140px] text-sm">{date}</p>
        </div>
      );
    },
    size: 150,
  },
  {
    id: "pic",
    header: () => <HeaderBookingPic />,
    cell: ({ row }) => {
      const { orderer_name, phone_number, contact_email, orderer_social_id } =
        row.original;

      return (
        <div className="w-[280px]">
          <p className="truncate text-sm">
            Tên: <span className="text-primary">{orderer_name}</span>
          </p>
          <p className="truncate text-sm">
            SĐT:{" "}
            <a
              className="w-fit text-primary hover:underline"
              href={`tel:${phone_number}`}
              target="_blank"
            >
              {phone_number}
            </a>
          </p>
          <p className="truncate text-sm">
            Email:{" "}
            <a
              className="w-fit text-primary hover:underline"
              href={`mailto:${contact_email}`}
              target="_blank"
            >
              {contact_email}
            </a>
          </p>
          {orderer_social_id && (
            <p className="truncate text-sm">
              CCCD: <span className="text-primary">{orderer_social_id}</span>
            </p>
          )}
        </div>
      );
    },
    size: 280,
  },
  {
    id: "order",
    header: () => <HeaderBookingOrderDetail />,
    cell: ({ row }) => {
      const { depart_order, return_order } = row.original;

      if (depart_order) {
      }

      return (
        <div className="min-w-[400px]">
          {depart_order && <CellOrderDetail order={depart_order} />}
          {depart_order && return_order && (
            <Separator className="my-4" decorative />
          )}
          {return_order && <CellOrderDetail order={return_order} />}
        </div>
      );
    },
    size: 400,
  },
  {
    accessorKey: "total_price",
    header: () => <HeaderBookingTotalPrice />,
    cell: ({ row }) => <CellTotalAmount booking={row.original} />,
    size: 350,
  },
  {
    accessorKey: "booking_status",
    header: () => <HeaderBookingStatus />,
    cell: ({ row }) => {
      const { depart_order, return_order } = row.original;
      let issue_ticket_speed =
        depart_order?.voyage?.operator?.configs.issue_ticket_speed;
      let is_manual = issue_ticket_speed !== IssueTicketSpeedEnum.INSTANT;
      let checkOrder = is_manual ? depart_order : return_order;
      let issueTicketLabel: { title: string; description?: string } = {
        title: "",
      };
      if (!is_manual && return_order) {
        issue_ticket_speed =
          return_order?.voyage?.operator?.configs.issue_ticket_speed;
        is_manual = issue_ticket_speed !== IssueTicketSpeedEnum.INSTANT;
        if (is_manual) {
          checkOrder = return_order;
        } else {
          issueTicketLabel = getIssueTicketSpeedLabel(
            issue_ticket_speed as IssueTicketSpeedEnum
          );
        }
      } else {
        issueTicketLabel = getIssueTicketSpeedLabel(
          issue_ticket_speed as IssueTicketSpeedEnum
        );
      }
      return (
        <div className="flex min-w-[140px] flex-col gap-2">
          <ChipBookingStatus status={row.getValue("booking_status")} />
          {is_manual && (
            <Badge variant="warning">
              {checkOrder.order_status === OrderStatusEnum.WaitForIssue
                ? "Đơn chờ xuất vé"
                : issueTicketLabel.title}
            </Badge>
          )}
        </div>
      );
    },
    size: 150,
  },
  {
    accessorKey: "booking_action",
    header: () => <HeaderBookingAction />,
    cell: ({ row }) => {
      const { depart_order, return_order } = row.original;
      return (
        <CellAction depart_order={depart_order} return_order={return_order} />
      );
    },
    size: 200,
  },
];
