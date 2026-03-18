"use client";

import * as React from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCheckMobile } from "@/hooks/use-check-screen-type";
import { memo, useContext, useState } from "react";
import { cn } from "@/lib/utils";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

interface TriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
}

interface ContentProps {
  children: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  className?: string;
}

// Internal context to share props
const TooltipResponsiveContext = React.createContext<{
  isMobile: boolean;
  open: boolean;
  setOpen: (open: boolean) => void;
} | null>(null);

// Main wrapper
export const TooltipResponsive = memo(function TooltipResponsive({
  children,
}: {
  children: React.ReactNode;
}) {
  const isMobile = useCheckMobile();
  const [open, setOpen] = useState(false);
  const content = isMobile ? (
    <Popover open={open} onOpenChange={setOpen}>
      {children}
    </Popover>
  ) : (
    <Tooltip delayDuration={0} open={open} onOpenChange={setOpen}>
      {children}
    </Tooltip>
  );

  return (
    <TooltipResponsiveContext.Provider value={{ isMobile, open, setOpen }}>
      {content}
    </TooltipResponsiveContext.Provider>
  );
});

// Trigger component
export const TooltipResponsiveTrigger = memo(function TooltipResponsiveTrigger({
  children,
  asChild = false,
}: TriggerProps) {
  const context = useContext(TooltipResponsiveContext);
  if (!context)
    throw new Error(
      "TooltipResponsiveTrigger must be inside TooltipResponsive"
    );

  const { isMobile } = context;

  if (isMobile) {
    return <PopoverTrigger asChild>{children}</PopoverTrigger>;
  }

  return <TooltipTrigger asChild={asChild}>{children}</TooltipTrigger>;
});

// Content component
export const TooltipResponsiveContent = memo(function TooltipResponsiveContent({
  children,
  side = "top",
  align = "center",
  className,
}: ContentProps) {
  const context = useContext(TooltipResponsiveContext);
  if (!context)
    throw new Error(
      "TooltipResponsiveContent must be inside TooltipResponsive"
    );

  const { isMobile } = context;

  if (isMobile) {
    return (
      <PopoverContent
        side={side}
        align={align}
        className={cn("flex w-auto max-w-xs p-3", className)}
        avoidCollisions
      >
        {children}
      </PopoverContent>
    );
  }

  return (
    <TooltipPrimitive.Portal>
      <TooltipContent
        side={side}
        align={align}
        className={cn("w-auto max-w-xs p-3", className)}
        avoidCollisions
      >
        {children}
      </TooltipContent>
    </TooltipPrimitive.Portal>
  );
});
