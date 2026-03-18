import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@heroui/react";
import { memo } from "react";

type InputFieldProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: any;
  name: string;
  type: string;
  placeholder?: string;
  label?: string;
  description?: string;
  labelClassName?: string;
  inputClassName?: string;
  descriptionClassName?: string;
  formItemClassName?: string;
  messageClassName?: string;
  isRequired?: boolean;
};

const InputField = ({
  control,
  label,
  placeholder,
  description,
  name,
  type,
  labelClassName,
  inputClassName,
  descriptionClassName,
  formItemClassName,
  messageClassName,
  isRequired,
}: InputFieldProps) => {
  return (
    <FormField
      name={name}
      defaultValue={""}
      control={control}
      // eslint-disable-next-line @arthurgeron/react-usememo/require-usememo
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
            {type === "textarea" ? (
              <Textarea
                id={field.name}
                className={inputClassName}
                placeholder={placeholder}
                {...field}
              />
            ) : (
              <Input
                id={field.name}
                className={inputClassName}
                placeholder={placeholder}
                type={type}
                {...field}
              />
            )}
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
  );
};

export default memo(InputField);
