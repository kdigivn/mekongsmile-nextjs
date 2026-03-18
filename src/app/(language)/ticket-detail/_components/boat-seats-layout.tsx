import PassengerFormTextInput from "@/components/form-elements/text-input/passenger-form-text-input";
// import LinkBase from "@/components/link-base";
import useConfirmDialog from "@/components/confirm-dialog/use-confirm-dialog";
import {
  countries,
  getCountry,
} from "@/components/form-elements/combobox/countries";
import FormPhoneInput from "@/components/form-elements/text-input/form-phone-input";
import { HtmlToImageSectionCaptureId } from "@/components/html-to-image/enum";
import HtmlToImage from "@/components/html-to-image/html-to-image";
import LinkBase from "@/components/link-base";
import SeatLegend from "@/components/page-section/seat-legend";
import { tooltipClassName } from "@/components/switch/seat-select-switch";
import ToasterMaxSeat from "@/components/toaster/toaster-max-seat";
import {
  TooltipResponsive,
  TooltipResponsiveContent,
  TooltipResponsiveTrigger,
} from "@/components/tooltip-responsive";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList } from "@/components/ui/tabs";
import { useMediaQuery } from "@/hooks/use-media-query";
import { processPhoneNumber } from "@/lib/countries";
import { calculateAge, cn, removeAccents } from "@/lib/utils";
import {
  DEFAULT_SEAT_TYPE_COLOR_PALETTE,
  SEAT_COLOR_PALETTE,
} from "@/services/apis/boatLayouts/seat-color-config";
import { BoatLayout } from "@/services/apis/boatLayouts/types/boat-layout";
import {
  PassengerTicket,
  SeatColor,
  SeatColorWithType,
  SeatMetadata,
  SeatTicket,
} from "@/services/apis/boatLayouts/types/seat";
import { Booking } from "@/services/apis/bookings/types/booking";
import {
  handleExportPassengerFromTable,
  handleExportTemplate,
  refreshWorkbook,
} from "@/services/apis/excel/excel.service";
import { OperatorNationality } from "@/services/apis/operators/types/operator-nationality";
import {
  Passenger,
  PassengerConfig,
} from "@/services/apis/passengers/types/passenger";
import { TicketGenderEnum } from "@/services/apis/tickets/types/ticket-gender-enum";
import { TicketPrice } from "@/services/apis/tickets/types/ticket-price";
import {
  TicketAgeCustomConfig,
  getMinMaxAgeByByOperatorCode,
  getTicketPriceIdsByOperatorCode,
} from "@/services/apis/tickets/types/ticket-type-config";
import { Voucher } from "@/services/apis/voucher/type/voucher";
import { Voyage, VoyageItem } from "@/services/apis/voyages/types/voyage";
import {
  FormPassengerTicket,
  PICFormData,
  TaxRecordFromData,
  VoyageFormData,
} from "@/services/form/types/form-types";
import { useTranslation } from "@/services/i18n/client";
import { Hang } from "@/services/infrastructure/wordpress/types/hang";
import { Checkbox, Spinner, Tooltip } from "@heroui/react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useTour } from "@reactour/tour";
import { format, sub } from "date-fns";
import { useRouter, useSearchParams } from "next/navigation";
import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { BsExclamationCircle } from "react-icons/bs";
import { HiOutlineSpeakerphone } from "react-icons/hi";
import {
  MdArrowBack,
  MdArrowForward,
  MdImportExport,
  MdOutlineOpenInNew,
} from "react-icons/md";
import { RiFileExcel2Line } from "react-icons/ri";
import { toast } from "sonner";
import * as yup from "yup";
import ChooseSeatMobileModal from "./_modal/choose-seat-mobile-modal";
import ImportPassengersModal from "./_modal/import-passengers-modal";
import ExportVatForm from "./export-vat-form";
import PassengerForms, { PassengerFormRefType } from "./passenger-forms";
import NoteSection from "./sections/note-section";
import TotalFeeSection from "./sections/total-fee-section";
import SelectedSeat from "./selected-seat";
import SelectedSeatSection from "./selected-seat-section";
import BoatLayoutTabTrigger from "./tabs/boat-layout-tabs-trigger";
import VoyageDetailCard from "./voyage-detail-card";
import { useDebounce } from "@/hooks/use-debounce";
import ModalRouteForVietnamese from "@/components/modals/modal-route-for-vietnamese/modal-route-for-vietnamese";
type Props = {
  boatLayout: BoatLayout;
  voyageItem: VoyageItem;
  operatorNationalities: OperatorNationality[];
  picData?: PICFormData;
  taxData?: TaxRecordFromData;
  defaultSelectedSeats?: SeatTicket[];
  /*
   *
   * @param selectedSeats Seat data with passenger info
   * @param picInfo Info of person in charge
   * @returns
   */
  onSavePassengerInfo?: (
    picInfo: PICFormData,
    selectedSeats: SeatTicket[],
    taxData?: TaxRecordFromData,
    vouchers?: Voucher[]
  ) => void;
  onNextStep: () => void;
  isNextStepEnable?: number;
  hasReturn: boolean;
  departSelectedSeats?: SeatTicket[];
  /* 
    Check if the operator of the return trip is different from the operator of the departure trip
  */
  isDifferentOperator?: boolean;
  /*
    return only operator nationalities of the return trip
  */
  departOperatorNationalities?: OperatorNationality[];
  /*
    Using to check if the operator of the return trip is different from the operator of the departure trip
  */
  ageConfigForBothVoyages?: {
    depart: TicketAgeCustomConfig[];
    return: TicketAgeCustomConfig[];
  };
  /*
    Only one excel file loaded
  */
  passengers?: Passenger[];

  handleChangeTab?: (event: React.SyntheticEvent, tab: string) => void;
  currentTab?: string;
  booking?: Booking;
  /*
    Booking data loading edit mode
  */
  onChangeSeatTicket: (seatTickets: SeatTicket[]) => void;
  checkReturnOrder?: boolean;
  checkSubmit?: boolean;
  hangs: Hang[];
  defaultVouchers?: Voucher[];
};

const maxSeatNumber = process.env.NEXT_PUBLIC_MAX_ALLOWED_PASSENGERS
  ? Number(process.env.NEXT_PUBLIC_MAX_ALLOWED_PASSENGERS)
  : 30;

