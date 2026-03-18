import { OperatorCodeEnum } from "@/components/html-to-image/enum";
import { FileEntity } from "../../files/types/file-entity";
import { OrganizationPaymentTypeEnum } from "./organization-enum";

export enum OrganizationCancelTicketRefundDecreaseTypeEnum {
  FLAT = "flat",
  PERCENTAGE = "percentage",
}
export type OrganizationCancelTicketTimeFrames = {
  to_hours: number;
  refund_decrease_type: OrganizationCancelTicketRefundDecreaseTypeEnum;
  refund_decrease_amount: number;
  not_allow_to_request: boolean;
};

export type OrganizationCancelTicketRule = {
  id?: number;
  operator_code?: OperatorCodeEnum;
  min_tickets: number;
  max_tickets: number;
  cancel_service_fee: number;
  time_frames?: OrganizationCancelTicketTimeFrames[];
};

export type OrganizationCancelTicketSetting = {
  // Commented out as it was in the original
  // limit_per_order?: number;
  rules?: OrganizationCancelTicketRule[] | null;
};

export type OrganizationSettings = {
  organization?: OrganizationInfoSetting;
  payment?: OrganizationPaymentSetting;
  smtp_mail?: OrganizationSmtpMailSetting;
  appearance?: OrganizationAppearanceSetting;
  zalo?: OrganizationZaloSetting;
  slug?: string;
  application?: OrganizationApplicationSetting;
  integrations?: OrganizationIntegrationSetting;
  cancel_tickets?: OrganizationCancelTicketSetting;
  bookings?: OrganizationBookingSetting;
};

export type OrganizationInfoSetting = {
  full_name?: string;
  short_name?: string;
  tax_number?: string;
  org_email?: string;
  hotline?: string;
  address?: string;
  description?: string;
};

export type PaymentSetting = {
  bank_name?: string;
  bank_account_name?: string;
  bank_account_number?: string;
  bank_name_full?: string;
  payment_type: OrganizationPaymentTypeEnum;
  // is_main_payment_method?: boolean; - main
  // include_vat?: boolean; - vat
  // is_top_up_method?: boolean; - top_up
};

export type OrganizationPaymentSetting = {
  unique_hash?: string;
  OnePaySettings?: OrganizationOnepayPaymentSetting;
  SMSBankingSettings?: SMSBankingPaymentSettings;
};

export type SMSBankingPaymentSettings = {
  is_enable?: boolean;
  payment_code_ttl?: number;
  payments?: PaymentSetting[];
};

export type OrganizationEmailSetting = {
  name?: string;
  sender_email?: string;
  email_header?: string;
  email_footer?: string;
};

export type OrganizationSmtpMailSetting = {
  server_address?: string;
  server_port_ssl?: number;
  server_port_tls?: number;
  mail_user?: string;
  mail_password?: string;
  mail_default_email?: string;
  mail_default_name?: string;
  ignore_tls?: boolean;
  is_secure?: boolean;
  require_tls?: boolean;
};

export type OrganizationColor = {
  name: string;
  value: string;
  color: string;
};

export type OrganizationAppearanceSetting = {
  logo?: FileEntity;
  logo_horizontal?: FileEntity;
  favicon_url?: string;
  font_family?: string;
  primary_color?: string;
  colors?: OrganizationColor[];
};

export type OrganizationApplicationSetting = {
  default_route_id?: number;
  featured_routes?: number[];
};

export type IntegrationEmailItem = {
  receivers?: ReceiverEmail;
  ccs?: string[];
  bccs?: string[];
  triggers?: string[];
  templates?: string;
};

export type ReceiverEmail = {
  emails?: string[];
  params?: string[];
};
export type ReceiverZalo = {
  params?: string[];
  phones?: {
    phone_number?: string;
    phone_country_code?: string;
  }[];
};

export type IntegrationEmail = {
  avaiableTemplates?: string[];
  items?: IntegrationEmailItem[];
};

export type IntegrationWebhook = {
  webhook_url?: string;
  triggers?: string[];
};

export type IntegrationZaloItem = {
  receivers?: ReceiverZalo;
  triggers?: string[];
  templates?: string[];
};

export type IntegrationZalo = {
  avaiableTemplates?: string[];
  items?: IntegrationZaloItem[];
};

export type OrganizationIntegrationSetting = {
  email?: IntegrationEmail;
  webhooks?: IntegrationWebhook[];
  zalo?: IntegrationZalo;
};

export type OrganizationUpdateSetting = Omit<
  OrganizationSettings,
  "payment"
> & {
  payments?: PaymentSetting[];
};

export type OrganizationZaloSetting = {
  zns_endpoint?: string;
};

export type OrganizationOnepayPaymentSetting = {
  is_enable: boolean;
  request_url?: string | null;
  merchant_id?: string | null;
  access_code?: string | null;
  merchant_hash_code?: string | null;
  is_enable_transaction_fee: boolean;
  fixedFeePerTransaction?: number;
  feePerPercentageOfPaymentAmount?: number;
};

export type OrganizationBookingSetting = {
  payment_expire_in?: number;
};
