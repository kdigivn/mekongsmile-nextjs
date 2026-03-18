"use client";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input, InputProps } from "@/components/ui/input";
import { cn, removeAccents } from "@/lib/utils";
import { TicketAgeCustomConfig } from "@/services/apis/tickets/types/ticket-type-config";
import { FormPassengerTicket } from "@/services/form/types/form-types";
import {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  FieldValues,
  UseFormGetValues,
  UseFormSetError,
  UseFormSetValue,
  UseFormClearErrors,
  useController,
  useFormContext,
} from "react-hook-form";

const debounceTime = 500;

type TextInputProps = Omit<
  InputProps,
  "onChange" | "onBlur" | "defaultValue" | "value"
> & {
  name: string;
  isRequired?: boolean;
  placeholder?: string;
  classNames?: {
    base?: string;
    label?: string;
    input?: string;
  };
  label?: string;
  readonly?: boolean;
  disabled?: boolean;
  isUppercase?: boolean;
  isRemoveAccents?: boolean;
  startContent?: React.ReactNode;
  endContent?: React.ReactNode;
  /**
   * Seat position ID
   */
  positionId: number;
  defaultValue: string | number | readonly string[];
  ticketAgeConfig: TicketAgeCustomConfig[];
};

type FormPassengerTextInputProps = TextInputProps & {
  setValue: UseFormSetValue<FieldValues>;
  getValues: UseFormGetValues<FieldValues>;
  setError: UseFormSetError<FieldValues>;
  clearErrors: UseFormClearErrors<FieldValues>;
};

const FormTextInput = memo(
  forwardRef<HTMLInputElement | null, FormPassengerTextInputProps>(
    function FormTextInputRaw({
      name,
      positionId,
      defaultValue,
      getValues,
      setValue: rhfSetValue,
      setError,
      clearErrors,
      classNames,
      isRequired,
      label,
      placeholder,
      readonly,
      disabled,
      isUppercase,
      isRemoveAccents,
      startContent,
      endContent,
      ticketAgeConfig,
    }: FormPassengerTextInputProps) {
      const [value, setValue] = useState<string | number | readonly string[]>(
        defaultValue ?? ""
      );
      const [isDuplicate, setIsDuplicate] = useState(false);

      const formData: FormPassengerTicket[] = getValues("passengers");
      const fieldIndex =
        formData.findIndex((field) => field.positionId === positionId) ?? 0;
      const fieldName = `passengers.${fieldIndex}.${name}`;

      // eslint-disable-next-line no-restricted-syntax
      const { field } = useController(
        useMemo(() => ({ name: fieldName }), [fieldName])
      );

      useEffect(() => {
        if (defaultValue || defaultValue === "") {
          setValue(defaultValue);
          rhfSetValue(fieldName, defaultValue);
        }
      }, [defaultValue, fieldName, rhfSetValue]);

      const onChangeTimeOutRef = useRef<NodeJS.Timeout | undefined>(undefined);

      const checkForDuplicates = useCallback(
        (currentValue: string) => {
          if (name !== "socialId" || !currentValue || currentValue === "TE") {
            setIsDuplicate(false);
            clearErrors(fieldName);
            return;
          }

          // Get the children ticket type ID
          const checkChildrenAgeId = ticketAgeConfig.find(
            (config) => config.label === "children"
          )?.type_id;

          // Get current passenger's ticket type
          const currentPassenger = formData.find(
            (passenger) => passenger.positionId === positionId
          );

          // Skip check if current passenger is a child
          if (
            currentPassenger?.ticketPrice?.ticket_type_id === checkChildrenAgeId
          ) {
            setIsDuplicate(false);
            clearErrors(fieldName);
            return;
          }

          // Filter out children passengers and the current passenger when checking duplicates
          const otherSocialIds = formData
            .filter(
              (field) =>
                field.positionId !== positionId &&
                field.ticketPrice?.ticket_type_id !== checkChildrenAgeId // Skip children passengers
            )
            .map((field) => field.socialId?.toLowerCase())
            .filter((id) => id && id !== "TE");

          const isDup = otherSocialIds.includes(currentValue.toLowerCase());
          setIsDuplicate(isDup);

          if (isDup) {
            setError(fieldName, {
              type: "manual",
              message: "CCCD/Hộ chiếu đã tồn tại trong danh sách hành khách.",
            });
          } else {
            clearErrors(fieldName);
          }
        },
        [
          name,
          ticketAgeConfig,
          formData,
          clearErrors,
          fieldName,
          positionId,
          setError,
        ]
      );

      const onChangeHandler = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
          // Clear previous timeout
          if (onChangeTimeOutRef.current)
            clearTimeout(onChangeTimeOutRef.current);

          let inputValue = event.target.value;
          if (isUppercase) {
            inputValue = inputValue.toUpperCase();
          }
          if (isRemoveAccents) {
            inputValue = removeAccents(inputValue);
          }

          // Update local state
          setValue(inputValue);

          // Create new timeout for form update
          onChangeTimeOutRef.current = setTimeout(() => {
            rhfSetValue(fieldName, inputValue, {
              shouldValidate: true,
              shouldDirty: true,
              shouldTouch: true,
            });
            // Check for duplicates after updating the value
            checkForDuplicates(inputValue);
          }, debounceTime);
        },
        [
          fieldName,
          isRemoveAccents,
          isUppercase,
          rhfSetValue,
          checkForDuplicates,
        ]
      );

      const classNamesInput = useMemo(
        () => cn(classNames?.input, "text-base"),
        [classNames?.input]
      );

      const onBlurHandler = useCallback(
        (event: React.FocusEvent<HTMLInputElement>) => {
          const inputValue = event.target.value;
          rhfSetValue(fieldName, inputValue, {
            shouldValidate: true,
            shouldDirty: true,
            shouldTouch: true,
          });
          checkForDuplicates(inputValue);
        },
        [fieldName, rhfSetValue, checkForDuplicates]
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
              ref={field.ref}
              placeholder={placeholder}
              className={cn(classNamesInput, isDuplicate && "border-danger")}
              value={value}
              onChange={onChangeHandler}
              onBlur={onBlurHandler}
              readOnly={readonly}
              disabled={disabled}
              startContent={startContent}
              endContent={endContent}
            />
          </FormControl>
          {isDuplicate && (
            <p className="text-[0.8rem] font-medium text-destructive">
              CCCD/Hộ chiếu đã tồn tại trong danh sách hành khách
            </p>
          )}
          <FormMessage />
        </FormItem>
      );
    }
  )
);

