// import { index } from "cheerio/dist/commonjs/api/traversing";
import { Transaction } from "./bookings/transactions/types/transaction";
import { Booking } from "./bookings/types/booking";
import { CancelTicketRequest } from "./cancel-ticket-request/types/cancel-ticket-request";
import { Customer } from "./customers/types/customer";
import { Operator } from "./operators/types/operator";
import { Order } from "./orders/types/order";
import { Route } from "./routes/types/route";
import { Voyage } from "./voyages/types/voyage";

export type ApiEndpoints = {
  [key: string]: string | ApiEndpoints;
};
export const FerryTicketApiEndpoints = {
  auth: {
    login: {
      email: {
        root: "/auth/login/email/",
        verifyEmailOTPAndResetPassword:
          "/auth/login/email/verifyEmailOTPAndResetPassword/",
        checkInOrg: "/auth/login/email/checkInOrg/",
        confirm: "/auth/login/email/confirm/",
        resendEmailOTP: "/auth/login/email/otp/resend/",
        useResendVerifyEmail: "/auth/login/email/resend-confirm-email/",
      },
    },
    register: {
      root: "/auth/register/",
      withEmailOTP: "/auth/register/withEmailOTP/",
    },
    refresh: "/auth/refresh/",
  },
  cms: {
    comment: "/cms/comment/",
    commentByPostId: (postId: number) => `/cms/comment/${postId}/?type=post`,
    commentByProductId: (postId: number) =>
      `/cms/comment/${postId}/?type=product`,
    rating: "/cms/rating/",
    notifiedPost: "/cms/notifiedPost/",
    getNotFoundImage: "/cms/get-not-found-image/",
  },
  ai: {
    scanIdCard: "/ai/scan-id-card/",
  },
  search: "/search/",
  baocao: {
    addVisitor: "/baocao/add-visitor/",
  },
  voyages: {
    byId: (id: Voyage["id"]) => `/voyages/${id}/`,
    findAllRelateByLocationAndDate: "/voyages/findAllRelateByLocationAndDate/",
    findAllRelateByLocationAndDateRange:
      "/voyages/findAllRelateByLocationAndDateRange/",
  },
  voyageCounts: {
    root: "/voyageCounts/",
  },
  boatLayouts: {
    latestByVoyageId: "/boatLayouts/latestByVoyageId/",
    byVoyageId: "/boatLayouts/byVoyageId/",
  },
  organization: {
    me: "/organization/me/",
  },
  vouchers: {
    apply: "/vouchers/apply/",
  },
  v1: {
    auth: {
      me: "/v1/internal/auth/me/",
      refresh: "/v1/internal/auth/refresh/",
      email: {
        checkInOrg: "/v1/auth/email/check-in-org",
        register: "/v1/auth/email/register",
        loginInOrg: "/v1/auth/email/login-in-org",
        registerWithEmailOTP: "/v1/auth/email/otp/register",
        verifyEmailOTPAndResetPassword: "/v1/auth/email/otp/confirm",
        confirm: "/v1/auth/email/confirm",
        resendEmailOTP: "/v1/auth/email/otp/resend",
        useResendVerifyEmail: "/v1/auth/email/resend-confirm-email",
      },
      google: {
        login: "/v1/auth/google/login/",
      },
      password: {
        forgot: "/v1/auth/password/forgot",
        reset: "/v1/auth/password/reset",
        change: "/v1/internal/auth/password/change",
      },
    },
    files: {
      upload: "/v1/internal/files/uploadAvatar",
      getFile: "/v1/internal/files/getFile",
    },
    locations: { index: "/v1/locations/" },
    routes: {
      index: "/v1/routes/",
      byId: (id: Route["id"]) => `/v1/routes/${id}/`,
    },
    voyages: {
      byId: (id: Voyage["id"]) => `/v1/voyages/${id}/`,
      findAllRelateByLocationAndDate:
        "/v1/voyages/findAllRelateByLocationAndDate/",
      findAllRelateByLocationAndDateRange:
        "/v1/voyages/findAllRelateByLocationAndDateRange/",
    },
    voyageCounts: {
      root: "/v1/voyage-counts/",
    },
    operators: {
      index: "/v1/operators/",
      nationals: (id: Operator["id"]) => `/v1/operators/nationals/${id}/`,
    },
    orders: {
      index: "/v1/orders/",
      byId: (id: Order["id"]) => `/v1/orders${id}/`,
      confirmToIssue: (id: Order["id"]) => `/v1/orders/confirmToIssue/${id}/`,
      updatePassengerInfo: (id: Order["id"]) =>
        `/v1/internal/orders/update-passenger-info/${id}/`,
    },
    boatLayouts: {
      latestByVoyageId: "/v1/boatLayouts/latestByVoyageId/",
      byVoyageId: "/v1/boatLayouts/byVoyageId/",
    },
    transactions: {
      index: "/v1/internal/transactions/",
      byId: (id: Transaction["id"]) => `/v1/internal/transactions/${id}`,
      me: {
        list: "/v1/internal/transactions/me/",
      },
    },
    payments: {
      onepay: "/v1/internal/payments/one-pay/generate-payment-url/",
      verify: "/v1/internal/payments/one-pay/verify-transaction/",
      postSMSBankingTransactionMessage:
        "/v1/internal/payments/sms-banking/get-transaction-message/",
    },
    bookings: {
      index: "/v1/internal/bookings",
      byId: (id: Booking["id"]) => `/v1/internal/bookings/${id}/`,
      confirmToIssue: (id: Booking["id"]) =>
        `/v1/internal/bookings/confirmToIssue/${id}/`,
      byUser: "/v1/internal/bookings/byUser/",
      patchInfo: (id: Booking["id"]) => `/v1/internal/bookings/${id}/`,
      me: {
        byId: (id: string) => `/v1/internal/bookings/me/${id}/`,
      },
    },
    passengers: {
      me: {
        index: "/v1/internal/passengers/me/",
        byId: (id: string) => `/v1/internal/passengers/me/${id}/`,
        batchCreate: "/v1/internal/passengers/me/batch_create/",
        batchUpdate: "/v1/internal/passengers/me/batch_update/",
      },
    },

    customers: {
      index: "/v1/internal/customers/",
      byId: (id: Customer["id"]) => `/v1/internal/customers/${id}/`,
      updateProfile: "/v1/internal/customers/profile/",
    },
    organization: {
      me: "/v1/organizations/me/",
    },
    vouchers: {
      apply: "/v1/vouchers/check-aplicability/",
    },
    webReports: {
      report: "/v1/internal/web-reports/get-bo-cong-thuong-report/",
      addVisitor: "/v1/internal/web-reports/add-visitor/",
    },
    cancelTicketRequest: {
      index: "/v1/internal/customer/cancel-ticket-request/",
      findAllByUser: "/v1/internal/customer/cancel-ticket-request/",
      recall: (id: CancelTicketRequest["id"]) =>
        `/v1/internal/customer/cancel-ticket-request/recall/${id}`,
    },
  },
  "third-party": {
    nucuoimekong: {
      lead: "https://n8n.nucuoimekong.com/webhook/ncmk/condaoexpress/tu-van/",
    },
    vietQR: {
      getDeepLinkApps: {
        ios: "https://api.vietqr.io/v2/ios-app-deeplinks",
        android: "https://api.vietqr.io/v2/android-app-deeplinks",
      },
    },
  },
};
