"use client";

import { Select, SelectItem } from "@heroui/react";
import { ForwardedRef, forwardRef } from "react";
import {
  Controller,
  ControllerProps,
  FieldPath,
  FieldValues,
} from "react-hook-form";

type SelectInputProps<T extends object> = {
  label: string;
  type?: string;
  autoFocus?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  error?: string;
  testId?: string;
  /**
   * Key of option object
   */
  keyValue: keyof T;
  options: T[];
  /**
   * Set the value to be rendered on the UI
   *
   * Eg: `(option) => option.value`
   * @param option the option object
   * @returns option value to display on the UI
   */
  renderOption: (option: T) => React.ReactNode;
};

function SelectInputRaw<T extends object>(
  props: SelectInputProps<T> & {
    name: string;
    value: T | undefined | null;
    onChange: (value: T) => void;
    onBlur: () => void;
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ref?: ForwardedRef<HTMLDivElement | null>
) {
  return (
    <>
      <Select
        label={props.label}
        fullWidth
        isInvalid={!!props.error}
        errorMessage={props.error}
        isDisabled={props.disabled}
        id={`select-${props.name}`}
        variant="bordered"
        // eslint-disable-next-line @arthurgeron/react-usememo/require-usememo
        onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
          const newValue = props.options.find(
            (option) =>
              (option[props.keyValue]?.toString() ?? "") === event.target.value
          );
          if (!newValue) return;

          props.onChange(newValue);
        }}
        onBlur={props.onBlur}
        // eslint-disable-next-line @arthurgeron/react-usememo/require-usememo
        renderValue={() => {
          return props.value ? props.renderOption(props.value) : undefined;
        }}
      >
        {props.options.map((option) => (
          <SelectItem
            key={option[props.keyValue]?.toString() ?? ""}
            // value={option[props.keyValue]?.toString() ?? ""}
            textValue={option[props.keyValue]?.toString() ?? ""}
          >
            {props.renderOption(option)}
          </SelectItem>
        ))}
      </Select>
    </>
  );
}

const SelectInput = forwardRef(SelectInputRaw) as never as <T extends object>(
  props: SelectInputProps<T> & {
    name: string;
    value: T | undefined | null;
    onChange: (value: T) => void;
    onBlur: () => void;
  } & { ref?: ForwardedRef<HTMLDivElement | null> }
) => ReturnType<typeof SelectInputRaw>;

function FormSelectInput<
  T extends object,
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  props: SelectInputProps<T> &
    Pick<ControllerProps<TFieldValues, TName>, "name" | "defaultValue">
) {
  return (
    <Controller
      name={props.name}
      defaultValue={props.defaultValue}
      // eslint-disable-next-line @arthurgeron/react-usememo/require-usememo
      render={({ field, fieldState }) => (
        <SelectInput<T>
          {...field}
          error={fieldState.error?.message}
          {...props}
        />
      )}
    />
  );
}

// Do not use React.memo for Components with generic types
export default FormSelectInput;
