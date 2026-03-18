"use client";
import { ColumnDef } from "@tanstack/react-table";
import { VoyageItem } from "../../../services/apis/voyages/types/voyage";
import Image from "next/image";
import { format } from "date-fns";
import Search from "./search";
import HeaderVoyageTable from "./header/header-voyage-table";
import { BsSortAlphaDown, BsSortAlphaUp } from "react-icons/bs";
import CellTicketPrice from "./cell/cell-ticket-price";
import TicketSpeedBadge from "@/components/badge/ticket-speed-badge";
import { IssueTicketSpeedEnum } from "@/services/apis/operators/enums/issue-ticket-speed.enum";

export const voyagesColumns = (
  toggleSorting: (id: string) => void,
  customizeSelectAction?: (voyage: VoyageItem) => void
): ColumnDef<VoyageItem>[] => [
  {
    accessorKey: "route",
    header: ({ column }) => (
      <div
        onClick={() => toggleSorting("route")} // Call the sorting function on click
        className="flex cursor-pointer flex-row items-center justify-between gap-1"
      >
        <HeaderVoyageTable t={"table.header.route"} />
        {column.getIsSorted() === "asc" ? (
          <BsSortAlphaDown className="h-6 w-6 flex-none" />
        ) : column.getIsSorted() === "desc" ? (
          <BsSortAlphaUp className="h-6 w-6 flex-none" />
        ) : (
          ""
        )}
      </div>
    ),
    cell: ({ row }) => {
      const { operator, route } = row.original.voyage;
      const operatorImage =
        operator?.operator_logo?.path ??
        "/static-img/condao.expressfavicon.png";

      return (
        <div className="flex items-center gap-2">
          <div className="relative h-10 w-10 flex-none rounded-s-full">
            <Image
              src={operatorImage}
              alt={`${operator?.operator_name}`}
              width={40}
              height={40}
              loading="lazy"
              className="h-full w-full rounded-s-full"
              unoptimized
            />
          </div>
          <div className="">
            {`${route?.departure_name} - ${route?.destination_name}`}{" "}
          </div>
        </div>
      );
    },
    sortingFn: (rowA, rowB) => {
      const locationA = rowA.original.voyage.route?.departure_name || "";
      const locationB = rowB.original.voyage.route?.departure_name || "";
      return locationA.localeCompare(locationB);
    },
  },

  {
    accessorKey: "boat_name",
    header: () => <HeaderVoyageTable t={"table.header.boat-name"} />,
    cell: ({ row }) => {
      const { operator, boat_name } = row.original.voyage;
      return (
        <div className="flex flex-col">
          <p>{`${boat_name ?? operator?.operator_name}`}</p>
          <div className="flex items-center gap-1 text-sm text-default-600">
            <TicketSpeedBadge
              speed={
                operator?.configs?.issue_ticket_speed as IssueTicketSpeedEnum
              }
            />
            {`${operator?.operator_name}`}
          </div>
          {/* <p className="text-default-600">{`${operator?.operator_name}`}</p> */}
        </div>
      );
    },
  },

  {
    accessorKey: "depart_time",
    header: ({ column }) => (
      <div
        onClick={() => toggleSorting("depart_time")} // Sorting for departure time
        className="flex cursor-pointer flex-row items-center justify-between gap-1"
      >
        <HeaderVoyageTable t={"table.header.depart-time"} />
        {column.getIsSorted() === "asc" ? (
          <BsSortAlphaDown className="h-6 w-6 flex-none" />
        ) : column.getIsSorted() === "desc" ? (
          <BsSortAlphaUp className="h-6 w-6 flex-none" />
        ) : (
          ""
        )}
      </div>
    ),
    cell: ({ row }) => {
      const { depart_time, departure_date } = row.original.voyage;
      return (
        <div className="whitespace-nowrap">
          <span className="hover:text-primary">
            {`${format(new Date(`${departure_date}T${depart_time}`), "HH:mm dd/MM/yyyy")}`}{" "}
          </span>
        </div>
      );
    },
  },

  {
    accessorKey: "no_remain",
    header: () => (
      <div className="text-center">
        <HeaderVoyageTable t={"table.header.available-seat"} />
      </div>
    ),
    cell: ({ row }) => {
      const { no_remain } = row.original.voyage;
      return (
        <div className="whitespace-nowrap text-center">
          {no_remain >= 100 ? "100+" : no_remain > 0 ? "20+" : 0}
        </div>
      );
    },
  },

  {
    accessorKey: "ticket_prices",
    header: () => (
      <div className="max-w-28 text-center">
        <HeaderVoyageTable t={"table.header.price"} />
      </div>
    ),
    cell: ({ row }) => {
      // const { ticket_prices } = row.original.voyage;
      // const formatted = new Intl.NumberFormat("en-US", {
      //   style: "currency",
      //   currency: "VND",
      // }).format(ticket_prices.default_ticket_price);

      return (
        <CellTicketPrice voyageItem={row.original} />
        // <div className="whitespace-nowrap text-center font-semibold text-primary">
        //   {`${formatted}`}
        // </div>
      );
    },
  },

  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      if (row.original) {
        return (
          <div className="flex items-center justify-center">
            <Search
              departVoyage={row.original}
              customizeSelectAction={customizeSelectAction}
            />
          </div>
        );
      }
      return null; // return null if the required values are not present
    },
  },
];
