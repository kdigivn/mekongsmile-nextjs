"use client";

import { Checkbox, CheckboxGroup } from "@heroui/react";
import { ForwardedRef, forwardRef } from "react";
import {
  Controller,
  ControllerProps,
  FieldPath,
  FieldValues,
} from "react-hook-form";

type CheckboxInputProps<T> = {
  label?: string;
  type?: string;
  autoFocus?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  error?: string;
  testId?: string;
  className?: string;
  size?: "sm" | "md" | "lg" | undefined;
  /**
   * Key of option object
   */
  keyValue: keyof T;
  options: T[];
  /**
   * Used to set key for the loop
   *
   * Eg: `(option) => option.id`
   * @param option the option object
   * @returns value that is used as key
   */
  keyExtractor: (option: T) => string;
  /**
   * Set the value to be rendered on the UI
   *
   * Eg: `(option) => option.value`
   * @param option the option object
   * @returns option value to display on the UI
   */
  renderOption: (option: T) => React.ReactNode;
};

function CheckboxInputRaw<T>(
  props: CheckboxInputProps<T> & {
    name: string;
    value: T[] | undefined | null;
    onChange: (value: string[]) => void;
    onBlur: () => void;
  },
  ref?: ForwardedRef<HTMLDivElement | null>
) {
  return (
    <>
      <CheckboxGroup
        ref={ref}
        label={props.label}
        isInvalid={!!props.error}
        errorMessage={props.error}
        // eslint-disable-next-line @arthurgeron/react-usememo/require-usememo
        onValueChange={(values) => props.onChange(values)}
      >
        {props.options.map((option) => (
          <Checkbox
            key={props.keyExtractor(option)}
            name={props.name}
            value={props.keyExtractor(option)}
            className={props.className}
            size={props.size}
          >
            {props.renderOption(option)}
          </Checkbox>
        ))}
      </CheckboxGroup>
    </>
  );
}

const CheckboxInput = forwardRef(CheckboxInputRaw) as never as <T>(
  props: CheckboxInputProps<T> & {
    name: string;
    value: T[] | undefined | null;
    onChange: (values: string[]) => void;
    onBlur: () => void;
  } & { ref?: ForwardedRef<HTMLDivElement | null> }
) => ReturnType<typeof CheckboxInputRaw>;

function FormCheckboxInput<
  T,
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  props: CheckboxInputProps<T> &
    Pick<ControllerProps<TFieldValues, TName>, "name" | "defaultValue">
) {
  return (
    <Controller
      name={props.name}
      defaultValue={props.defaultValue}
      // eslint-disable-next-line @arthurgeron/react-usememo/require-usememo
      render={({ field, fieldState }) => (
        <CheckboxInput<T>
          {...field}
          error={fieldState.error?.message}
          {...props}
        />
      )}
    />
  );
}

export default FormCheckboxInput;
