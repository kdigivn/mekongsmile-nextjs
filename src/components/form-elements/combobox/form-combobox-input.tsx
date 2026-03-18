"use client";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";
import { ForwardedRef, forwardRef, useCallback } from "react";
import {
  ControllerProps,
  ControllerRenderProps,
  FieldPath,
  FieldValues,
} from "react-hook-form";

type ComboboxInputProps<T extends object> = {
  label: string;
  type?: string;
  isRequired?: boolean;
  autoFocus?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  testId?: string;
  /**
   * Name of the property that define `key` in the object T
   *
   * Eg:
   * ```
   * T: {
   * locationId,
   * locationName
   * }
   * ```
   * => keyName = `locationId`
   */
  keyName: keyof T;
  /**
   * Name of the property that define `value` in the object T
   *
   * Eg:
   * ```
   * T: {
   * locationId,
   * locationName
   * }
   * ```
   * => valueName = `locationName`
   */
  valueName: keyof T;
  options: T[];
  text?: {
    searchPlaceholder?: string;
    triggerDefaultLabel?: string;
    noResult?: string;
  };
  classNames?: Partial<
    Record<
      | "base"
      | "label"
      | "trigger"
      | "triggerIcon"
      | "popupWrapper"
      | "searchInput"
      | "listItem",
      string
    >
  >;
};

function ComboboxInputRaw<T extends object>(
  props: ComboboxInputProps<T> & {
    name: string;
    value: T | undefined | null;
    onChange: (value: T) => void;
    onBlur: () => void;
  },
  ref?: ForwardedRef<HTMLDivElement | null>
) {
  const buttonLabel = props.value
    ? (props.options.find(
        (option) => option[props.keyName] === props.value?.[props.keyName]
      )?.[props.valueName] as string)
    : props?.text?.triggerDefaultLabel
      ? props?.text?.triggerDefaultLabel
      : "Press";
  return (
    <FormItem ref={ref} className={cn("flex flex-col", props.classNames?.base)}>
      <FormLabel
        className={cn(props.classNames?.label)}
        isRequired={props.isRequired}
      >
        {props.label}
      </FormLabel>
      <Popover>
        <PopoverTrigger asChild>
          <FormControl>
            <Button
              variant="outline"
              role="combobox"
              className={cn(
                "w-[200px] justify-between",
                !props.value && "text-muted-foreground",
                props.classNames?.trigger
              )}
            >
              <span className="overflow-hidden text-ellipsis whitespace-nowrap">
                {buttonLabel}
              </span>
              <CaretSortIcon
                className={cn(
                  "ml-2 h-4 w-4 shrink-0 opacity-50",
                  props.classNames?.triggerIcon
                )}
              />
            </Button>
          </FormControl>
        </PopoverTrigger>
        <PopoverContent
          className={cn("w-[200px] p-0", props.classNames?.popupWrapper)}
        >
          <Command>
            <CommandInput
              placeholder={
                props?.text?.searchPlaceholder
                  ? props.text.searchPlaceholder
                  : "Search something..."
              }
              className={cn("h-9", props.classNames?.searchInput)}
            />
            <CommandEmpty>
              {props?.text?.noResult ? props?.text?.noResult : "Nothing found"}
            </CommandEmpty>
            <CommandList>
              <CommandGroup>
                {props.options.length &&
                  // eslint-disable-next-line @arthurgeron/react-usememo/require-usememo
                  props.options.map((option) => (
                    <CommandItem
                      value={option[props.valueName] as string}
                      key={option[props.valueName] as string}
                      // eslint-disable-next-line @arthurgeron/react-usememo/require-usememo
                      onSelect={() => {
                        props.onChange(option);
                      }}
                    >
                      {option[props.valueName] as string}
                      <CheckIcon
                        className={cn(
                          "ml-auto h-4 w-4",
                          option?.[props.keyName] ===
                            props.value?.[props.keyName]
                            ? "opacity-100"
                            : "opacity-0",
                          props.classNames?.listItem
                        )}
                      />
                    </CommandItem>
                  ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <FormMessage />
    </FormItem>
  );
}

const ComboboxInput = forwardRef(ComboboxInputRaw) as never as <
  T extends object,
>(
  props: ComboboxInputProps<T> & {
    name: string;
    value: T | undefined | null;
    onChange: (value: T) => void;
    onBlur: () => void;
  } & { ref?: ForwardedRef<HTMLDivElement | null> }
) => ReturnType<typeof ComboboxInputRaw>;

function FormComboboxInput<
  T extends object,
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  props: ComboboxInputProps<T> &
    Pick<
      ControllerProps<TFieldValues, TName>,
      "name" | "defaultValue" | "control"
    >
) {
  const renderElement = useCallback(
    ({ field }: { field: ControllerRenderProps<TFieldValues, TName> }) => {
      return <ComboboxInput<T> {...field} {...props} />;
    },
    [props]
  );
  return (
    <FormField
      name={props.name}
      control={props.control}
      defaultValue={props.defaultValue}
      render={renderElement}
    />
  );
}

// Do not memo this component as its need to use generic type
// Ref: https://stackoverflow.com/questions/73868787/react-generic-props-gets-an-danger-whilst-using-function-in-props
export default FormComboboxInput;
