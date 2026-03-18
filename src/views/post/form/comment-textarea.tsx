import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { memo } from "react";

type CommentTextareaProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
};

const CommentTextarea = ({
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
}: CommentTextareaProps) => {
  return (
    <FormField
      name={name}
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
            <Textarea
              id={field.name}
              className={inputClassName}
              placeholder={placeholder}
              {...field}
            />
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

export default memo(CommentTextarea);
