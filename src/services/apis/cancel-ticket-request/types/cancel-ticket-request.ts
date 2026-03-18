import { FileEntity } from "../../files/types/file-entity";
import { Order } from "../../orders/types/order";
import { Organization } from "../../organizations/types/organization";
import { Ticket } from "../../tickets/types/ticket";
import { User } from "../../users/types/user";
import { CancelTicketRequestProcessStatusEnum } from "./cancel-ticket-request-process-status.enum";

export type CancelTicketRequestOrganizationRelated = {
  org_id: Organization["id"];
  organization_detail: {
    name: Organization["name"];
    logo: FileEntity["path"];
  };
  request_process_status: CancelTicketRequestProcessStatusEnum;
  parent_org_id: string | null;
  is_root: boolean;
  total_refund_amount?: number;
  total_cancel_fee?: number;
  total_service_fee?: number;
  max_refund_amount?: number;
  hasRefund: boolean;
  refund_note?: string;
  acceptedBy?: User["id"] | null;
  refundedBy?: User["id"] | null;
  order: Order | null;
};

export type CancelTicketRequest = {
  id: string;
  organization_id: Organization["id"];
  organization_related: CancelTicketRequestOrganizationRelated[];
  order_id: Order["id"];
  cancel_ticket_by_positions: Ticket["position_id"][];
  cancel_reason: string;
  // refund_status: CancelTicketRequestRefundStatusEnum;
  process_status: CancelTicketRequestProcessStatusEnum;
  created_by: string;
  creator?: User | null;
  reject_message?: string;
  recall_message?: string;
  is_recall: boolean;
  createdAt: Date;
  updatedAt: Date;
  booking_id?: string;
};

export type UseFindOneCancelTicketRequestByIdResponse = {
  cancelTicketRequest: CancelTicketRequest;
  cancelTicketRequestLoading: boolean;
  cancelTicketRequestError: Error | null;
  cancelTicketRequestRefetch: () => void;
};

export type CancelTicketRequestSortItem = {
  orderBy?: string;
  order?: string;
};

export type FilterCancelTicketRequestItem = {
  organization_id?: string | null;
  organization_related_id?: Organization["id"];
  ids?: CancelTicketRequest["id"][];
  order_id?: CancelTicketRequest["order_id"];
  cancel_reason?: string;
  // refund_status?: CancelTicketRequestRefundStatusEnum[];
  process_statuses?: CancelTicketRequestProcessStatusEnum[];
  created_by?: string;
  createdAt?: Date;
  createdAtFrom?: Date;
  createdAtTo?: Date;
};
export type FilterCancelTicketRequest = {
  cursor?: string;
  limit?: number;
  filters?: FilterCancelTicketRequestItem;
  sort?: CancelTicketRequestSortItem[];
};

export type RecallCancelTicketRequestPayload = {
  recall_message: CancelTicketRequest["recall_message"];
};
