"use client";
import { cn } from "@/lib/utils";
import { Input } from "@heroui/react";
import { EyeClosedIcon, EyeOpenIcon } from "@radix-ui/react-icons";
import {
  ChangeEvent,
  ForwardedRef,
  forwardRef,
  memo,
  useCallback,
  useMemo,
  useState,
} from "react";
import {
  Controller,
  ControllerFieldState,
  ControllerProps,
  ControllerRenderProps,
  FieldPath,
  FieldValues,
} from "react-hook-form";

export type TextInputProps = {
  label: string;
  type?: string;
  autoFocus?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  error?: string;
  testId?: string;
  autoComplete?: string;
  isRequired?: boolean;
  labelPlacement?: "outside" | "outside-left" | "inside";
  placeholder?: string;
  radius?: "sm" | "lg" | "md" | "none" | "full" | undefined;
  classNames?: Partial<
    Record<
      | "base"
      | "label"
      | "inputWrapper"
      | "innerWrapper"
      | "mainWrapper"
      | "input"
      | "clearButton"
      | "helperWrapper"
      | "description"
      | "errorMessage",
      string
    >
  >;
  endContent?: React.ReactNode;
};

const TextInput = memo(
  forwardRef<
    HTMLInputElement | null,
    TextInputProps & {
      name: string;
      value: string;
      onChange: (
        value: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      ) => void;
      onBlur: () => void;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  >(function TextInput(props, ref?: ForwardedRef<HTMLInputElement | null>) {
    const [isShowPassword, setIsShowPassword] = useState(false);

    const handleClickShowPassword = () => setIsShowPassword((show) => !show);

    const handleMouseDownPassword = (
      event: React.MouseEvent<HTMLButtonElement>
    ) => {
      event.preventDefault();
    };

    const type = useMemo(
      () => (props.type === "password" && isShowPassword ? "text" : props.type),
      [isShowPassword, props.type]
    );

    const classNames = useMemo(
      () => ({
        ...props.classNames,
        input: cn(props.classNames?.input, "text-base"),
      }),
      [props.classNames]
    );

    const endContent = useMemo(
      () =>
        props.type === "password" && props.value ? (
          <button
            className="flex h-[20px] w-[20px] items-center justify-center focus:outline-none"
            type="button"
            onClick={handleClickShowPassword}
            onMouseDown={handleMouseDownPassword}
            aria-label={isShowPassword ? "Hide password" : "Show password"}
          >
            {isShowPassword ? (
              <EyeOpenIcon className="pointer-events-none text-2xl text-primary" />
            ) : (
              <EyeClosedIcon className="pointer-events-none text-2xl text-primary" />
            )}
          </button>
        ) : (
          <>{props.endContent}</>
        ),
      [isShowPassword, props.endContent, props.type, props.value]
    );
    return (
      <>
        {props.type !== "hidden" ? (
          <Input
            ref={ref}
            name={props.name}
            value={props.value}
            onChange={props.onChange}
            onBlur={props.onBlur}
            label={props.label}
            autoFocus={props.autoFocus}
            type={type}
            variant="bordered"
            fullWidth
            isInvalid={!!props.error}
            data-testid={props.testId}
            errorMessage={props.error}
            isDisabled={props.disabled}
            autoComplete={props.autoComplete}
            isRequired={props.isRequired}
            labelPlacement={props.labelPlacement}
            placeholder={props.placeholder}
            endContent={endContent}
            classNames={classNames}
            radius={props.radius}
          />
        ) : (
          <input name={props.name} value={props.value} type="hidden" />
        )}
      </>
    );
  })
);

function FormTextInput<
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
      field,
      fieldState,
    }: {
      field: ControllerRenderProps<TFieldValues, TName>;
      fieldState: ControllerFieldState;
    }) => <TextInput {...field} error={fieldState.error?.message} {...props} />,
    [props]
  );

  return (
    <Controller
      name={props.name}
      defaultValue={props.defaultValue}
      control={props.control}
      render={renderElement}
    />
  );
}

export default memo(FormTextInput);
