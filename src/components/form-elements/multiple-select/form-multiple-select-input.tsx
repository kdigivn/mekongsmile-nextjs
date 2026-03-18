"use client";

import { ForwardedRef, forwardRef } from "react";
import {
  Controller,
  ControllerProps,
  FieldPath,
  FieldValues,
} from "react-hook-form";
import { Select, SelectItem } from "@heroui/react";

type MultipleSelectInputProps<T> = {
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
  /**
   * Set the value to be rendered after selected
   *
   * Eg: `(options) => (<p>{options.map((option) => option.value).join(",")}</p>)`
   * @param options the options array
   * @returns options value to display on the UI
   */
  renderValue: (options: T[]) => React.ReactNode;
};

function MultipleSelectInputRaw<T extends object>(
  props: MultipleSelectInputProps<T> & {
    name: string;
    value: T[] | undefined | null;
    onChange: (value: T[]) => void;
    onBlur: () => void;
  }
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
        selectionMode="multiple"
        // eslint-disable-next-line @arthurgeron/react-usememo/require-usememo
        onChange={(event) => {
          const value = event.target.value;
          const selectedStrings =
            typeof value === "string" ? value.split(",") : value;

          const newValue = selectedStrings
            .map((selectedString) => {
              const option = props.options.find(
                (option) =>
                  option[props.keyValue]?.toString() === selectedString
              );

              if (!option) return undefined;

              return option;
            })
            .filter((option) => option !== undefined) as T[];

          props.onChange(newValue);
        }}
        // eslint-disable-next-line @arthurgeron/react-usememo/require-usememo
        renderValue={() => {
          return props.value ? props.renderValue(props.value) : undefined;
        }}
        onBlur={props.onBlur}
      >
        {props.options.map((option) => (
          <SelectItem
            key={option[props.keyValue]?.toString() ?? ""}
            // value={option[props.keyValue]?.toString() ?? ""}
          >
            {props.renderOption(option)}
          </SelectItem>
        ))}
      </Select>
    </>
  );
}

const MultipleSelectInput = forwardRef(MultipleSelectInputRaw) as never as <T>(
  props: MultipleSelectInputProps<T> & {
    name: string;
    value: T | undefined | null;
    onChange: (value: T) => void;
    onBlur: () => void;
  } & { ref?: ForwardedRef<HTMLDivElement | null> }
) => ReturnType<typeof MultipleSelectInputRaw>;

function FormMultipleSelectInput<
  T,
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  props: MultipleSelectInputProps<T> &
    Pick<ControllerProps<TFieldValues, TName>, "name" | "defaultValue">
) {
  return (
    <Controller
      name={props.name}
      defaultValue={props.defaultValue}
      // eslint-disable-next-line @arthurgeron/react-usememo/require-usememo
      render={({ field, fieldState }) => (
        <MultipleSelectInput<T>
          {...field}
          error={fieldState.error?.message}
          {...props}
        />
      )}
    />
  );
}

export default FormMultipleSelectInput;