function BoatSeatsLayout({
  boatLayout,
  voyageItem,
  operatorNationalities,
  picData,
  taxData,
  defaultSelectedSeats,
  onSavePassengerInfo,
  departSelectedSeats,
  isDifferentOperator,
  departOperatorNationalities,
  ageConfigForBothVoyages,
  passengers,
  handleChangeTab,
  currentTab,
  booking,
  onChangeSeatTicket,
  checkReturnOrder,
  checkSubmit,
  hangs,
  defaultVouchers,
}: Props) {
  const router = useRouter();

  const [seatTypeColors, setSeatTypeColors] = useState<SeatColorWithType[]>(
    DEFAULT_SEAT_TYPE_COLOR_PALETTE
  );
  const [selectedSeats, setSelectedSeats] = useState<SeatTicket[]>(
    defaultSelectedSeats ?? []
  );

  const [isImport, setIsImport] = useState(false);

  const [vouchers, setVouchers] = useState<Voucher[]>(defaultVouchers ?? []);

  // Use this ref to reduce re-render in seat switch
  const selectedSeatsRef = useRef<SeatTicket[]>(defaultSelectedSeats ?? []);
  const [activeTab, setActiveTab] = useState("0");
  // Use this ref to trigger passenger forms actions like insert & remove form fields
  const passengerFormsRef = useRef<PassengerFormRefType>(null);
  // Use this ref to check reach max seat limit and reduce re-render
  const reachMaxSeatRef = useRef<boolean>(false);
  // Use this ref to store route data and reduce re-render

  const isReturn = !!departOperatorNationalities;
  const searchParams = useSearchParams();

  const confirmDialog = useConfirmDialog();

  const [isChooseSeatMobileOpen, setIsChooseSeatMobileOpen] = useState(false);

  const { t } = useTranslation("ticket-detail");

  // Xử lý note theo hãng
  const operatorNote = hangs.find(
    (hang) =>
      hang?.operatorInfo?.operatorId ===
      voyageItem?.voyage?.operator?.operator_code
  )?.operatorInfo?.operatorNote;

  useEffect(() => {
    refreshWorkbook();
  }, []);

  useEffect(() => {
    if (voyageItem.voyage.route?.isVietnameseOnly) {
      setTimeout(() => {
        setIsOpenModalRouteForVietnamese(true);
      }, 1000);
    }
  }, [voyageItem.voyage.route?.isVietnameseOnly]);

  const [hasTourBeenShown, setHasTourBeenShown] = useState(false);

  const handleClick = useCallback(() => {
    setIsImport(true);
  }, []);

  const { setIsOpen: setOpenTour } = useTour();
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const [mounted, setMounted] = useState(false);

  const [isOpenModalRouteForVietnamese, setIsOpenModalRouteForVietnamese] =
    useState(false);

  const onRouteForVietnameseAgree = useCallback(
    () => setIsOpenModalRouteForVietnamese(false),
    []
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!mounted) {
      setMounted(true);
      return;
    }

    if (mounted) {
      // Check if the tour has been shown before
      const hasTourBeenShown =
        localStorage.getItem("hasTourBeenShown") === "true";
      setHasTourBeenShown(hasTourBeenShown);
      if (!hasTourBeenShown && !isDesktop) {
        setOpenTour(true);
      }
    }
  }, [isDesktop, mounted, setOpenTour]);

  const handleOpenAlert = useCallback(() => {
    setIsChooseSeatMobileOpen(true);
    if (!hasTourBeenShown) {
      setOpenTour(false);
    }
  }, [hasTourBeenShown, setOpenTour]);

  const ticketAgeConfig: TicketAgeCustomConfig[] = useMemo(() => {
    return getMinMaxAgeByByOperatorCode(
      voyageItem?.voyage.operator?.operator_code
    );
  }, [voyageItem?.voyage.operator?.operator_code]);

  const passengerConfig = useMemo(() => {
    return (
      voyageItem.voyage.operator?.configs.passenger_inputs ?? {
        full_name: {
          enable: true,
        },
        date_of_birth: { enable: true },
        social_id: { enable: true },
        email: { enable: true },
        phone_number: { enable: true },
        address: { enable: true },
        national_abbrev: { enable: true },
        gender: { enable: false },
        plate_number: { enable: false },
      }
    );
  }, [voyageItem.voyage.operator?.configs.passenger_inputs]);

  const noPlate = (voyageItem?.voyage.no_plate as number) || 0;
  const maxVehicleCapacity =
    voyageItem?.voyage.operator?.configs.max_vehicle_capacity ?? 0;

  // Start init form elements
  const formValidationSchema = useValidationSchema(
    ticketAgeConfig,
    passengerConfig
  );
  const methods = useForm(
    useMemo(
      () => ({
        resolver: yupResolver(formValidationSchema),
        defaultValues: {
          pic: {
            picName: "",
            picEmail: "",
            picPhone: "",
            phone_country_code: "VN",
            picSocialId: "",
          },
          isExportVat: false,
          vat: {
            email: "",
            taxNumber: "",
            name: "",
            address: "",
          },
          passengers: [],
        },
      }),
      [formValidationSchema]
    )
  );

  const { handleSubmit, control } = methods;

  useSendContactInfo(voyageItem.voyage, control);

  const selectTicketRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectTicketRef.current && formRef.current) {
      formRef.current.style.maxHeight = `${selectTicketRef.current.clientHeight}px`;
    }
  }, [selectTicketRef.current?.clientHeight]);

  useEffect(() => {
    if (defaultSelectedSeats) {
      setSelectedSeats(defaultSelectedSeats);
      selectedSeatsRef.current = defaultSelectedSeats;
    }
  }, [defaultSelectedSeats]);

  useEffect(() => {
    /**
     * Create a seat type color palette for the layout.
     * For example: the boat has 2 seat types: "ECO" and "VIP". The function then map these 2 types with the defined color palette. The result is: `"ECO": "text-black bg-green-100"`, `"VIP": "text-black bg-amber-100"`.
     *
     * Then, when create seats, we can map their seat type with the result and return the color
     * @param seatType list of seat types in this boat
     */
    function createSeatTypeColorPalette(seatType: string[]) {
      const mappedSeatColorWithType: SeatColorWithType[] = seatType.map(
        (seatType, index) => {
          // Get color from colorPalette with cyclic index
          const colorIndex = index % SEAT_COLOR_PALETTE.length;
          const color = SEAT_COLOR_PALETTE[colorIndex];

          // Assign seatType to color object
          return { ...color, seatType };
        }
      );

      setSeatTypeColors([
        ...DEFAULT_SEAT_TYPE_COLOR_PALETTE,
        ...mappedSeatColorWithType,
      ]);
    }

    createSeatTypeColorPalette(boatLayout.seat_types);
  }, [boatLayout.seat_types]);

  useEffect(() => {
    reachMaxSeatRef.current = selectedSeats.length >= maxSeatNumber;
  }, [selectedSeats.length]);

  const handleRemoveSelectedSeat = useCallback((positionId: number) => {
    const seatIndex = selectedSeatsRef.current.findIndex(
      (seat) => seat.seatMetadata.PositionId === positionId
    );

    if (seatIndex !== -1) {
      selectedSeatsRef.current = selectedSeatsRef.current.filter(
        (seat) => seat.seatMetadata.PositionId !== positionId
      );
      setSelectedSeats(selectedSeatsRef.current);
      passengerFormsRef.current?.remove(seatIndex);
    }
  }, []);

  const handleSelectedSeat = useCallback(
    (isSelected: boolean, seatData: SeatTicket) => {
      // Seat is selected
      if (isSelected) {
        if (!reachMaxSeatRef.current) {
          // Set new value in ref
          selectedSeatsRef.current = [...selectedSeatsRef.current, seatData];
          // selectedSeatsRef.current = [
          //   ...selectedSeatsRef.current,
          //   seatData,
          // ].sort(
          //   (seatA, seatB) =>
          //     seatA.seatMetadata.PositionId - seatB.seatMetadata.PositionId
          // );

          setSelectedSeats(selectedSeatsRef.current);

          // const newSeatIndex = selectedSeatsRef.current.findIndex(
          //   (seat) =>
          //     seat.seatMetadata.PositionId === seatData.seatMetadata.PositionId
          // );

          const { national_id, ...operatorNationality } =
            operatorNationalities.find((nationality) => nationality.default) ??
            operatorNationalities[0];
          const ticket_type_id =
            ticketAgeConfig.find((ticket) => ticket.label === "adult")
              ?.type_id ?? 1;

          const ticketPrice =
            seatData.selectedTicketPrice ??
            seatData.ticketPriceAppliedPromotions.find(
              (ticket) => ticket.ticket_type_id === ticket_type_id
            ) ??
            seatData.ticketPriceAppliedPromotions[0];

          passengerFormsRef.current?.append(
            // newSeatIndex,
            {
              name: "",
              address: "",
              dateOfBirth: new Date(2000, 0, 1),
              gender: TicketGenderEnum.Male,
              nationality: {
                national_id: national_id.toString(),
                ...operatorNationality,
              },
              plateNumber: "",
              socialId: "",
              positionId: seatData.seatMetadata.PositionId,
              seatName: seatData.seatMetadata.SeatName,
              price: seatData.selectedTicketPrice?.price_with_VAT ?? 0,
              allTicketPrice: JSON.stringify(
                seatData.ticketPriceAppliedPromotions
              ),
              ticketPrice: ticketPrice,
            },
            {
              shouldFocus: false,
            }
          );
        } else {
          toast.custom((toastId) => <ToasterMaxSeat toastId={toastId} />, {
            position: "top-center",
            className: "rounded-lg group-[.toaster]:shadow-md",
          });
        }
      } else {
        // Check if seat exist
        const seatIndex = selectedSeatsRef.current.findIndex(
          (seat) =>
            seat.seatMetadata.PositionId === seatData.seatMetadata.PositionId
        );

        if (seatIndex !== -1) {
          selectedSeatsRef.current = selectedSeatsRef.current.filter(
            (seat) =>
              seat.seatMetadata.PositionId !== seatData.seatMetadata.PositionId
          );
          setSelectedSeats(selectedSeatsRef.current);
          passengerFormsRef.current?.remove(seatIndex);
        }
      }
    },
    [operatorNationalities, ticketAgeConfig]
  );

  // Prepare data to render boat layout
  const createBoatLayoutWithSeatTickets = useMemo(
    () =>
      boatLayout?.floors.map((floorLayout) => {
        const seatsInFloor: SeatTicket[] = [];

        // Iterate through each row in a floor
        for (let i = 0; i < floorLayout.no_rows; i++) {
          const seatsInRow: SeatTicket[] = [];

          // Iterate through each seat in a row
          for (let j = 0; j < floorLayout.no_cols; j++) {
            const index = i * floorLayout.no_cols + j;
            if (
              index < floorLayout.Cols.length &&
              floorLayout.ColSpans[index] !== 0
            ) {
              // Check and define seat color
              const defaultSeatColor = {
                text: "text-seatDefault-foreground",
                background: "bg-seatDefault",
              };
              let seatColor: SeatColor =
                seatTypeColors
                  .filter(
                    (seatTypeColor) =>
                      seatTypeColor.seatType === floorLayout.SeatTypes[index]
                  )
                  ?.map((seatTypeColor) => ({
                    text: seatTypeColor.text,
                    background: seatTypeColor.background,
                  }))?.[0] ?? defaultSeatColor;

              if (floorLayout.IsBookeds[index]) {
                seatColor =
                  seatTypeColors.find(
                    (seatTypeColor) => seatTypeColor.seatType === "booked"
                  ) ?? defaultSeatColor;
              }

              if (floorLayout.IsHelds[index]) {
                seatColor =
                  seatTypeColors.find(
                    (seatTypeColor) => seatTypeColor.seatType === "onHold"
                  ) ?? defaultSeatColor;
              }

              const currentSeatType: string = floorLayout.SeatTypes[index];

              const seatMetadata: SeatMetadata = {
                Floor: index,
                Col: floorLayout.Cols[index],
                ColSpan: floorLayout.ColSpans[index],
                Row: floorLayout.Rows[index],
                RowSpan: floorLayout.RowSpans[index],
                PositionId: floorLayout.PositionIds?.[index],
                SeatId: floorLayout.SeatIds[index],
                SeatName: floorLayout.SeatNames[index],
                SeatType: currentSeatType,
                IsBooked: floorLayout.IsBookeds[index],
                IsHeld: floorLayout.IsHelds[index],
                IsVIP: floorLayout.IsVIPs[index],
                IsExported: floorLayout.IsExporteds[index],
                IsRender: floorLayout.IsRenders[index],
                IsRotate: floorLayout.IsRotates[index],
                IsSeat: floorLayout.IsSeats[index],
                SeatColor: seatColor,
                SortAuto: floorLayout.SortAutos?.[index] ?? 0,
                FloorId: floorLayout.floor_id,
              };

              // Find all ticket prices of current seat type
              const seatTicketPrice = boatLayout.prices.filter(
                (ticketType) => ticketType.seat_type === currentSeatType
              );

              // Find all ticket promotions of current seat type
              // const seatTicketPromotions = boatLayout.ticket_promotions.filter(
              //   (promotion) => promotion.seat_type === currentSeatType
              // );

              // const seatTicketPriceAppliedPromotionsBySeatType = seatTicketPrice
              //   .map<TicketPrice>((ticketPrice) => ({
              //     ...ticketPrice,
              //     price_with_VAT:
              //       seatTicketPromotions.find(
              //         (promotion) =>
              //           promotion.seat_type === ticketPrice.seat_type &&
              //           promotion.ticket_type_id === ticketPrice.ticket_type_id
              //       )?.price ?? ticketPrice.price_with_VAT,
              //   }))
              //   .filter(
              //     (ticketPrice) =>
              //       ticketPrice.seat_type === seatMetadata.SeatType
              //   );

              // Create new ticket price with promotion
              const seatTicketPriceAppliedPromotions = seatMetadata.IsVIP
                ? seatMetadata.SeatType === "NguyenThu" ||
                  seatMetadata.SeatType === "ThuongGia"
                  ? getTicketPriceIdsByOperatorCode(
                      voyageItem?.voyage.operator?.operator_code || "",
                      seatTicketPrice
                    )
                  : seatTicketPrice.length > 1
                    ? getTicketPriceIdsByOperatorCode(
                        voyageItem.voyage.operator?.operator_code || "",
                        seatTicketPrice
                      )
                    : seatTicketPrice
                : getTicketPriceIdsByOperatorCode(
                    voyageItem?.voyage.operator?.operator_code || "",
                    seatTicketPrice
                  );
              const ticketTypeDefault =
                voyageItem?.voyage.operator?.operator_code === "hoabinhship" &&
                seatMetadata.SeatType === "VIP"
                  ? 4
                  : (ticketAgeConfig.find((config) => config.label === "adult")
                      ?.type_id ?? 1);

              seatsInRow.push({
                seatMetadata: seatMetadata,
                ticketPrice: seatTicketPrice,
                selectedTicketPrice: seatTicketPriceAppliedPromotions.find(
                  (price) => price.ticket_type_id === ticketTypeDefault
                ),
                ticketPriceAppliedPromotions: seatTicketPriceAppliedPromotions,
              });
            }
          }
          seatsInFloor.push(...seatsInRow);
        }

        return {
          seatsInFloor,
          noCols: floorLayout.no_cols,
          noRows: floorLayout.no_rows,
        };
      }),
    [
      boatLayout?.floors,
      boatLayout.prices,
      seatTypeColors,
      ticketAgeConfig,
      voyageItem.voyage.operator?.operator_code,
    ]
  );

  // const [selectionStart, setSelectionStart] = useState<number | null>(null);

  // const selectRange = useCallback(
  //   (startId: number, endId: number) => {
  //     let isFullChair = false;
  //     const updatedItems = createBoatLayoutWithSeatTickets
  //       .map((floorLayout) => floorLayout.seatsInFloor)
  //       .flat()
  //       .filter(
  //         (item) =>
  //           item.seatMetadata.PositionId >= startId &&
  //           item.seatMetadata.PositionId <= endId &&
  //           !item.seatMetadata.IsBooked &&
  //           !item.seatMetadata.IsHeld &&
  //           item.seatMetadata.IsSeat
  //       );
  //     const remainingSeats = maxSeatNumber - selectedSeats.length;
  //     if (updatedItems.length === 1) {
  //       const item = updatedItems[0];
  //       const isSelected = selectedSeats.some(
  //         (selectedSeat) =>
  //           selectedSeat.seatMetadata?.PositionId ===
  //           item.seatMetadata?.PositionId
  //       );
  //       if (!isSelected) {
  //         if (remainingSeats > 0) {
  //           handleSelectedSeat(true, item);
  //         } else {
  //           toast.custom((toastId) => <ToasterMaxSeat toastId={toastId} />, {
  //             position: "top-center",
  //             className: "rounded-lg group-[.toaster]:shadow-md",
  //           });
  //         }
  //         return;
  //       }
  //       handleSelectedSeat(false, item);
  //       return;
  //     }
  //     updatedItems
  //       .filter((_, idx) => {
  //         if (idx < remainingSeats) {
  //           return true;
  //         } else {
  //           isFullChair = true;
  //           return false;
  //         }
  //       })
  //       .forEach((item) => {
  //         const isSelected = selectedSeats.some(
  //           (selectedSeat) =>
  //             selectedSeat.seatMetadata?.PositionId ===
  //             item.seatMetadata?.PositionId
  //         );
  //         if (!isSelected) {
  //           handleSelectedSeat(true, item);
  //         }
  //       });
  //     if (isFullChair) {
  //       toast.custom((toastId) => <ToasterMaxSeat toastId={toastId} />, {
  //         position: "top-center",
  //         className: "rounded-lg group-[.toaster]:shadow-md",
  //       });
  //     }
  //   },
  //   [createBoatLayoutWithSeatTickets, handleSelectedSeat, selectedSeats]
  // );

  // const handleMouseDown = useCallback(
  //   (event: MouseEvent<HTMLDivElement, globalThis.MouseEvent>) => {
  //     const element = document.elementFromPoint(event.clientX, event.clientY);
  //     if (!element) return;
  //     const id = Number(element.getAttribute("data-position-id"));
  //     if (event.shiftKey && selectionStart && selectionStart !== id) {
  //       selectRange(selectionStart, id);
  //       setSelectionStart(null);
  //       return;
  //     }

  //     setSelectionStart(id);
  //   },
  //   [selectRange, selectionStart]
  // );

  // const handleMouseUp = useCallback(
  //   (event: MouseEvent<HTMLDivElement, globalThis.MouseEvent>) => {
  //     if (event.shiftKey) return;
  //     const element = document.elementFromPoint(event.clientX, event.clientY);
  //     if (!element) return;
  //     const id = Number(element.getAttribute("data-position-id"));
  //     if (selectionStart === null || selectionStart === id) {
  //       selectRange(id, id);
  //       return;
  //     }
  //     selectRange(selectionStart, id);
  //     setSelectionStart(null);
  //   },
  //   [selectRange, selectionStart]
  // );

  // const handleTouchStart = useCallback(
  //   (event: React.TouchEvent<HTMLDivElement>) => {
  //     const touch = event.touches[0];
  //     const element = document.elementFromPoint(touch.clientX, touch.clientY);

  //     if (element) {
  //       const id = Number(element.getAttribute("data-position-id"));
  //       setSelectionStart(id);
  //     }
  //   },
  //   []
  // );

  // const handleTouchEnd = useCallback(
  //   (event: React.TouchEvent<HTMLDivElement>) => {
  //     if (selectionStart === null) return;
  //     const touch = event.changedTouches[0];
  //     const element = document.elementFromPoint(touch.clientX, touch.clientY);
  //     if (element) {
  //       const id = Number(element.getAttribute("data-position-id"));
  //       if (id && selectionStart && id !== selectionStart) {
  //         const startId = Math.min(selectionStart, id);
  //         const endId = Math.max(selectionStart, id);
  //         selectRange(startId, endId);
  //       }
  //       if (id && selectionStart && id === selectionStart) {
  //         selectRange(id, id);
  //       }
  //     }
  //     setSelectionStart(null);
  //   },
  //   [selectRange, selectionStart]
  // );

  // const handleOnMouseLeave = useCallback(() => {
  //   setSelectionStart(null);
  // }, []);

  const boatLayoutContent = useMemo(
    () =>
      createBoatLayoutWithSeatTickets?.map((floorLayout, index) => {
        const tabTrigger = (
          <BoatLayoutTabTrigger
            key={index}
            tabValue={index}
            onTabClick={setActiveTab}
          />
        );

        const tabContent = (
          <TabsContent
            key={index}
            value={index.toString()}
            hidden={index.toString() !== activeTab}
            forceMount
          >
            <ScrollArea className="w-full whitespace-nowrap pb-3">
              <div
                className="grid w-max min-w-full select-none gap-2"
                style={{
                  gridTemplateColumns: `repeat(${floorLayout.noCols}, minmax(0, 1fr))`,
                }}
              >
                {floorLayout.seatsInFloor.map((seatTicket) => {
                  const isSelected =
                    selectedSeats.some(
                      (selectedSeat) =>
                        selectedSeat.seatMetadata?.PositionId ===
                        seatTicket.seatMetadata?.PositionId
                    ) && !seatTicket.seatMetadata.IsBooked;
                  return (
                    <SelectedSeat
                      seatTicket={seatTicket}
                      handleSelectedSeat={handleSelectedSeat}
                      ticketAgeConfig={ticketAgeConfig}
                      key={seatTicket.seatMetadata.PositionId}
                      isSelected={isSelected}
                      isReadOnly={
                        seatTicket.seatMetadata.IsBooked ||
                        seatTicket.seatMetadata.IsHeld ||
                        !seatTicket.seatMetadata.IsSeat
                      }
                    />
                  );
                })}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </TabsContent>
        );

        return {
          tabTrigger,
          tabContent,
        };
      }),
    [
      createBoatLayoutWithSeatTickets,
      activeTab,
      selectedSeats,
      handleSelectedSeat,
      ticketAgeConfig,
    ]
  );

  const onSubmit = async (formData: VoyageFormData) => {
    const passengers = methods.getValues("passengers") || [];
    let hasDuplicateError = false;

    if (
      !(
        (searchParams.get("mode") === "edit" && !checkReturnOrder) ||
        (searchParams.get("mode") === "edit" && currentTab === "1")
      )
    ) {
      // Get children ticket type ID
      const checkChildrenAgeId = ticketAgeConfig.find(
        (config) => config.label === "children"
      )?.type_id;

      // Kiểm tra trùng lặp Social ID
      const socialIdMap = new Map();
      passengers.forEach((passenger, index) => {
        // Skip check for children
        if (passenger.ticketPrice?.ticket_type_id === checkChildrenAgeId) {
          return; // Skip this passenger if they are a child
        }

        if (passenger.socialId) {
          if (socialIdMap.has(passenger.socialId)) {
            const duplicateIndex = socialIdMap.get(passenger.socialId);

            // Check if the duplicate is not a child
            if (
              passengers[duplicateIndex].ticketPrice?.ticket_type_id !==
              checkChildrenAgeId
            ) {
              // The duplicate checking logic remains, but we've changed the condition
              // to also verify that the duplicate passenger is not a child
              hasDuplicateError = true;
            }
          } else {
            socialIdMap.set(passenger.socialId, index);
          }
        }
      });
    }

    if (hasDuplicateError) {
      return;
    }

    // Lấy thông tin quốc gia từ phone_country_code
    const countryInfo = getCountry(formData.pic.phone_country_code);

    // Gán lại số điện thoại với mã quốc gia
    const phoneWithCountryCode = countryInfo?.phone
      ? `+${countryInfo.phone}${formData.pic.picPhone}`
      : formData.pic.picPhone;

    // Cập nhật picPhone
    const updatedFormData = {
      ...formData,
      pic: {
        ...formData.pic,
        picPhone: phoneWithCountryCode,
      },
    };

    // Select operatorNationalities based on isReturn
    const currentOperatorNationalities = operatorNationalities;

    const selectedSeatsWithPassengerData = selectedSeats.map((seat) => {
      const foundPassengerData = updatedFormData.passengers?.find(
        (passenger) => passenger.positionId === seat.seatMetadata.PositionId
      );

      const selectedTicketPrice =
        seat.ticketPriceAppliedPromotions.find(
          (ticket) =>
            ticket.ticket_type_id.toString() ===
            foundPassengerData?.ticketPrice?.ticket_type_id.toString()
        ) || seat.selectedTicketPrice;

      if (foundPassengerData) {
        const {
          nationality,
          dateOfBirth,
          gender,
          plateNumber,
          name,
          socialId,
          address,
          ...passengerData
        } = foundPassengerData;

        // Find matching nationality in operatorNationalities
        let matchedNationality: OperatorNationality | undefined =
          currentOperatorNationalities.find(
            (opNationality) =>
              String(opNationality.national_id) ===
                String(nationality.national_id) ||
              opNationality.name === String(nationality.name) ||
              opNationality.abbrev === String(nationality.abbrev)
          );

        // Fallback to default or first nationality if no match
        if (!matchedNationality) {
          matchedNationality =
            currentOperatorNationalities.find(
              (opNationality) => opNationality.default
            ) ?? currentOperatorNationalities[0];
        }

        // Use base_national_id if available, otherwise fall back to national_id
        const nationalId =
          matchedNationality?.base_national_id ??
          matchedNationality?.national_id ??
          nationality.national_id;
        return {
          ...seat,
          passengerData: {
            nationality: nationalId.toString(), // Use base_national_id (e.g., 'US') or national_id
            ...(passengerConfig.gender.enable && { gender }),
            ...(passengerConfig.plate_number.enable && { plateNumber }),
            ...(passengerConfig.social_id.enable && socialId && { socialId }),
            ...(passengerConfig.address.enable && address && { address }),
            ...(passengerConfig.full_name.enable && name && { name }),
            dateOfBirth: format(dateOfBirth, "yyyy-MM-dd"),
            ...passengerData,
          },
          selectedTicketPrice,
        };
      }

      return {
        ...seat,
        passengerData: foundPassengerData,
      };
    });

    if (passengerConfig.plate_number.enable) {
      const noPlatePassenger = selectedSeatsWithPassengerData.reduce(
        (count, seat) => {
          if (seat.passengerData?.plateNumber) {
            count += 1;
          }
          return count;
        },
        0
      );

      // Sometimes the operator allow to book more than maxVehicleCapacity, thus we need to check whether `noPlatePassenger` is greater than 0 before checking if its exceed the limit
      if (
        noPlatePassenger &&
        noPlatePassenger > maxVehicleCapacity - (noPlate ?? 0)
      ) {
        confirmDialog.confirmDialog({
          title: "Vượt quá số lượng giữ xe",
          message: `Hiện tại số lượng xe có thể giữ là ${
            maxVehicleCapacity - (noPlate ?? 0) < 0
              ? 0
              : maxVehicleCapacity - (noPlate ?? 0)
          }. Số lượng xe đã vượt quá giới hạn cho phép của chuyến tàu. Vui lòng kiểm tra và nhập lại.`,
          hasCancelButton: false,
          successButtonText: "OK",
        });
        return;
      }
    }

    if (onSavePassengerInfo) {
      onSavePassengerInfo(
        updatedFormData.pic,
        selectedSeatsWithPassengerData,
        formData.isExportVat ? updatedFormData.vat : undefined,
        vouchers
      );
    }
  };

  const inputClassNames = useMemo(
    () => ({
      base: "col-span-6 flex flex-col gap-1.5",
      input:
        "!mt-0 min-h-7 rounded-md border-1 border-default-400 p-1 px-3 py-2 text-default-700 data-[hover=true]:border-black md:text-sm",
      label: "font-medium md:text-sm text-xs",
    }),
    []
  );

  const inputEmailClassNames = useMemo(
    () => ({
      base: "col-span-6 flex flex-col gap-1.5",
      input:
        "!mt-0 min-h-7 rounded-md border-1 border-default-400 p-1 px-3 py-2 text-default-700 data-[hover=true]:border-black md:text-sm",
      label: "font-medium md:text-sm text-xs",
    }),
    []
  );

  const handleDownload = useCallback(() => {
    handleExportTemplate(passengerConfig);
  }, [passengerConfig]);

  const handleExportCurrentData = useCallback(() => {
    const realTimePassengerForms: FormPassengerTicket[] =
      methods.getValues("passengers") ?? [];
    handleExportPassengerFromTable(
      realTimePassengerForms,
      passengerConfig,
      isReturn
    );
  }, [isReturn, methods, passengerConfig]);

  // const handleImport = useCallback(() => {
  //   if (fileInputRef.current) {
  //     fileInputRef.current.value = "";
  //     fileInputRef.current.click();
  //   }
  // }, []);

  const formatDOB = (dob?: string) => {
    if (!dob) return `01/01/2000`;

    const [day, month, year] = dob.split("/");
    return `${month}/${day}/${year}`;
  };

  const getNationalityName = useCallback(
    (nationality?: string) => {
      if (!nationality)
        return (
          operatorNationalities.find((item) => item.default)?.name ||
          operatorNationalities[0].name
        );
      const lowerCaseNationality = nationality.toLowerCase();
      const operatorNationality =
        operatorNationalities.find(
          (item) =>
            item.national_id.toString().toLowerCase() ===
              lowerCaseNationality ||
            item.name.toLowerCase().startsWith(lowerCaseNationality) ||
            item.name.toLowerCase().endsWith(lowerCaseNationality)
        ) ??
        operatorNationalities.find((item) => item.default) ??
        operatorNationalities[0];

      return operatorNationality?.name ?? operatorNationalities[0].name;
    },
    [operatorNationalities]
  );

  const onCloseImport = useCallback(() => {
    setIsImport(false);
    // setErrorMessageImport([]);
    // setNumberImported(0);
  }, []);

  /**
   * Old handle import passengers data
   */
  // const handleFileChange = useCallback(
  //   async (event: React.ChangeEvent<HTMLInputElement>) => {
  //     const file = event.target.files?.[0];
  //     if (file) {
  //       // Handle the file here, e.g., read its contents
  //       const wb = XLSX.read(await file.arrayBuffer());

  //       // Data is an array of arrays extracted from the sheet
  //       const data: [] = XLSX.utils
  //         .sheet_to_json(wb.Sheets[wb.SheetNames[0]], {
  //           header: 1,
  //         })
  //         .slice(2) as [];
  //       let numberImported = 0;
  //       const formPassengerTickets = selectedSeats.map((seat, idx) => {
  //         const passengerData: string[] | [] =
  //           idx < data.length ? data[idx] : [];

  //         if (!passengerConfig.plate_number) {
  //           // Nếu chỉ plate_number là false, xóa tại vị trí 6
  //           passengerData.splice(6, 1);
  //         }

  //         if (!passengerConfig.gender) {
  //           // Nếu chỉ gender là false, xóa tại vị trí 5
  //           passengerData.splice(5, 1);
  //         }

  //         // passengerData is an array extracted from the sheet with the same order as the header
  //         // 0: name
  //         // 1: dateOfBirth
  //         // 2: gender
  //         // 3: socialId
  //         // 4: address
  //         // 5: nationality

  //         if (
  //           passengerData &&
  //           passengerData.length >= countTrue &&
  //           passengerData[5] !== ""
  //         ) {
  //           let gender;
  //           if (typeof passengerData[5] === "string") {
  //             const parsedGender = parseInt(passengerData[5], 10);
  //             gender =
  //               parsedGender === 0 || parsedGender === 1
  //                 ? parsedGender
  //                 : undefined;
  //           } else if (typeof passengerData[5] === "number") {
  //             gender =
  //               passengerData[5] === 0 || passengerData[5] === 1
  //                 ? passengerData[5]
  //                 : undefined;
  //           } else {
  //             gender = TicketGenderEnum.Male;
  //           }

  //           const passengerTicket: PassengerTicket = {
  //             name: removeAccents(passengerData[0]).toUpperCase(),
  //             dateOfBirth: formatDOB(passengerData[1]),
  //             socialId: passengerData[2],
  //             address: passengerData[3],
  //             nationality: getNationalityName(passengerData[4]),
  //             gender: gender,
  //             plateNumber: !passengerConfig.gender
  //               ? passengerData[5]
  //               : passengerData[6],
  //           };
  //           seat.passengerData = passengerTicket;
  //           numberImported += 1;
  //         } else {
  //           setErrorMessageImport((prev) => [
  //             ...prev,
  //             `${t("import-modal.invalid-data-for")} ${seat.seatMetadata.SeatName}`,
  //           ]);
  //         }
  //         setNumberImported(numberImported);
  //         const { national_id, ...operatorNationality } =
  //           operatorNationalities.find(
  //             (item) =>
  //               item.national_id.toString().toLowerCase() ===
  //                 seat.passengerData?.nationality.toLowerCase() ||
  //               item.name.toLowerCase() ===
  //                 seat.passengerData?.nationality.toLowerCase()
  //           ) ??
  //           operatorNationalities.find((item) => item.default) ??
  //           operatorNationalities[0];

  //         let age =
  //           new Date().getFullYear() -
  //           new Date(
  //             seat.passengerData?.dateOfBirth
  //               ? new Date(seat.passengerData?.dateOfBirth)
  //               : new Date(2000, 1, 1)
  //           ).getFullYear();
  //         let ticketSelectedType = ticketAgeConfig.find(
  //           (ticket) => ticket.min <= age && ticket.max >= age
  //         );
  //         if (ticketAgeConfig && ticketAgeConfig[0].is_with_date) {
  //           age = calculateAge(
  //             new Date(
  //               seat.passengerData?.dateOfBirth
  //                 ? new Date(seat.passengerData?.dateOfBirth)
  //                 : new Date(2000, 1, 1)
  //             ).toDateString()
  //           );
  //           ticketSelectedType = ticketAgeConfig.find(
  //             (ticket) => ticket.min - 1 <= age && ticket.max > age
  //           );
  //         }

  //         if (
  //           ticketSelectedType?.label === "elderly" &&
  //           !operatorNationality.default
  //         ) {
  //           ticketSelectedType = ticketAgeConfig.find(
  //             (ticket) => ticket.label === "adult"
  //           );
  //         }

  //         const ticketSelected =
  //           seat.ticketPriceAppliedPromotions.find(
  //             (ticket: TicketPrice) =>
  //               ticket.ticket_type_id === ticketSelectedType?.type_id
  //           ) ?? seat.ticketPriceAppliedPromotions[0];

  //         let socialId = seat.passengerData?.socialId;
  //         if (ticketSelectedType?.label === "children") {
  //           socialId = "TE";
  //         }

  //         return {
  //           name: seat.passengerData?.name ?? "",
  //           address: seat.passengerData?.address ?? "",
  //           gender: seat.passengerData?.gender ?? TicketGenderEnum.Male,
  //           dateOfBirth: seat.passengerData?.dateOfBirth
  //             ? new Date(seat.passengerData?.dateOfBirth)
  //             : new Date(2000, 1, 1),
  //           nationality: {
  //             national_id: national_id.toString(),
  //             ...operatorNationality,
  //           },
  //           plateNumber: seat.passengerData?.plateNumber,
  //           socialId: socialId ?? "",
  //           positionId: seat.seatMetadata.PositionId,
  //           seatName: seat.seatMetadata.SeatName,
  //           price: seat.selectedTicketPrice?.price_with_VAT ?? 0,
  //           allTicketPrice: JSON.stringify(seat.ticketPriceAppliedPromotions),
  //           ticketPrice:
  //             ticketSelected?.ticket_type_id ===
  //             seat.selectedTicketPrice?.ticket_type_id
  //               ? seat.selectedTicketPrice
  //               : ticketSelected,
  //         };
  //       });
  //       passengerFormsRef.current?.remove();
  //       passengerFormsRef.current?.append(formPassengerTickets);
  //       toast.success(t("import-modal.success"));
  //       if (numberImported === selectedSeats.length) {
  //         setTimeout(() => onCloseImport(), 3000);
  //       }
  //     }
  //   },
  //   [
  //     selectedSeats,
  //     t,
  //     passengerConfig.plate_number,
  //     passengerConfig.gender,
  //     countTrue,
  //     operatorNationalities,
  //     ticketAgeConfig,
  //     getNationalityName,
  //     onCloseImport,
  //   ]
  // );
  /**
   * New handle import passengers data
   */
  const handleImportPassengers = useCallback(
    async (
      fileData: string[][],
      utils: {
        setTotalRecord: React.Dispatch<React.SetStateAction<number>>;
        setCurrentProgress: React.Dispatch<React.SetStateAction<number>>;
        setErrorMessages: React.Dispatch<React.SetStateAction<string[]>>;
      }
    ) => {
      utils.setTotalRecord(selectedSeats.length);

      let numberImported = 0;
      let hasError = false;
      const formPassengerTickets = selectedSeats.map((seat, idx) => {
        const passengerData: string[] | [] =
          idx < fileData.length ? fileData[idx] : [];

        if (!passengerConfig.plate_number.enable) {
          // Nếu chỉ plate_number là false, xóa tại vị trí 6
          passengerData.splice(6, 1);
        }

        if (!passengerConfig.gender.enable) {
          // Nếu chỉ gender là false, xóa tại vị trí 5
          passengerData.splice(5, 1);
        }

        // passengerData is an array extracted from the sheet with the same order as the header
        // 0: name
        // 1: dateOfBirth
        // 2: socialId
        // 3: address
        // 4: nationality
        // 5: gender
        // 6: plateNumber

        // normal case 0 - 4
        // greenline case 0 - 5
        // superdong case 0 - 6, except 5

        if (
          passengerData &&
          passengerData.length > 0 &&
          passengerData.reduce(
            (b, a) => b || !(a === "" || a === undefined),
            false
          )
        ) {
          let gender;
          if (typeof passengerData[5] === "string") {
            const parsedGender = parseInt(passengerData[5], 10);
            gender =
              parsedGender === 0 || parsedGender === 1
                ? parsedGender
                : undefined;
          } else if (typeof passengerData[5] === "number") {
            gender =
              passengerData[5] === 0 || passengerData[5] === 1
                ? passengerData[5]
                : undefined;
          } else {
            gender = TicketGenderEnum.Male;
          }

          if (!passengerData[0]) {
            utils.setErrorMessages((prev) => [
              ...prev,
              `${t("import-modal.name-empty", { seat: seat.seatMetadata.SeatName })}`,
            ]);
            hasError = true;
          }

          if (!passengerData[1]) {
            utils.setErrorMessages((prev) => [
              ...prev,
              `${t("import-modal.dob-empty", { seat: seat.seatMetadata.SeatName })}`,
            ]);
            hasError = true;
          }

          if (
            passengerData[1] &&
            !passengerData[1].match(/^\d{2}\/\d{2}\/\d{4}$/)
          ) {
            utils.setErrorMessages((prev) => [
              ...prev,
              `${t("import-modal.dob-invalid", { seat: seat.seatMetadata.SeatName })}`,
            ]);
            hasError = true;
          }

          const passengerTicket: PassengerTicket = {
            name: removeAccents(passengerData[0]).toUpperCase(),
            dateOfBirth: formatDOB(passengerData[1]),
            socialId: passengerData[2],
            address: passengerData[3],
            nationality: getNationalityName(passengerData[4]),
            gender: gender,
            plateNumber: !passengerConfig.gender.enable
              ? passengerData[5]
              : passengerData[6],
          };
          seat.passengerData = passengerTicket;
          numberImported += 1;
        } else {
          utils.setErrorMessages((prev) => [
            ...prev,
            `${t("import-modal.invalid-data-for", { seat: seat.seatMetadata.SeatName })}`,
          ]);
        }
        utils.setCurrentProgress(numberImported);
        const { national_id, ...operatorNationality } =
          operatorNationalities.find(
            (item) =>
              item.national_id.toString().toLowerCase() ===
                seat.passengerData?.nationality.toLowerCase() ||
              item.name.toLowerCase() ===
                seat.passengerData?.nationality.toLowerCase()
          ) ??
          operatorNationalities.find((item) => item.default) ??
          operatorNationalities[0];

        let age =
          new Date().getFullYear() -
          new Date(
            seat.passengerData?.dateOfBirth
              ? new Date(seat.passengerData?.dateOfBirth)
              : new Date(2000, 1, 1)
          ).getFullYear();
        let ticketSelectedType = ticketAgeConfig.find(
          (ticket) => ticket.min <= age && ticket.max >= age
        );
        if (ticketAgeConfig && ticketAgeConfig[0].is_with_date) {
          age = calculateAge(
            new Date(
              seat.passengerData?.dateOfBirth
                ? new Date(seat.passengerData?.dateOfBirth)
                : new Date(2000, 1, 1)
            ).toDateString()
          );
          ticketSelectedType = ticketAgeConfig.find(
            (ticket) => ticket.min - 1 <= age && ticket.max > age
          );
        }

        if (
          ticketSelectedType?.label === "elderly" &&
          !operatorNationality.default
        ) {
          ticketSelectedType = ticketAgeConfig.find(
            (ticket) => ticket.label === "adult"
          );
        }

        const ticketSelected =
          seat.ticketPriceAppliedPromotions.find(
            (ticket: TicketPrice) =>
              ticket.ticket_type_id === ticketSelectedType?.type_id
          ) ?? seat.ticketPriceAppliedPromotions[0];

        let socialId = seat.passengerData?.socialId;
        if (ticketSelectedType?.label === "children") {
          socialId = "TE";
        }

        return {
          name: seat.passengerData?.name ?? "",
          address: seat.passengerData?.address ?? "",
          gender: seat.passengerData?.gender ?? TicketGenderEnum.Male,
          dateOfBirth: seat.passengerData?.dateOfBirth
            ? new Date(seat.passengerData?.dateOfBirth)
            : new Date(2000, 1, 1),
          nationality: {
            national_id: national_id.toString(),
            ...operatorNationality,
          },
          plateNumber: seat.passengerData?.plateNumber,
          socialId: socialId ?? "",
          positionId: seat.seatMetadata.PositionId,
          seatName: seat.seatMetadata.SeatName,
          price: seat.selectedTicketPrice?.price_with_VAT ?? 0,
          allTicketPrice: JSON.stringify(seat.ticketPriceAppliedPromotions),
          ticketPrice:
            ticketSelected?.ticket_type_id ===
            seat.selectedTicketPrice?.ticket_type_id
              ? seat.selectedTicketPrice
              : ticketSelected,
        };
      });
      passengerFormsRef.current?.remove();
      passengerFormsRef.current?.append(formPassengerTickets);
      toast.success(t("import-modal.success"));
      if (numberImported === selectedSeats.length && !hasError) {
        setTimeout(() => onCloseImport(), 3000);
      }
    },
    [
      getNationalityName,
      onCloseImport,
      operatorNationalities,
      passengerConfig.gender.enable,
      passengerConfig.plate_number.enable,
      selectedSeats,
      t,
      ticketAgeConfig,
    ]
  );

  const SubmitFormButton = memo(function SubmitFormButton({
    className,
    checkSubmit,
  }: {
    className?: string;
    checkSubmit?: boolean;
  }) {
    return (
      <>
        {
          <Button
            id="btn-handle-next-step"
            disabled={checkSubmit}
            type={`${(searchParams.get("mode") === "edit" && !checkReturnOrder) || (searchParams.get("mode") === "edit" && currentTab === "1") ? "button" : "submit"}`}
            className={className}
            onClick={handleSubmitClick}
          >
            <Spinner
              color="white"
              size="md"
              className={cn("text-white", checkSubmit ? "" : "hidden")}
            />
            {t("nextStep")}
            <MdArrowForward className="h-6 w-6" />
          </Button>
        }
      </>
    );
  });

  function swapSeatTicket(arr: SeatTicket[], index1: number, index2: number) {
    if (arr.length === index2) return;
    const temp = arr[index1];
    arr[index1] = arr[index2];
    arr[index2] = temp;
  }

  const handleSyncPassengerData = useCallback(() => {
    const departData = departSelectedSeats;
    if (passengerFormsRef && departData) {
      const syncData = passengerFormsRef.current?.fields.map((field, index) => {
        if (index >= departData.length) return field;
        let passengerData = departData[index].passengerData;

        if (ageConfigForBothVoyages) {
          const isDifferentTicketType =
            ageConfigForBothVoyages.return.find(
              (item) => item.type_id === field.ticketPrice.ticket_type_id
            )?.label !==
            ageConfigForBothVoyages.depart.find(
              (item) =>
                item.type_id ===
                departData[index].selectedTicketPrice?.ticket_type_id
            )?.label;

          if (isDifferentTicketType) {
            const sameTypeIndex = departData.findIndex(
              (item, idx) =>
                idx > index &&
                ageConfigForBothVoyages.return.find(
                  (item) => item.type_id === field.ticketPrice.ticket_type_id
                )?.label ===
                  ageConfigForBothVoyages.depart.find(
                    (item) =>
                      item.type_id ===
                      departData[idx].selectedTicketPrice?.ticket_type_id
                  )?.label
            );

            if (sameTypeIndex !== -1) {
              swapSeatTicket(departData, index, sameTypeIndex);
              passengerData = departData[index].passengerData;
            }
          }
        }
        if (passengerData) {
          let returnOperatorNationality: OperatorNationality | undefined;

          if (!isDifferentOperator) {
            returnOperatorNationality = operatorNationalities.find(
              (nationality) =>
                nationality.national_id.toString() ===
                passengerData?.nationality.toString()
            );
          } else {
            if (
              !isNaN(Number(passengerData?.nationality)) &&
              departOperatorNationalities
            ) {
              returnOperatorNationality = operatorNationalities.find(
                (nationality) =>
                  String(nationality.national_id) ===
                    String(passengerData?.nationality) ||
                  nationality.name === String(passengerData?.nationality) ||
                  nationality.abbrev === String(passengerData?.nationality)
              );
            } else {
              returnOperatorNationality = operatorNationalities.find(
                (nationality) =>
                  nationality.abbrev === passengerData?.nationality
              );
            }
          }

          // If returnOperatorNationality is still undefined, find the default or use the first one
          if (!returnOperatorNationality) {
            returnOperatorNationality =
              returnOperatorNationality ??
              operatorNationalities.find(
                (nationality) => nationality.default
              ) ??
              operatorNationalities[0];
          }
          const { national_id, ...operatorNationality } =
            returnOperatorNationality;
          return {
            ...field,
            ...(passengerConfig.address.enable &&
              passengerData.address && { address: passengerData.address }),
            ...(passengerConfig.full_name.enable &&
              passengerData.name && { name: passengerData.name }),
            ...(passengerConfig.gender.enable && {
              gender: passengerData.gender ?? TicketGenderEnum.Male,
            }),
            dateOfBirth: new Date(passengerData.dateOfBirth),
            ...(passengerConfig.social_id.enable &&
              passengerData.socialId && { socialId: passengerData.socialId }),
            nationality: {
              national_id: national_id.toString(),
              ...operatorNationality,
            },
            ...(passengerConfig.plate_number.enable && {
              plateNumber: passengerData.plateNumber ?? "",
            }),
          };
        }
        return field;
      });
      if (syncData) {
        passengerFormsRef.current?.remove();
        passengerFormsRef.current?.append(syncData);
      }
    }
  }, [
    ageConfigForBothVoyages,
    departOperatorNationalities,
    departSelectedSeats,
    isDifferentOperator,
    operatorNationalities,
    passengerConfig.address.enable,
    passengerConfig.full_name.enable,
    passengerConfig.gender.enable,
    passengerConfig.plate_number.enable,
    passengerConfig.social_id.enable,
  ]);

  const handleBackButtonClicked = useCallback(
    (event: React.SyntheticEvent) => {
      if (currentTab === "1") {
        handleChangeTab?.(event, "0");
      } else {
        router.back();
      }
    },
    [currentTab, handleChangeTab, router]
  );

  const scrollToSelectTicket = useCallback(() => {
    if (selectTicketRef.current) {
      selectTicketRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, []);

  const [isExportVAT, setIsExportVAT] = useState(
    methods.getValues("isExportVat")
  );

  const handleChangeExportVAT = useCallback(
    (isSelected: boolean) => {
      setIsExportVAT(isSelected);
      methods.setValue("isExportVat", isSelected);
      if (!isSelected) {
        methods.resetField("vat");
      }
    },
    [methods]
  );

  const handleSubmitClick = () => {
    if (searchParams.get("mode") === "edit" && !checkReturnOrder) {
      confirmDialog.confirmDialog({
        title: t("confirmDialogEdit.title"),
        message: `${t("confirmDialogEdit.message")} ${searchParams.get("booking_id") ?? ""}`,
        hasCancelButton: false,
        successButtonText: "OK",
        successButtonAction: () => {
          // Đóng dialog và thực thi handleSubmit
          handleSubmit(onSubmit)();
        },
      });
    } else {
      handleSubmit(onSubmit);
    }
  };

  useEffect(() => {
    if (booking) {
      if (!isReturn) {
        const { depart_order } = booking;
        const positionIds = depart_order?.tickets?.map(
          (ticket) => ticket.position_id
        );

        setVouchers(depart_order?.vouchers ?? []);

        const seatsData = createBoatLayoutWithSeatTickets
          ?.map((floorLayout) =>
            floorLayout.seatsInFloor.filter((seat) =>
              positionIds?.includes(`${seat.seatMetadata.PositionId}`)
            )
          )
          .flat();

        if (!seatsData) return;
        const departSelectedSeats: SeatTicket[] = depart_order?.tickets?.map(
          (ticket) => {
            const seatData =
              seatsData.find(
                (seat) =>
                  `${seat.seatMetadata.PositionId}` === ticket.position_id
              ) ?? seatsData[0];

            const selectedTicketPrice = seatData.ticketPrice.find(
              (ticketPrice) =>
                ticketPrice.ticket_type_id === ticket.ticket_type_id
            );

            return {
              ...seatData,
              selectedTicketPrice,
              passengerData: {
                nationality: ticket.national_id || "",
                name: ticket.name,
                gender: ticket.gender,
                dateOfBirth: ticket.date_of_birth,
                socialId: ticket.social_id,
                address: ticket.home_town,
                plateNumber: ticket.plate_number,
                positionId: Number(ticket.position_id),
              },
            };
          }
        );
        if (departSelectedSeats) {
          onChangeSeatTicket(departSelectedSeats);
        }
      } else {
        const { return_order } = booking;
        setVouchers(return_order?.vouchers ?? []);
        const positionIds = return_order?.tickets?.map(
          (ticket) => ticket.position_id
        );
        const seatsData = createBoatLayoutWithSeatTickets
          ?.map((floorLayout) =>
            floorLayout.seatsInFloor.filter((seat) =>
              positionIds?.includes(`${seat.seatMetadata.PositionId}`)
            )
          )
          .flat();
        if (!seatsData) return;
        const destiSelectedSeats = return_order?.tickets?.map((ticket) => {
          const seatData =
            seatsData.find(
              (seat) => `${seat.seatMetadata.PositionId}` === ticket.position_id
            ) ?? seatsData[0];

          const selectedTicketPrice = seatData.ticketPrice.find(
            (ticketPrice) =>
              ticketPrice.ticket_type_id === ticket.ticket_type_id
          );
          return {
            ...seatData,
            selectedTicketPrice,
            passengerData: {
              nationality: ticket.national_id || "",
              name: ticket.name,
              gender: ticket.gender,
              dateOfBirth: ticket.date_of_birth,
              socialId: ticket.social_id,
              address: ticket.home_town,
              plateNumber: ticket.plate_number,
              positionId: Number(ticket.position_id),
            },
          };
        });

        if (destiSelectedSeats) {
          onChangeSeatTicket(destiSelectedSeats);
        }
      }
    }
  }, [booking, createBoatLayoutWithSeatTickets, isReturn, onChangeSeatTicket]);

  useEffect(() => {
    if (taxData) {
      setIsExportVAT(true);
      methods.setValue("vat", {
        email: taxData.email,
        taxNumber: taxData.taxNumber,
        name: taxData.name,
        address: taxData.address,
      });
      methods.setValue("isExportVat", true);
    } else {
      setIsExportVAT(false);
    }
  }, [taxData, methods]);

  const name = useMemo(
    () => ({
      countryCode: "pic.phone_country_code",
      phoneNumber: "pic.picPhone",
    }),
    []
  );
  const defaultValues = useMemo(
    () => ({
      countryCode: picData?.phone_country_code || "VN",
      phoneNumber: processPhoneNumber(
        picData?.picPhone as string,
        picData?.phone_country_code || "VN"
      ),
    }),
    [picData?.phone_country_code, picData?.picPhone]
  );

  const classNames = useMemo(
    () => ({
      base: "flex flex-col gap-1.5 w-full",
      input:
        "!mt-0 min-h-7 rounded-md border-1 border-default-400 p-1 px-3 py-2 text-default-700 data-[hover=true]:border-black md:text-sm rounded-tl-none rounded-bl-none",
      label: "top-full font-medium md:text-sm text-xs",
      countryCodeTrigger:
        "!mt-0 min-h-7 rounded-md border-1 border-default-400 p-1 px-3 py-2 text-default-700 data-[hover=true]:border-black w-full md:text-sm rounded-tr-none rounded-br-none",
      baseCountryCode: "flex flex-col gap-1 space-y-1 w-[80px] flex-none",
      labelCountryCode: "leading-5 text-xs",
      wrapper: "col-span-6 flex flex-row items-center",
      wrapperErrorMessage: "col-span-6 flex flex-row items-center",
    }),
    []
  );

  const endContent = useCallback(() => {
    return (
      <TooltipResponsive>
        <TooltipResponsiveTrigger asChild>
          <Button variant="ghost" size="sm" className="mb-1 h-auto p-1">
            <BsExclamationCircle className="h-5 w-5" />
          </Button>
        </TooltipResponsiveTrigger>
        <TooltipResponsiveContent className="flex items-center justify-center">
          Để xuất hóa đơn theo nghị định 70/2025/NĐ-CP{" "}
          <LinkBase
            href={
              "https://thuvienphapluat.vn/van-ban/Thue-Phi-Le-Phi/Nghi-dinh-70-2025-ND-CP-sua-doi-Nghi-dinh-123-2020-ND-CP-hoa-don-chung-tu-577816.aspx?anchor=dieu_1"
            }
            target="_blank"
            className="inline-block h-[14px]"
          >
            <MdOutlineOpenInNew className="h-4 w-4" />
          </LinkBase>
        </TooltipResponsiveContent>
      </TooltipResponsive>
    );
  }, []);

  return (
    <div>
      <div className="grid h-fit max-h-max w-full grid-cols-12 gap-6">
        <div
          ref={selectTicketRef}
          className="col-span-12 row-span-1 flex h-fit flex-col items-center gap-4 overflow-auto lg:col-span-6"
        >
          <VoyageDetailCard
            voyage={voyageItem?.voyage}
            className="w-full rounded-md bg-background p-3"
          />
          <SelectedSeatSection
            selectedSeats={selectedSeats}
            className="w-full rounded-md bg-background p-3"
            maxSeatNumber={maxSeatNumber}
            handleOpenAlert={handleOpenAlert} // Sử dụng hàm từ useCallback
            hasTourBeenShown={hasTourBeenShown}
            isDesktop={isDesktop}
            voyage={voyageItem?.voyage}
            passengerConfig={passengerConfig}
          />
          {/* Seat for desktop */}
          {isDesktop && (
            <div
              id={HtmlToImageSectionCaptureId.SELECTED_SEAT_MODAL}
              className="w-full flex-col items-center justify-center gap-4 rounded-md bg-background p-4 lg:flex"
              // onMouseLeave={handleOnMouseLeave}
              // onMouseDown={handleMouseDown}
              // onMouseUp={handleMouseUp}
            >
              <div className="flex w-full items-center justify-between gap-2">
                <p className="w-full font-bold">{t("boat-layout.title")}</p>
                <HtmlToImage
                  captureId={HtmlToImageSectionCaptureId.SELECTED_SEAT_MODAL}
                  captureButtonName="Sơ đồ tàu"
                  sectionCapture="boat-layout"
                  operatorLayout={
                    voyageItem?.voyage?.operator?.operator_code ?? ""
                  }
                />
              </div>

              <div className="flex w-full flex-col items-center justify-start gap-4">
                <SeatLegend
                  seatTypeColors={seatTypeColors}
                  ticketPrices={boatLayout.prices}
                  operatorCode={
                    voyageItem?.voyage.operator?.operator_code ?? ""
                  }
                />
              </div>
              {boatLayoutContent ? (
                <Tabs
                  aria-label="TODO"
                  className="w-full"
                  defaultValue="0"
                  onValueChange={setActiveTab}
                >
                  <TabsList className="w-full">
                    {boatLayoutContent.map((layout) => layout.tabTrigger)}
                  </TabsList>
                  {boatLayoutContent.map((layout) => layout.tabContent)}
                </Tabs>
              ) : (
                <>Loading..</>
              )}
            </div>
          )}
          {/* End seat for desktop */}

          {/* </div> */}
        </div>
        <ScrollArea className="col-span-12 row-span-1 lg:col-span-6">
          {/* <div
            ref={formRef}
            // className="col-span-12 row-span-1 overflow-y-scroll lg:col-span-6"
          > */}
          <div className="flex flex-col gap-4 rounded-md bg-background p-4 shadow-sm">
            <p className="hidden text-center text-base font-bold md:block">
              {t("passenger-details.title")}
            </p>
            <FormProvider {...methods}>
              {/* Total & Fee section */}

              <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col gap-4"
              >
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3 lg:grid-cols-12">
                  <div className="order-last flex flex-col gap-4 md:order-first md:col-span-2 lg:col-span-7">
                    <div className="flex w-full justify-between">
                      <p className="text-base font-bold">
                        {t(
                          "passenger-details.passenger-details-input.pic-inputs.title"
                        )}
                      </p>
                      <div className="flex items-center justify-center justify-items-center gap-2">
                        <Checkbox
                          className="self-center p-0 text-sm font-medium leading-none"
                          onValueChange={handleChangeExportVAT}
                          isSelected={isExportVAT}
                        >
                          {t(
                            "passenger-details.passenger-details-input.exportVatForm.label"
                          )}
                        </Checkbox>
                      </div>
                    </div>
                    <div className="grid grid-cols-6 flex-row gap-2">
                      <PassengerFormTextInput
                        name="pic.picName"
                        label={t(
                          "passenger-details.passenger-details-input.pic-inputs.name.label"
                        )}
                        placeholder={t(
                          "passenger-details.passenger-details-input.pic-inputs.name.placeholder"
                        )}
                        isRequired
                        classNames={inputClassNames}
                        defaultValue={picData?.picName}
                      />

                      <FormPhoneInput
                        name={name}
                        label="Số điện thoại"
                        options={countries}
                        isRequired={true}
                        placeholder="Nhập số điện thoại"
                        defaultValues={defaultValues}
                        classNames={classNames}
                      />

                      <PassengerFormTextInput
                        name="pic.picEmail"
                        label={t(
                          "passenger-details.passenger-details-input.pic-inputs.email.label"
                        )}
                        placeholder={t(
                          "passenger-details.passenger-details-input.pic-inputs.email.placeholder"
                        )}
                        isRequired
                        classNames={inputEmailClassNames}
                        defaultValue={picData?.picEmail}
                      />

                      <div className="col-span-6 flex items-center gap-2 rounded-md border border-amber-200/60 bg-gradient-to-r from-amber-50 to-orange-50 p-2 text-sm text-amber-800">
                        <BsExclamationCircle className="flex-none" />
                        <p className="font-semibold text-amber-800">
                          Lưu ý:{" "}
                          <span className="ml-1 font-normal text-amber-800">
                            Nhập CCCD chỉ dành cho người Việt Nam
                          </span>
                        </p>
                      </div>
                      <PassengerFormTextInput
                        name="pic.picSocialId"
                        label={t(
                          "passenger-details.passenger-details-input.pic-inputs.socialId.label"
                        )}
                        placeholder={t(
                          "passenger-details.passenger-details-input.pic-inputs.socialId.placeholder"
                        )}
                        classNames={inputEmailClassNames}
                        defaultValue={picData?.picSocialId}
                        endContent={endContent()}
                      />
                    </div>
                  </div>
                  <TotalFeeSection
                    voyage={voyageItem?.voyage}
                    selectedSeats={selectedSeats}
                    vouchers={vouchers}
                    onVouchersChange={setVouchers}
                  />
                </div>
                {isExportVAT && (
                  <ExportVatForm method={methods} taxData={taxData} />
                )}
                <div className="flex flex-col gap-4">
                  <div className="flex flex-row items-center justify-start gap-2">
                    <p className="font-bold">
                      {t(
                        "passenger-details.passenger-details-input.passenger-inputs.title"
                      )}
                    </p>
                  </div>

                  {/* Import excel */}
                  {selectedSeats && selectedSeats.length > 0 && (
                    <div className="flex w-full flex-col gap-4">
                      <p className="flex w-full items-center gap-1 rounded-md bg-default-200 px-3 py-2 text-left text-sm font-bold text-danger">
                        <HiOutlineSpeakerphone className="h-6 w-6 flex-none" />
                        {t(
                          "passenger-details.passenger-details-input.passenger-inputs.warning"
                        )}
                      </p>
                      <div className="flex flex-row flex-wrap gap-3">
                        <Tooltip
                          classNames={tooltipClassName}
                          content={t("tooltip.import")}
                        >
                          <Button
                            className="flex w-fit gap-1 rounded-md"
                            variant={"default"}
                            type="button"
                            disabled={selectedSeats.length === 0}
                            onClick={handleClick}
                          >
                            {t("passenger-details.importFromExcel")}
                            <RiFileExcel2Line className="h-5 w-5" />
                          </Button>
                        </Tooltip>
                        <Tooltip
                          classNames={tooltipClassName}
                          content={"Xuất dữ liệu hành khách đang nhập"}
                        >
                          <Button
                            className="flex w-fit gap-1 rounded-md"
                            variant={"default"}
                            type="button"
                            disabled={selectedSeats.length === 0}
                            onClick={handleExportCurrentData}
                          >
                            {`Xuất dữ liệu`}
                            <RiFileExcel2Line className="h-5 w-5" />
                          </Button>
                        </Tooltip>

                        {departSelectedSeats && (
                          <Tooltip
                            classNames={tooltipClassName}
                            // placement="right"
                            content={t("tooltip.sync")}
                          >
                            <Button
                              type="button"
                              disabled={selectedSeats.length === 0}
                              className="flex w-fit items-center justify-center rounded-md bg-primary-100 text-black hover:bg-primary-200"
                              onClick={handleSyncPassengerData}
                            >
                              {t("tooltip.sync-title")}
                              <MdImportExport className="h-5 w-5" />
                            </Button>
                          </Tooltip>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-4">
                    <PassengerForms
                      ref={passengerFormsRef}
                      control={control}
                      operatorNationalities={operatorNationalities}
                      defaultSeats={defaultSelectedSeats}
                      onRemoveSelectedSeat={handleRemoveSelectedSeat}
                      operatorId={voyageItem?.voyage.operator_id}
                      ticketAgeConfig={ticketAgeConfig}
                      passengerConfig={passengerConfig}
                      passengers={passengers}
                      operatorCode={voyageItem?.voyage.operator?.operator_code}
                      departureDate={voyageItem?.voyage.departure_date}
                    />
                    {!selectedSeats.length && (
                      <span
                        className="cursor-pointer text-center text-xl font-bold text-danger hover:underline"
                        onClick={scrollToSelectTicket}
                      >
                        {t(
                          "passenger-details.passenger-details-input.passenger-inputs.no-seat-selected"
                        )}
                      </span>
                    )}
                  </div>
                </div>

                <NoteSection operatorNote={operatorNote} />

                <div className="flex w-full flex-row justify-between gap-3">
                  <Button
                    type="button"
                    className="flex w-1/2 max-w-[50%] items-center justify-center gap-1 bg-[#1B45C4]"
                    onClick={handleBackButtonClicked}
                  >
                    <MdArrowBack className="h-6 w-6" />
                    {t(
                      "passenger-details.passenger-details-input.submit.actions.back"
                    )}
                  </Button>
                  {selectedSeats.length ? (
                    <SubmitFormButton
                      className="flex w-1/2 items-center gap-2"
                      checkSubmit={checkSubmit}
                    />
                  ) : (
                    <></>
                  )}
                </div>
              </form>
            </FormProvider>
          </div>
          {/* </div> */}
          <ScrollBar orientation="vertical" className="right-4" />
        </ScrollArea>
      </div>
      {/* Old Import Passenger Dialog */}
      {/* <Dialog open={isImport} onOpenChange={onCloseImport}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t("import-modal.title")}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-start justify-start gap-3">
            <span className="text-sm font-semibold">
              {t("import-modal.step1")}
            </span>
            <Button
              // asChild
              className="rounded-md"
              type="button"
              onClick={handleDownload}
            >
              {t("passenger-details.downloadTemplate")}
            </Button>
          </div>
          <div className="flex flex-col items-start justify-start gap-3">
            <span className="text-sm font-semibold">
              {t("import-modal.step2")}
            </span>
            <span className="text-xs font-normal">
              {t("import-modal.step2-1")}
            </span>
          </div>
          <div className="flex flex-col items-start justify-start gap-3">
            <span className="text-sm font-semibold">
              {t("import-modal.step3")}
            </span>
            <div className="flex flex-row justify-start gap-3">
              <Button
                className="flex gap-1 rounded-md"
                type="button"
                onClick={handleImport}
              >
                {t("import-modal.import")}
                <input
                  className="hidden"
                  ref={fileInputRef}
                  type="file"
                  id="import-file"
                  accept=".xls"
                  onChange={handleFileChange}
                />
              </Button>
              {(numberImported !== 0 || errorMessageImport.length > 0) && (
                <>
                  <span className="flex flex-row items-center gap-1 text-xs">
                    <span
                      className={`${numberImported === selectedSeats.length ? "text-success" : "text-warning"}`}
                    >
                      <GoDotFill />
                    </span>
                    {t("import-modal.import-passenger")} {numberImported}/
                    {selectedSeats.length}
                  </span>
                </>
              )}
            </div>
            {errorMessageImport.length !== 0 && (
              <Accordion type="multiple" className="w-full">
                <AccordionItem value="error">
                  <AccordionTrigger className="m-0 pt-0 text-sm hover:no-underline">
                    {t("import-modal.view-detail-error")}
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="flex flex-col gap-1">
                      {errorMessageImport.map((error, index) => (
                        <p
                          key={index}
                          className="flex flex-row items-center gap-1 text-xs text-danger"
                        >
                          <GoDotFill />
                          {error}
                        </p>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )}
          </div>
        </DialogContent>
      </Dialog> */}
      {/* New Import Passenger Dialog */}
      <ImportPassengersModal
        isOpen={isImport}
        onOpenChange={onCloseImport}
        onDownloadTemplateButtonClicked={handleDownload}
        onHandleFileData={handleImportPassengers}
      />
      <ChooseSeatMobileModal
        activeTab={activeTab}
        boatLayoutContent={boatLayoutContent}
        boatLayout={boatLayout}
        // handleTouchEnd={handleTouchEnd}
        // handleTouchStart={handleTouchStart}
        isOpen={isChooseSeatMobileOpen}
        seatTypeColors={seatTypeColors}
        selectedSeats={selectedSeats}
        setActiveTab={setActiveTab}
        setIsOpen={setIsChooseSeatMobileOpen}
        voyageItem={voyageItem}
      />
      {voyageItem.voyage.route && (
        <ModalRouteForVietnamese
          isOpen={isOpenModalRouteForVietnamese}
          onAgree={onRouteForVietnameseAgree}
          route={voyageItem.voyage.route}
        />
      )}
    </div>
  );
}

export default memo(BoatSeatsLayout);

const useValidationSchema = (
  ticketAgeConfig: TicketAgeCustomConfig[],
  passengerConfig: PassengerConfig
) => {
  const { t } = useTranslation("ticket-detail");

  // const ticketMinMaxConfig = ticketAgeConfig.map((config, idx) => {
  //   if (config.is_with_date)
  //     return {
  //       min: sub(new Date(), {
  //         years: config.max,
  //       }),
  //       max: sub(new Date(), {
  //         years: config.min - 1,
  //       }),
  //       idx,
  //     };

  //   return {
  //     min: sub(new Date(), {
  //       years: ticketAgeConfig[idx].max,
  //       months: new Date().getMonth(),
  //       days: new Date().getDate(),
  //     }),
  //     max: sub(new Date(), {
  //       years: ticketAgeConfig[idx].min - 1,
  //       months: new Date().getMonth(),
  //       days: new Date().getDate(),
  //     }),
  //     idx,
  //   };
  // });

  const ageNotBuyTicket: Date = useMemo(() => {
    const childrenTicketType: TicketAgeCustomConfig | undefined =
      ticketAgeConfig.find((config) => config.label === "children");

    if (childrenTicketType) {
      return sub(new Date(), {
        years: childrenTicketType.min - 1,
        months: new Date().getMonth(),
        days: new Date().getDate(),
      });
    }

    return new Date();
  }, [ticketAgeConfig]);

  const vatSchema = yup.object().shape({
    email: yup.string(),
    taxNumber: yup.string(),
    name: yup.string(),
    address: yup.string(),
  });

  const vatSchemaRequired = yup.object().shape({
    email: yup
      .string()
      .email(
        t(
          "passenger-details.passenger-details-input.pic-inputs.email.validation.invalid"
        )
      )
      .required(
        t(
          "passenger-details.passenger-details-input.pic-inputs.email.validation.required"
        )
      ),
    taxNumber: yup
      .string()
      .required(
        t(
          "passenger-details.passenger-details-input.pic-inputs.name.validation.required"
        )
      ),
    name: yup
      .string()
      .required(
        t(
          "passenger-details.passenger-details-input.pic-inputs.name.validation.required"
        )
      ),
    address: yup
      .string()
      .required(
        t(
          "passenger-details.passenger-details-input.pic-inputs.phone.validation.required"
        )
      ),
  });

  return yup.object().shape({
    pic: yup.object().shape({
      picName: yup
        .string()
        .required(
          t(
            "passenger-details.passenger-details-input.pic-inputs.name.validation.required"
          )
        ),
      picEmail: yup
        .string()
        .email(
          t(
            "passenger-details.passenger-details-input.pic-inputs.email.validation.invalid"
          )
        )
        .required(
          t(
            "passenger-details.passenger-details-input.pic-inputs.email.validation.required"
          )
        ),
      picPhone: yup
        .string()
        .max(20, "Phone number must be less than 20 characters")
        .required(
          t(
            "passenger-details.passenger-details-input.pic-inputs.phone.validation.required"
          )
        ),
      phone_country_code: yup
        .string()
        .required(
          t(
            "passenger-details.passenger-details-input.pic-inputs.phone.validation.required"
          )
        ),
      picSocialId: yup
        .string()
        .trim()
        .nullable()
        .matches(
          /^(|\d{12})$/,
          t(
            "passenger-details.passenger-details-input.pic-inputs.socialId.validation.invalid-length"
          )
        ),
    }),
    isExportVat: yup.boolean().required(),
    vat: yup.object().when("isExportVat", {
      is: true,
      then: () => vatSchemaRequired,
      otherwise: () => vatSchema,
    }),
    passengers: yup
      .array()
      .of(
        yup.object().shape({
          ticketPrice: yup.object<TicketPrice>().shape({
            id: yup.number().required(),
            seat_type: yup.string().required(),
            ticket_type_id: yup.number().required(),
            ticket_type_label: yup.string().required(),
            price_with_VAT: yup.number().required(),
            original_price: yup.number().required(),
          }),
          name: passengerConfig.full_name.enable
            ? yup
                .string()
                .required(
                  t(
                    "passenger-details.passenger-details-input.passenger-inputs.name.validation.required"
                  )
                )
            : yup.string().nullable(),
          dateOfBirth: yup
            .date()
            .min(
              new Date("1900-01-01"),
              t(
                "passenger-details.passenger-details-input.passenger-inputs.dateOfBirth.validation.min"
              )
            )
            .max(ageNotBuyTicket, "Không đủ tuổi mua vé")
            // .max(
            //   new Date(),
            //   t(
            //     "passenger-details.passenger-details-input.passenger-inputs.dateOfBirth.validation.disableFuture"
            //   )
            // )
            // .when("ticketPrice.ticket_type_id", {
            //   is: (ticket_type_id: number) => {
            //     return ticket_type_id === childrenTicketType?.type_id;
            //   },
            //   then: (schema) => schema.max(ageNotBuyTicket, "Không đủ tuổi mua vé"),
            //   otherwise: (schema) => schema,
            // })

            // .when("nationality.default", {
            //   is: false,
            //   then: (schema) =>
            //     schema.when("ticketPrice.ticket_type_id", {
            //       is: (ticket_type_id: number) => {
            //         return ticket_type_id === ticketAgeConfig[0].type_id;
            //       },
            //       then: (schema) =>
            //         schema
            //           .min(
            //             ticketMinMaxConfig[0].min,
            //             `${t("passenger-details.passenger-details-input.passenger-inputs.dateOfBirth.validation.yourAgeMustLessThan")} ${ticketAgeConfig[0].max} ${t("passenger-details.passenger-details-input.passenger-inputs.dateOfBirth.validation.yearsOld")}`
            //           )
            //           .max(
            //             ticketMinMaxConfig[0].max,
            //             `${t("passenger-details.passenger-details-input.passenger-inputs.dateOfBirth.validation.yourAgeMustMoreThan")} ${ticketAgeConfig[0].min} ${t("passenger-details.passenger-details-input.passenger-inputs.dateOfBirth.validation.yearsOld")}`
            //           ),
            //       otherwise: (schema) => schema,
            //     }),
            //   otherwise: (schema) =>
            //     schema.when("ticketPrice.ticket_type_id", {
            //       is: (ticket_type_id: number) => {
            //         return ticket_type_id === ticketAgeConfig[0].type_id;
            //       },
            //       then: (schema) =>
            //         schema
            //           .min(
            //             ticketMinMaxConfig[0].min,
            //             `${t("passenger-details.passenger-details-input.passenger-inputs.dateOfBirth.validation.yourAgeMustLessThan")} ${ticketAgeConfig[0].max} ${t("passenger-details.passenger-details-input.passenger-inputs.dateOfBirth.validation.yearsOld")}`
            //           )
            //           .max(
            //             ticketMinMaxConfig[0].max,
            //             `${t("passenger-details.passenger-details-input.passenger-inputs.dateOfBirth.validation.yourAgeMustMoreThan")} ${ticketAgeConfig[0].min} ${t("passenger-details.passenger-details-input.passenger-inputs.dateOfBirth.validation.yearsOld")}`
            //           ),
            //       otherwise: (schema) =>
            //         schema.when("ticketPrice.ticket_type_id", {
            //           is: (ticket_type_id: number) => {
            //             return ticket_type_id === ticketAgeConfig[1].type_id;
            //           },
            //           then: (schema) =>
            //             schema
            //               .min(
            //                 ticketMinMaxConfig[1].min,
            //                 `${t("passenger-details.passenger-details-input.passenger-inputs.dateOfBirth.validation.yourAgeMustLessThan")} ${ticketAgeConfig[1].max} ${t("passenger-details.passenger-details-input.passenger-inputs.dateOfBirth.validation.yearsOld")}`
            //               )
            //               .max(
            //                 ticketMinMaxConfig[1].max,
            //                 `${t("passenger-details.passenger-details-input.passenger-inputs.dateOfBirth.validation.yourAgeMustMoreThan")} ${ticketAgeConfig[1].min} ${t("passenger-details.passenger-details-input.passenger-inputs.dateOfBirth.validation.yearsOld")}`
            //               ),
            //           otherwise: (schema) =>
            //             schema.when("ticketPrice.ticket_type_id", {
            //               is: (ticket_type_id: number) => {
            //                 return (
            //                   ticket_type_id === ticketAgeConfig[2].type_id
            //                 );
            //               },
            //               then: (schema) =>
            //                 schema
            //                   .min(
            //                     ticketMinMaxConfig[2].min,
            //                     `${t("passenger-details.passenger-details-input.passenger-inputs.dateOfBirth.validation.yourAgeMustLessThan")} ${ticketAgeConfig[2].max} ${t("passenger-details.passenger-details-input.passenger-inputs.dateOfBirth.validation.yearsOld")}`
            //                   )
            //                   .max(
            //                     ticketMinMaxConfig[2].max,
            //                     `${t("passenger-details.passenger-details-input.passenger-inputs.dateOfBirth.validation.yourAgeMustMoreThan")} ${ticketAgeConfig[2].min} ${t("passenger-details.passenger-details-input.passenger-inputs.dateOfBirth.validation.yearsOld")}`
            //                   ),
            //               otherwise: (schema) => schema,
            //             }),
            //         }),
            //     }),
            // })
            .required(
              t(
                "passenger-details.passenger-details-input.passenger-inputs.dateOfBirth.validation.required"
              )
            ),
          gender: passengerConfig.gender.enable
            ? yup
                .number()
                .required(
                  t(
                    "passenger-details.passenger-details-input.passenger-inputs.gender.validation.required"
                  )
                )
            : yup.number().nullable(),
          socialId: passengerConfig.social_id.enable
            ? yup
                .string()
                .required(
                  t(
                    "passenger-details.passenger-details-input.passenger-inputs.socialId.validation.required"
                  )
                )
                .min(
                  passengerConfig.social_id.validation?.min_length || 0,
                  t(
                    "passenger-details.passenger-details-input.passenger-inputs.socialId.validation.min_length",
                    { min: passengerConfig.social_id.validation?.min_length }
                  )
                )
                .max(
                  passengerConfig.social_id.validation?.max_length || Infinity,
                  t(
                    "passenger-details.passenger-details-input.passenger-inputs.socialId.validation.max_length",
                    { max: passengerConfig.social_id.validation?.max_length }
                  )
                )
            : yup.string().nullable(),
          address: passengerConfig.address.enable
            ? yup
                .string()
                .required(
                  t(
                    "passenger-details.passenger-details-input.passenger-inputs.address.validation.required"
                  )
                )
                .min(
                  passengerConfig.address.validation?.min_length || 0,
                  t(
                    "passenger-details.passenger-details-input.passenger-inputs.address.validation.min_length",
                    { min: passengerConfig.address.validation?.min_length }
                  )
                )
                .max(
                  passengerConfig.address.validation?.max_length || Infinity,
                  t(
                    "passenger-details.passenger-details-input.passenger-inputs.address.validation.max_length",
                    { max: passengerConfig.address.validation?.max_length }
                  )
                )
            : yup.string().nullable(),
          nationality: yup
            .object<OperatorNationality>()
            .shape({
              national_id: yup.string().default(""),
              name: yup.string().default(""),
              abbrev: yup.string().default(""),
              default: yup.bool().default(false),
            })
            .required(
              t(
                "passenger-details.passenger-details-input.passenger-inputs.nationality.validation.required"
              )
            ),
          plateNumber: yup.string().nullable(),
          positionId: yup.number().required(),
          seatName: yup.string().required(),
          price: yup.number().required(),
          allTicketPrice: yup.string().required(),
        })
      )
      .min(1, t("passenger-details.passenger-details-input.required")),
  });
};

const useSendContactInfo = (
  voyage: Voyage,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: any
) => {
  // eslint-disable-next-line @arthurgeron/react-usememo/require-usememo
  const picInfo = useWatch({
    control,
    name: "pic",
  });

  const searchParams = useSearchParams();

  const sendCheckoutData = useCallback(() => {
    if (!picInfo?.picPhone || searchParams.get("mode") === "edit") return;

    const voyageName = `${voyage.clickBait?.rootVoyageId ? "[Clickbait] " : ""}Hãng ${voyage?.operator?.operator_name ?? "[Hãng]"} tuyến ${voyage.route?.departure_name ?? "[Điểm khởi hành]"} - ${voyage.route?.destination_name ?? "[Điểm đến]"} khởi hành ${voyage.depart_time ?? "[Giờ xuất phát]"} ${voyage?.departure_date ? format(new Date(`${voyage?.departure_date}`), "dd/MM/yyyy") : "[Ngày đi]"}`;

    const countryInfo = getCountry(picInfo?.phone_country_code);

    // Gán lại số điện thoại với mã quốc gia
    const phoneWithCountryCode = countryInfo?.phone
      ? `+${countryInfo.phone}${picInfo?.picPhone}`
      : picInfo?.picPhone;

    const data = {
      phone: phoneWithCountryCode,
      name: picInfo?.picName,
      email: picInfo?.picEmail,
      product_names: [voyageName],
      product_name_str: voyageName,
    };

    fetch("https://n8n.nucuoimekong.com/webhook/ferry-lead-on-payment-page", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => {
        if (!response.ok) {
          console.error("Webhook call failed with status:", response.status);
        }
      })
      .catch((error) => {
        console.error("Error calling webhook:", error);
      });
  }, [
    picInfo?.phone_country_code,
    picInfo?.picEmail,
    picInfo?.picName,
    picInfo?.picPhone,
    searchParams,
    voyage.clickBait?.rootVoyageId,
    voyage.depart_time,
    voyage?.departure_date,
    voyage?.operator?.operator_name,
    voyage.route?.departure_name,
    voyage.route?.destination_name,
  ]);

  const [debouncedSearch, cancelSearch] = useDebounce(sendCheckoutData, 5000);

  useEffect(() => {
    if (
      process.env.NODE_ENV === "test" ||
      process.env.NODE_ENV === "production"
    ) {
      debouncedSearch();
    }

    return () => {
      cancelSearch();
    };
  }, [debouncedSearch, cancelSearch]);
};
