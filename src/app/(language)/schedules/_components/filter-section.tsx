/* eslint-disable @typescript-eslint/no-explicit-any */
import type React from "react";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { cn, formatCurrency } from "@/lib/utils";
import type { Operator } from "@/services/apis/operators/types/operator";
import { FaSortNumericDown, FaSortNumericUpAlt } from "react-icons/fa";
import { useCheckMobile } from "@/hooks/use-check-screen-type";
import { useMobileBottomNavActions } from "@/components/footer/footer-mobile-contact-buttons/use-mobile-bottom-nav-actions";
import { MdOutlineFilterAlt } from "react-icons/md";
import { VoyageItem } from "@/services/apis/voyages/types/voyage";
import { useTranslation } from "react-i18next";

type Props = {
  operatorSelected: Operator[];
  departVoyagesState: VoyageItem[];
  destiVoyagesState: VoyageItem[];
  activeTab: string;
  isFiltering: boolean;
  setOperatorSelected: (value: Operator[]) => void;
  ticketPriceRange: { minPrice: number; maxPrice: number };
  ticketPriceSelected: { minPrice: number; maxPrice: number };
  setTicketPriceSelected: (value: {
    minPrice: number;
    maxPrice: number;
  }) => void;
  sortState: string;
  setSortState: (value: string) => void;
};

