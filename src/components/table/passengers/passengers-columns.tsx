import { useCallback } from "react";
import { Ticket } from "@/services/apis/tickets/types/ticket";
import { ColumnDef } from "@tanstack/react-table";
import { formatDate } from "date-fns";
import HeaderBookingDetail from "./header/header-passenger-table";
import { TicketGenderEnum } from "@/services/apis/tickets/types/ticket-gender-enum";
import { formatCurrency } from "@/lib/utils";
import {
  PassengerConfig,
  UpdatePassengerInfoProps,
} from "@/services/apis/passengers/types/passenger";
import { Button } from "@/components/ui/button";
import { RiPencilLine } from "react-icons/ri";
import {
  getTicketStatusColor,
  getTicketStatusName,
} from "@/lib/get-ticket-status";
import {
  getTicketPaymentStatusStyles,
  getTicketPaymentStatusText,
} from "../user-cancel-ticket-request/helper/helper";
import { TFunction } from "i18next";

// let passengerNationality: string = "Việt Nam A";
// const fetchOperatorNationality = useGetOperatorNationality();
// let operatorNationalities: OperatorNationality[] = [];
/**
 * Store nationality list of operator of departure voyage. Data from API
 */
//  const [operatorNationalities, setOperatorNationalities] =
//  useState<OperatorNationality[]>([]);

// async function fetchDepartOperatorNationality() {
//   if (props.operator_id) {
//     const { data, status } = await fetchOperatorNationality({
//       id: props.operator_id,
//     });

//     if (status === HTTP_CODES_ENUM.OK && data) {
//       console.log(data);
//       setOperatorNationalities(data as OperatorNationality[]);
//     }
//   }
// }

// if (props.operator_id) {
//   fetchDepartOperatorNationality();
//   console.log(operatorNationalities);
// }

