import { FileEntity } from "../../files/types/file-entity";
import { EInvoiceProvider } from "../../invoices/types/invoice-provider.enum";
import { EInvoiceStatus } from "../../invoices/types/invoice-status.enum";

/**
 * Hold commonly used data of invoice for order
 */
export type EmbeddedEInvoice = {
  id: string;

  provider: EInvoiceProvider;

  providerInvoiceId: string;

  lookupCode?: string;

  lookupUrl?: string;
  providerPdfUrl?: string;

  pdfFile?: FileEntity;

  status: EInvoiceStatus;
  errorMessage?: string;
};
