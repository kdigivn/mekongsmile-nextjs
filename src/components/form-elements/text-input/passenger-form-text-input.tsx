"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn, removeAccents } from "@/lib/utils";
import {
  ForwardedRef,
  forwardRef,
  memo,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ControllerProps,
  ControllerRenderProps,
  FieldPath,
  FieldValues,
} from "react-hook-form";

type TextInputProps = {
  label: string;
  placeholder?: string;
  classNames?: {
    base?: string;
    label?: string;
    input?: string;
  };
  isRequired?: boolean;
  defaultValue?: string | number | readonly string[] | null;
  readonly?: boolean;
  disabled?: boolean;
  isUppercase?: boolean;
  isRemoveAccents?: boolean;
  type?: string; // Explicitly include the type prop
  name: string;
  endContent?: ReactNode;
};

const FormTextInput = memo(
  forwardRef<
    HTMLInputElement | null,
    TextInputProps & {
      onChange: (value: string | number | readonly string[]) => void;
      onBlur: () => void;
    }
  >(function FormTextInputRaw(
    {
      label,
      classNames,
      defaultValue,
      isRequired,
      placeholder,
      readonly,
      disabled,
      isUppercase,
      isRemoveAccents,
      onBlur,
      onChange,
      type = "text", // Set a default value of "text"
      name,
      endContent,
    }: TextInputProps & {
      onChange: (value: string | number | readonly string[]) => void;
      onBlur: () => void;
    },
    ref?: ForwardedRef<HTMLInputElement | null>
  ) {
    const [value, setValue] = useState<string | number | readonly string[]>("");

    useEffect(() => {
      if (defaultValue !== undefined && defaultValue !== value) {
        setValue(defaultValue ?? "");
        onChange(defaultValue ?? "");
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [defaultValue]);

    const onChangeHandler = useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        let newValue = event.target.value;
        if (isUppercase) {
          newValue = newValue.toUpperCase();
        }
        if (isRemoveAccents) {
          newValue = removeAccents(newValue);
        }
        onChange(newValue);
        setValue(newValue);
      },
      [isRemoveAccents, isUppercase, onChange]
    );

    const classNamesInput = useMemo(
      () => cn(classNames?.input, "text-base"),
      [classNames?.input]
    );

    return (
      <FormItem className={`${classNames?.base} relative`}>
        <FormLabel
          isRequired={isRequired}
          className={cn(
            `pointer-events-none absolute left-0 top-0 z-[1] !-translate-y-[0.275rem] translate-x-3.5 bg-white px-0.5 !text-[9px] font-medium !leading-[9px] text-muted-foreground`,
            classNames?.label
          )}
        >
          {label}
        </FormLabel>
        <FormControl>
          <Input
            ref={ref}
            name={name}
            placeholder={placeholder}
            className={classNamesInput}
            value={value}
            onChange={onChangeHandler}
            onBlur={onBlur}
            readOnly={readonly}
            disabled={disabled}
            type={type} // Use the type prop here
            endContent={endContent}
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    );
  })
);

function PassengerFormTextInput<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  props: Pick<
    ControllerProps<TFieldValues, TName>,
    "name" | "defaultValue" | "control"
  > &
    TextInputProps
) {
  const renderElement = useCallback(
    ({
      field: { onBlur, onChange, ref },
    }: {
      field: ControllerRenderProps<TFieldValues, TName>;
    }) => {
      return (
        <FormTextInput
          label={props.label}
          name={props.name}
          classNames={props.classNames}
          isRequired={props.isRequired}
          placeholder={props.placeholder}
          defaultValue={props.defaultValue}
          onBlur={onBlur}
          onChange={onChange}
          readonly={props.readonly}
          disabled={props.disabled}
          isRemoveAccents={props.isRemoveAccents}
          isUppercase={props.isUppercase}
          type={props.type} // Pass the type prop here
          endContent={props.endContent}
          ref={ref}
        />
      );
    },
    [
      props.label,
      props.name,
      props.classNames,
      props.isRequired,
      props.placeholder,
      props.defaultValue,
      props.readonly,
      props.disabled,
      props.isRemoveAccents,
      props.isUppercase,
      props.type,
      props.endContent,
    ]
  );

  return (
    <FormField
      name={props.name}
      defaultValue={props.defaultValue}
      control={props.control}
      render={renderElement}
    />
  );
}

export default memo(PassengerFormTextInput);