function PassengerFormTextInputV2({
  name,
  defaultValue,
  positionId,
  isRequired,
  isRemoveAccents,
  isUppercase,
  classNames,
  label,
  disabled,
  readonly,
  placeholder,
  startContent,
  endContent,
  ticketAgeConfig,
}: TextInputProps) {
  const { setValue, getValues, setError, clearErrors } = useFormContext();
  const formData: FormPassengerTicket[] = getValues("passengers");
  const fieldIndex =
    formData.findIndex((field) => field.positionId === positionId) ?? 0;
  const fieldName = `passengers.${fieldIndex}.${name}`;

  const renderElement = useCallback(() => {
    return (
      <FormTextInput
        name={name}
        defaultValue={defaultValue as string | number | readonly string[]}
        positionId={positionId}
        getValues={getValues}
        setValue={setValue}
        setError={setError}
        clearErrors={clearErrors}
        isRequired={isRequired}
        isRemoveAccents={isRemoveAccents}
        isUppercase={isUppercase}
        classNames={classNames}
        label={label}
        disabled={disabled}
        readonly={readonly}
        placeholder={placeholder}
        startContent={startContent}
        endContent={endContent}
        ticketAgeConfig={ticketAgeConfig}
      />
    );
  }, [
    name,
    defaultValue,
    positionId,
    getValues,
    setValue,
    setError,
    clearErrors,
    isRequired,
    isRemoveAccents,
    isUppercase,
    classNames,
    label,
    disabled,
    readonly,
    placeholder,
    startContent,
    endContent,
    ticketAgeConfig,
  ]);

  return (
    <FormField
      name={fieldName}
      defaultValue={defaultValue}
      render={renderElement}
    />
  );
}

export default memo(PassengerFormTextInputV2);
