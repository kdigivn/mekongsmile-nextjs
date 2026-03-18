"use client";

import useConfirmDialog from "@/components/confirm-dialog/use-confirm-dialog";
import BookingStep from "@/components/page-section/booking-step";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetBoatLayoutFromOperator } from "@/services/apis/boatLayouts/boatlayout.service";
import { BoatLayout } from "@/services/apis/boatLayouts/types/boat-layout";
import { SeatTicket } from "@/services/apis/boatLayouts/types/seat";
import {
  useBookingPatchMutation,
  useGetBooking,
  usePostCreateBooking,
} from "@/services/apis/bookings/bookings.service";
import { CreateBooking } from "@/services/apis/bookings/types/booking";
import { BookingStatusEnum } from "@/services/apis/bookings/types/booking-status-enum";
import HTTP_CODES_ENUM from "@/services/apis/common/types/http-codes";
import { OperatorNationality } from "@/services/apis/operators/types/operator-nationality";
import { CreateOrder } from "@/services/apis/orders/types/order";
import { OrderStatusEnum } from "@/services/apis/orders/types/order-status-enum";
import { CreateTicket } from "@/services/apis/tickets/types/ticket";
import { TicketGenderEnum } from "@/services/apis/tickets/types/ticket-gender-enum";
import { TicketTypeEnum } from "@/services/apis/tickets/types/ticket-type-enum";
import { User } from "@/services/apis/users/types/user";
import { Voyage, VoyageItem } from "@/services/apis/voyages/types/voyage";
import useAuth from "@/services/auth/use-auth";
import {
  LocalFormKey,
  LocalSelectedTicketFormData,
  PICFormData,
  TaxRecordFromData,
} from "@/services/form/types/form-types";
import useLanguage from "@/services/i18n/use-language";
import { addDays, formatDate, isBefore } from "date-fns";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  memo,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { checkVoyageValid } from "@/app/(language)/schedules/search-helpers";
import VoyagesTable from "@/components/table/homepage/voyages-table";
import { Button } from "@/components/ui/button";
import { cn, removeAccents } from "@/lib/utils";
import {
  BoatLayoutValidationErrors,
  OperatorOrderErrors,
  OrderValidationErrors,
} from "@/services/apis/common/types/common-errors";
import { CommonAPIErrors } from "@/services/apis/common/types/validation-errors";
import { useGetOperatorNationality } from "@/services/apis/operators/operators.service";
import { Operator } from "@/services/apis/operators/types/operator";
import {
  useGetPassengersQuery,
  usePatchBatchPassengersMutation,
  usePostBatchPassengersMutation,
} from "@/services/apis/passengers/passengers.service";
import {
  CreatePassengerRequest,
  Passenger,
  UpdatePassengerRequest,
} from "@/services/apis/passengers/types/passenger";
import { Route } from "@/services/apis/routes/types/route";
import { TicketDetailParams } from "@/services/apis/tickets/types/ticket-detail-params";
import { getMinMaxAgeByByOperatorCode } from "@/services/apis/tickets/types/ticket-type-config";
import { Voucher } from "@/services/apis/voucher/type/voucher";
import { objectToArray } from "@/services/helpers/objectUtils";
import { useTranslation } from "@/services/i18n/client";
import { useGetPermateParams } from "@/services/infrastructure/permate/use-get-permate-params";
import { Hang } from "@/services/infrastructure/wordpress/types/hang";
import { DisableRoute } from "@/services/infrastructure/wordpress/types/sideBar";
import { TourProvider } from "@reactour/tour";
import { disableBodyScroll, enableBodyScroll } from "body-scroll-lock";
import ExportPassengerModal from "../booking/[id]/_components/_modal/export-passenger-modal";
import { SchedulesQueryParams } from "../schedules/_types/route-search-params";
import QuickLoginModal from "./_components/_modal/quick-login-modal";
import QuickSignUpModal from "./_components/_modal/quick-sign-up-modal";
import RememberModal from "./_components/_modal/remember-modal";
import SelectedFailModal from "./_components/_modal/selected-fail-modal";
import BoatSeatsLayout from "./_components/boat-seats-layout";
import useTourSteps from "./_components/tour/steps";
import PromoExpiredModal from "@/components/modals/promo-expired-modal";
import {
  CLICKBAIT_VOUCHER_CODE,
  addBlockedRootVoyage,
} from "@/lib/clickBaitUtil";

type Props = {
  selectedVoyages: {
    departVoyage: Voyage;
    destiVoyage?: Voyage;
  };
  numberOfPassengers: number;
  boatLayout: {
    departBoatLayout?: BoatLayout;
    destiBoatLayout?: BoatLayout;
  };
  departOperatorNationalities: OperatorNationality[];
  destiNationalities: OperatorNationality[];
  isValid: boolean;
  invalidMessage: string;
  operators: Operator[];
  routes: Route[];
  disableRoutes?: DisableRoute[];
  hangs: Hang[];
  isDepartClickbait?: boolean;
  isReturnClickbait?: boolean;
};

type TourContentProps = {
  content: ReactNode; // Bạn có thể điều chỉnh kiểu này tùy theo nội dung bạn dự định truyền
  onClose?: () => void;
  setIsOpen?: (check: boolean) => void;
};

