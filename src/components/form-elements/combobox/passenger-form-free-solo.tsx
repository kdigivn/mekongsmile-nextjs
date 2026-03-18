/* eslint-disable no-restricted-syntax */
/* eslint-disable @arthurgeron/react-usememo/require-usememo */
"use client";
import {
  Command,
  CommandGroup,
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
import { Input } from "@/components/ui/input";
import { calculateAge, cn, removeAccents } from "@/lib/utils";
import { OperatorNationality } from "@/services/apis/operators/types/operator-nationality";
import { Passenger } from "@/services/apis/passengers/types/passenger";
import { TicketGenderEnum } from "@/services/apis/tickets/types/ticket-gender-enum";
import { TicketPrice } from "@/services/apis/tickets/types/ticket-price";
import { TicketAgeCustomConfig } from "@/services/apis/tickets/types/ticket-type-config";
import {
  FormPassengerTicket,
  VoyageFormData,
} from "@/services/form/types/form-types";
import { CheckIcon } from "@radix-ui/react-icons";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FieldValues,
  UseFieldArrayUpdate,
  UseFormGetValues,
  UseFormSetValue,
  useFormContext,
} from "react-hook-form";

type FreeSoloInputProps = {
  name: string;
  label: string;
  type?: string;
  isRequired?: boolean;
  autoFocus?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  options: Passenger[];
  placeholder?: string;
  defaultValue: Passenger["full_name"];
  isUppercase?: boolean;
  isRemoveAccents?: boolean;
  classNames?: {
    base?: string;
    label?: string;
    input?: string;
    dropdown?: string;
  };
  positionId: number;
  update: UseFieldArrayUpdate<VoyageFormData, "passengers">;
  nationalities: OperatorNationality[];
  ticketAgeConfig: TicketAgeCustomConfig[];
};

type FormFreeSoloInputProps = FreeSoloInputProps & {
  setValue: UseFormSetValue<FieldValues>;
  getValues: UseFormGetValues<FieldValues>;
};

