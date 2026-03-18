"use client";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { calculateAge, cn } from "@/lib/utils";
import { OperatorEnum } from "@/services/apis/operators/types/operator";
import { OperatorNationality } from "@/services/apis/operators/types/operator-nationality";
import { TicketPrice } from "@/services/apis/tickets/types/ticket-price";
import { TicketAgeCustomConfig } from "@/services/apis/tickets/types/ticket-type-config";
import {
  FormOperatorNationality,
  FormPassengerTicket,
  VoyageFormData,
} from "@/services/form/types/form-types";
import { useTranslation } from "@/services/i18n/client";
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";
import { memo, useCallback, useEffect, useState } from "react";
import {
  FieldValues,
  UseFieldArrayUpdate,
  UseFormGetValues,
  UseFormSetValue,
  useFormContext,
} from "react-hook-form";

type ComboboxInputProps = {
  name: string;
  label: string;
  type?: string;
  isRequired?: boolean;
  autoFocus?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  options: OperatorNationality[];
  text?: {
    searchPlaceholder?: string;
    triggerDefaultLabel?: string;
    noResult?: string;
  };
  defaultValueId?: FormOperatorNationality["national_id"];
  classNames?: Partial<
    Record<
      | "base"
      | "label"
      | "trigger"
      | "triggerIcon"
      | "popupWrapper"
      | "searchInput"
      | "listItem",
      string
    >
  >;
  positionId: number;
  update: UseFieldArrayUpdate<VoyageFormData, "passengers">;
  ticketAgeConfig: TicketAgeCustomConfig[];
  operatorCode?: string;
};

type FormComboboxInputProps = ComboboxInputProps & {
  setValue: UseFormSetValue<FieldValues>;
  getValues: UseFormGetValues<FieldValues>;
};

const getDefaultOperatorNationalities = (
  operatorNationalities: OperatorNationality[],
  defaultValueId?: FormOperatorNationality["national_id"]
) =>
  operatorNationalities.find(
    (option) =>
      String(option.national_id) === String(defaultValueId) ||
      option.name === String(defaultValueId) ||
      option.abbrev === String(defaultValueId)
  ) ??
  operatorNationalities.find((option) => option.default) ??
  operatorNationalities[0] ??
  [];

