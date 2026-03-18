"use client";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { memo, useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
  FieldValues,
  UseFieldArrayUpdate,
  useFormContext,
  UseFormGetValues,
  UseFormSetValue,
} from "react-hook-form";
import {
  FormPassengerTicket,
  VoyageFormData,
} from "@/services/form/types/form-types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TicketGenderEnum } from "@/services/apis/tickets/types/ticket-gender-enum";

type OptionType<T> = {
  id: T;
  label: string;
};

type PassengerFormSelectionProps<T> = {
  label: string;
  name: string;
  options: OptionType<T>[];
  positionId: number;
  defaultValue?: T;
  isRequired?: boolean;
  disabled?: boolean;
  classNames?: Partial<
    Record<
      | "base"
      | "label"
      | "trigger"
      | "triggerIcon"
      | "popupWrapper"
      | "listItem",
      string
    >
  >;
  update: UseFieldArrayUpdate<VoyageFormData, "passengers">;
};

type FormPassengerTextInputProps<T> = PassengerFormSelectionProps<T> & {
  setValue: UseFormSetValue<FieldValues>;
  getValues: UseFormGetValues<FieldValues>;
};

const InputRender = memo(function FormPassengerTextInputProps<T>({
  name,
  label,
  positionId,
  getValues,
  setValue: rhfSetValue,
  update,
  options,
  defaultValue,
  isRequired,
  disabled,
  classNames,
}: FormPassengerTextInputProps<T>) {
  // debugger;
  const [selected, setSelected] = useState<T | undefined>(defaultValue);

  useEffect(() => {
    if (defaultValue !== undefined) {
      const newFormData: FormPassengerTicket[] = getValues("passengers");
      const newFieldIndex =
        newFormData.findIndex((field) => field.positionId === positionId) ?? 0;
      const newFieldName = `passengers.${newFieldIndex}.${name}`;
      setSelected(defaultValue);
      rhfSetValue(newFieldName, defaultValue);
    }
  }, [defaultValue, getValues, name, positionId, rhfSetValue]);

  const onChangeHandler = useCallback(
    (value: string) => {
      const newFormData: FormPassengerTicket[] = getValues("passengers");
      const newFieldIndex =
        newFormData.findIndex((field) => field.positionId === positionId) ?? 0;
      const newFieldName = `passengers.${newFieldIndex}.${name}`;

      const passengerData = newFormData[newFieldIndex];

      const selectedValue =
        options.find((option) => String(option.id) === value) || undefined;

      rhfSetValue(newFieldName, selectedValue?.id, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      });
      setSelected(selectedValue?.id);

      if (passengerData) {
        update(newFieldIndex, {
          ...passengerData,
          gender:
            (selectedValue?.id as TicketGenderEnum) ?? TicketGenderEnum.Male,
        });
      }
    },
    [getValues, name, options, positionId, rhfSetValue, update]
  );

  return (
    <FormItem className={cn("relative flex flex-col", classNames?.base)}>
      <FormLabel
        isRequired={isRequired}
        className={cn(
          `pointer-events-none absolute left-0 top-0 z-[1] !-translate-y-[0.275rem] translate-x-3.5 transform-gpu bg-white px-0.5 !text-[9px] font-medium !leading-[9px] text-muted-foreground`,
          classNames?.label
        )}
      >
        {label}
      </FormLabel>

      <Select
        onValueChange={onChangeHandler}
        disabled={disabled}
        value={String(selected)}
      >
        <FormControl>
          <SelectTrigger className={cn("!m-0")}>
            <SelectValue placeholder="Select a verified email to display" />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          {options.map((option, inx) => (
            <SelectItem key={inx} value={String(option.id)}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  );
});

function PassengerFormSelectionInput<T>({
  label,
  name,
  options,
  defaultValue,
  isRequired,
  classNames,
  positionId,
  disabled,
  update,
}: PassengerFormSelectionProps<T>) {
  const { setValue, getValues } = useFormContext();
  const formData: FormPassengerTicket[] = getValues("passengers");

  const fieldIndex =
    formData.findIndex((field) => field.positionId === positionId) ?? 0;
  const fieldName = `passengers.${fieldIndex}.${name}`;

  const renderElement = useCallback(
    () => (
      <InputRender
        name={name}
        label={label}
        options={options}
        classNames={classNames}
        isRequired={isRequired}
        defaultValue={defaultValue}
        positionId={positionId}
        setValue={setValue}
        getValues={getValues}
        update={update}
        disabled={disabled ?? false}
      />
    ),
    [
      classNames,
      defaultValue,
      disabled,
      getValues,
      isRequired,
      label,
      name,
      options,
      positionId,
      setValue,
      update,
    ]
  );

  return (
    <FormField
      name={fieldName}
      defaultValue={defaultValue}
      render={renderElement}
    />
  );
}

export default memo(PassengerFormSelectionInput);
