"use client";

import {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  FieldValues,
  useFormContext,
  UseFormGetValues,
  UseFormSetValue,
} from "react-hook-form";
import { cn } from "@/lib/utils";
import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { TicketAgeCustomConfig } from "@/services/apis/tickets/types/ticket-type-config";
import { TicketPrice } from "@/services/apis/tickets/types/ticket-price";
import { FormPassengerTicket } from "@/services/form/types/form-types";
import { format } from "date-fns";
import CalendarPopover from "./popover-calendar";
import { OperatorEnum } from "@/services/apis/operators/types/operator";
type DatePickerFieldProps = {
  classNames?: {
    base?: string;
    input?: string;
    label?: string;
    container?: string;
    fieldset?: string;
  };
  label: string;
  disableFuture?: boolean;
  isRequired?: boolean;
  inputRef?: React.Ref<HTMLInputElement>;
  ticketAgeConfig: TicketAgeCustomConfig[];
  update?: (index: number, data: FormPassengerTicket) => void;
  name: string;
  positionId: number;
  defaultValue?: number;
  operatorCode?: string;
  departureDate?: string;
};

const PATTERNS = {
  day: "d",
  month: "m",
  year: "y",
};

type SelectedSection = {
  pattern: string;
  cursorStart: number;
  cursorEnd: number;
  positionValue: number;
};

const isValidDate = (day: number, month: number, year: number): boolean => {
  const date = new Date(year, month - 1, day);
  // if (year < 1900 || year > new Date().getFullYear()) return false;
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
};

