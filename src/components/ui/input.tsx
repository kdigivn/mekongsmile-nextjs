import * as React from "react";

import { cn } from "@/lib/utils";
import { cva, VariantProps } from "class-variance-authority";

export const inputVariants = cva(
  "flex items-center h-9 w-full px-3 py-2 text-sm bg-transparent file:border-0 file:text-sm file:font-medium",

  {
    variants: {
      rounded: {
        none: "rounded-none",
        md: "rounded-md",
      },
      variant: {
        outline:
          "border border-input transition-colors file:border-0 file:bg-transparent file:font-medium placeholder:text-muted-foreground focus-within:outline-none focus-within:ring-1 focus-within:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        filled: "",
        underlined:
          "rounded-none border-b-border focus-within:border-b-primary focus-within:shadow-[0_1px_0px_0px_hsl(var(--primary))]",
        unstyled: "",
      },
    },
    defaultVariants: {
      rounded: "md",
      variant: "outline",
    },
  }
);

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  startContent?: React.ReactNode;
  endContent?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { className, type, variant, rounded, startContent, endContent, ...props },
    ref
  ) => {
    if (startContent || endContent) {
      return (
        <div
          className={cn(
            inputVariants({ variant, rounded, className }),
            className
          )}
        >
          {startContent && (
            <div className="flex items-center text-muted-foreground">
              {startContent}
            </div>
          )}
          <input
            type={type}
            ref={ref}
            {...props}
            className={cn(
              "flex h-9 w-full bg-transparent px-3 py-1 focus-visible:outline-none focus-visible:ring-0",
              {
                "pl-1.5": !!startContent,
                "pl-0 pr-1.5": !!endContent,
              }
            )}
          />
          {endContent && (
            <div className="flex items-center text-muted-foreground">
              {endContent}
            </div>
          )}
        </div>
      );
    }
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 shadow-sm transition-colors file:border-0 file:bg-transparent file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
