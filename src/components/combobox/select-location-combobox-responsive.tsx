import { useCheckMobile } from "@/hooks/use-check-screen-type";
import { Location } from "@/services/apis/locations/types/location";
import {
  ReactNode,
  forwardRef,
  memo,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from "../ui/drawer";
import { Button } from "../ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { CheckIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/services/i18n/client";
import { useMobileBottomNavActions } from "@/components/footer/footer-mobile-contact-buttons/use-mobile-bottom-nav-actions";

type Props = {
  title?: string;
  /**
   * List of location to render
   */
  locations: Location[];
  /**
   * (uncontrolled) Default location
   */
  defaultLocation?: Location;
  /**
   * (controlled) Selected location. Shouldn't use along with `defaultLocation`
   */
  location?: Location;
  selectorIcon?: ReactNode;
  classNames?: {
    triggerButton?: string;
    contentWrapper?: string;
    contentItem?: string;
  };
  /**
   * Trigger when selected location change to new value
   * @param location Selected location
   */
  onSelectionChange?: (location: Location) => void;
  /**
   * Trigger every time a location is selected. Should use with `controlled` props
   * @param location Selected location
   * @returns
   */
  onSelection?: (location: Location | null) => void;
};

const SelectLocationComboboxResponsive = forwardRef<HTMLButtonElement, Props>(
  function SelectLocationComboboxResponsive(
    {
      title,
      locations,
      defaultLocation,
      location,
      selectorIcon,
      classNames,
      onSelection,
      onSelectionChange,
    },
    ref
  ) {
    const { t } = useTranslation("search-ticket-form");
    const [open, setOpen] = useState(false);
    const isMobile = useCheckMobile();
    const [selectedLocation, setSelectedLocation] = useState<Location | null>(
      null
    );

    const { hideNav, showNav } = useMobileBottomNavActions();

    useEffect(() => {
      if (open) {
        hideNav();
      } else {
        showNav();
      }
    }, [hideNav, open, showNav]);

    useEffect(() => {
      if (defaultLocation && !location) {
        setSelectedLocation(defaultLocation);
      }
      if (location && !defaultLocation) {
        setSelectedLocation(location);
      }
    }, [defaultLocation, location]);

    // trigger event every time selected location changed
    useEffect(() => {
      if (onSelectionChange && selectedLocation) {
        onSelectionChange(selectedLocation);
      }
    }, [onSelectionChange, selectedLocation]);

    const locationListContent = useMemo(
      () => (
        <Command>
          <CommandInput placeholder={t("location.filter-placeholder")} />
          <CommandList>
            <CommandEmpty>{t("location.no-result")}</CommandEmpty>
            <CommandGroup heading={title}>
              {
                // eslint-disable-next-line @arthurgeron/react-usememo/require-usememo
                locations.map((location) => (
                  <CommandItem
                    className="hover:cursor-pointer"
                    key={location.id}
                    value={location.location_name}
                    onSelect={(locationName) => {
                      const selectedLocation =
                        locations.find(
                          (location) => location.location_name === locationName
                        ) || null;

                      setSelectedLocation(selectedLocation);

                      if (onSelection) onSelection(selectedLocation);

                      setOpen(false);
                    }}
                  >
                    {location.location_name}
                    <CheckIcon
                      className={cn(
                        "ml-auto h-4 w-4",
                        location === selectedLocation
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))
              }
            </CommandGroup>
          </CommandList>
        </Command>
      ),
      [locations, onSelection, selectedLocation, t, title]
    );

    const triggerButton = useMemo(
      () => (
        <Button
          ref={ref}
          variant={"outline"}
          className={cn(
            "w-[150px] justify-between border-none shadow-none hover:bg-transparent",
            classNames?.triggerButton
          )}
        >
          {selectedLocation ? (
            <div className="line-clamp-1">{selectedLocation.location_name}</div>
          ) : (
            <>{t("location.placeholder")}</>
          )}
          {selectorIcon ? selectorIcon : <></>}
        </Button>
      ),
      [classNames?.triggerButton, ref, selectedLocation, selectorIcon, t]
    );

    if (isMobile) {
      return (
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerTrigger asChild>{triggerButton}</DrawerTrigger>
          <DrawerContent className={cn(classNames?.contentWrapper)}>
            <DrawerTitle className="hidden">Location</DrawerTitle>
            <div className="mt-4 border-t">{locationListContent}</div>
          </DrawerContent>
        </Drawer>
      );
    }

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>{triggerButton}</PopoverTrigger>
        <PopoverContent
          className={cn("w-[250px] p-0", classNames?.contentWrapper)}
          align="center"
          sideOffset={10}
        >
          {locationListContent}
        </PopoverContent>
      </Popover>
    );
  }
);

export default memo(SelectLocationComboboxResponsive);
