import { FileEntity } from "../../files/types/file-entity";
import { Organization } from "../../organizations/types/organization";
import { EInvoiceProvider } from "./invoice-provider.enum";
import { EInvoiceStatus } from "./invoice-status.enum";

export type Invoice = {
  id: string;

  orderId: string;

  bookingId: string;

  provider: EInvoiceProvider;

  providerInvoiceId?: string;

  lookupCode?: string;

  lookupUrl?: string;

  providerPdfUrl?: string;

  pdfFile?: FileEntity;

  status: EInvoiceStatus;

  providerResponse: Record<string, unknown>;

  errorMessage?: string;

  organization_id: Organization["id"];

  createdAt: Date;

  updatedAt: Date;
};