function FilterSection({
  activeTab,
  isFiltering,
  departVoyagesState,
  destiVoyagesState,
  operatorSelected,
  setOperatorSelected,
  ticketPriceRange,
  ticketPriceSelected,
  setTicketPriceSelected,
  sortState,
  setSortState,
}: Props) {
  const isMobile = useCheckMobile();
  const { t: filterTranslation } = useTranslation("search/filter-and-sort");
  const defaultAccordionValue = useMemo(
    () => ["operator", "price", "depart-time"],
    []
  );

  const [filterModelState, setFilterModelState] = useState(false);
  const { hideNav, showNav } = useMobileBottomNavActions();

  useEffect(() => {
    if (filterModelState) {
      hideNav();
    } else {
      showNav();
    }
  }, [filterModelState, hideNav, showNav]);

  const operators = useMemo(() => {
    const operatorMap = new Map<string, Operator>();
    departVoyagesState.forEach((voyage) => {
      // Check if the operator of the current voyage is not already in the map
      if (!operatorMap.has(voyage.voyage.operator_id)) {
        // If not, add the operator to the map
        if (voyage.voyage.operator) {
          operatorMap.set(voyage.voyage.operator_id, voyage.voyage.operator);
        }
      }
    });
    destiVoyagesState.forEach((voyage) => {
      // Check if the operator of the current voyage is not already in the map
      if (!operatorMap.has(voyage.voyage.operator_id)) {
        // If not, add the operator to the map
        if (voyage.voyage.operator) {
          operatorMap.set(voyage.voyage.operator_id, voyage.voyage.operator);
        }
      }
    });
    return Array.from(operatorMap.values()).sort((a, b) =>
      a.operator_name.localeCompare(b.operator_name)
    );
  }, [departVoyagesState, destiVoyagesState]);

  const OperatorFilter = useMemo(() => {
    return (
      <AccordionItem value="operator">
        <AccordionTrigger className="gap-1 hover:no-underline">
          {filterTranslation("operator")}
        </AccordionTrigger>
        <AccordionContent>
          {operators.map((operator) => (
            <OperatorCheckbox
              key={operator.id}
              operator={operator}
              operatorSelected={operatorSelected}
              setOperatorSelected={setOperatorSelected}
            />
          ))}
        </AccordionContent>
      </AccordionItem>
    );
  }, [filterTranslation, operatorSelected, operators, setOperatorSelected]);

  const defaultMinPrice = useMemo(
    () => [ticketPriceSelected.minPrice, ticketPriceSelected.maxPrice],
    [ticketPriceSelected.maxPrice, ticketPriceSelected.minPrice]
  );

  const onFilterPriceChange = useCallback(
    (value: [number, number]) => {
      setTicketPriceSelected({
        minPrice: value[0],
        maxPrice: value[1],
      });
    },
    [setTicketPriceSelected]
  );

  const resetFilter = useCallback(() => {
    setTicketPriceSelected({
      minPrice: ticketPriceRange.minPrice,
      maxPrice: ticketPriceRange.maxPrice,
    });
    setOperatorSelected([]);
    setSortState("0");
  }, [
    setOperatorSelected,
    setSortState,
    setTicketPriceSelected,
    ticketPriceRange.maxPrice,
    ticketPriceRange.minPrice,
  ]);

  /**
   * Debounce time for function
   * @param func function debounce, return function or callback return void function
   * @param delay time to delay in miliseconds
   * @returns new function with debounce time
   */
  function debounce<T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): (...args: Parameters<T>) => ReturnType<T> | void {
    let timer: ReturnType<typeof setTimeout>;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return function (this: any, ...args: Parameters<T>): ReturnType<T> | void {
      clearTimeout(timer);
      timer = setTimeout(() => {
        func.apply(this, args);
      }, delay);

      if (typeof func.apply(this, args) === "undefined") {
        return;
      } else {
        return func.apply(this, args) as ReturnType<T>;
      }
    };
  }

  const debounceResetFilter = debounce(resetFilter, 500);

  /**
   * Function used for filter voyages, return a new list voyages
   */
  const filterVoyages = useCallback(
    (voyages: VoyageItem[]) => {
      if (operatorSelected.length > 0) {
        const operator_ids = operatorSelected.map((operator) => operator.id);
        voyages = voyages.filter(
          (voyage) =>
            voyage.voyage.operator &&
            operator_ids.includes(voyage.voyage.operator.id)
        );
      }

      voyages = voyages.filter(
        (voyage) =>
          voyage.voyage.ticket_prices.default_ticket_price >=
            ticketPriceSelected.minPrice &&
          voyage.voyage.ticket_prices.default_ticket_price <=
            ticketPriceSelected.maxPrice
      );
      return voyages;
    },
    [
      operatorSelected,
      ticketPriceSelected.maxPrice,
      ticketPriceSelected.minPrice,
    ]
  );

  const debounceFilterVoyages = useCallback(
    (voyages: VoyageItem[]) => {
      const debounceFilterVoyages = debounce(filterVoyages, 500);
      return debounceFilterVoyages(voyages);
    },
    [filterVoyages]
  );

  const priceFilter = useMemo(() => {
    return (
      <AccordionItem value="price">
        <AccordionTrigger className="gap-1 hover:no-underline">
          {filterTranslation("price")}
        </AccordionTrigger>
        <AccordionContent className="flex flex-col gap-2">
          <div className="flex w-full flex-row items-center justify-between">
            <div>{`${formatCurrency(ticketPriceSelected.minPrice)}`}</div>
            <div>{`${formatCurrency(ticketPriceSelected.maxPrice)}`}</div>
          </div>
          <Slider
            className="cursor-pointer"
            min={ticketPriceRange.minPrice}
            defaultValue={defaultMinPrice}
            value={defaultMinPrice}
            max={ticketPriceRange.maxPrice}
            step={1000}
            onValueChange={onFilterPriceChange}
          />
        </AccordionContent>
      </AccordionItem>
    );
  }, [
    defaultMinPrice,
    filterTranslation,
    onFilterPriceChange,
    ticketPriceRange.maxPrice,
    ticketPriceRange.minPrice,
    ticketPriceSelected.maxPrice,
    ticketPriceSelected.minPrice,
  ]);

  const onTimeSortNumericDown = useCallback(() => {
    setSortState("1");
  }, [setSortState]);

  const onTimeSortNumericUpAlt = useCallback(() => {
    setSortState("0");
  }, [setSortState]);

  const timeFilter = useMemo(() => {
    return (
      <AccordionItem value="depart-time">
        <AccordionTrigger className="gap-1 hover:no-underline">
          {filterTranslation("departureTime")}
        </AccordionTrigger>
        <AccordionContent className="flex flex-row items-center gap-2 lg:justify-between">
          <Button
            className={cn(
              `flex w-28 gap-1`,
              sortState === "1" &&
                "bg-primary-100 text-black hover:bg-primary-300"
            )}
            variant={"default"}
            onClick={onTimeSortNumericUpAlt}
          >
            <FaSortNumericDown className="h-4 w-4 flex-none" />
            {filterTranslation("departureButton.early")}
          </Button>
          <Button
            className={cn(
              `flex w-28 gap-1`,
              sortState === "0" &&
                "bg-primary-100 text-black hover:bg-primary-300"
            )}
            variant={"default"}
            onClick={onTimeSortNumericDown}
          >
            <FaSortNumericUpAlt className="h-4 w-4 flex-none" />
            {filterTranslation("departureButton.last")}
          </Button>
        </AccordionContent>
      </AccordionItem>
    );
  }, [
    filterTranslation,
    onTimeSortNumericDown,
    onTimeSortNumericUpAlt,
    sortState,
  ]);

  const resultText = useMemo(() => {
    let text = `${filterTranslation("view")} `;
    if (activeTab === "0") {
      const filter = debounceFilterVoyages(departVoyagesState);
      if (filter && filter.length !== 0) {
        if (filter.length < 2 && filterTranslation("result") === "results") {
          text += `${filter.length} kết quả`;
        } else {
          text += `${filter.length} ${filterTranslation("result")}`;
        }
      } else {
        return filterTranslation("filterResultEmpty");
      }
    } else {
      const filter = debounceFilterVoyages(destiVoyagesState);
      if (filter && filter.length !== 0) {
        if (filter.length < 2 && filterTranslation("result") === "results") {
          text += `${filter.length} kết quả`;
        } else {
          text += `${filter.length} ${filterTranslation("result")}`;
        }
      } else {
        return filterTranslation("filterResultEmpty");
      }
    }
    return text;
  }, [
    activeTab,
    debounceFilterVoyages,
    departVoyagesState,
    destiVoyagesState,
    filterTranslation,
  ]);

  const onClickDebounceResetFilter = useCallback(() => {
    debounceResetFilter();
  }, [debounceResetFilter]);

  const onCloseModelFilter = useCallback(() => {
    setFilterModelState(false);
  }, []);

  return isMobile ? (
    <Sheet open={filterModelState} onOpenChange={setFilterModelState}>
      <SheetTrigger asChild>
        <Button
          className={cn(
            "fixed bottom-56 right-4 z-20 mx-auto flex h-9 w-9 flex-row items-center justify-center gap-1 rounded-lg bg-primary-100 p-2 lg:hidden"
          )}
        >
          <MdOutlineFilterAlt className="h-6 w-6 text-primary-800" />
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="rounded-md p-3 pb-14">
        <SheetHeader className="flex flex-row items-center justify-start gap-2">
          <SheetTitle className="">
            <div className="text-base font-semibold">
              {filterTranslation("title")}
            </div>
          </SheetTitle>
          <Button
            variant={"default"}
            className={cn(
              `!mt-0 h-4 bg-primary-100 p-3 text-primary hover:bg-primary-200`,
              !isFiltering && "hidden"
            )}
            onClick={onClickDebounceResetFilter}
          >
            {filterTranslation("reset")}
          </Button>
        </SheetHeader>
        <Accordion type="multiple" defaultValue={defaultAccordionValue}>
          {operators.length > 1 && OperatorFilter}
          {ticketPriceRange.minPrice !== ticketPriceRange.maxPrice &&
            priceFilter}
          {timeFilter}
        </Accordion>

        <div className="absolute bottom-2 left-0 flex w-full items-center justify-center bg-white p-3">
          <Button
            className="w-full gap-1 text-center"
            onClick={onCloseModelFilter}
          >
            {isFiltering ? resultText : filterTranslation("action")}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  ) : (
    <div className="hidden rounded-md border bg-background p-4 shadow-sm lg:block">
      <h2 className="pb-4 pt-0 text-base font-semibold">
        {filterTranslation("title")}
      </h2>
      <hr />
      <Accordion type="multiple" defaultValue={defaultAccordionValue}>
        {operators.length > 1 && OperatorFilter}
        {ticketPriceRange.minPrice !== ticketPriceRange.maxPrice && priceFilter}
        {timeFilter}
      </Accordion>
    </div>
  );
}

export default memo(FilterSection);

const OperatorCheckbox = ({
  operator,
  operatorSelected,
  setOperatorSelected,
}: {
  operator: Operator;
  operatorSelected: Operator[];
  setOperatorSelected: (value: Operator[]) => void;
}) => {
  const onCheckedChange = useCallback(
    (checked: boolean) => {
      if (checked) {
        setOperatorSelected([...operatorSelected, operator]);
      } else {
        setOperatorSelected(
          operatorSelected.filter((item) => item.id !== operator.id)
        );
      }
    },
    [operator, operatorSelected, setOperatorSelected]
  );
  return (
    <div className="items-top flex gap-2 space-x-2 p-2" key={operator.id}>
      <Checkbox
        name="operator"
        value={operator.id}
        checked={operatorSelected.includes(operator)}
        id={operator.id}
        onCheckedChange={onCheckedChange}
      />
      <div className="leading-none">
        <label
          htmlFor={operator.id}
          className="cursor-pointer text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          {operator.operator_name}
        </label>
      </div>
    </div>
  );
};
