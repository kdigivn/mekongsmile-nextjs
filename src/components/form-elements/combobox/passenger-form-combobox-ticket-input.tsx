"use client";
import { Button } from "@/components/ui/button";
import {
  Command,
  // CommandEmpty,
  CommandGroup,
  // CommandInput,
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
import { cn } from "@/lib/utils";
import { TicketPrice } from "@/services/apis/tickets/types/ticket-price";
import { FormPassengerTicket } from "@/services/form/types/form-types";
// import { useTranslation } from "@/services/i18n/client";
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";
import { memo, useCallback, useEffect, useState } from "react";
import {
  FieldValues,
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
  options: string;
  text?: {
    searchPlaceholder?: string;
    triggerDefaultLabel?: string;
    noResult?: string;
  };
  defaultValueId?: TicketPrice["ticket_type_id"];
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
};

type FormComboboxTicketInputProps = ComboboxInputProps & {
  setValue: UseFormSetValue<FieldValues>;
  getValues: UseFormGetValues<FieldValues>;
};

const getDefaultTicketPrice = (
  ticketPrices: TicketPrice[],
  defaultValueId?: TicketPrice["ticket_type_id"]
) => {
  return (
    ticketPrices.find(
      (ticketPrice) => ticketPrice.ticket_type_id === defaultValueId
    ) ??
    ticketPrices.find((ticketPrice) => ticketPrice.ticket_type_id === 1) ??
    ticketPrices[0]
  );
};

const ComboboxInput = memo(function ComboboxInputRaw({
  label,
  options: stringOptions,
  text,
  classNames,
  isRequired,
  defaultValueId,
  setValue: rhfSetValue,
  getValues,
  positionId,
  name,
  readOnly,
}: FormComboboxTicketInputProps) {
  // const { t: translation } = useTranslation("ticket-detail");
  const [open, setOpen] = useState(false);
  const options = JSON.parse(stringOptions) as TicketPrice[];
  const [selectedValue, setSelectedValue] = useState<TicketPrice>(
    getDefaultTicketPrice(options, defaultValueId)
  );

  // The React Hook Form core logic
  const formData: FormPassengerTicket[] = getValues("passengers");
  const fieldIndex =
    formData.findIndex((field) => field.positionId === positionId) ?? 0;
  const fieldName = `passengers.${fieldIndex}.${name}`;

  useEffect(() => {
    if (defaultValueId || defaultValueId === 0) {
      const ticketPrice = getDefaultTicketPrice(options, defaultValueId);
      setSelectedValue(ticketPrice);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValueId]);

  useEffect(() => {
    rhfSetValue(fieldName, selectedValue);
  }, [fieldName, rhfSetValue, selectedValue]);

  const buttonLabel = selectedValue
    ? options.find(
        (option) => option.id.toString() === selectedValue?.id.toString()
      )?.ticket_type_label
    : text?.triggerDefaultLabel
      ? text?.triggerDefaultLabel
      : "Press";

  const onSelectHandler = useCallback(
    (value: string) => {
      const ticketPrice = options.find(
        (option) => option.ticket_type_label === value
      );
      if (ticketPrice) {
        rhfSetValue(fieldName, ticketPrice, {
          shouldValidate: true,
          shouldDirty: true,
          shouldTouch: true,
        });
        setSelectedValue(ticketPrice);
      }
      setOpen(false);
    },
    [fieldName, options, rhfSetValue]
  );

  return (
    <FormItem className={cn("relative flex flex-col", classNames?.base)}>
      <FormLabel
        isRequired={isRequired}
        className={cn(
          `pointer-events-none absolute left-0 top-0 z-[2] !-translate-y-[0.275rem] translate-x-2.5 bg-white px-0.5 !text-[9px] font-medium !leading-[9px] text-muted-foreground`,
          classNames?.label
        )}
      >
        {label}
      </FormLabel>
      {readOnly ? (
        <Button
          disabled
          variant="outline"
          role="combobox"
          className={cn(
            "w-[200px] justify-between",
            !selectedValue && "text-muted-foreground",
            classNames?.trigger
          )}
        >
          <span className="overflow-hidden text-ellipsis whitespace-nowrap">
            {buttonLabel}
          </span>
        </Button>
      ) : (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <FormControl>
              <Button
                variant="outline"
                role="combobox"
                className={cn(
                  "w-[200px] justify-between",
                  !selectedValue && "text-muted-foreground",
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
              {/* <CommandInput
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
              </CommandEmpty> */}
              <CommandList>
                <CommandGroup>
                  {options.length &&
                    options.map((option) => (
                      <CommandItem
                        value={option.ticket_type_label as string}
                        key={option.id}
                        onSelect={onSelectHandler}
                      >
                        {option.ticket_type_label as string}
                        <CheckIcon
                          className={cn(
                            "ml-auto h-4 w-4",
                            option?.id === selectedValue?.id
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
      )}
      <FormMessage />
    </FormItem>
  );
});

function PassengerFormComboboxTicketInput({
  label,
  options,
  text,
  isRequired,
  classNames,
  name,
  defaultValueId,
  positionId,
  readOnly,
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
        readOnly={readOnly}
        name={name}
        positionId={positionId}
        setValue={setValue}
        getValues={getValues}
      />
    );
  }, [
    classNames,
    defaultValueId,
    getValues,
    isRequired,
    label,
    name,
    options,
    positionId,
    readOnly,
    setValue,
    text,
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

export default PassengerFormComboboxTicketInput;
