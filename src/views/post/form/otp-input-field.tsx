/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @arthurgeron/react-usememo/require-usememo */
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { memo, useRef } from "react";

type OTPInputFieldProps = {
  control: any;
  name: string;
  placeholder?: string;
  label?: string;
  description?: string;
  labelClassName?: string;
  inputClassName?: string;
  descriptionClassName?: string;
  formItemClassName?: string;
  messageClassName?: string;
  isRequired?: boolean;
  length?: number;
};

const OTPInputField = ({
  control,
  label,
  placeholder,
  description,
  name,
  labelClassName,
  inputClassName,
  descriptionClassName,
  formItemClassName,
  messageClassName,
  isRequired,
  length = 6,
}: OTPInputFieldProps) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const handlePaste = (event: React.ClipboardEvent, field: any) => {
    event.preventDefault();
    const pastedData = event.clipboardData.getData("text");
    const pastedOTP = pastedData.slice(0, length).replace(/\D/g, "");

    field.onChange(pastedOTP.padEnd(length, ""));

    pastedOTP.split("").forEach((char, index) => {
      if (inputRefs.current[index]) {
        inputRefs.current[index]!.value = char;
      }
    });

    // Focus on the next empty input or the last input
    const nextEmptyIndex =
      pastedOTP.length < length ? pastedOTP.length : length - 1;
    inputRefs.current[nextEmptyIndex]?.focus();

    buttonRef.current?.click();
  };

  return (
    <>
      <FormField
        name={name}
        defaultValue=""
        control={control}
        render={({ field }) => (
          <FormItem className={formItemClassName}>
            {label && (
              <FormLabel
                className={labelClassName}
                htmlFor={field.name}
                isRequired={isRequired}
              >
                {label}
              </FormLabel>
            )}
            <FormControl>
              <div className="flex space-x-2">
                {[...Array(length)].map((_, index) => (
                  <Input
                    key={index}
                    ref={(el) => void (inputRefs.current[index] = el)}
                    id={`${field.name}-${index}`}
                    className={`h-10 w-10 text-center ${inputClassName}`}
                    placeholder={placeholder}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={field.value[index] || ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      const newValue = field.value.split("");
                      newValue[index] = value;
                      field.onChange(newValue.join(""));

                      // Move to next input if value is entered
                      if (value && index < length - 1) {
                        inputRefs.current[index + 1]?.focus();
                      }
                    }}
                    onKeyDown={(e) => {
                      // Move to previous input on backspace if current input is empty
                      if (
                        e.key === "Backspace" &&
                        !field.value[index] &&
                        index > 0
                      ) {
                        inputRefs.current[index - 1]?.focus();
                      }
                    }}
                    onPaste={(e) => handlePaste(e, field)}
                  />
                ))}
              </div>
            </FormControl>
            {description && (
              <FormDescription className={descriptionClassName}>
                {description}
              </FormDescription>
            )}
            <FormMessage className={messageClassName} />
          </FormItem>
        )}
      />
      <button type="submit" className="hidden" ref={buttonRef}>
        Hidden
      </button>
    </>
  );
};

export default memo(OTPInputField);