const FreeSoloInput = memo(function FreeSoloInputRaw({
  label,
  options,
  defaultValue,
  classNames,
  isRequired,
  isUppercase,
  isRemoveAccents,
  placeholder,
  name,
  positionId,
  getValues,
  update,
  nationalities,
  setValue: rhfSetValue,
  ticketAgeConfig,
}: FormFreeSoloInputProps) {
  const [inputValue, setInputValue] = useState<string>(defaultValue ?? "");
  const [filteredOptions, setFilteredOptions] = useState<Passenger[]>([]);
  // The React Hook Form core logic
  const formData: FormPassengerTicket[] = getValues("passengers");
  const fieldIndex =
    formData.findIndex((field) => field.positionId === positionId) ?? 0;
  const fieldName = `passengers.${fieldIndex}.${name}`;
  // const { field } = useController({ name: fieldName });
  const passengerData = formData[fieldIndex];
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const optionsFiltered = useMemo(() => {
    const seen = new Set<string>();
    return options.filter((option) => {
      const fullName = removeAccents(option.full_name.toLocaleUpperCase());
      if (seen.has(fullName)) {
        return false;
      }
      seen.add(fullName);
      return fullName.includes(removeAccents(inputValue));
    });
  }, [options, inputValue]);

  useEffect(() => {
    if (defaultValue || defaultValue === "") {
      let value = defaultValue ?? "";
      if (isUppercase) {
        value = value.toUpperCase();
      }
      if (isRemoveAccents) {
        value = removeAccents(value);
      }
      setInputValue(value);
    }
  }, [defaultValue, isRemoveAccents, isUppercase]);

  useEffect(() => {
    setFilteredOptions(
      optionsFiltered.filter((option) =>
        removeAccents(option.full_name.toLocaleUpperCase()).includes(
          removeAccents(inputValue)
        )
      )
    );
  }, [inputValue, optionsFiltered]);

  const getNationalityByAbbrev = useCallback(
    (abbrev: string) => {
      const nationality: OperatorNationality =
        nationalities.find((nationality) => nationality.abbrev === abbrev) ||
        nationalities.find((nationality) => nationality.default) ||
        nationalities[0];
      return {
        ...nationality,
        national_id: nationality.national_id.toString(),
      };
    },
    [nationalities]
  );

  const onSelectHandler = useCallback(
    (value: string) => {
      const passenger = optionsFiltered.find(
        (option) => option.full_name === value
      );

      if (passenger) {
        // rhfSetValue(fieldName, passenger.full_name);
        const name = removeAccents(passenger.full_name.toLocaleUpperCase());

        let age =
          new Date().getFullYear() -
          new Date(passenger.date_of_birth).getFullYear();
        let ticketSelectedType = ticketAgeConfig.find(
          (ticket) => ticket.min <= age && ticket.max >= age
        );
        if (ticketAgeConfig && ticketAgeConfig[0].is_with_date) {
          age = calculateAge(passenger.date_of_birth);
          ticketSelectedType = ticketAgeConfig.find(
            (ticket) => ticket.min - 1 <= age && ticket.max > age
          );
        }
        if (
          ticketSelectedType?.label === "elderly" &&
          passenger.national_abbrev !== "VN"
        ) {
          ticketSelectedType = ticketAgeConfig.find(
            (ticket) => ticket.label === "adult"
          );
        }
        const ticketSelected = JSON.parse(passengerData?.allTicketPrice).find(
          (ticket: TicketPrice) =>
            ticket.ticket_type_id === ticketSelectedType?.type_id
        );
        if (
          ticketSelected &&
          ticketSelected.ticket_type_id !==
            passengerData?.ticketPrice.ticket_type_id
        ) {
          update(fieldIndex, {
            ...passengerData,
            name: name,
            gender: passenger.gender ?? TicketGenderEnum.Male,
            address: passenger.address,
            dateOfBirth: new Date(passenger.date_of_birth),
            socialId: passenger.social_id,
            nationality: getNationalityByAbbrev(passenger.national_abbrev),
            plateNumber: passenger.plate_number,
            ticketPrice: ticketSelected,
            price: ticketSelected.price_with_VAT ?? 0,
          });
        } else {
          update(fieldIndex, {
            ...passengerData,
            name: name,
            gender: passenger.gender ?? TicketGenderEnum.Male,
            address: passenger.address,
            dateOfBirth: new Date(passenger.date_of_birth),
            socialId: passenger.social_id,
            nationality: getNationalityByAbbrev(passenger.national_abbrev),
            plateNumber: passenger.plate_number,
          });
        }
      } else {
        rhfSetValue(fieldName, value);
      }
      setInputValue(value);
      setIsDropdownOpen(false); // Keep dropdown open on select
    },
    [
      fieldIndex,
      fieldName,
      getNationalityByAbbrev,
      optionsFiltered,
      passengerData,
      rhfSetValue,
      ticketAgeConfig,
      update,
    ]
  );

  const onInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      let value = event.target.value;
      if (isUppercase) {
        value = value.toUpperCase();
      }
      if (isRemoveAccents) {
        value = removeAccents(value);
      }
      setInputValue(value);
      setIsDropdownOpen(true);
      rhfSetValue(fieldName, value);
    },
    [fieldName, isRemoveAccents, isUppercase, rhfSetValue]
  );

  const classNamesInput = useMemo(
    () => cn(classNames?.input, "text-base"),
    [classNames?.input]
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (!filteredOptions.length) return;

      switch (event.key) {
        case "ArrowDown":
          setHighlightedIndex((prevIndex) =>
            prevIndex === null || prevIndex === filteredOptions.length - 1
              ? 0
              : prevIndex + 1
          );
          break;
        case "ArrowUp":
          setHighlightedIndex((prevIndex) =>
            prevIndex === null || prevIndex === 0
              ? filteredOptions.length - 1
              : prevIndex - 1
          );
          break;
        case "Enter":
          if (highlightedIndex !== null) {
            const selectedOption = filteredOptions[highlightedIndex];
            onSelectHandler(selectedOption.full_name);
            setHighlightedIndex(null);
          } else {
            const firstOption = filteredOptions[0];
            if (firstOption) {
              onSelectHandler(firstOption.full_name);
            }
          }
          break;
        case "Escape":
          setIsDropdownOpen(false);
          setHighlightedIndex(null);
          break;
      }
    },
    [filteredOptions, highlightedIndex, onSelectHandler]
  );

  useEffect(() => {
    if (highlightedIndex !== null && listRef.current) {
      const listItems = listRef.current.querySelectorAll("[data-highlighted]");
      const highlightedItem = listItems[highlightedIndex];
      if (highlightedItem) {
        highlightedItem.scrollIntoView({ block: "nearest" });
      }
    }
  }, [highlightedIndex]);

  const highlightKeyword = useCallback((text: string, keyword: string) => {
    const escapedKeyword = keyword.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
    const parts = text.split(new RegExp(`(${escapedKeyword})`, "gi"));
    return (
      <span>
        {parts.map((part, index) =>
          part === keyword ? (
            <span key={index} className="font-bold text-primary">
              {`${part}`}
            </span>
          ) : (
            `${part}`
          )
        )}
      </span>
    );
  }, []);

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
        <FormControl>
          <Input
            // ref={field.ref}
            className={classNamesInput}
            value={inputValue}
            onChange={onInputChange}
            placeholder={placeholder ?? ""}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsDropdownOpen(true)}
            autoComplete="anyrandominvalidvalue"
          />
        </FormControl>
        {isDropdownOpen && filteredOptions.length > 0 && inputValue !== "" && (
          <div
            className={cn(
              "absolute top-9 z-10 w-full rounded-md border bg-white",
              classNames?.dropdown
            )}
            ref={listRef}
          >
            <Command>
              <CommandList>
                <CommandGroup>
                  {filteredOptions
                    .filter((_, index) => index < 3)
                    .map((option, index) => (
                      <CommandItem
                        data-highlighted={highlightedIndex === index}
                        value={option.full_name as string}
                        key={index}
                        className={`${highlightedIndex === index ? "bg-default-200" : ""} cursor-pointer`}
                        onMouseEnter={() => setHighlightedIndex(index)}
                        onMouseLeave={() => setHighlightedIndex(null)}
                        onMouseDown={() => onSelectHandler(option.full_name)} // Prevents blur event
                        onClick={() => onSelectHandler(option.full_name)}
                      >
                        {highlightKeyword(
                          (option.full_name as string).toLocaleUpperCase(),
                          inputValue
                        )}
                        {/* {option.full_name as string} */}
                        <CheckIcon
                          className={cn(
                            "ml-auto h-4 w-4",
                            option.full_name === inputValue
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                      </CommandItem>
                    ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </div>
        )}
        <FormMessage />
      </FormItem>
    </>
  );
});

function PassengerFormFreeSoloInput({
  label,
  options,
  isRequired,
  classNames,
  name,
  defaultValue,
  positionId,
  isUppercase,
  isRemoveAccents,
  placeholder,
  update,
  nationalities,
  ticketAgeConfig,
}: FreeSoloInputProps) {
  const { setValue, getValues } = useFormContext();
  const formData: FormPassengerTicket[] = getValues("passengers");
  const fieldIndex =
    formData.findIndex((field) => field.positionId === positionId) ?? 0;
  const fieldName = `passengers.${fieldIndex}.${name}`;

  const renderElement = useCallback(() => {
    return (
      <FreeSoloInput
        label={label}
        options={options}
        classNames={classNames}
        isRequired={isRequired}
        placeholder={placeholder}
        defaultValue={defaultValue}
        isRemoveAccents={isRemoveAccents}
        isUppercase={isUppercase}
        getValues={getValues}
        setValue={setValue}
        name={name}
        positionId={positionId}
        update={update}
        nationalities={nationalities}
        ticketAgeConfig={ticketAgeConfig}
      />
    );
  }, [
    classNames,
    defaultValue,
    getValues,
    isRemoveAccents,
    isRequired,
    isUppercase,
    label,
    name,
    nationalities,
    options,
    placeholder,
    positionId,
    setValue,
    ticketAgeConfig,
    update,
  ]);
  return (
    <FormField
      name={fieldName}
      // control={control}
      defaultValue={defaultValue}
      render={renderElement}
    />
  );
}

export default PassengerFormFreeSoloInput;