export const getPassengerColumns = (
  config: PassengerConfig,
  handleEditPassenger: (passenger: UpdatePassengerInfoProps) => void,
  orderId?: string,
  bookingId?: string,
  isEdit?: boolean,
  t?: TFunction
): ColumnDef<Ticket>[] => {
  // Index column is always shown
  const baseColumns: ColumnDef<Ticket>[] = [
    {
      accessorKey: "id",
      header: () => <>#</>,
      cell: ({ row }) => <>{row.index + 1}</>,
    },
  ];

  if (isEdit) {
    baseColumns.unshift({
      accessorKey: "action",
      header: "Tác vụ",
      cell: ({ row }) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const onClick = useCallback(
          () =>
            handleEditPassenger({
              orderId: orderId ?? "",
              seatName: row.original.seat_name,
              bookingId: bookingId ?? "",
              passengerName: row.original.name,
              passengerSocialId: row.original.social_id,
              passengerConfig: config,
            }),
          [row.original.name, row.original.seat_name, row.original.social_id]
        );
        return (
          <div className="flex w-full items-center justify-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClick}
              className="h-8 w-8 p-0"
            >
              <RiPencilLine className="h-4 w-4" />
              <span className="sr-only">Edit</span>
            </Button>
          </div>
        );
      },
    });
  }

  // Info column (combines name, email, phone)
  if (config.full_name || config.email || config.phone_number) {
    baseColumns.push({
      id: "info",
      header: () => <HeaderBookingDetail t={"table.header.passenger"} />,
      cell: ({ row }) => {
        const { name, phone_number, email } = row.original;
        return (
          <div className="flex w-max flex-col">
            {config.full_name && <p className="text-sm">{name}</p>}
            {config.phone_number && (
              <a
                className="w-fit text-sm text-primary hover:underline"
                href={`tel:${phone_number}`}
                target="_blank"
              >
                {phone_number}
              </a>
            )}
            {config.email && (
              <a
                className="w-fit text-sm text-primary hover:underline"
                href={`mailto:${email}`}
                target="_blank"
              >
                {email}
              </a>
            )}
          </div>
        );
      },
    });
  }

  // Gender column
  if (config.gender) {
    baseColumns.push({
      accessorKey: "gender",
      header: () => <HeaderBookingDetail t={"table.header.gender.title"} />,
      cell: ({ row }) => {
        const title = `table.header.gender.${TicketGenderEnum[(row.getValue("gender") ?? 1) as TicketGenderEnum].toLowerCase()}`;
        return (
          <p className="text-sm">
            <HeaderBookingDetail t={title} />
          </p>
        );
      },
    });
  }

  // Date of birth column
  if (config.date_of_birth) {
    baseColumns.push({
      accessorKey: "date_of_birth",
      header: () => <HeaderBookingDetail t={"table.header.dob"} />,
      cell: ({ row }) => {
        const date_of_birth = formatDate(
          row.getValue("date_of_birth"),
          "dd/MM/yyyy"
        );
        return <p className="text-sm">{date_of_birth}</p>;
      },
    });
  }

  // Social ID column
  if (config.social_id) {
    baseColumns.push({
      accessorKey: "social_id",
      header: () => <HeaderBookingDetail t={"table.header.social-id"} />,
      cell: ({ row }) => {
        return <p className="text-sm">{row.getValue("social_id")}</p>;
      },
    });
  }

  // Address column
  if (config.address) {
    baseColumns.push({
      accessorKey: "home_town",
      header: () => <HeaderBookingDetail t={"table.header.address"} />,
      cell: ({ row }) => {
        return <p className="text-sm">{row.getValue("home_town")}</p>;
      },
    });
  }

  // Nationality column
  if (config.national_abbrev) {
    baseColumns.push({
      accessorKey: "national",
      header: () => <HeaderBookingDetail t={"table.header.nationality"} />,
      cell: ({ row }) => {
        return <p className="text-sm">{row.getValue("national")}</p>;
      },
    });
  }

  // Plate number column
  if (config.plate_number) {
    baseColumns.push({
      accessorKey: "plate_number",
      header: () => <HeaderBookingDetail t={"table.header.plate-number"} />,
      cell: ({ row }) => {
        return <p className="text-sm">{row.getValue("plate_number")}</p>;
      },
    });
  }

  // These columns are always shown as they're not part of the config
  const additionalColumns: ColumnDef<Ticket>[] = [
    {
      id: "seat",
      header: () => <HeaderBookingDetail t={"table.header.seat-code"} />,
      cell: ({ row }) => {
        const { seat_name, seat_type_code } = row.original;
        return (
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm">{seat_name}</p>
            </div>

            <div className="flex">
              <p className="text-sm font-semibold">
                <HeaderBookingDetail t={"table.cell.type"} />:{" "}
              </p>
              <p className="px-3">{seat_type_code}</p>
            </div>
          </div>
        );
      },
    },
    {
      id: "ticket",
      header: () => (
        <p>
          <HeaderBookingDetail t={"table.header.ticket"} />
        </p>
      ),
      cell: ({ row }) => {
        const { is_child, price, ticket_status, ticket_payment_status } =
          row.original;
        let ticketType = "table.cell.adult";
        if (is_child === true) {
          ticketType = "table.cell.children";
        }
        return (
          <div>
            <p className="text-sm">
              <HeaderBookingDetail t={"table.cell.price"} />:{" "}
              {formatCurrency(price)}
            </p>
            <div className="flex">
              <p className="text-sm font-semibold">
                <HeaderBookingDetail t={"table.cell.type"} />:{" "}
              </p>
              <p className="px-3">
                <HeaderBookingDetail t={ticketType} />
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <p
                className={`${getTicketStatusColor(ticket_status)} w-fit rounded-md px-2 py-1 text-xs`}
              >
                {getTicketStatusName(ticket_status)}
              </p>
              <span
                className={`flex w-fit items-center whitespace-nowrap rounded-md px-2 py-1 text-xs ${getTicketPaymentStatusStyles(ticket_payment_status)}`}
              >
                {getTicketPaymentStatusText(ticket_payment_status, t)}
              </span>
            </div>
          </div>
        );
      },
    },
  ];

  return [...baseColumns, ...additionalColumns];
};
