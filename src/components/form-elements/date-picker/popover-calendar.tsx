"use client";

/* eslint-disable @arthurgeron/react-usememo/require-usememo */
import Calendar from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "@radix-ui/react-icons";
import { vi } from "date-fns/locale/vi";
import { memo, useEffect, useState } from "react";

type Props = {
  inputValue: string; // input value
  onSelect: (date: Date | undefined) => void; // on select date
};

/**
 * Popover calendar component
 * @param inputValue - input value
 * @param onSelect - on select date
 * @returns
 */
const CalendarPopover = ({ inputValue, onSelect }: Props) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    if (inputValue !== "dd/mm/yyyy" && inputValue !== "Invalid Date") {
      const dateSplit = inputValue.split("/");
      setSelectedDate(
        new Date(`${dateSplit[1]}/${dateSplit[0]}/${dateSplit[2]}`)
      );
    }
  }, [inputValue]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <CalendarIcon />
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={onSelect}
          autoFocus
          defaultMonth={selectedDate}
          onDayClick={(date) => {
            setSelectedDate(date);
            onSelect(date);
          }}
          disabled={(date) =>
            date > new Date() || date < new Date("1900-01-01")
          }
          locale={vi}
        />
      </PopoverContent>
    </Popover>
  );
};

export default memo(CalendarPopover);
