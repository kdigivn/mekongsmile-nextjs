"use client";

import { forwardRef, memo, useCallback, useState } from "react";
import {
  Controller,
  ControllerProps,
  FieldPath,
  FieldValues,
} from "react-hook-form";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CiCalendar } from "react-icons/ci";
import Calendar from "@/components/ui/calendar";

type ValueDateType = Date | null | undefined;

type DatePickerFieldProps = {
  disabled?: boolean;
  className?: string;
  minDate?: Date;
  maxDate?: Date;
  autoFocus?: boolean;
  readOnly?: boolean;
  label: string;
  testId?: string;
  error?: string;
  defaultValue?: ValueDateType;
  disableFuture?: boolean;
  isRequired?: boolean;
  inputRef?: React.Ref<HTMLInputElement>;
  name: string; // Added name prop
  value: ValueDateType; // Added value prop
  onChange: (value: ValueDateType) => void; // Added onChange prop
  onBlur: () => void; // Added onBlur prop
};

const DatePickerInput = memo(
  forwardRef<HTMLDivElement, DatePickerFieldProps>(
    function DatePickerInput(props, ref) {
      const [date, setDate] = useState<Date | undefined>(
        props.value ?? undefined
      );

      const handleSelect = useCallback(
        (selectedDate: Date | undefined) => {
          setDate(selectedDate);
          props.onChange(selectedDate ?? null);
        },
        [props]
      );

      const handleDisable = useCallback(
        (date: Date) =>
          (props.minDate ? date < props.minDate : false) ||
          (props.maxDate ? date > props.maxDate : false) ||
          (props.disableFuture ? date > new Date() : false),
        [props]
      );

      return (
        <div
          className={cn("flex flex-col space-y-2", props.className)}
          ref={ref}
        >
          <Label htmlFor={props.name}>{props.label}</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
                disabled={props.disabled || props.readOnly}
              >
                <CiCalendar className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={handleSelect}
                disabled={handleDisable}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Input
            type="hidden"
            name={props.name}
            value={date ? date.toISOString() : ""}
            ref={props.inputRef}
          />
          {props.error && <p className="text-sm text-red-500">{props.error}</p>}
        </div>
      );
    }
  )
);

function FormDatePickerInput<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  props: DatePickerFieldProps &
    Pick<
      ControllerProps<TFieldValues, TName>,
      "name" | "defaultValue" | "control"
    >
) {
  const handleOnChange = useCallback(
    (value: ValueDateType) => props.onChange?.(value),
    [props]
  );
  const renderElement = useCallback(
    () => (
      <DatePickerInput
        {...props}
        name={props.name} // Passing name
        value={props.defaultValue} // Passing value
        onChange={handleOnChange} // Passing onChange
        onBlur={props.onBlur} // Passing onBlur
      />
    ),
    [handleOnChange, props]
  );

  return (
    <Controller
      control={props.control}
      name={props.name}
      defaultValue={props.defaultValue}
      render={renderElement}
    />
  );
}

export default memo(FormDatePickerInput);