const DateInput = memo(
  forwardRef<
    HTMLInputElement,
    DatePickerFieldProps & {
      setValue: UseFormSetValue<FieldValues>;
      getValues: UseFormGetValues<FieldValues>;
    }
  >(function DateInput(
    {
      label,
      name,
      classNames,
      defaultValue,
      isRequired,
      setValue,
      getValues,
      ticketAgeConfig,
      update,
      positionId,
      operatorCode,
      departureDate,
    },
    ref
  ) {
    const formData: FormPassengerTicket[] = getValues("passengers");
    const fieldIndex =
      formData.findIndex((field) => field.positionId === positionId) ?? 0;
    const fieldName = `passengers.${fieldIndex}.${name}`;
    const inputRef = ref as React.RefObject<HTMLInputElement>;
    const [inputValue, setInputValue] = useState("dd/mm/yyyy");
    const [inputSegmentValue, setInputSegmentValue] = useState("");
    const [selectedSection, setSelectedSection] = useState<SelectedSection>({
      pattern: PATTERNS.day,
      cursorStart: 0,
      cursorEnd: 2,
      positionValue: 0,
    });

    const [isValid, setIsValid] = useState(true);

    const minMaxValues: {
      min: number;
      max: number;
    } = useMemo(() => {
      switch (selectedSection.pattern) {
        case PATTERNS.day:
          return { min: 1, max: 31 };
        case PATTERNS.month:
          return { min: 1, max: 12 };
        case PATTERNS.year:
          return { min: 1900, max: new Date().getFullYear() };
        default:
          return { min: 0, max: 0 };
      }
    }, [selectedSection.pattern]);

    const formatDate = (date: Date) => {
      return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getFullYear()}`;
    };

    const setSelectionRange = (
      target: HTMLInputElement,
      start: number,
      end: number
    ) => {
      setTimeout(() => {
        target.setSelectionRange(start, end);
      }, 10);
    };

    const setSelectedSectionByPattern = useCallback(
      (pattern: string) => {
        switch (pattern) {
          case PATTERNS.month:
            setSelectedSection({
              pattern: PATTERNS.month,
              cursorStart: 3,
              cursorEnd: 5,
              positionValue: 2,
            });
            setInputSegmentValue(inputValue.slice(3, 5));
            break;
          case PATTERNS.year:
            setSelectedSection({
              pattern: PATTERNS.year,
              cursorStart: 6,
              cursorEnd: 10,
              positionValue: 4,
            });
            setInputSegmentValue(inputValue.slice(6, 10));
            break;
          default:
            setSelectedSection({
              pattern: PATTERNS.day,
              cursorStart: 0,
              cursorEnd: 2,
              positionValue: 0,
            });
            setInputSegmentValue(inputValue.slice(0, 2));
        }
      },
      [inputValue]
    );

    const nextSection = useCallback(
      (target: HTMLInputElement) => {
        if (selectedSection.pattern === PATTERNS.day) {
          setSelectedSectionByPattern(PATTERNS.month);
          setSelectionRange(target, 3, 5);
        } else if (selectedSection.pattern === PATTERNS.month) {
          setSelectedSectionByPattern(PATTERNS.year);
          setSelectionRange(target, 6, 10);
        }
      },
      [selectedSection.pattern, setSelectedSectionByPattern]
    );

    const prevSection = useCallback(
      (target: HTMLInputElement) => {
        if (selectedSection.pattern === PATTERNS.year) {
          setSelectedSectionByPattern(PATTERNS.month);
          setSelectionRange(target, 3, 5);
        } else if (selectedSection.pattern === PATTERNS.month) {
          setSelectedSectionByPattern(PATTERNS.day);
          setSelectionRange(target, 0, 2);
        }
      },
      [selectedSection.pattern, setSelectedSectionByPattern]
    );

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        const target = e.target as HTMLInputElement;
        if (e.key === "/" || e.key === "-" || e.key === "." || e.key === " ") {
          e.preventDefault();
          nextSection(target);
        }
        if (e.key === "Backspace") {
          e.preventDefault();
          if (
            (selectedSection.pattern === PATTERNS.month &&
              (inputSegmentValue === "mm" || inputSegmentValue === "")) ||
            (selectedSection.pattern === PATTERNS.year &&
              (inputSegmentValue === "yyyy" || inputSegmentValue === ""))
          ) {
            prevSection(target);
          } else {
            setTimeout(() => {
              setInputSegmentValue("");
            }, 10);
            if (selectedSection.pattern === PATTERNS.year) {
              setInputValue(
                inputValue.slice(0, selectedSection.cursorStart) +
                  "yyyy" +
                  inputValue.slice(selectedSection.cursorEnd)
              );
            } else {
              if (selectedSection.pattern === PATTERNS.day) {
                setInputValue(
                  inputValue.slice(0, selectedSection.cursorStart) +
                    "dd" +
                    inputValue.slice(selectedSection.cursorEnd)
                );
              } else {
                setInputValue(
                  inputValue.slice(0, selectedSection.cursorStart) +
                    "mm" +
                    inputValue.slice(selectedSection.cursorEnd)
                );
              }
            }

            setSelectionRange(
              target,
              selectedSection.cursorStart,
              selectedSection.cursorEnd
            );
          }
        }
        if (e.key === "ArrowRight") {
          e.preventDefault();
          nextSection(target);
        }
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          prevSection(target);
        }
        if (e.key === "ArrowUp") {
          e.preventDefault();
          let newValue = parseInt(inputSegmentValue) + 1;
          if (isNaN(newValue)) {
            newValue = minMaxValues.min;
          }
          if (newValue > minMaxValues.max) return;
          if (selectedSection.pattern === PATTERNS.year) {
            setInputSegmentValue(newValue.toString().padStart(4, "0"));
            setInputValue(
              inputValue.slice(0, selectedSection.cursorStart) +
                newValue.toString().padStart(4, "0") +
                inputValue.slice(selectedSection.cursorEnd)
            );
          } else {
            setInputSegmentValue(newValue.toString().padStart(2, "0"));
            setInputValue(
              inputValue.slice(0, selectedSection.cursorStart) +
                newValue.toString().padStart(2, "0") +
                inputValue.slice(selectedSection.cursorEnd)
            );
          }

          setSelectionRange(
            target,
            selectedSection.cursorStart,
            selectedSection.cursorEnd
          );
        }
        if (e.key === "ArrowDown") {
          e.preventDefault();
          let newValue = parseInt(inputSegmentValue) - 1;
          if (isNaN(newValue)) {
            newValue = minMaxValues.max;
          }
          if (newValue < 0) return;
          if (newValue < minMaxValues.min) return;
          if (selectedSection.pattern === PATTERNS.year) {
            setInputSegmentValue(newValue.toString().padStart(4, "0"));
            setInputValue(
              inputValue.slice(0, selectedSection.cursorStart) +
                newValue.toString().padStart(4, "0") +
                inputValue.slice(selectedSection.cursorEnd)
            );
          } else {
            setInputSegmentValue(newValue.toString().padStart(2, "0"));
            setInputValue(
              inputValue.slice(0, selectedSection.cursorStart) +
                newValue.toString().padStart(2, "0") +
                inputValue.slice(selectedSection.cursorEnd)
            );
          }

          setSelectionRange(
            target,
            selectedSection.cursorStart,
            selectedSection.cursorEnd
          );
        }
      },
      [
        inputSegmentValue,
        inputValue,
        minMaxValues.max,
        minMaxValues.min,
        nextSection,
        prevSection,
        selectedSection.cursorEnd,
        selectedSection.cursorStart,
        selectedSection.pattern,
      ]
    );

    const handleDateChange = useCallback(
      (date: Date | null) => {
        if (date) {
          setValue(fieldName, date, {
            shouldValidate: true,
            shouldDirty: true,
            shouldTouch: true,
          });

          let age: number;
          // Exception for CangSaKy operator: calculate age based on departure date
          if (operatorCode === OperatorEnum.CangSaKy && departureDate) {
            if (ticketAgeConfig?.[0]?.is_with_date) {
              const departureDateObj = new Date(departureDate);
              const birthDate = date;
              age = departureDateObj.getFullYear() - birthDate.getFullYear();
              const monthDiff =
                departureDateObj.getMonth() - birthDate.getMonth();
              const dayDiff = departureDateObj.getDate() - birthDate.getDate();

              if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
                age -= 1; // Adjust age if birthday hasn't occurred this year
              }
            } else {
              // Original logic: calculate age using only the year
              age = new Date().getFullYear() - date.getFullYear();
            }
          } else {
            // Normal case: calculate age based on current date
            if (ticketAgeConfig?.[0]?.is_with_date) {
              // Precise age calculation using full date
              const today = new Date();
              const birthDate = date; // Assuming valueCurrent is a Date object
              age = today.getFullYear() - birthDate.getFullYear();
              const monthDiff = today.getMonth() - birthDate.getMonth();
              const dayDiff = today.getDate() - birthDate.getDate();

              if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
                age -= 1; // Adjust age if birthday hasn't occurred this year
              }
            } else {
              // Original logic: calculate age using only the year
              age = new Date().getFullYear() - date.getFullYear();
            }
          }

          let ticketSelectedType = ticketAgeConfig.find(
            (ticket) => ticket.min <= age && ticket.max >= age
          );

          if (
            formData[fieldIndex].nationality &&
            formData[fieldIndex].nationality.abbrev !== "VN" &&
            formData[fieldIndex].nationality.abbrev.toLowerCase() !==
              "vietnam" &&
            // Exception for GreenLines, BinhAnHaTien and ThanhThoi operators
            operatorCode !== OperatorEnum.GreenLines &&
            operatorCode !== OperatorEnum.BinhAnHaTien &&
            operatorCode !== OperatorEnum.ThanhThoi &&
            operatorCode !== OperatorEnum.Lightning68 &&
            ticketSelectedType?.label === "elderly"
          ) {
            ticketSelectedType = ticketAgeConfig.find(
              (ticket) => ticket.label === "adult"
            );
          }

          const ticketSelected = JSON.parse(
            formData[fieldIndex].allTicketPrice
          ).find(
            (ticket: TicketPrice) =>
              ticket.ticket_type_id === ticketSelectedType?.type_id
          );
          if (
            ticketSelected &&
            ticketSelected.ticket_type_id !==
              formData[fieldIndex].ticketPrice.ticket_type_id &&
            (formData[fieldIndex].nationality ||
              ticketSelectedType?.label !== "elderly")
          ) {
            if (update) {
              update(fieldIndex, {
                ...formData[fieldIndex],
                ticketPrice: ticketSelected,
                socialId:
                  ticketSelectedType?.label === "children"
                    ? ticketSelectedType?.is_children_social_required
                      ? date.getFullYear() + ""
                      : "TE"
                    : "",
                price: ticketSelected.price_with_VAT ?? 0,
              });
            }
          }
        }
      },
      [
        setValue,
        fieldName,
        ticketAgeConfig,
        formData,
        fieldIndex,
        operatorCode,
        departureDate,
        update,
      ]
    );

    useEffect(() => {
      if (defaultValue) {
        const date = new Date(defaultValue);
        setInputValue(formatDate(date));
        handleDateChange(date);
      } else {
        setInputValue("dd/mm/yyyy");
      }
    }, [defaultValue, handleDateChange]);

    const handleInputChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const target = e.target as HTMLInputElement;
        const value = target.value
          .replace(/d/g, "0")
          .replace(/m/g, "0")
          .replace(/y/g, "0")
          .replace(/\D/g, "");
        const newInput = value.slice(
          selectedSection.positionValue,
          selectedSection.positionValue + 1
        );

        let newString = inputSegmentValue + newInput;

        if (selectedSection.pattern === PATTERNS.year) {
          if (inputSegmentValue.length === 4 && inputSegmentValue[0] !== "0") {
            newString = newInput.padStart(4, "0");
          } else if (
            inputSegmentValue.length === 4 &&
            inputSegmentValue[0] === "0"
          ) {
            newString = newString.slice(1);
          } else newString = newString.padStart(4, "0");
        } else {
          if (inputSegmentValue.length === 2 && inputSegmentValue[0] !== "0") {
            newString = newInput.padStart(2, "0");
          } else if (
            inputSegmentValue.length === 2 &&
            inputSegmentValue[0] === "0"
          ) {
            newString = newString.slice(1);

            if (Number(newString) > minMaxValues.max) {
              newString = newString.slice(1).padStart(2, "0");
              // nextSection(target);
            }
          } else {
            newString = newString.padStart(2, "0");
          }
        }

        setInputSegmentValue(newString);

        const newValue =
          inputValue.slice(0, selectedSection.cursorStart) +
          newString +
          inputValue.slice(selectedSection.cursorEnd);

        setInputValue(newValue);

        // Validate parts of the date
        const [day, month, year] = newValue.split("/").map(Number);

        const isValid =
          newValue.length === 10 ? isValidDate(day, month, year) : true;

        setIsValid(isValid);

        if (
          Number(newString) >= minMaxValues.min &&
          Number(newString) <= minMaxValues.max &&
          newString.length === 2 &&
          selectedSection.pattern !== PATTERNS.year
        ) {
          if (
            selectedSection.pattern === PATTERNS.day &&
            (Number(newString) >= 4 ||
              (newString.length === 2 &&
                inputSegmentValue[inputSegmentValue.length - 1] === "0"))
          ) {
            nextSection(target);
          } else if (
            (selectedSection.pattern === PATTERNS.month &&
              Number(newString) >= 2) ||
            (newString.length === 2 &&
              inputSegmentValue[inputSegmentValue.length - 1] === "0")
          ) {
            nextSection(target);
          } else {
            setSelectionRange(
              target,
              selectedSection.cursorStart,
              selectedSection.cursorEnd
            );
          }
        } else {
          // Keep the cursor in the right place after input
          setSelectionRange(
            target,
            selectedSection.cursorStart,
            selectedSection.cursorEnd
          );
        }

        if (newValue.length === 10 && isValid) {
          handleDateChange(new Date(year, month - 1, day));
        } else {
          handleDateChange(null);
        }
      },
      [
        handleDateChange,
        inputSegmentValue,
        inputValue,
        minMaxValues.max,
        minMaxValues.min,
        nextSection,
        selectedSection,
      ]
    );

    const handleBlur = useCallback(() => {
      const [day, month, year] = inputValue.split("/").map(Number);

      const isValid =
        inputValue.length === 10 ? isValidDate(day, month, year) : true;

      setIsValid(isValid);

      if (inputValue.length === 10 && isValid) {
        handleDateChange(new Date(year, month - 1, day));
      } else {
        handleDateChange(null);
      }
    }, [inputValue, handleDateChange]);

    const handleOnSelect = useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        const target = e.target as HTMLInputElement;
        const selectionStart = target.selectionStart ?? 0;
        if (selectionStart < 3) {
          setSelectedSectionByPattern(PATTERNS.day);
          target.setSelectionRange(0, 2);
        } else if (selectionStart < 6) {
          setSelectedSectionByPattern(PATTERNS.month);
          target.setSelectionRange(3, 5);
        } else {
          setSelectedSectionByPattern(PATTERNS.year);
          target.setSelectionRange(6, 10);
        }
      },
      [setSelectedSectionByPattern]
    );

    const handleCalendarSelect = useCallback(
      (date: Date | undefined) => {
        if (date) {
          setInputValue(format(date, "dd/MM/yyyy"));
          handleDateChange(date);
        }
      },
      [handleDateChange]
    );

    const endContent = useMemo(
      () => (
        <CalendarPopover
          inputValue={inputValue}
          onSelect={handleCalendarSelect}
        />
      ),
      [handleCalendarSelect, inputValue]
    );
    return (
      <FormItem className={cn("relative", classNames?.base)}>
        <FormLabel
          isRequired={isRequired}
          className={cn(
            `pointer-events-none absolute left-0 top-0 !-translate-y-[0.275rem] translate-x-2.5 bg-white px-0.5 !text-[9px] font-medium !leading-[9px] text-muted-foreground`,
            classNames?.label
          )}
        >
          {label}
        </FormLabel>
        <Input
          ref={inputRef}
          name={name}
          value={inputValue}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          onChange={handleInputChange}
          onSelect={handleOnSelect}
          className={cn(
            classNames?.input,
            !isValid && "text-red-500",
            "pr-2 text-base"
          )}
          placeholder="dd/mm/yyyy"
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          endContent={endContent}
        />
        <FormMessage />
      </FormItem>
    );
  })
);

function PassengerFormDatePickerInput(props: DatePickerFieldProps) {
  const { setValue, getValues } = useFormContext();
  const formData: FormPassengerTicket[] = getValues("passengers");
  const fieldIndex =
    formData.findIndex((field) => field.positionId === props.positionId) ?? 0;
  const fieldName = `passengers.${fieldIndex}.${props.name}`;

  const renderItem = useCallback(() => {
    return <DateInput {...props} setValue={setValue} getValues={getValues} />;
  }, [props, setValue, getValues]);

  return (
    <FormField
      name={fieldName}
      defaultValue={props.defaultValue}
      render={renderItem}
    />
  );
}

export default memo(PassengerFormDatePickerInput);
