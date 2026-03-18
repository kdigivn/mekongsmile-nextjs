"use client";

import { memo, useCallback, useState, useEffect, useMemo } from "react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";
import { cn, removeAccents } from "@/lib/utils";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "@/services/i18n/client";
import { getCountry } from "../combobox/countries";

type Country = {
  code: string;
  label: string;
  phone: string;
};

type ContactFormPhoneInputProps = {
  name: {
    countryCode: string;
    phoneNumber: string;
  };
  label: string;
  placeholder?: string;
  options: Country[];
  isRequired?: boolean;
  defaultValues?: {
    countryCode?: string;
    phoneNumber?: string;
  };
  classNames?: {
    base?: string;
    baseCountryCode?: string;
    label?: string;
    labelCountryCode?: string;
    input?: string;
    inputCountryCode?: string;
    countryCodeTrigger?: string;
    countryCodePopup?: string;
    triggerIconCountryCode?: string;
    listItemCountryCode?: string;
    wrapper?: string;
    wrapperErrorMessage?: string;
  };
  readonly?: boolean;
  disabled?: boolean;
};

const ContactFormPhoneInput = memo(function ContactFormPhoneInputRaw({
  name,
  label,
  placeholder,
  options,
  isRequired,
  defaultValues,
  classNames,
  readonly,
  disabled,
}: ContactFormPhoneInputProps) {
  const { t: ticketDetailTranslation } = useTranslation("ticket-detail");
  const { setValue } = useFormContext();

  const defaultOption = getCountry(defaultValues?.countryCode || "VN");
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(
    defaultOption || null
  );
  const [open, setOpen] = useState(false);
  const [phoneValue, setPhoneValue] = useState<string>(
    defaultValues?.phoneNumber ?? ""
  );

  useEffect(() => {
    if (defaultValues?.countryCode) {
      const country = options.find(
        (option) => option.code === defaultValues.countryCode
      );
      if (country) {
        setSelectedCountry(country);
        setValue(name.countryCode, country.code, {
          shouldValidate: true,
          shouldDirty: true,
        });
      }
    }

    if (defaultValues?.phoneNumber) {
      setPhoneValue(defaultValues.phoneNumber);
      setValue(name.phoneNumber, defaultValues.phoneNumber, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  }, [defaultValues, name, options, setValue]);

  const onCountrySelectHandler = useCallback(
    (value: string) => {
      const country = options.find((option) => option.label === value);
      if (country) {
        setSelectedCountry(country);
        setValue(name.countryCode, country.code);
        if (country.code === "VN") {
          // Nếu là số điện thoại Việt Nam, loại bỏ số 0 ở đầu
          let newValue = phoneValue;
          if (phoneValue.startsWith("0")) {
            newValue = phoneValue.slice(1);
          }

          setPhoneValue(newValue);
          setValue(name.phoneNumber, newValue);
        }
      }
      setOpen(false);
    },
    [name.countryCode, name.phoneNumber, options, phoneValue, setValue]
  );

  const onPhoneChangeHandler = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value;
      setPhoneValue(newValue);
      setValue(name.phoneNumber, newValue);
    },
    [name.phoneNumber, setValue]
  );

  const onPhoneBlurHandler = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      let newValue = event.target.value;

      // Loại bỏ dấu nếu cần
      newValue = removeAccents(newValue);

      // Nếu là số điện thoại Việt Nam, loại bỏ số 0 ở đầu
      if (selectedCountry?.code === "VN" && newValue.startsWith("0")) {
        newValue = newValue.slice(1);
      }

      setPhoneValue(newValue);
      setValue(name.phoneNumber, newValue);
    },
    [name.phoneNumber, selectedCountry, setValue]
  );

  const classNamesInput = useMemo(
    () => cn(classNames?.input, "text-base"),
    [classNames?.input]
  );

  return (
    <>
      <div className={classNames?.wrapper}>
        <FormItem
          className={cn("relative flex flex-col", classNames?.baseCountryCode)}
        >
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  role="combobox"
                  className={cn(
                    "w-[200px] justify-between",
                    !selectedCountry && "text-muted-foreground",
                    classNames?.countryCodeTrigger
                  )}
                  disabled={disabled}
                >
                  <span className="overflow-hidden text-ellipsis whitespace-nowrap">
                    +{selectedCountry?.phone || "84"}
                  </span>
                  <CaretSortIcon
                    className={cn(
                      "ml-2 h-4 w-4 shrink-0 opacity-50",
                      classNames?.triggerIconCountryCode
                    )}
                  />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent
              className={cn("w-[250px] p-0", classNames?.countryCodePopup)}
            >
              <Command>
                <CommandInput
                  placeholder={ticketDetailTranslation(
                    "passenger-details.passenger-details-input.pic-inputs.phone-country-code.placeholder"
                  )}
                />
                <CommandEmpty>
                  {ticketDetailTranslation(
                    "passenger-details.passenger-details-input.pic-inputs.phone-country-code.not-found"
                  )}
                </CommandEmpty>
                <CommandList>
                  <CommandGroup>
                    {options.map((option) => (
                      <CommandItem
                        key={option.code}
                        value={option.label}
                        onSelect={onCountrySelectHandler}
                      >
                        {option.label} (+{option.phone})
                        <CheckIcon
                          className={`${classNames?.listItemCountryCode} ml-auto h-4 w-4 ${
                            selectedCountry?.code === option.code
                              ? "opacity-100"
                              : "opacity-0"
                          }`}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </FormItem>

        <FormItem className={`${classNames?.base} relative`}>
          <FormLabel
            isRequired={isRequired}
            className={`${classNames?.label} pointer-events-none absolute left-0 top-0 z-[1] !-translate-y-[0.275rem] translate-x-3.5 transform-gpu bg-white px-0.5 !text-[9px] font-medium !leading-[9px] text-muted-foreground`}
          >
            {label}
          </FormLabel>
          <FormControl>
            <Input
              name={name.phoneNumber}
              placeholder={placeholder}
              className={classNamesInput}
              value={phoneValue}
              onChange={onPhoneChangeHandler}
              onBlur={onPhoneBlurHandler}
              readOnly={readonly}
              disabled={disabled}
              type="tel"
            />
          </FormControl>
        </FormItem>
      </div>

      <FormMessage className={classNames?.wrapperErrorMessage} />
    </>
  );
});

function FormPhoneInput(props: ContactFormPhoneInputProps) {
  const renderElement = useCallback(() => {
    return <ContactFormPhoneInput {...props} />;
  }, [props]);

  return <FormField name={props.name.phoneNumber} render={renderElement} />;
}

export default memo(FormPhoneInput);
