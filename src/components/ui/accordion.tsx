"use client";

import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
// import { ChevronDownIcon } from "@radix-ui/react-icons";
import { FaAngleDown } from "react-icons/fa6";

import { cn } from "@/lib/utils";
import { ReactNode } from "react";

const Accordion = AccordionPrimitive.Root;

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn("border-b", className)}
    {...props}
  />
));
AccordionItem.displayName = "AccordionItem";

interface AccordionTriggerProps
  extends React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger> {
  isHeader?: boolean;
  /**
   * classname for wrapper trigger icon
   */
  iconWrapperClass?: string;
  /**
   * classname for trigger icon
   */
  iconClass?: string;
  /**
   * Custom Trigger Icon Component
   */
  triggerIcon?: ReactNode;
}

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  AccordionTriggerProps
>(
  (
    {
      className,
      children,
      isHeader = false,
      iconWrapperClass,
      iconClass,
      triggerIcon,
      ...props
    },
    ref
  ) =>
    isHeader ? (
      <AccordionPrimitive.Header className="flex">
        <AccordionPrimitive.Trigger
          ref={ref}
          className={cn(
            "flex flex-1 items-center justify-between py-4 text-sm font-medium transition-all hover:underline [&[data-state=open]>div>svg]:rotate-180",
            className
          )}
          {...props}
        >
          {children}
          <div className={iconWrapperClass}>
            {triggerIcon ?? (
              <FaAngleDown
                className={`h-4 w-4 shrink-0 text-black transition-transform duration-200 ${iconClass}`}
              />
            )}
          </div>
        </AccordionPrimitive.Trigger>
      </AccordionPrimitive.Header>
    ) : (
      <AccordionPrimitive.Trigger
        ref={ref}
        className={cn(
          "flex flex-1 items-center justify-between py-4 text-sm font-medium transition-all hover:underline [&[data-state=open]>div>svg]:rotate-180",
          className
        )}
        {...props}
      >
        {children}
        <div className={iconWrapperClass}>
          {triggerIcon ?? (
            <FaAngleDown
              className={`h-4 w-4 shrink-0 text-black transition-transform duration-200 ${iconClass}`}
            />
          )}
        </div>
      </AccordionPrimitive.Trigger>
    )
);
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}
  >
    <div className={cn("pb-4 pt-0", className)}>{children}</div>
  </AccordionPrimitive.Content>
));
AccordionContent.displayName = AccordionPrimitive.Content.displayName;

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
