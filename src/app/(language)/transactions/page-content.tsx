"use client";

import { useTranslation } from "@/services/i18n/client";
import { memo } from "react";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import PaymentHistoryTable from "@/components/table/transaction/payment-history-table";
import { paymentHistoryColumns } from "@/components/table/transaction/payment-history-columns";

function Transactions() {
  const { t } = useTranslation("user/transactions");

  return (
    <div className="lg:px-auto flex w-full max-w-screen-xl flex-col gap-4 px-5 py-2 md:container md:px-10 md:py-4">
      <div className="h-full w-full rounded-md bg-transparent p-0 shadow-none lg:mb-6 lg:flex lg:min-h-screen lg:justify-center lg:bg-white lg:shadow-md">
        <div className="flex w-full flex-col gap-3">
          {/* Table title */}
          <div className="flex p-3">
            <div className="flex gap-3">
              <h2 className="text-lg font-semibold text-foreground">
                {t("table.title")}
              </h2>
            </div>
          </div>

          {/* Table */}
          <PaymentHistoryTable
            columns={paymentHistoryColumns}
          ></PaymentHistoryTable>
        </div>
      </div>
    </div>
  );
}

export default memo(withPageRequiredAuth(Transactions));