const ComboboxInput = memo(function ComboboxInputRaw({
  label,
  options,
  text,
  classNames,
  isRequired,
  defaultValueId,
  setValue: rhfSetValue,
  getValues,
  positionId,
  update,
  name,
  ticketAgeConfig,
  operatorCode,
}: FormComboboxInputProps) {
  const [value, setValue] = useState<OperatorNationality>(
    getDefaultOperatorNationalities(options, defaultValueId)
  );
  // The React Hook Form core logic
  const formData: FormPassengerTicket[] = getValues("passengers");
  const fieldIndex =
    formData.findIndex((field) => field.positionId === positionId) ?? 0;
  const fieldName = `passengers.${fieldIndex}.${name}`;
  const passengerData = formData[fieldIndex];
  useEffect(() => {
    if (defaultValueId) {
      const operatorNationality = getDefaultOperatorNationalities(
        options,
        defaultValueId
      );
      setValue(operatorNationality);
      rhfSetValue(fieldName, operatorNationality);
    }
  }, [defaultValueId, fieldName, options, rhfSetValue]);

  const { t: translation } = useTranslation("ticket-detail");
  const [open, setOpen] = useState(false);

  // useEffect(() => {
  //   // onChange(value);
  //   rhfSetValue(fieldName, value);
  // }, [fieldName, rhfSetValue, value]);

  const buttonLabel = value
    ? options.find(
        (option) =>
          option.national_id.toString() === value?.national_id.toString()
      )?.name
    : text?.triggerDefaultLabel
      ? text?.triggerDefaultLabel
      : "Press";

  const onSelectHandler = useCallback(
    (value: string) => {
      const nationality = options.find((option) => option.name === value);
      if (nationality) {
        setValue(nationality);
        rhfSetValue(
          fieldName,
          {
            ...nationality,
            national_id: nationality.national_id.toString(),
          },
          {
            shouldValidate: true,
            shouldDirty: true,
            shouldTouch: true,
          }
        );

        let age =
          new Date().getFullYear() -
          formData[fieldIndex].dateOfBirth?.getFullYear();
        let ticketSelectedType = ticketAgeConfig.find(
          (ticket) => ticket.min <= age && ticket.max >= age
        );
        if (ticketAgeConfig && ticketAgeConfig[0].is_with_date) {
          age = calculateAge(formData[fieldIndex].dateOfBirth?.toDateString());
          ticketSelectedType = ticketAgeConfig.find(
            (ticket) => ticket.min - 1 <= age && ticket.max > age
          );
        }

        if (
          ticketSelectedType?.label === "elderly" &&
          !nationality.default &&
          operatorCode !== OperatorEnum.GreenLines &&
          operatorCode !== OperatorEnum.BinhAnHaTien &&
          operatorCode !== OperatorEnum.ThanhThoi &&
          operatorCode !== OperatorEnum.Lightning68
        ) {
          ticketSelectedType = ticketAgeConfig.find(
            (ticket) => ticket.label === "adult"
          );
          const ticketSelected = JSON.parse(passengerData?.allTicketPrice).find(
            (ticket: TicketPrice) =>
              ticket.ticket_type_id === ticketSelectedType?.type_id
          );
          update(fieldIndex, {
            ...passengerData,
            nationality: {
              ...nationality,
              national_id: nationality.national_id.toString(),
            },
            ticketPrice: ticketSelected,
            price: ticketSelected?.price,
          });
        } else if (
          ticketSelectedType?.label === "elderly" &&
          nationality.default
        ) {
          const ticketSelected = JSON.parse(passengerData?.allTicketPrice).find(
            (ticket: TicketPrice) =>
              ticket.ticket_type_id === ticketSelectedType?.type_id
          );
          update(fieldIndex, {
            ...passengerData,
            nationality: {
              ...nationality,
              national_id: nationality.national_id.toString(),
            },
            ticketPrice: ticketSelected,
            price: ticketSelected?.price,
          });
        } else {
          update(fieldIndex, {
            ...passengerData,
            nationality: {
              ...nationality,
              national_id: nationality.national_id.toString(),
            },
          });
        }
      }
      setOpen(false);
    },
    [
      fieldIndex,
      fieldName,
      formData,
      operatorCode,
      options,
      passengerData,
      rhfSetValue,
      ticketAgeConfig,
      update,
    ]
  );

  return (
    <>
      <FormItem className={cn("relative flex flex-col", classNames?.base)}>
        <FormLabel
          isRequired={isRequired}
          className={cn(
            `pointer-events-none absolute left-0 top-0 !-translate-y-[0.275rem] translate-x-2.5 bg-white px-0.5 !text-[9px] font-medium !leading-[9px] text-muted-foreground`,
            classNames?.label
          )}
        >
          {label}
        </FormLabel>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <FormControl>
              <Button
                variant="outline"
                role="combobox"
                className={cn(
                  "w-[200px] justify-between",
                  !value && "text-muted-foreground",
                  classNames?.trigger
                )}
              >
                <span className="overflow-hidden text-ellipsis whitespace-nowrap">
                  {buttonLabel}
                </span>
                <CaretSortIcon
                  className={cn(
                    "ml-2 h-4 w-4 shrink-0 opacity-50",
                    classNames?.triggerIcon
                  )}
                />
              </Button>
            </FormControl>
          </PopoverTrigger>
          <PopoverContent
            className={cn("w-[250px] p-0", classNames?.popupWrapper)}
          >
            <Command>
              <CommandInput
                placeholder={
                  text?.searchPlaceholder
                    ? text.searchPlaceholder
                    : translation(
                        "passenger-details.passenger-details-input.passenger-inputs.nationality.placeholder"
                      )
                }
                className={cn("h-9", classNames?.searchInput)}
              />
              <CommandEmpty>
                {text?.noResult
                  ? text?.noResult
                  : translation(
                      "passenger-details.passenger-details-input.passenger-inputs.nationality.no-result"
                    )}
              </CommandEmpty>
              <CommandList>
                <CommandGroup>
                  {options.length &&
                    options.map((option) => (
                      <CommandItem
                        value={option.name as string}
                        key={option.name as string}
                        onSelect={onSelectHandler}
                      >
                        {option.name as string}
                        <CheckIcon
                          className={cn(
                            "ml-auto h-4 w-4",
                            option?.national_id === value?.national_id
                              ? "opacity-100"
                              : "opacity-0",
                            classNames?.listItem
                          )}
                        />
                      </CommandItem>
                    ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        <FormMessage />
      </FormItem>
    </>
  );
});

function PassengerFormComboboxInput({
  label,
  options,
  text,
  isRequired,
  classNames,
  name,
  defaultValueId,
  positionId,
  update,
  ticketAgeConfig,
  operatorCode,
}: ComboboxInputProps) {
  const { setValue, getValues } = useFormContext();
  const formData: FormPassengerTicket[] = getValues("passengers");
  const fieldIndex =
    formData.findIndex((field) => field.positionId === positionId) ?? 0;
  const fieldName = `passengers.${fieldIndex}.${name}`;

  const renderElement = useCallback(() => {
    return (
      <ComboboxInput
        label={label}
        options={options}
        classNames={classNames}
        isRequired={isRequired}
        text={text}
        defaultValueId={defaultValueId}
        positionId={positionId}
        setValue={setValue}
        getValues={getValues}
        name={name}
        update={update}
        ticketAgeConfig={ticketAgeConfig}
        operatorCode={operatorCode}
      />
    );
  }, [
    classNames,
    defaultValueId,
    getValues,
    isRequired,
    label,
    name,
    operatorCode,
    options,
    positionId,
    setValue,
    text,
    ticketAgeConfig,
    update,
  ]);

  return (
    <FormField
      name={fieldName}
      defaultValue={defaultValueId}
      // control={props.control}
      render={renderElement}
    />
  );
}

export default PassengerFormComboboxInput;