const TicketDetail = ({
  selectedVoyages,
  numberOfPassengers,
  boatLayout,
  departOperatorNationalities,
  destiNationalities,
  isValid: valid,
  invalidMessage: message,
  operators,
  routes,
  disableRoutes,
  hangs,
  isDepartClickbait = false,
  isReturnClickbait = false,
}: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const language = useLanguage();
  const { t } = useTranslation("ticket-detail");
  const createBooking = usePostCreateBooking();
  const searchParams = useSearchParams();
  const permateParams = useGetPermateParams();

  const [checkSubmit, setCheckSubmit] = useState(false);
  const [departVouchers, setDepartVouchers] = useState<Voucher[]>([]);
  const [destiVouchers, setDestiVouchers] = useState<Voucher[]>([]);
  const [showPromoExpired, setShowPromoExpired] = useState(false);

  const bookingId = useMemo(
    () => searchParams.get("booking_id") ?? "",
    [searchParams]
  );
  const { patchBookingAsync } = useBookingPatchMutation(bookingId as string);

  // Load booking by id
  const { booking: editedBooking } = useGetBooking(bookingId, !!bookingId);

  const departVoyage = useMemo(
    () => selectedVoyages.departVoyage,
    [selectedVoyages.departVoyage]
  );

  const [destiVoyage, setDestiVoyage] = useState<Voyage | undefined>(
    selectedVoyages.destiVoyage
  );

  // Use rootVoyageId for clickbait voyages when fetching boat layout
  const departVoyageIdForFetch = departVoyage.clickBait
    ? departVoyage.clickBait.rootVoyageId
    : departVoyage.id;

  const destiVoyageIdForFetch = destiVoyage?.clickBait
    ? destiVoyage.clickBait.rootVoyageId
    : (destiVoyage?.id ?? "");

  const {
    boatLayout: departBoatLayoutRes,
    boatLayoutError: departBoatLayoutError,
  } = useGetBoatLayoutFromOperator(
    departVoyageIdForFetch,
    searchParams.get("mode") !== "edit"
  );

  const {
    boatLayout: destiBoatLayoutRes,
    boatLayoutError: destiBoatLayoutError,
  } = useGetBoatLayoutFromOperator(
    destiVoyageIdForFetch,
    !!destiVoyage && searchParams.get("mode") !== "edit"
  );

  const departVoyageWithAdditions: VoyageItem = useMemo(
    () => ({
      voyage: departVoyage,
    }),
    [departVoyage]
  );

  const destiVoyageWithAdditions: VoyageItem = useMemo(
    () => ({
      voyage: destiVoyage as Voyage,
    }),
    [destiVoyage]
  );

  const fetchOperatorNationality = useGetOperatorNationality();
  const [rememberState, setRememberState] = useState<number>(0);
  const [isRememberModalOpen, setIsRememberModalOpen] =
    useState<boolean>(false);

  const [destiOperatorNationalities, setDestiOperatorNationalities] =
    useState<OperatorNationality[]>(destiNationalities);

  const [isValid, setIsValid] = useState<boolean>(valid);
  const [invalidMessage, setInvalidMessage] = useState<string>(message);

  /**
   * Store boat layout of departure voyage. Data from API
   */
  const [departBoatLayout, setDepartBoatLayout] = useState<BoatLayout>();
  /**
   * Store boat layout of destination voyage. Data from API
   */
  const [destiBoatLayout, setDestiBoatLayout] = useState<BoatLayout>();
  /**
   * Store selected seats of depart voyage. Data from user action
   */
  const [departSelectedSeatTicket, setDepartSelectedSeatTicket] =
    useState<SeatTicket[]>();
  /**
   * Store selected seats of destination voyage. Data from user action
   */
  const [destiSelectedSeatTicket, setDestiSelectedSeatTicket] =
    useState<SeatTicket[]>();
  /**
   * Store default selected seats of depart voyage. Data from localStorage. We use another state to store default selected seats to reduce dependency between components and reduce re-render
   */
  const [defaultDepartSelectedSeatTicket, setDefaultDepartSelectedSeatTicket] =
    useState<SeatTicket[]>();
  /**
   * Store default selected seats of destination voyage. Data from localStorage. We use another state to store default selected seats to reduce dependency between components and reduce re-render
   */
  const [defaultDestiSelectedSeatTicket, setDefaultDestiSelectedSeatTicket] =
    useState<SeatTicket[]>();

  /**
   * Temporary store saved selected seat from local
   */
  const departSavedSeatTicketRef = useRef<SeatTicket[]>([]);
  /**
   * Temporary store saved selected seat from local
   */
  const destiSavedSeatTicketRef = useRef<SeatTicket[]>([]);
  /**
   * Store person-in-charge info of this booking. This data will be shared among depart & destination voyage
   */
  const [picInfo, setPicInfo] = useState<PICFormData>();
  /**
   * Store Tax info of this booking. This data will be shared among depart & destination voyage
   */
  const [taxInfo, setTaxInfo] = useState<TaxRecordFromData>();

  /**
   * Active voyage tab
   */
  const [activeTab, setActiveTab] = useState("0");

  const { user } = useAuth();

  const confirmDialog = useConfirmDialog();

  const { passengers } = useGetPassengersQuery();

  const [passengersData, setPassengersData] = useState<Passenger[]>([]);

  const [passengerCreateRequest, setPassengerCreateRequest] = useState<
    CreatePassengerRequest[]
  >([]);

  const { postBatchPassengers } = usePostBatchPassengersMutation(
    useMemo(
      () => ({ passengers: passengerCreateRequest }),
      [passengerCreateRequest]
    )
  );

  const [passengerUpdateRequest, setPassengerUpdateRequest] = useState<
    UpdatePassengerRequest[]
  >([]);

  const { patchBatchPassengers } = usePatchBatchPassengersMutation(
    useMemo(
      () => ({ passengers: passengerUpdateRequest }),
      [passengerUpdateRequest]
    )
  );

  const [tempContactData, setTempContactData] = useState<{
    contacts: {
      update?: Passenger[];
      add?: Passenger[];
      list?: Passenger[];
    };
  }>({ contacts: {} });

  const [quickSignUpModalOpen, setQuickSignUpModalOpen] =
    useState<boolean>(false);
  const [quickSignInModalOpen, setQuickSignInModalOpen] =
    useState<boolean>(false);
  const [isExportPassengerModalOpen, setIsExportPassengerModalOpen] =
    useState<boolean>(false);

  const handleCloseExportPassengerModal = useCallback(() => {
    setIsExportPassengerModalOpen(false);
  }, []);

  const queryParams: TicketDetailParams = {
    departVoyageId: departVoyage.id,
    returnVoyageId: destiVoyage?.id,
    numberOfPassengers: numberOfPassengers,
  };
  const path = `/sign-in?returnTo=${pathname}%3F${objectToArray(queryParams)
    .filter((item) => item.value)
    .map((item) => `${item.key}%3D${item.value}`)
    .join("%26")}`;

  useEffect(() => {
    if (passengerCreateRequest.length > 0) {
      postBatchPassengers();
      setPassengerCreateRequest([]);
    }
  }, [passengerCreateRequest, postBatchPassengers]);

  useEffect(() => {
    if (passengerUpdateRequest.length > 0) {
      patchBatchPassengers();
      setPassengerUpdateRequest([]);
    }
  }, [passengerUpdateRequest, patchBatchPassengers]);

  useEffect(() => {
    if (passengers) {
      setPassengersData(passengers);
    }
  }, [passengers]);

  const isDifferentOperator = useMemo(() => {
    if (departVoyage && destiVoyage) {
      return departVoyage.operator_id !== destiVoyage.operator_id;
    }
    return false;
  }, [departVoyage, destiVoyage]);

  const ageConfigForBothVoyages = useMemo(() => {
    return {
      depart: getMinMaxAgeByByOperatorCode(
        departVoyage.operator?.operator_code
      ),
      return: getMinMaxAgeByByOperatorCode(
        destiVoyage ? destiVoyage.operator?.operator_code : ""
      ),
    };
  }, [departVoyage.operator?.operator_code, destiVoyage]);

  const setReturnVoyage = useCallback(
    async (voyage: VoyageItem) => {
      if (voyage) {
        setDestiVoyage(voyage.voyage);
        const nationalities = await fetchOperatorNationality({
          id: voyage.voyage.operator_id,
        });
        if (nationalities.status === HTTP_CODES_ENUM.OK) {
          setDestiOperatorNationalities(nationalities.data);
        }
      }
    },
    [fetchOperatorNationality]
  );

  useEffect(() => {
    if (boatLayout.departBoatLayout) {
      setDepartBoatLayout(boatLayout.departBoatLayout);
    }
    if (boatLayout.destiBoatLayout) {
      setDestiBoatLayout(boatLayout.destiBoatLayout);
    }
  }, [boatLayout.departBoatLayout, boatLayout.destiBoatLayout]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const rememberState = localStorage.getItem(LocalFormKey.rememberState);
    if (rememberState) {
      setRememberState(parseInt(rememberState));
    }

    if (searchParams.get("mode") === "edit") {
      if (editedBooking) {
        const status = editedBooking.depart_order.order_status;
        if (
          [
            OrderStatusEnum.Expired, // 8
            OrderStatusEnum.Booked, // 10
            // OrderStatusEnum.CancelRequest, // 12
            OrderStatusEnum.Cancelled, // 14
            // OrderStatusEnum.CancelledBecauseBoatNotDepart, // 16
            // OrderStatusEnum.Refunded, // 18
          ].includes(status)
        ) {
          setActiveTab("1");
        }
        const {
          orderer_name,
          phone_number,
          contact_email,
          VAT_invoice,
          phone_country_code,
          orderer_social_id,
        } = editedBooking;

        const customerInfor: PICFormData = {
          picEmail: contact_email as string,
          picName: orderer_name,
          picPhone: phone_number as string,
          phone_country_code: phone_country_code as string,
          picSocialId: orderer_social_id as string,
        };

        if (customerInfor) {
          // setCustomerInfo(customerInfor);
          setPicInfo(customerInfor);
        }
        if (VAT_invoice && VAT_invoice.VAT_company_name) {
          setTaxInfo({
            name: VAT_invoice.VAT_company_name,
            taxNumber: VAT_invoice.VAT_tax_number,
            address: VAT_invoice.VAT_company_address,
            email: VAT_invoice.VAT_email,
          });
        }
      }
    } else {
      const localSelectedTicketFormData = localStorage.getItem(
        LocalFormKey.selectedTicketData
      );

      if (localSelectedTicketFormData) {
        const {
          selectedVoyages: voyages,
          picInfo,
          departSelectedSeats,
          destiSelectedSeats,
          taxInfo,
        }: LocalSelectedTicketFormData = JSON.parse(
          localSelectedTicketFormData
        );

        if (voyages?.departVoyage.id === departVoyage.id) {
          // setSelectedVoyages({
          //   departVoyage: departVoyage,
          //   destiVoyage: destiVoyage,
          // });
          if (taxInfo?.name) {
            setTaxInfo(taxInfo);
          }

          if (picInfo) {
            setPicInfo(picInfo);
          } else if (user) {
            const fullName =
              language === "en"
                ? `${user.customer.first_name || ""}${user.customer.last_name ? (user.customer.first_name ? " " : "") + user.customer.last_name : ""}`
                : `${user.customer.last_name || ""}${user.customer.first_name ? (user.customer.last_name ? " " : "") + user.customer.first_name : ""}`;
            setPicInfo({
              picName: fullName,
              picEmail: user.email,
              picPhone: user.customer.phone ?? "",
              phone_country_code: user.customer.phone_country_code ?? "VN",
              picSocialId: user.customer.social_id ?? "",
            });
          }

          if (departSelectedSeats) {
            departSavedSeatTicketRef.current = departSelectedSeats;
          }

          if (destiSelectedSeats) {
            destiSavedSeatTicketRef.current = destiSelectedSeats;
          }
        }
      } else {
        // if no data in local => user access is invalid => redirect to home page
        router.push(`/${language}`);
      }
    }
  }, [editedBooking, language, router, searchParams, departVoyage.id, user]);

  const handleReturnSearch = useCallback(() => {
    if (selectedVoyages && !isValid) {
      const queryParams: SchedulesQueryParams = {
        from: formatDate(
          isBefore(departVoyage.departure_date, new Date())
            ? departVoyage.departure_date
            : addDays(new Date(), 1),
          "yyyy-MM-dd"
        ),
        p: numberOfPassengers + "",
      };

      if (destiVoyage && queryParams.from) {
        queryParams.to = formatDate(
          isBefore(destiVoyage.departure_date, queryParams.from)
            ? destiVoyage.departure_date
            : addDays(queryParams.from, 1),
          "yyyy-MM-dd"
        );
      }

      // Create path.
      const route = departVoyage.route;
      const params = [];
      if (!route) {
        params.push(0);
      } else {
        params.push(
          route.id,
          route.departure_abbreviation,
          route.destination_abbreviation
        );
      }

      const path = `/schedules/${params.join("-")}?${objectToArray(queryParams)
        .filter((item) => item.value)
        .map((item) => `${item.key}=${item.value}`)
        .join("&")}`;

      router.push(path);
    }
  }, [
    selectedVoyages,
    isValid,
    departVoyage.departure_date,
    departVoyage.route,
    numberOfPassengers,
    destiVoyage,
    router,
  ]);

  function checkSeatBooking(
    savedSelectedSeats: SeatTicket[],
    boatLayout: BoatLayout
  ) {
    const availableSeats: SeatTicket[] = [];
    const bookedSeats: SeatTicket[] = [];

    // Iterate through saved selected seats array
    savedSelectedSeats?.forEach((seat) => {
      let isBooked = false;

      // Iterate through boat layout
      boatLayout.floors.forEach((floor) => {
        // Check if the seat id exists in the current floor's position ids array
        if (floor.PositionIds?.includes(seat.seatMetadata?.PositionId)) {
          // If the seat is booked, add it to the bookedSeats array
          if (
            floor.IsBookeds[
              floor.PositionIds.indexOf(seat.seatMetadata?.PositionId)
            ]
          ) {
            bookedSeats.push(seat);
            isBooked = true;
          }
        }
      });

      // If the seat is not booked, add it to the availableSeats array
      if (!isBooked) {
        availableSeats.push(seat);
      }
    });

    return { availableSeats, bookedSeats };
  }

  const handleChangeDepartSavedSeatTicketRef = useCallback(
    (seatTickets: SeatTicket[]) => {
      departSavedSeatTicketRef.current = seatTickets;
      if (departBoatLayoutRes && seatTickets) {
        const { availableSeats, bookedSeats } = checkSeatBooking(
          departSavedSeatTicketRef.current,
          departBoatLayoutRes.boatLayout
        );

        setDefaultDepartSelectedSeatTicket(availableSeats);
        setDepartSelectedSeatTicket(availableSeats);

        if (bookedSeats.length) {
          setIsExportPassengerModalOpen(true);
        }
      }
    },
    [departBoatLayoutRes]
  );

  const handleChangeDestiSavedSeatTicketRef = useCallback(
    (seatTickets: SeatTicket[]) => {
      destiSavedSeatTicketRef.current = seatTickets;
      if (destiBoatLayoutRes && seatTickets) {
        const { availableSeats, bookedSeats } = checkSeatBooking(
          destiSavedSeatTicketRef.current,
          destiBoatLayoutRes.boatLayout
        );

        setDefaultDestiSelectedSeatTicket(availableSeats);
        setDestiSelectedSeatTicket(availableSeats);

        if (bookedSeats.length) {
          setIsExportPassengerModalOpen(true);
        }
      }
    },
    [destiBoatLayoutRes]
  );

  useEffect(() => {
    if (departBoatLayoutRes) {
      // Override prices with clickbait pricing if applicable
      const layoutToSet = departVoyage.clickBait
        ? {
            ...departBoatLayoutRes.boatLayout,
            prices: departBoatLayoutRes.boatLayout.prices.map((price) => ({
              ...price,
              price_with_VAT: departVoyage.clickBait!.price,
            })),
          }
        : departBoatLayoutRes.boatLayout;

      setDepartBoatLayout(layoutToSet);
      if (departSavedSeatTicketRef.current?.length) {
        // Check whether saved seats have been booked
        const { availableSeats, bookedSeats } = checkSeatBooking(
          departSavedSeatTicketRef.current,
          layoutToSet
        );

        setDefaultDepartSelectedSeatTicket(availableSeats);
        setDepartSelectedSeatTicket(availableSeats);

        if (bookedSeats.length) {
          confirmDialog.confirmDialog({
            title: t("confirmDialog.title"),
            message: t("confirmDialog.message"),
            hasCancelButton: false,
            successButtonText: "OK",
          });
        }
      }
    }

    if (departBoatLayoutError) {
      if (
        (departBoatLayoutError as unknown as CommonAPIErrors)?.errorCode ===
        BoatLayoutValidationErrors.OperatorIsDisabled
      ) {
        confirmDialog.confirmDialog({
          title: "Lỗi",
          message: t("booking-error.operator-disabled-message"),
          hasCancelButton: false,
          successButtonText: "OK",
        });
      } else {
        confirmDialog.confirmDialog({
          title: "Lỗi",
          message: "Đã xảy ra lỗi. Không thể tải bố cục thuyền từ máy chủ",
          hasCancelButton: false,
          successButtonText: "OK",
        });
      }
    }
  }, [
    confirmDialog,
    departBoatLayoutError,
    departBoatLayoutRes,
    departVoyage.clickBait,
    t,
  ]);

  useEffect(() => {
    if (destiBoatLayoutRes) {
      // Override prices with clickbait pricing if applicable
      const layoutToSet = destiVoyage?.clickBait
        ? {
            ...destiBoatLayoutRes.boatLayout,
            prices: destiBoatLayoutRes.boatLayout.prices.map((price) => ({
              ...price,
              price_with_VAT: destiVoyage.clickBait!.price,
            })),
          }
        : destiBoatLayoutRes.boatLayout;

      setDestiBoatLayout(layoutToSet);
      // Check whether saved seats have been booked
      const { availableSeats, bookedSeats } = checkSeatBooking(
        destiSavedSeatTicketRef.current,
        layoutToSet
      );

      setDefaultDestiSelectedSeatTicket(availableSeats);
      setDestiSelectedSeatTicket(availableSeats);

      if (bookedSeats.length) {
        confirmDialog.confirmDialog({
          title: t("confirmDialogDesti.title"),
          message: t("confirmDialogDesti.message"),
          hasCancelButton: false,
          successButtonText: "OK",
        });
      }
    }

    if (destiBoatLayoutError) {
      if (
        (destiBoatLayoutError as unknown as CommonAPIErrors)?.errorCode ===
        BoatLayoutValidationErrors.OperatorIsDisabled
      ) {
        confirmDialog.confirmDialog({
          title: "Lỗi",
          message: t("booking-error.operator-disabled-message"),
          hasCancelButton: false,
          successButtonText: "OK",
        });
      } else {
        confirmDialog.confirmDialog({
          title: "Lỗi",
          message: "Đã xảy ra lỗi. Không thể tải bố cục thuyền từ máy chủ",
          hasCancelButton: false,
          successButtonText: "OK",
        });
      }
    }
  }, [confirmDialog, destiBoatLayoutError, destiBoatLayoutRes, destiVoyage, t]);

  /**
   * A helper function that create order
   */
  const createOrder = useCallback(
    (
      voyage: Voyage,
      user: User,
      picInfo: PICFormData,
      seatTicket: SeatTicket[],
      vouchers?: Voucher[],
      /**
       * Is this return trip?
       */
      isReturn: boolean = false
    ) => {
      const tickets = seatTicket
        .sort(
          (seatA, seatB) =>
            seatA.seatMetadata.PositionId - seatB.seatMetadata.PositionId
        )
        .map<CreateTicket>((seatTicket) => ({
          name: seatTicket.passengerData?.name ?? "",
          date_of_birth: seatTicket.passengerData?.dateOfBirth ?? "",
          place_of_birth: "",
          social_id: seatTicket.passengerData?.socialId ?? "",
          national_id: seatTicket.passengerData?.nationality ?? "",
          ...(voyage.operator?.configs.passenger_inputs.gender.enable && {
            gender: seatTicket.passengerData?.gender ?? TicketGenderEnum.Male,
          }),
          ...(voyage.operator?.configs.passenger_inputs.plate_number.enable && {
            plate_number: seatTicket.passengerData?.plateNumber ?? "",
          }),
          email: "",
          phone_number: "",
          home_town: seatTicket.passengerData?.address ?? "",
          seat_id: seatTicket.seatMetadata.SeatId.toString(),
          seat_name: seatTicket.seatMetadata.SeatName,
          position_id: seatTicket.seatMetadata.PositionId.toString(),
          price: seatTicket.selectedTicketPrice?.price_with_VAT ?? 0,
          return_trip: isReturn,
          ticket_type: TicketTypeEnum.Adult,
          ticket_type_id: seatTicket.selectedTicketPrice?.ticket_type_id,
          seat_type_code: seatTicket.selectedTicketPrice?.seat_type ?? "",
          is_child: false,
          is_vip: seatTicket.seatMetadata.IsVIP,
          ticket_price_id: seatTicket.selectedTicketPrice?.id,
          sort_auto: seatTicket.seatMetadata.SortAuto,
          floor_id: seatTicket.seatMetadata.FloorId,
        }));

      // const totalTicketPrice = tickets.reduce(
      //   (total, currentTicket) => total + currentTicket.price,
      //   0
      // );

      const order: CreateOrder = {
        // voyage: voyage,
        voyage_id: voyage.id ?? "",
        // voyage_depart_date: voyage.departure_date
        //   ? parseISO(voyage.departure_date)
        //   : new Date(),
        // user,
        customer_id: user.customer_id ?? 0,
        // order_status: OrderStatusEnum.Requested,
        orderer_name: picInfo?.picName ?? "",
        contact_email: picInfo?.picEmail ?? "",
        orderer_social_id: picInfo?.picSocialId ?? "",
        phone_number: picInfo?.picPhone ?? "",
        tickets: tickets,
        // total_ticket_price: totalTicketPrice,
        // total_harbor_fee: 0,
        // total_agent_price: 0,
        // total_price: totalTicketPrice + 0,
        vouchers: vouchers ?? [],
      };

      return order;
    },
    []
  );

  const handleGoToNextStep = useCallback(
    async (
      picInfoInput?: PICFormData,
      taxInfoInput?: TaxRecordFromData,
      departSelectedSeatTicketInput?: SeatTicket[],
      destiSelectedSeatTicketInput?: SeatTicket[],
      departVouchersInput?: Voucher[],
      destiVouchersInput?: Voucher[]
    ) => {
      // ⭐ INTERCEPT: If clickbait voyage, show popup instead of creating booking
      if (isDepartClickbait || isReturnClickbait) {
        // Block these root voyages from being used for clickbait again
        if (isDepartClickbait && departVoyage) {
          addBlockedRootVoyage(departVoyage.id);
        }
        if (isReturnClickbait && destiVoyage) {
          addBlockedRootVoyage(destiVoyage.id);
        }
        setShowPromoExpired(true);
        return;
      }

      if (
        departVoyage &&
        user &&
        picInfoInput &&
        departSelectedSeatTicketInput?.length
      ) {
        const departOrder: CreateOrder = createOrder(
          departVoyage,
          user,
          picInfoInput,
          departSelectedSeatTicketInput,
          departVouchersInput
        );
        const booking: CreateBooking = {
          // user,
          customer_id: user?.customer_id,
          orderer_name: picInfoInput?.picName ?? "",
          contact_email: picInfoInput?.picEmail ?? "",
          orderer_social_id: picInfoInput?.picSocialId ?? "",
          phone_number: picInfoInput?.picPhone ?? "",
          phone_country_code: picInfoInput?.phone_country_code ?? "",
          // no_passengers: numberOfPassengers,
          // no_tickets:
          //   (departSelectedSeatTicket?.length ?? 0) +
          //   (destiSelectedSeatTicketInput?.length ?? 0),
          booking_status: BookingStatusEnum.Requested,
          // round_trip: false,
          VAT_buyer_name: taxInfoInput?.taxNumber
            ? (picInfo?.picName ?? "")
            : "",
          VAT_company_address: taxInfoInput?.address ?? "",
          VAT_company_name: taxInfoInput?.name ?? "",
          VAT_tax_number: taxInfoInput?.taxNumber ?? "",
          VAT_email: taxInfoInput?.email ?? "",
          permateTracking: permateParams.pm_click_id
            ? {
                click_uuid: permateParams.pm_click_id || "",
                offer_id: permateParams.offer_id ?? "",
                event_id: "",
              }
            : undefined,
          depart_order: departOrder,
        };
        if (destiVoyage && destiSelectedSeatTicketInput?.length) {
          const destiOrder: CreateOrder = createOrder(
            destiVoyage,
            user,
            picInfoInput,
            destiSelectedSeatTicketInput,
            destiVouchersInput,
            true
          );

          booking.return_order = destiOrder;
          // booking.round_trip = true;
        }
        try {
          if (searchParams.get("mode") === "edit") {
            setCheckSubmit(true);
            const data = await patchBookingAsync({
              orderer_social_id: booking.orderer_social_id,
              orderer_name: booking.orderer_name,
              contact_email: booking.contact_email,
              phone_number: booking.phone_number,
              phone_country_code: booking.phone_country_code,
              depart_order: booking.depart_order,
              return_order: booking.return_order,
              // round_trip: booking.round_trip,
              VAT_buyer_name: booking.VAT_buyer_name,
              VAT_company_address: booking.VAT_company_address,
              VAT_company_name: booking.VAT_company_name,
              VAT_tax_number: booking.VAT_tax_number,
              VAT_email: booking.VAT_email,
              // depart_order_id: searchParams.get("depart_order_id") as string,
              // return_order_id: searchParams.get("return_order_id") as string,
            });

            setCheckSubmit(false);

            if (data) {
              localStorage.removeItem("selectedVoyages");
              router.replace("/booking/" + bookingId);
            } else {
              setCheckSubmit(false);
            }
          } else {
            setCheckSubmit(true);
            const { data, status } = await createBooking(booking);

            if (status === HTTP_CODES_ENUM.UNPROCESSABLE_ENTITY) {
              setCheckSubmit(false);
              // Xử lý riêng case mã lỗi 150105
              switch ((data?.errors as CommonAPIErrors)?.errorCode as number) {
                case OperatorOrderErrors.OperatorIsDisabled:
                  confirmDialog.confirmDialog({
                    title: "Lỗi",
                    message: t(
                      "booking-error.operator-disabled-create-booking-message"
                    ),
                    hasCancelButton: false,
                    successButtonText: "OK",
                  });
                  break;
                case OrderValidationErrors.DuplicateSocialId:
                  confirmDialog.confirmDialog({
                    title: "Lỗi",
                    message: t("booking-error.duplicate-id-message"),
                    hasCancelButton: false,
                    successButtonText: "OK",
                  });
                  break;
                case OrderValidationErrors.LimitVoucherPerCustomer:
                  confirmDialog.confirmDialog({
                    title: "Lỗi",
                    message: t(
                      "booking-error.limit-voucher-per-customer-message"
                    ),
                    hasCancelButton: false,
                    successButtonText: "OK",
                  });
                  break;
                case OperatorOrderErrors.InvalidTicketTypeId:
                  confirmDialog.confirmDialog({
                    title: "Lỗi",
                    message: t("booking-error.invalid-ticket-type-id", {
                      seatName: data?.errors?.message,
                    }),
                    hasCancelButton: false,
                    successButtonText: "OK",
                  });
                  break;
                case OperatorOrderErrors.InvalidSeatType:
                  confirmDialog.confirmDialog({
                    title: "Lỗi",
                    message: t("booking-error.invalid-seat-type", {
                      seatName: data?.errors?.message,
                    }),
                    hasCancelButton: false,
                    successButtonText: "OK",
                  });
                  break;
                case OperatorOrderErrors.NoPriceMatched:
                  confirmDialog.confirmDialog({
                    title: "Lỗi",
                    message: t("booking-error.no-price-matched", {
                      seatName: data?.errors?.message,
                    }),
                    hasCancelButton: false,
                    successButtonText: "OK",
                  });
                  break;
                default:
                  confirmDialog.confirmDialog({
                    title: "Error",
                    message: Object.keys(data.errors)
                      .map((key) => data.errors[key])
                      .join("\n"),
                    hasCancelButton: false,
                    successButtonText: "OK",
                  });
                  break;
              }
            }

            if (status === HTTP_CODES_ENUM.CREATED && data) {
              localStorage.removeItem("selectedVoyages");
              router.replace("/booking/" + data.id);
            } else {
              setCheckSubmit(false);
            }
          }
        } catch (error) {
          setCheckSubmit(false);
          if (error instanceof Error) {
            const errorObj = JSON.parse(error.message);
            switch (errorObj.errorCode) {
              case OperatorOrderErrors.OperatorIsDisabled:
                confirmDialog.confirmDialog({
                  title: "Lỗi",
                  message: t(
                    "booking-error.operator-disabled-edit-booking-message"
                  ),
                  hasCancelButton: false,
                  successButtonText: "OK",
                });
                break;
              case OrderValidationErrors.DuplicateSocialId:
                confirmDialog.confirmDialog({
                  title: "Lỗi",
                  message: t("booking-error.duplicate-id-message"),
                  hasCancelButton: false,
                  successButtonText: "OK",
                });
                break;
              case OrderValidationErrors.LimitVoucherPerCustomer:
                confirmDialog.confirmDialog({
                  title: "Lỗi",
                  message: t(
                    "booking-error.limit-voucher-per-customer-message"
                  ),
                  hasCancelButton: false,
                  successButtonText: "OK",
                });
                break;
              case OperatorOrderErrors.InvalidTicketTypeId:
                confirmDialog.confirmDialog({
                  title: "Lỗi",
                  message: t("booking-error.invalid-ticket-type-id", {
                    seatName: errorObj.message,
                  }),
                  hasCancelButton: false,
                  successButtonText: "OK",
                });
                break;
              case OperatorOrderErrors.InvalidSeatType:
                confirmDialog.confirmDialog({
                  title: "Lỗi",
                  message: t("booking-error.invalid-seat-type", {
                    seatName: errorObj.message,
                  }),
                  hasCancelButton: false,
                  successButtonText: "OK",
                });
                break;
              case OperatorOrderErrors.NoPriceMatched:
                confirmDialog.confirmDialog({
                  title: "Lỗi",
                  message: t("booking-error.no-price-matched", {
                    seatName: errorObj.message,
                  }),
                  hasCancelButton: false,
                  successButtonText: "OK",
                });
                break;
              default:
                confirmDialog.confirmDialog({
                  title: "Error",
                  message: "Đang có lỗi xảy ra",
                  hasCancelButton: false,
                  successButtonText: "OK",
                });
            }
          }
        }

        // if (searchParams.get("mode") === "edit") {
        //   const data = await patchBookingAsync({
        //     orderer_name: booking.orderer_name,
        //     contact_email: booking.contact_email,
        //     phone_number: booking.phone_number,
        //     depart_order: booking.depart_order,
        //     return_order: booking.return_order,
        //     round_trip: booking.round_trip,
        //     depart_order_id: searchParams.get("depart_order_id") as string,
        //     return_order_id: searchParams.get("return_order_id") as string,
        //     VAT_buyer_name: booking.VAT_buyer_name,
        //     VAT_company_address: booking.VAT_company_address,
        //     VAT_company_name: booking.VAT_company_name,
        //     VAT_tax_number: booking.VAT_tax_number,
        //     VAT_email: booking.VAT_email,
        //   });

        //   if (data) {
        //     localStorage.removeItem("selectedVoyages");
        //     router.replace("/booking/" + bookingId);
        //   }
        // } else {
        //   const { data, status } = await createBooking(booking);

        //   if (status === HTTP_CODES_ENUM.UNPROCESSABLE_ENTITY) {
        //     confirmDialog.confirmDialog({
        //       title: "Error",
        //       message: Object.keys(data.errors)
        //         .map((key) => data.errors[key])
        //         .join("\n"),
        //       hasCancelButton: false,
        //       successButtonText: "OK",
        //     });
        //   }

        //   if (status === HTTP_CODES_ENUM.CREATED && data) {
        //     localStorage.removeItem("selectedVoyages");
        //     router.replace("/booking/" + data.id);
        //   }
        // }
      } else {
        if (
          destiSelectedSeatTicketInput &&
          departSelectedSeatTicket === undefined
        ) {
          setActiveTab("0");
          return;
        }
        setQuickSignUpModalOpen(true);
      }
    },
    [
      isDepartClickbait,
      isReturnClickbait,
      departVoyage,
      destiVoyage,
      user,
      createOrder,
      picInfo?.picName,
      permateParams.pm_click_id,
      permateParams.offer_id,
      searchParams,
      patchBookingAsync,
      router,
      bookingId,
      createBooking,
      confirmDialog,
      t,
      departSelectedSeatTicket,
    ]
  );

  const handleSavePassengerContact = useCallback(
    (addList?: Passenger[], updateList?: Passenger[]) => {
      if (addList && addList.length > 0) setPassengerCreateRequest(addList);
      if (updateList && updateList.length > 0)
        setPassengerUpdateRequest(updateList);
    },
    []
  );

  const handleDepartSavePassengerInfo = useCallback(
    (
      picInfo: PICFormData,
      selectedSeats: SeatTicket[],
      taxData?: TaxRecordFromData,
      vouchers?: Voucher[]
    ) => {
      setDepartSelectedSeatTicket(selectedSeats);
      setPicInfo(picInfo);
      setTaxInfo(taxData);
      setDepartVouchers(vouchers ?? []);

      const localSelectedTicketFormData: LocalSelectedTicketFormData = {
        selectedVoyages,
        numberOfPassengers,
        picInfo,
        // departSelectedSeats: selectedSeats,
        // destiSelectedSeats: destiSelectedSeatTicket,
        taxInfo,
        departVouchers: vouchers,
      };

      let passengerData: Passenger[] = [
        ...selectedSeats.map((seat) => {
          const passengerData = seat.passengerData;
          const nationalityAbbrev =
            departOperatorNationalities.find(
              (operatorNationality) =>
                operatorNationality.national_id.toString() ===
                passengerData?.nationality.toString()
            )?.abbrev ?? "";
          const PassengerContact = {
            full_name: removeAccents(
              passengerData?.name ?? ""
            ).toLocaleUpperCase(),
            gender: passengerData?.gender ?? TicketGenderEnum.Male,
            date_of_birth: passengerData?.dateOfBirth ?? "",
            address: passengerData?.address ?? "",
            social_id: passengerData?.socialId ?? "",
            national_abbrev: nationalityAbbrev ?? "",
          };
          return PassengerContact;
        }),
        ...passengersData,
      ];

      const uniqueNames = new Set();
      let updateList: Passenger[] = [];
      let addList: Passenger[] = [];

      // Filter passengers, only keeping those with unique names
      passengerData = passengerData.filter((passenger) => {
        if (!uniqueNames.has(passenger.full_name)) {
          uniqueNames.add(passenger.full_name);
          // If id is undefined, add to addList, else keep in passengerData
          if (passenger.id === undefined) {
            addList.push(passenger);
          }
          return true;
        } else {
          // Name is not unique, add to updateList
          updateList.push(passenger);
        }
        return false;
      });

      updateList = updateList
        .map((passenger) => {
          const newData = addList.find(
            (item) => item.full_name === passenger.full_name
          );
          addList = addList.filter(
            (item) => item.full_name !== passenger.full_name
          );
          return {
            ...passenger,
            ...newData,
          };
        })
        .filter((passenger) => passenger.id);

      localStorage.setItem(
        LocalFormKey.selectedTicketData,
        JSON.stringify(localSelectedTicketFormData)
      );

      // Change active tab to select destination voyage if user chose round trip
      if (!checkVoyageValid(departVoyage)) {
        setIsValid(false);
        setInvalidMessage(t("voyage-invalid.voyageDepart"));
        return;
      }

      if (destiVoyage && !checkVoyageValid(destiVoyage)) {
        setIsValid(false);
        setInvalidMessage(t("voyage-invalid.voyageDesti"));
        return;
      }

      if (rememberState !== 2 && user) {
        setIsRememberModalOpen(true);
        setTempContactData({
          contacts: { add: addList, update: updateList, list: passengerData },
        });
      } else {
        if (user) {
          handleSavePassengerContact(addList, updateList);
          setPassengersData(passengerData);
        }
        if (destiVoyage) {
          setActiveTab("1");
        } else {
          handleGoToNextStep(
            picInfo,
            taxData,
            selectedSeats,
            undefined,
            vouchers
          );
        }
      }
    },
    [
      departOperatorNationalities,
      departVoyage,
      // destiSelectedSeatTicket,
      destiVoyage,
      handleGoToNextStep,
      handleSavePassengerContact,
      numberOfPassengers,
      passengersData,
      rememberState,
      selectedVoyages,
      t,
      taxInfo,
      user,
    ]
  );

  const handleDestiSavePassengerInfo = useCallback(
    (
      picInfo: PICFormData,
      selectedSeats: SeatTicket[],
      taxData?: TaxRecordFromData,
      vouchers?: Voucher[]
    ) => {
      setDestiSelectedSeatTicket(selectedSeats);
      setPicInfo(picInfo);
      setTaxInfo(taxData);
      setDestiVouchers(vouchers ?? []);

      const localSelectedTicketFormData: LocalSelectedTicketFormData = {
        selectedVoyages,
        numberOfPassengers,
        picInfo,
        // departSelectedSeats: departSelectedSeatTicket,
        // destiSelectedSeats: selectedSeats,
        taxInfo,
        destiVouchers: vouchers,
      };

      let passengerData: Passenger[] = [
        ...selectedSeats.map((seat) => {
          const passengerData = seat.passengerData;
          const nationalityAbbrev =
            departOperatorNationalities.find(
              (operatorNationality) =>
                operatorNationality.national_id === passengerData?.nationality
            )?.abbrev ?? "";
          const PassengerContact = {
            full_name: passengerData?.name ?? "",
            gender: passengerData?.gender ?? TicketGenderEnum.Male,
            date_of_birth: passengerData?.dateOfBirth ?? "",
            address: passengerData?.address ?? "",
            social_id: passengerData?.socialId ?? "",
            national_abbrev: nationalityAbbrev ?? "",
          };
          return PassengerContact;
        }),
        ...passengersData,
      ];

      const uniqueNames = new Set();

      let updateList: Passenger[] = [];
      let addList: Passenger[] = [];

      // Filter passengers, only keeping those with unique names
      passengerData = passengerData.filter((passenger) => {
        if (!uniqueNames.has(passenger.full_name)) {
          uniqueNames.add(passenger.full_name);
          // If id is undefined, add to addList, else keep in passengerData
          if (passenger.id === undefined) {
            addList.push(passenger);
          }
          return true;
        } else {
          // Name is not unique, add to updateList
          updateList.push(passenger);
        }
        return false;
      });

      updateList = updateList
        .map((passenger) => {
          const newData = addList.find(
            (item) => item.full_name === passenger.full_name
          );
          addList = addList.filter(
            (item) => item.full_name !== passenger.full_name
          );
          return {
            ...passenger,
            ...newData,
          };
        })
        .filter((passenger) => passenger.id);

      localStorage.setItem(
        LocalFormKey.selectedTicketData,
        JSON.stringify(localSelectedTicketFormData)
      );

      if (!checkVoyageValid(departVoyage)) {
        setIsValid(false);
        setInvalidMessage(t("voyage-invalid.voyageDepart"));
      }

      if (rememberState === 0) {
        handleGoToNextStep(
          picInfo,
          taxData,
          departSelectedSeatTicket,
          selectedSeats,
          departVouchers,
          vouchers
        );
      } else {
        if (user) {
          handleSavePassengerContact(addList, updateList);
          setPassengersData(passengerData);
        }
        handleGoToNextStep(
          picInfo,
          taxData,
          departSelectedSeatTicket,
          selectedSeats,
          departVouchers,
          vouchers
        );
      }
    },
    [
      departOperatorNationalities,
      departSelectedSeatTicket,
      departVouchers,
      departVoyage,
      handleGoToNextStep,
      handleSavePassengerContact,
      numberOfPassengers,
      passengersData,
      rememberState,
      selectedVoyages,
      t,
      taxInfo,
      user,
    ]
  );

  const isNextStepEnable = destiVoyage
    ? departSelectedSeatTicket?.length && destiSelectedSeatTicket?.length
    : departSelectedSeatTicket?.length;

  const hasReturn = !!destiVoyage;

  const handleChangeTab = useCallback(
    (event: React.SyntheticEvent, newValue: string) => {
      setActiveTab(newValue);
    },
    []
  );

  const departBoatLayoutContent: {
    tabContent: JSX.Element;
    tabTrigger: JSX.Element;
  }[] = useMemo(() => {
    if (departBoatLayout && departVoyage) {
      // Kiểm tra điều kiện editedBooking và status
      let shouldIncludeDepartBoatLayout = true;
      if (editedBooking) {
        const status = editedBooking.depart_order.order_status;
        if (
          [
            OrderStatusEnum.Expired, // 8
            OrderStatusEnum.Booked, // 10
            // OrderStatusEnum.CancelRequest, // 12
            OrderStatusEnum.Cancelled, // 14
            // OrderStatusEnum.CancelledBecauseBoatNotDepart, // 16
            // OrderStatusEnum.Refunded, // 18
          ].includes(status)
        ) {
          setActiveTab("1");
          shouldIncludeDepartBoatLayout = false;
        }
      }
      const tabTrigger = (
        <TabsTrigger
          id="departure"
          key={0}
          value={"0"}
          className={cn(
            "min-w-[150px] text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground md:text-sm",
            shouldIncludeDepartBoatLayout ? "" : "hidden"
          )}
        >
          {t("voyage-tab.selectDepartSeats")}
        </TabsTrigger>
      );
      const tabContent = (
        <TabsContent key={0} value={"0"} forceMount hidden={"0" !== activeTab}>
          <BoatSeatsLayout
            hasReturn={hasReturn}
            isNextStepEnable={isNextStepEnable}
            onNextStep={handleGoToNextStep}
            boatLayout={departBoatLayout}
            voyageItem={departVoyageWithAdditions}
            operatorNationalities={departOperatorNationalities}
            picData={picInfo}
            taxData={taxInfo}
            defaultSelectedSeats={defaultDepartSelectedSeatTicket}
            onSavePassengerInfo={handleDepartSavePassengerInfo}
            passengers={passengersData}
            currentTab={activeTab}
            booking={editedBooking}
            onChangeSeatTicket={handleChangeDepartSavedSeatTicketRef}
            defaultVouchers={departVouchers}
            checkReturnOrder={!!(destiBoatLayout && departVoyage)}
            checkSubmit={checkSubmit}
            hangs={hangs}
          />
        </TabsContent>
      );
      return [{ tabTrigger, tabContent }];
    }
    return [];
  }, [
    activeTab,
    checkSubmit,
    defaultDepartSelectedSeatTicket,
    departBoatLayout,
    departOperatorNationalities,
    departVouchers,
    departVoyage,
    departVoyageWithAdditions,
    destiBoatLayout,
    editedBooking,
    handleChangeDepartSavedSeatTicketRef,
    handleDepartSavePassengerInfo,
    handleGoToNextStep,
    hangs,
    hasReturn,
    isNextStepEnable,
    passengersData,
    picInfo,
    t,
    taxInfo,
  ]);

  const minDate = useMemo(
    () => new Date(departVoyage.departure_date),
    [departVoyage.departure_date]
  );

  const destiBoatLayoutContent: {
    tabContent: JSX.Element;
    tabTrigger: JSX.Element;
  }[] = useMemo(() => {
    if (destiBoatLayout && destiVoyage) {
      const tabTrigger = (
        <TabsTrigger
          id="destination"
          key={1}
          value={"1"}
          className="min-w-[150px] text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground md:text-sm"
        >
          {t("voyage-tab.selectDestinationSeats")}
        </TabsTrigger>
      );
      const tabContent = (
        <TabsContent key={1} value={"1"} forceMount hidden={"1" !== activeTab}>
          <BoatSeatsLayout
            hasReturn={hasReturn}
            isNextStepEnable={isNextStepEnable}
            onNextStep={handleGoToNextStep}
            boatLayout={destiBoatLayout}
            voyageItem={destiVoyageWithAdditions}
            operatorNationalities={destiOperatorNationalities}
            picData={picInfo}
            taxData={taxInfo}
            defaultSelectedSeats={defaultDestiSelectedSeatTicket}
            onSavePassengerInfo={handleDestiSavePassengerInfo}
            departSelectedSeats={departSelectedSeatTicket}
            isDifferentOperator={isDifferentOperator}
            departOperatorNationalities={departOperatorNationalities}
            ageConfigForBothVoyages={ageConfigForBothVoyages}
            passengers={passengersData}
            currentTab={activeTab}
            handleChangeTab={handleChangeTab}
            defaultVouchers={destiVouchers}
            booking={editedBooking}
            onChangeSeatTicket={handleChangeDestiSavedSeatTicketRef}
            checkSubmit={checkSubmit}
            hangs={hangs}
          />
        </TabsContent>
      );
      return [{ tabTrigger, tabContent }];
    } else if (departBoatLayout && departVoyage) {
      const tabTrigger = (
        <TabsTrigger
          id="destination"
          key={1}
          value={"1"}
          className="min-w-[150px] text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground md:text-sm"
        >
          {t("voyage-tab.selectDestinationSeats")}
        </TabsTrigger>
      );

      const routeId =
        routes.find(
          (route) =>
            route.departure_id === departVoyage.route?.destination_id &&
            route.destination_id === departVoyage.route?.departure_id
        )?.id ?? 22;

      const tabContent = (
        <TabsContent key={1} value={"1"} forceMount hidden={"1" !== activeTab}>
          <VoyagesTable
            operators={operators}
            disableRoutes={disableRoutes}
            routes={routes}
            routeId={routeId}
            customizeSelectAction={setReturnVoyage}
            minDate={minDate}
          />
        </TabsContent>
      );
      return [{ tabTrigger, tabContent }];
    }
    return [];
  }, [
    destiBoatLayout,
    destiVoyage,
    departBoatLayout,
    departVoyage,
    t,
    activeTab,
    hasReturn,
    isNextStepEnable,
    handleGoToNextStep,
    destiVoyageWithAdditions,
    destiOperatorNationalities,
    picInfo,
    taxInfo,
    defaultDestiSelectedSeatTicket,
    handleDestiSavePassengerInfo,
    departSelectedSeatTicket,
    isDifferentOperator,
    departOperatorNationalities,
    ageConfigForBothVoyages,
    passengersData,
    handleChangeTab,
    destiVouchers,
    editedBooking,
    handleChangeDestiSavedSeatTicketRef,
    checkSubmit,
    hangs,
    routes,
    operators,
    disableRoutes,
    setReturnVoyage,
    minDate,
  ]);

  const voyageLayoutContent = useMemo(() => {
    const voyageLayoutContent: {
      tabContent: JSX.Element;
      tabTrigger: JSX.Element;
    }[] = [];
    // Thêm nội dung vào voyageLayoutContent
    if (departBoatLayoutContent.length > 0) {
      voyageLayoutContent.push(...departBoatLayoutContent);
    }
    if (destiBoatLayoutContent.length > 0)
      voyageLayoutContent.push(...destiBoatLayoutContent);

    return voyageLayoutContent;
  }, [departBoatLayoutContent, destiBoatLayoutContent]);

  useEffect(() => {
    if (activeTab === "1") {
      const destinationElement = document.getElementById("destination");
      if (destinationElement) {
        destinationElement.scrollIntoView({ behavior: "smooth" });
      }
    } else if (activeTab === "0") {
      const departureElement = document.getElementById("departure");
      if (departureElement) {
        departureElement.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [activeTab]);

  const handleSetRememberState = useCallback(
    (value: number) => {
      setRememberState(value);
      if (value !== 0) {
        handleSavePassengerContact(
          tempContactData.contacts.add,
          tempContactData.contacts.update
        );
        if (tempContactData.contacts.list)
          setPassengersData(tempContactData.contacts.list);
      }
      localStorage.setItem(LocalFormKey.rememberState, value.toString());
      setIsRememberModalOpen(false);
      if (activeTab === "0" && destiVoyage) {
        setActiveTab("1");
      } else {
        handleGoToNextStep(
          picInfo,
          taxInfo,
          departSelectedSeatTicket,
          undefined,
          departVouchers,
          destiVouchers
        );
      }
    },
    [
      activeTab,
      destiVoyage,
      handleSavePassengerContact,
      tempContactData.contacts.add,
      tempContactData.contacts.update,
      tempContactData.contacts.list,
      handleGoToNextStep,
      picInfo,
      taxInfo,
      departSelectedSeatTicket,
      departVouchers,
      destiVouchers,
    ]
  );

  const styles = useMemo(
    () => ({
      popover: (base: Record<string, unknown>) => ({
        ...base,
        borderRadius: "0.375rem", // rounded-md (6px)
        padding: "1rem",
      }),
      content: (base: Record<string, unknown>) => ({
        ...base,
        fontSize: "0.875rem", // text-sm (14px)
      }),
      close: (base: Record<string, unknown>) => ({
        ...base,
        top: "12px", // Đẩy nút close lên trên 10px
        right: "12px", // Bạn có thể điều chỉnh để đẩy qua phải hoặc trái
      }),
    }),
    []
  );

  const TourContent = ({ content, onClose }: TourContentProps) => {
    return (
      <div className="p-5 text-center">
        <div className="mb-5">{content}</div>
        <Button className="text-sm" onClick={onClose}>
          Tôi đã hiểu
        </Button>
      </div>
    );
  };

  const componentsMemo = useMemo(
    () => ({
      Content: ({ content, setIsOpen }: TourContentProps) => {
        // Sử dụng useCallback để tối ưu hóa hàm handleClose
        const handleClose = useCallback(() => {
          if (setIsOpen) {
            setIsOpen(false);
          }
          localStorage.setItem("hasTourBeenShown", "true");
        }, [setIsOpen]);

        return <TourContent content={content} onClose={handleClose} />;
      },
    }),
    []
  );

  // Sử dụng useCallback để tối ưu hóa hàm onStepClick
  const handleBackToStep1 = useCallback(() => {
    router.back();
  }, [router]);

  const disableBody = useCallback((target: Element | HTMLElement | null) => {
    if (target) {
      disableBodyScroll(target);
    }
  }, []);

  const enableBody = useCallback((target: Element | HTMLElement | null) => {
    if (target) {
      enableBodyScroll(target);
    }
  }, []);

  const handleClosePromoExpired = useCallback(() => {
    setShowPromoExpired(false);
  }, []);

  const handleGoBackFromPromo = useCallback(() => {
    router.back();
  }, [router]);

  const handleUpdatePrice = useCallback(() => {
    // Navigate back to root voyage with real pricing (remove -CB suffix)
    const newParams = new URLSearchParams(searchParams.toString());

    if (isDepartClickbait && departVoyage) {
      newParams.set("departVoyageId", departVoyage.id);
    }
    if (isReturnClickbait && destiVoyage) {
      newParams.set("returnVoyageId", destiVoyage.id);
    }

    router.replace(`/ticket-detail?${newParams.toString()}`);
  }, [
    isDepartClickbait,
    isReturnClickbait,
    departVoyage,
    destiVoyage,
    searchParams,
    router,
  ]);

  return (
    <>
      <TourProvider
        steps={useTourSteps()}
        afterOpen={disableBody}
        beforeClose={enableBody}
        showBadge={false}
        showNavigation={false}
        showPrevNextButtons={false}
        styles={styles}
        scrollSmooth
        components={componentsMemo}
      >
        <div className="lg:px-auto m-auto flex h-auto w-full max-w-screen-xl flex-col items-center justify-center gap-4 p-4 md:px-10">
          <div className="mb-4 flex w-full justify-center">
            <BookingStep
              currentStep={2}
              className="max-w-[500px]"
              onStepClick={handleBackToStep1}
            />
          </div>
          <Tabs
            className={"w-full"}
            defaultValue={"0"}
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <TabsList className="flex w-full justify-center">
              <div className="flex flex-row flex-nowrap gap-1 rounded bg-white p-1">
                {voyageLayoutContent.map((layout) => layout.tabTrigger)}
              </div>
            </TabsList>
            {voyageLayoutContent.map((layout) => layout.tabContent)}
          </Tabs>
        </div>
        <SelectedFailModal
          returnHandle={handleReturnSearch}
          isOpen={!isValid}
          message={invalidMessage}
        />
        <RememberModal
          isOpen={isRememberModalOpen}
          onRemember={handleSetRememberState}
          onOpenChange={setIsRememberModalOpen}
        />
        <QuickSignUpModal
          email={picInfo?.picEmail}
          fullName={picInfo?.picName}
          phone={picInfo?.picPhone}
          phone_country_code={picInfo?.phone_country_code}
          social_id={picInfo?.picSocialId}
          isLoginOpen={quickSignInModalOpen}
          onLoginOpenChange={setQuickSignInModalOpen}
          isOpen={quickSignUpModalOpen}
          onOpenChange={setQuickSignUpModalOpen}
          path={path}
        />
        <QuickLoginModal
          isOpen={quickSignInModalOpen}
          onOpenChange={setQuickSignInModalOpen}
          // isSignUpOpen={quickSignUpModalOpen}
          onSignUpOpenChange={setQuickSignUpModalOpen}
          path={path}
        />
        <ExportPassengerModal
          isOpen={isExportPassengerModalOpen}
          onClose={handleCloseExportPassengerModal}
          booking={editedBooking}
        />
        <PromoExpiredModal
          isOpen={showPromoExpired}
          onClose={handleClosePromoExpired}
          onGoBack={handleGoBackFromPromo}
          onUpdatePrice={handleUpdatePrice}
          voucherCode={CLICKBAIT_VOUCHER_CODE}
          departVoyage={departVoyage}
          returnVoyage={destiVoyage}
        />
      </TourProvider>
    </>
  );
};

export default memo(TicketDetail);
