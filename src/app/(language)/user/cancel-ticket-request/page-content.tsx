"use client";

import { memo } from "react";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import UserCancelTicketRequestDataTable from "@/components/table/user-cancel-ticket-request/user-cancel-ticket-request-data-table";

function UserCancelTicketRequest() {
  return (
    <div className="lg:px-auto flex w-full max-w-screen-xl flex-col gap-4 px-5 py-2 md:container md:px-10 md:py-4">
      <div className="h-full w-full rounded-md bg-transparent p-0 shadow-none lg:mb-6 lg:flex lg:min-h-screen lg:justify-center lg:bg-white lg:shadow-md">
        <div className="flex w-full flex-col gap-3">
          {/* Table title */}
          <div className="flex p-3">
            <div className="flex">
              <h2 className="text-lg font-semibold text-foreground">
                Theo dõi hủy vé
              </h2>
            </div>
          </div>

          {/* Table */}
          <UserCancelTicketRequestDataTable limit={20} />
        </div>
      </div>
    </div>
  );
}

export default memo(withPageRequiredAuth(UserCancelTicketRequest));
