import CopyButton from "@/components/button/copy-button";
import LinkBase from "@/components/link-base";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { EInvoiceStatus } from "@/services/apis/invoices/types/invoice-status.enum";
import { Order } from "@/services/apis/orders/types/order";
import { useTranslation } from "@/services/i18n/client";
import { TFunction } from "i18next";
import { memo, useMemo } from "react";
import { LuDownload, LuExternalLink } from "react-icons/lu";

interface Props {
  order: Order;
}

const getStatusChipProps = (
  status: EInvoiceStatus,
  translation: TFunction<"translation", undefined>
) => {
  switch (status) {
    case EInvoiceStatus.ISSUED:
      return {
        label: translation("status.ISSUED"),
        variant: "default" as const,
        colorClass: "bg-primary",
      };
    case EInvoiceStatus.FAILED:
      return {
        label: translation("status.FAILED"),
        variant: "destructive" as const,
        colorClass: "bg-danger",
      };
    case EInvoiceStatus.CANCELED:
      return {
        label: translation("status.CANCELED"),
        variant: "default" as const,
        colorClass: "bg-default",
      };
    case EInvoiceStatus.PENDING:
      return {
        label: translation("status.PENDING"),
        variant: "warning" as const,
        colorClass: "bg-warning",
      };
    default:
      return {
        label: translation("status.unknown", { status }),
        variant: "outline" as const,
        colorClass: "bg-default",
      };
  }
};

const EInvoiceInformationSection = ({ order }: Props) => {
  const { t } = useTranslation("user/booking-detail");
  const { t: invoiceTranslation } = useTranslation("booking/invoice");
  const { eInvoice } = order;

  const statusChipProps = useMemo(
    () =>
      eInvoice ? getStatusChipProps(eInvoice.status, invoiceTranslation) : null,
    [eInvoice, invoiceTranslation]
  );

  if (!eInvoice) {
    return (
      <p className="text-sm text-muted-foreground">
        {t("e-invoice.not-found")}
      </p>
    );
  }

  return (
    <div className="flex flex-col space-y-3 p-1">
      {/* Status */}
      <div className="flex items-center space-x-2">
        <p className="text-sm font-medium">{`${t("e-invoice.status-label")}:`}</p>
        {/* Giả sử bạn có hàm getStatusVariant để trả về 'destructive', 'outline', etc. */}
        {statusChipProps && (
          <Badge
            variant={statusChipProps.variant}
            className={cn(
              statusChipProps.colorClass,
              `hover:${statusChipProps.colorClass}`
            )}
          >
            {statusChipProps.label}
          </Badge>
        )}
      </div>

      {/* Lookup Code */}
      {eInvoice.lookupCode && (
        <div className="flex items-center space-x-2">
          <p className="min-w-[80px] text-sm font-medium">
            {`${t("e-invoice.lookup-code-label")}:`}
          </p>
          <div className="flex items-center gap-1">
            <p className="break-all text-sm">{eInvoice.lookupCode}</p>
            <CopyButton textToCopy={eInvoice.lookupCode} />
          </div>
        </div>
      )}

      {/* Lookup URL & PDF File */}
      {eInvoice.lookupUrl && (
        <div className="flex items-center space-x-2">
          <p className="min-w-[80px] text-sm font-medium">
            {`${t("e-invoice.lookup-url.label")}:`}
          </p>
          <LinkBase
            href={eInvoice.lookupUrl}
            target="_blank"
            className="flex items-center text-sm text-primary hover:underline"
          >
            {t("e-invoice.lookup-url.open-link")}
            <LuExternalLink className="ml-1.5 h-4 w-4" />
          </LinkBase>
        </div>
      )}
      {eInvoice.pdfFile && (
        <div className="flex items-center space-x-2">
          <p className="min-w-[80px] text-sm font-medium">
            {`${t("e-invoice.pdf-file.label")}:`}
          </p>
          <LinkBase
            href={eInvoice.pdfFile.path}
            className="flex items-center text-sm text-primary hover:underline"
          >
            {t("e-invoice.pdf-file.download")}
            <LuDownload className="ml-1.5 h-4 w-4" />
          </LinkBase>
        </div>
      )}

      {eInvoice.status === EInvoiceStatus.FAILED && (
        <p className="text-sm font-medium text-destructive">
          {t("e-invoice.errors-label")}
        </p>
      )}
    </div>
  );
};

export default memo(EInvoiceInformationSection);
