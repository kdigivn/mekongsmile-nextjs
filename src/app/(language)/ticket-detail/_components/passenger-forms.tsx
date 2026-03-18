/* eslint-disable @arthurgeron/react-usememo/require-usememo */
import PassengerFormComboboxInput from "@/components/form-elements/combobox/passenger-form-combobox-input";
import PassengerFormDatePickerInput from "@/components/form-elements/date-picker/passenger-form-date-picker-input";
import {
  PassengerTicket,
  SeatTicket,
} from "@/services/apis/boatLayouts/types/seat";
import { OperatorNationality } from "@/services/apis/operators/types/operator-nationality";
import {
  FormPassengerTicket,
  VoyageFormData,
} from "@/services/form/types/form-types";
import { useTranslation } from "@/services/i18n/client";
import {
  Ref,
  useCallback,
  forwardRef,
  memo,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import {
  Control,
  FieldArrayMethodProps,
  UseFieldArrayProps,
  useFieldArray,
} from "react-hook-form";
import { IoCloseOutline, IoQrCodeOutline } from "react-icons/io5";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Html5QrcodePlugin from "@/components/qr-scanner/qr-scanner";
import { Button } from "@/components/ui/button";
import { RiEraserLine } from "react-icons/ri";
import PassengerFormComboboxTicketInput from "@/components/form-elements/combobox/passenger-form-combobox-ticket-input";
import { TicketAgeCustomConfig } from "@/services/apis/tickets/types/ticket-type-config";
import { TicketPrice } from "@/services/apis/tickets/types/ticket-price";
import PassengerFormTextInputV2 from "@/components/form-elements/text-input/passenger-form-text-input-v2";
import PassengerFormFreeSoloInput from "@/components/form-elements/combobox/passenger-form-free-solo";
import { calculateAge, formatCurrency } from "@/lib/utils";
import {
  Passenger,
  PassengerConfig,
} from "@/services/apis/passengers/types/passenger";
import { useMobileBottomNavActions } from "@/components/footer/footer-mobile-contact-buttons/use-mobile-bottom-nav-actions";
import IdCardUploadModal from "@/components/qr-scanner/id-card-upload-modal";
import { IdCardToPassenger } from "@/components/qr-scanner/id-card-type";
import PassengerFormSelectionInput from "@/components/form-elements/combobox/passenger-form-selection-input";
import {
  TicketGenderEnum,
  useTicketGenderOptions,
} from "@/services/apis/tickets/types/ticket-gender-enum";
import { BsExclamationCircle } from "react-icons/bs";
import { getProvinceByCCCD } from "@/lib/provinces";
import {
  TooltipResponsive,
  TooltipResponsiveContent,
  TooltipResponsiveTrigger,
} from "@/components/tooltip-responsive";
// import { FaIdCard } from "react-icons/fa6";
type Props = {
  control: Control<VoyageFormData>;
  operatorNationalities: OperatorNationality[];
  defaultSeats?: SeatTicket[];
  operatorId: string;
  onRemoveSelectedSeat: (positionId: number) => void;
  ticketAgeConfig: TicketAgeCustomConfig[];
  passengers?: Passenger[];
  passengerConfig: PassengerConfig;
  operatorCode?: string;
  departureDate?: string;
};

const QrCodeIcon = memo(() => <IoQrCodeOutline className="h-5 w-5" />);
QrCodeIcon.displayName = "QrCodeIcon";

// Tạo một type helper để giữ nguyên path ban đầu
type PassengersFieldArrayPath = "passengers";

export type PassengerFormRefType = {
  insert: (
    index: number,
    value: FormPassengerTicket | FormPassengerTicket[],
    options?: FieldArrayMethodProps
  ) => void;
  append: (
    value: FormPassengerTicket | FormPassengerTicket[],
    options?: FieldArrayMethodProps
  ) => void;
  remove: (index?: number | number[]) => void;
  fields: FormPassengerTicket[];
};

const PassengerForms = memo(
  forwardRef(function PassengerForms(
    {
      control,
      operatorNationalities,
      defaultSeats,
      onRemoveSelectedSeat,
      ticketAgeConfig,
      passengers,
      passengerConfig,
      operatorCode,
      departureDate,
    }: Props,
    ref: Ref<PassengerFormRefType>
  ) {
    const { t: ticketDetailTranslation } = useTranslation("ticket-detail");
    const [qrScan, setQrScan] = useState(false);
    const [idCardModal, setIdCardModal] = useState(false);
    const [index, setIndex] = useState(0);
    const [isClear, setIsClear] = useState(false);
    const [errorScanner, setErrorScanner] = useState("");
    const { hideNav, showNav } = useMobileBottomNavActions();

    useEffect(() => {
      if (qrScan) {
        hideNav();
      } else {
        showNav();
      }
    }, [hideNav, qrScan, showNav]);

    useEffect(() => {
      if (idCardModal) {
        hideNav();
      } else {
        showNav();
      }
    }, [hideNav, idCardModal, showNav]);

    const handleIdCardModalOnClose = useCallback(() => {
      setIdCardModal(false);
    }, []);

    const config: UseFieldArrayProps<
      VoyageFormData,
      PassengersFieldArrayPath,
      "id"
    > = {
      name: "passengers",
      control,
    };

    const { fields, insert, append, remove, update } = useFieldArray(config);

    useImperativeHandle(ref, () => ({
      insert,
      append,
      remove,
      update,
      fields,
    }));

    // const [requestPassenger, setRequestPassenger] = useState<{
    //   operator_id: string;
    //   social_id: string;
    // }>({ operator_id: operatorId, social_id: "" });

    // const { passenger, passengerRefetch } =
    //   useGetPassengersByOperatorAndSocialIdQuery(requestPassenger);

    // const [indexSocialId, setIndexSocialId] = useState<number>(-1);

    const onNewScanResult = useCallback(
      (decodedText: string) => {
        const seat = fields[index];
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const [cccd, cmnd, name, birthdate, gender, address, provideDate] =
          decodedText.split("|");

        // Check if the QR code is a Social Card QR
        if (decodedText.split("|").length < 7) {
          setErrorScanner(ticketDetailTranslation("qr.notValid"));
          // setTimeout(() => setQrScan(false), 3000);
        } else {
          const passengerTicket: PassengerTicket = {
            name,
            gender:
              gender === "Nam" || gender === "1"
                ? TicketGenderEnum.Male
                : TicketGenderEnum.Female,
            dateOfBirth: `${birthdate.substring(2, 4)}/${birthdate.substring(0, 2)}/${birthdate.substring(4, 8)}`,
            socialId: cccd,
            address,
            nationality: "Việt Nam",
            plateNumber: "",
          };

          const { national_id, ...operatorNationality } =
            operatorNationalities.find((nationality) => {
              const lowerCaseNationality =
                passengerTicket.nationality.toLowerCase();
              return (
                lowerCaseNationality ===
                  nationality.national_id.toString().toLowerCase() ||
                lowerCaseNationality === nationality.name.toLowerCase() ||
                nationality.default
              );
            }) ?? operatorNationalities[0];

          let age =
            new Date().getFullYear() -
            new Date(passengerTicket.dateOfBirth).getFullYear();
          let ticketSelectedType = ticketAgeConfig.find(
            (ticket) => ticket.min <= age && ticket.max >= age
          )?.type_id;
          if (ticketAgeConfig && ticketAgeConfig[0].is_with_date) {
            age = calculateAge(
              new Date(passengerTicket.dateOfBirth).toDateString()
            );
            ticketSelectedType = ticketAgeConfig.find(
              (ticket) => ticket.min - 1 <= age && ticket.max > age
            )?.type_id;
          }

          const ticketSelected =
            JSON.parse(seat.allTicketPrice).find(
              (ticket: TicketPrice) =>
                ticket.ticket_type_id === ticketSelectedType
            ) ?? seat.ticketPrice;

          update(index, {
            name: passengerTicket.name,
            address: passengerTicket.address,
            gender: passengerTicket.gender ?? TicketGenderEnum.Male,
            dateOfBirth:
              new Date(passengerTicket.dateOfBirth) || new Date(2000, 1, 1),
            nationality: {
              national_id: national_id.toString(),
              ...operatorNationality,
            },
            plateNumber: passengerTicket.plateNumber ?? "",
            socialId: passengerTicket.socialId,
            positionId: seat.positionId,
            seatName: seat.seatName,
            price: ticketSelected.price_with_VAT ?? 0,
            allTicketPrice: seat.allTicketPrice,
            ticketPrice: ticketSelected,
          });
          setErrorScanner("");
          setQrScan(false);
        }
      },
      [
        fields,
        index,
        operatorNationalities,
        ticketAgeConfig,
        ticketDetailTranslation,
        update,
      ]
    );

    const onErrorScan = useCallback(() => {
      setErrorScanner(ticketDetailTranslation("qr.notFound"));
    }, [ticketDetailTranslation]);

    const handleAddressProcessing = useCallback(
      (address?: string, cccd?: string) => {
        if (address && address.split(",").length > 0) {
          const addressSplit = address.split(",");
          const province = addressSplit[addressSplit.length - 1];
          return province.trim() ?? null;
        }
        if (cccd) {
          return getProvinceByCCCD(cccd)?.name || null;
        }
        return null;
      },
      []
    );

    useEffect(() => {
      if (defaultSeats) {
        // Delete all added fields
        remove();
        // Add fields
        defaultSeats.forEach((seatData) => {
          const defaultDoB = seatData.passengerData?.dateOfBirth
            ? new Date(seatData.passengerData?.dateOfBirth)
            : new Date(2000, 0, 1);
          const { national_id, ...operatorNationality } =
            operatorNationalities.find(
              (nationality) =>
                String(nationality.national_id) ===
                  String(seatData.passengerData?.nationality) ||
                nationality.name ===
                  String(seatData.passengerData?.nationality) ||
                nationality.abbrev ===
                  String(seatData.passengerData?.nationality)
            ) ??
            operatorNationalities.find((nationality) => nationality.default) ??
            operatorNationalities[0];
          append({
            name: seatData.passengerData?.name ?? "",
            address: seatData.passengerData?.address ?? "",
            dateOfBirth: defaultDoB,
            gender: seatData.passengerData?.gender ?? TicketGenderEnum.Male,
            nationality: {
              national_id: national_id.toString(),
              ...operatorNationality,
            },
            plateNumber: seatData.passengerData?.plateNumber ?? "",
            socialId: seatData.passengerData?.socialId ?? "",
            positionId: seatData?.seatMetadata?.PositionId,
            seatName: seatData.seatMetadata?.SeatName,
            price: seatData?.selectedTicketPrice?.price_with_VAT ?? 0,
            allTicketPrice: JSON.stringify(
              seatData.ticketPriceAppliedPromotions
            ),
            ticketPrice:
              seatData.selectedTicketPrice ??
              seatData.ticketPriceAppliedPromotions[0],
          });
        });
      }
    }, [append, defaultSeats, operatorNationalities, remove]);

    const handleOCRResultCardId = useCallback(
      (result: IdCardToPassenger) => {
        const seat = fields[index];
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { cccd, name, birthdate, address, gender } = result;
        const province = handleAddressProcessing(address, cccd);
        const passengerTicket: PassengerTicket = {
          name,
          gender: gender,
          dateOfBirth: birthdate,
          socialId: cccd,
          address: province,
          nationality: "Việt Nam",
          plateNumber: "",
        };

        const { national_id, ...operatorNationality } =
          operatorNationalities.find((nationality) => {
            const lowerCaseNationality =
              passengerTicket.nationality.toLowerCase();
            return (
              lowerCaseNationality ===
                nationality.national_id.toString().toLowerCase() ||
              lowerCaseNationality === nationality.name.toLowerCase() ||
              nationality.default
            );
          }) ?? operatorNationalities[0];

        //

        // Parse the birthdate in dd/mm/yyyy format
        const [day, month, year] = birthdate.split("/").map(Number);
        const date = new Date(year, month - 1, day); // Create a valid Date object

        let age = new Date().getFullYear() - date.getFullYear();
        let ticketSelectedType = ticketAgeConfig.find(
          (ticket) => ticket.min <= age && ticket.max >= age
        )?.type_id;
        if (ticketAgeConfig && ticketAgeConfig[0].is_with_date) {
          age = calculateAge(date.toDateString());
          ticketSelectedType = ticketAgeConfig.find(
            (ticket) => ticket.min - 1 <= age && ticket.max > age
          )?.type_id;
        }

        const ticketSelected =
          JSON.parse(seat.allTicketPrice).find(
            (ticket: TicketPrice) =>
              ticket.ticket_type_id === ticketSelectedType
          ) ?? seat.ticketPrice;

        update(index, {
          name: passengerTicket.name,
          address: passengerTicket.address,
          dateOfBirth: date || new Date(2000, 1, 1),
          gender: passengerTicket.gender ?? TicketGenderEnum.Male,
          nationality: {
            national_id: national_id.toString(),
            ...operatorNationality,
          },
          plateNumber: passengerTicket.plateNumber,
          socialId: passengerTicket.socialId,
          positionId: seat.positionId,
          seatName: seat.seatName,
          price: ticketSelected.price_with_VAT ?? 0,
          allTicketPrice: seat.allTicketPrice,
          ticketPrice: ticketSelected,
        });
        setIdCardModal(false);
      },
      [
        fields,
        handleAddressProcessing,
        index,
        operatorNationalities,
        ticketAgeConfig,
        update,
      ]
    );

    const handleOnClear = useCallback(
      (index: number) => {
        const seat = fields[index];
        const nationality: OperatorNationality =
          operatorNationalities.find((nationality) => nationality.default) ||
          operatorNationalities[0];

        // replace the current default value with the new default value
        update(index, {
          name: " ",
          address: " ",
          gender: TicketGenderEnum.Male,
          dateOfBirth: new Date(2000, 1, 1),
          socialId: " ",
          nationality: {
            ...nationality,
            national_id: " ",
          },
          plateNumber: " ",
          positionId: seat.positionId,
          seatName: seat.seatName,
          price: seat.ticketPrice.price_with_VAT ?? 0,
          ticketPrice: seat.ticketPrice,
          allTicketPrice: seat.allTicketPrice,
        });
        setIsClear(true);
        setIndex(index);
      },
      [fields, operatorNationalities, update]
    );

    const inputSpan3ClassNames = useMemo(
      () => ({
        base: "order-4 md:order-3 col-span-12 md:col-span-3 space-y-1",
        input:
          "!mt-0 min-h-7 rounded-md border-1 border-default-400 p-1 px-3 py-2 text-default-700 data-[hover=true]:border-black md:text-sm",
        label: "font-medium md:text-sm text-xs",
      }),
      []
    );

    const inputSpan4ClassNames = useMemo(
      () => ({
        base: `order-5 col-span-12 ${passengerConfig.plate_number.enable ? "md:col-span-6" : "md:col-span-4"} space-y-1`,
        input:
          "!mt-0 min-h-7 rounded-md border-1 border-default-400 p-1 px-3 py-2 text-default-700 data-[hover=true]:border-black md:text-sm",
        label: "font-medium md:text-sm text-xs",
      }),
      [passengerConfig.plate_number.enable]
    );

    const inputNameClassNames = useMemo(
      () => ({
        base: "order-1 col-span-12 md:col-span-6 space-y-1",
        input:
          "!mt-0 min-h-7 rounded-md border-1 border-default-400 p-1 px-3 py-2 text-default-700 data-[hover=true]:border-black md:text-sm",
        label: "font-medium md:text-sm text-xs",
      }),
      []
    );

    const datePickerClassNames = useMemo(
      () => ({
        base: `order-2 ${passengerConfig.gender.enable ? "col-span-6" : "col-span-12"} md:col-span-3 space-y-1 md:w-full`,
        input:
          "!mt-0 min-h-7 rounded-md border-1 border-default-400 p-1 pr-0 pl-3 text-default-700 data-[hover=true]:border-black md:text-sm",
        label: "font-medium md:text-sm text-xs",
        container: "w-full !mt-0",
        fieldset: "rounded-md",
      }),
      [passengerConfig.gender.enable]
    );

    const comboboxClassNames = useMemo(
      () => ({
        base: "order-last col-span-6 md:col-span-3 flex flex-col gap-1 space-y-1",
        label: "leading-5 text-xs",
        trigger:
          "!mt-0 min-h-7 rounded-md border-1 border-default-400 p-1 px-3 py-2 text-default-700 data-[hover=true]:border-black w-full md:text-sm",
      }),
      []
    );

    const comboboxSpan2ClassNames = useMemo(
      () => ({
        base: "order-3 md:order-4 col-span-6 md:col-span-2 flex flex-col gap-1 space-y-1",
        label: "leading-5 text-xs",
        trigger:
          "!mt-0 min-h-7 rounded-md border-1 border-default-400 p-1 px-3 py-2 text-default-700 data-[hover=true]:border-black w-full md:text-sm",
      }),
      []
    );

    const configs = useMemo(
      () => ({
        fps: 10,
        qrbox: 250,
        disableFlip: false,
        defaultZoomValueIfSupported: 4,
        showZoomSliderIfSupported: true,
      }),
      []
    );

    // useEffect(() => {
    //   if (passenger && indexSocialId !== -1 && passengers) {
    //     const passengerTicket = fields[indexSocialId];
    //     update(indexSocialId, {
    //       ...passengerTicket,
    //       name: passenger.full_name,
    //       address: passenger.POB,
    //       dateOfBirth: new Date(passenger.DOB),
    //       socialId: passengers[indexSocialId].socialId,
    //     });
    //     setIndexSocialId(-1);
    //     setRequestPassenger((prev) => ({ ...prev, social_id: "" }));
    //     passengerRefetch();
    //   }
    //   // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, [passenger]);

    // const handleSocialIdBlur = useCallback(
    //   (index: number) => {
    //     setIndexSocialId(index);
    //     if (passengers) {
    //       setRequestPassenger((prev) => ({
    //         ...prev,
    //         social_id: passengers[index].socialId,
    //       }));
    //       passengerRefetch();
    //     }
    //   },
    //   [passengerRefetch, passengers]
    // );

    useEffect(() => {
      if (isClear) {
        const seat = fields[index];
        // set the default value to the new default value
        const nationality: OperatorNationality =
          operatorNationalities.find((nationality) => nationality.default) ||
          operatorNationalities[0];
        update(index, {
          name: "",
          address: "",
          dateOfBirth: new Date(2000, 0, 1),
          gender: TicketGenderEnum.Male,
          socialId: "",
          nationality: {
            ...nationality,
            national_id: nationality.national_id.toString(),
          },
          plateNumber: "",
          positionId: seat.positionId,
          seatName: seat.seatName,
          price: seat.ticketPrice.price_with_VAT ?? 0,
          ticketPrice: seat.ticketPrice,
          allTicketPrice: seat.allTicketPrice,
        });
        setIsClear(false);
      }
    }, [fields, index, isClear, operatorNationalities, update]);

    const ticketGenderOptions = useTicketGenderOptions();

    const endContent = useMemo(() => {
      return (
        <TooltipResponsive>
          <TooltipResponsiveTrigger asChild>
            <Button variant="ghost" size="sm">
              <BsExclamationCircle className="h-4 w-4" />
            </Button>
          </TooltipResponsiveTrigger>
          <TooltipResponsiveContent>
            <p>Gửi xe nếu có</p>
          </TooltipResponsiveContent>
        </TooltipResponsive>
      );
    }, []);

    return (
      <>
        {fields.map((field, inx) => (
          <div key={field.positionId} className="flex flex-col gap-2">
            {/* Detail title */}
            <div className="flex w-full justify-between gap-2 bg-default-200 p-2">
              <div className="flex w-full items-center justify-start gap-2">
                <div className="flex flex-none flex-row-reverse items-center justify-end gap-2 py-1 hover:no-underline">
                  <p className="text-sm font-bold">
                    <span className="hidden md:inline">{`${ticketDetailTranslation(
                      "passenger-details.passenger-details-input.passenger-inputs.ticket-title"
                    )} `}</span>
                    <span className="text-danger">
                      {field.seatName?.toUpperCase()}
                    </span>
                    {field.ticketPrice?.price_with_VAT >= 0 && (
                      <>
                        {` - ${ticketDetailTranslation("ticketPrice")} `}
                        <span className="text-danger">
                          {formatCurrency(field.ticketPrice?.price_with_VAT)}
                        </span>
                      </>
                    )}
                  </p>
                </div>
                <Button
                  type="button"
                  className="h-8 w-16 bg-primary-100 p-1 font-semibold text-black hover:bg-primary/30"
                  onClick={() => {
                    setIdCardModal(true);
                    setIndex(inx);
                  }}
                >
                  CCCD
                </Button>
                <Button
                  type="button"
                  className="hidden h-8 w-8 justify-center bg-primary-100 p-1 text-xl text-black hover:bg-primary/30 md:flex"
                  onClick={() => {
                    setQrScan(true);
                    setIndex(inx);
                  }}
                >
                  <QrCodeIcon />
                </Button>
              </div>
              <div className="flex flex-row justify-end gap-2">
                <Button
                  type="button"
                  onClick={() => handleOnClear(inx)}
                  className="h-8 w-8 bg-info-100/50 p-1 text-xl text-black hover:bg-info-100"
                >
                  <RiEraserLine width={"20px"} height={"20px"} />
                </Button>
                <Button
                  type="button"
                  onClick={() => onRemoveSelectedSeat(field.positionId)}
                  className="h-8 w-8 bg-danger-100 p-1 text-xl text-black hover:bg-danger-300"
                >
                  <IoCloseOutline width={"20px"} height={"20px"} />
                </Button>
              </div>
            </div>
            {/* Form inputs */}
            <div className="mt-1 grid grid-cols-12 gap-x-2 gap-y-3 px-1">
              {/* <PassengerFormTextInputV2
                  name={`passengers.${index}.name`}
                  label={ticketDetailTranslation(
                    "passenger-details.passenger-details-input.passenger-inputs.name.label"
                  )}
                  placeholder={ticketDetailTranslation(
                    "passenger-details.passenger-details-input.passenger-inputs.name.placeholder"
                  )}
                  isRequired
                  classNames={inputNameClassNames}
                  defaultValue={field.name}
                  isUppercase={true}
                  isRemoveAccents={true}
                /> */}

              {passengerConfig.full_name.enable && (
                <PassengerFormFreeSoloInput
                  name={`name`}
                  label={ticketDetailTranslation(
                    "passenger-details.passenger-details-input.passenger-inputs.name.label"
                  )}
                  placeholder={ticketDetailTranslation(
                    "passenger-details.passenger-details-input.passenger-inputs.name.placeholder"
                  )}
                  isRequired
                  positionId={field.positionId}
                  classNames={inputNameClassNames}
                  defaultValue={field.name || ""}
                  isUppercase={true}
                  isRemoveAccents={true}
                  options={passengers ? passengers : []}
                  update={update}
                  nationalities={operatorNationalities}
                  ticketAgeConfig={ticketAgeConfig}
                />
              )}

              {passengerConfig.date_of_birth.enable && (
                <PassengerFormDatePickerInput
                  label={ticketDetailTranslation(
                    "passenger-details.passenger-details-input.passenger-inputs.dateOfBirth.label"
                  )}
                  name={`dateOfBirth`}
                  defaultValue={
                    field.dateOfBirth?.getTime() ===
                    new Date(2000, 0, 1).getTime()
                      ? undefined
                      : field.dateOfBirth.getTime()
                  }
                  disableFuture
                  isRequired
                  classNames={datePickerClassNames}
                  ticketAgeConfig={ticketAgeConfig}
                  update={update}
                  positionId={field.positionId}
                  operatorCode={operatorCode}
                  departureDate={departureDate}
                />
              )}

              {passengerConfig.address.enable && (
                <PassengerFormTextInputV2
                  name={`address`}
                  label={ticketDetailTranslation(
                    "passenger-details.passenger-details-input.passenger-inputs.address.label"
                  )}
                  placeholder={ticketDetailTranslation(
                    "passenger-details.passenger-details-input.passenger-inputs.address.placeholder"
                  )}
                  isUppercase={true}
                  isRemoveAccents={true}
                  positionId={field.positionId}
                  isRequired
                  classNames={inputSpan3ClassNames}
                  defaultValue={field.address || ""}
                  ticketAgeConfig={ticketAgeConfig}
                />
              )}

              {passengerConfig.gender.enable && (
                <PassengerFormSelectionInput
                  label={ticketDetailTranslation(
                    "passenger-details.passenger-details-input.passenger-inputs.gender.label"
                  )}
                  isRequired
                  name={`gender`}
                  classNames={comboboxSpan2ClassNames}
                  defaultValue={field.gender}
                  options={ticketGenderOptions}
                  positionId={field.positionId}
                  update={update}
                />
              )}

              {passengerConfig.social_id.enable && (
                <PassengerFormTextInputV2
                  name={`socialId`}
                  label={ticketDetailTranslation(
                    "passenger-details.passenger-details-input.passenger-inputs.socialId.label"
                  )}
                  placeholder={ticketDetailTranslation(
                    "passenger-details.passenger-details-input.passenger-inputs.socialId.placeholder"
                  )}
                  isRequired
                  disabled={
                    field.socialId === "TE" &&
                    (!passengerConfig?.social_id?.validation?.min_length ||
                      passengerConfig?.social_id?.validation?.min_length <= 2)
                  }
                  classNames={inputSpan4ClassNames}
                  defaultValue={field.socialId || ""}
                  positionId={field.positionId}
                  ticketAgeConfig={ticketAgeConfig}
                />
              )}

              {passengerConfig.national_abbrev.enable && (
                <PassengerFormComboboxInput
                  label={ticketDetailTranslation(
                    "passenger-details.passenger-details-input.passenger-inputs.nationality.label"
                  )}
                  name={`nationality`}
                  defaultValueId={field.nationality?.national_id}
                  options={operatorNationalities}
                  classNames={comboboxClassNames}
                  positionId={field.positionId}
                  update={update}
                  ticketAgeConfig={ticketAgeConfig}
                  operatorCode={operatorCode}
                />
              )}

              <PassengerFormComboboxTicketInput
                label={ticketDetailTranslation(
                  "passenger-details.passenger-details-input.passenger-inputs.ticketType.label"
                )}
                name={`ticketPrice`}
                defaultValueId={field.ticketPrice?.ticket_type_id}
                options={field.allTicketPrice}
                classNames={comboboxClassNames}
                positionId={field.positionId}
                readOnly={true}
              />
            </div>
            <div className="px-1">
              {passengerConfig.plate_number.enable && (
                <PassengerFormTextInputV2
                  ticketAgeConfig={ticketAgeConfig}
                  name={`plateNumber`}
                  label={ticketDetailTranslation(
                    "passenger-details.passenger-details-input.passenger-inputs.plate-number.label"
                  )}
                  placeholder="VD: 95N1-035.29"
                  isUppercase={true}
                  isRemoveAccents={true}
                  positionId={field.positionId}
                  classNames={inputSpan3ClassNames}
                  defaultValue={field.plateNumber || ""}
                  endContent={endContent}
                />
              )}
            </div>
          </div>
        ))}
        <Dialog
          open={qrScan}
          onOpenChange={() => {
            setQrScan(!qrScan);
          }}
        >
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{ticketDetailTranslation("qr.title")}</DialogTitle>
              <DialogDescription>
                {ticketDetailTranslation("qr.message")}
              </DialogDescription>
              <Html5QrcodePlugin
                configs={configs}
                onCodeSuccess={onNewScanResult}
                onCodeError={onErrorScan}
              />
            </DialogHeader>
            <span className="text-danger">{errorScanner}</span>
          </DialogContent>
        </Dialog>
        <IdCardUploadModal
          isOpen={idCardModal}
          onClose={handleIdCardModalOnClose}
          onResult={handleOCRResultCardId}
        />
      </>
    );
  })
);

export default PassengerForms;
