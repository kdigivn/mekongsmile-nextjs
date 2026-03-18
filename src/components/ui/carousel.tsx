/* eslint-disable no-restricted-syntax */
"use client";

import * as React from "react";
import { useContext, useMemo, useState, useCallback, useEffect } from "react";
import useEmblaCarousel, {
  type UseEmblaCarouselType,
} from "embla-carousel-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

type CarouselApi = UseEmblaCarouselType[1];
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>;
type CarouselOptions = UseCarouselParameters[0];
type CarouselPlugin = UseCarouselParameters[1];

type CarouselProps = {
  opts?: CarouselOptions;
  plugins?: CarouselPlugin;
  orientation?: "horizontal" | "vertical";
  setApi?: (api: CarouselApi) => void;
};

type CarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0];
  api: ReturnType<typeof useEmblaCarousel>[1];
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
} & CarouselProps;

const CarouselContext = React.createContext<CarouselContextProps | null>(null);

function useCarousel() {
  const context = useContext(CarouselContext);

  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />");
  }

  return context;
}

const Carousel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & CarouselProps
>(
  (
    {
      orientation = "horizontal",
      opts,
      setApi,
      plugins,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const [carouselRef, api] = useEmblaCarousel(
      useMemo(
        () => ({
          ...opts,
          axis: orientation === "horizontal" ? "x" : "y",
        }),
        [opts, orientation]
      ),
      plugins
    );
    const [canScrollPrev, setCanScrollPrev] = useState(false);
    const [canScrollNext, setCanScrollNext] = useState(false);

    const onSelect = useCallback((api: CarouselApi) => {
      if (!api) {
        return;
      }

      setCanScrollPrev(api.canScrollPrev());
      setCanScrollNext(api.canScrollNext());
    }, []);

    const scrollPrev = useCallback(() => {
      api?.scrollPrev();
    }, [api]);

    const scrollNext = useCallback(() => {
      api?.scrollNext();
    }, [api]);

    const handleKeyDown = useCallback(
      (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          scrollPrev();
        } else if (event.key === "ArrowRight") {
          event.preventDefault();
          scrollNext();
        }
      },
      [scrollPrev, scrollNext]
    );

    useEffect(() => {
      if (!api || !setApi) {
        return;
      }

      setApi(api);
    }, [api, setApi]);

    useEffect(() => {
      if (!api) {
        return;
      }

      onSelect(api);
      api.on("reInit", onSelect);
      api.on("select", onSelect);

      return () => {
        api?.off("select", onSelect);
      };
    }, [api, onSelect]);

    return (
      <CarouselContext.Provider
        value={{
          carouselRef,
          api: api,
          opts,
          orientation:
            orientation || (opts?.axis === "y" ? "vertical" : "horizontal"),
          scrollPrev,
          scrollNext,
          canScrollPrev,
          canScrollNext,
        }}
      >
        <div
          ref={ref}
          onKeyDownCapture={handleKeyDown}
          className={cn("relative", className)}
          role="region"
          aria-roledescription="carousel"
          {...props}
        >
          {children}
        </div>
      </CarouselContext.Provider>
    );
  }
);
Carousel.displayName = "Carousel";

interface CarouselContentProps extends React.HTMLAttributes<HTMLDivElement> {
  classNameRoot?: string;
}

const CarouselContent = React.forwardRef<HTMLDivElement, CarouselContentProps>(
  ({ className, classNameRoot, ...props }, ref) => {
    const { carouselRef, orientation } = useCarousel();

    return (
      <div ref={carouselRef} className={cn("overflow-hidden", classNameRoot)}>
        <div
          ref={ref}
          className={cn(
            "flex",
            orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col",
            className
          )}
          {...props}
        />
      </div>
    );
  }
);
CarouselContent.displayName = "CarouselContent";

const CarouselItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { orientation } = useCarousel();

  return (
    <div
      ref={ref}
      role="group"
      aria-roledescription="slide"
      className={cn(
        "min-w-0 shrink-0 grow-0 basis-full",
        orientation === "horizontal" ? "pl-4" : "pt-4",
        className
      )}
      {...props}
    />
  );
});
CarouselItem.displayName = "CarouselItem";

/**
 * CarouselPrevious is a button component that navigates to the previous slide in a carousel.
 * It uses the `useCarousel` hook to access carousel state and control functions.
 *
 * @param {Object} props - The props for the CarouselPrevious component.
 * @param {string} [props.className] - Additional classNames for styling the button.
 * @param {string} [props.variant="outline"] - Variant for the button styling.
 * @param {string} [props.size="icon"] - Size of the button, defaults to icon size.
 * @param {string} [props.iconClassName] - ClassName to customize the styling of the IoIosArrowBack icon.
 * @param {React.Ref<HTMLButtonElement>} ref - Ref forwarded to the button element.
 * @param {boolean} canScrollPrev - Indicates whether there are slides to scroll back to.
 * @param {function} scrollPrev - Function to scroll to the previous slide.
 * @param {string} orientation - Determines the orientation of the carousel (horizontal or vertical).
 *
 * @returns {JSX.Element} A button that triggers scrolling to the previous slide when clicked.
 * The button is hidden if there is no previous slide to scroll to (`canScrollPrev` is false).
 *
 * @example
 * ```
 * <CarouselPrevious className="my-carousel-prev" iconClassName="custom-arrow-icon" />
 * ```
 */
const CarouselPrevious = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button> & { iconClassName?: string }
>(
  (
    { className, variant = "outline", size = "icon", iconClassName, ...props },
    ref
  ) => {
    const { orientation, scrollPrev, canScrollPrev } = useCarousel();

    return (
      <Button
        ref={ref}
        variant={variant}
        size={size}
        className={cn(
          "absolute h-8 w-8 rounded-full border-0 bg-transparent !shadow-none hover:!bg-transparent hover:!shadow-none",
          orientation === "horizontal"
            ? "-left-12 top-1/2 -translate-y-1/2"
            : "-top-12 left-1/2 -translate-x-1/2 rotate-90",
          canScrollPrev ? "flex" : "hidden",

          className
        )}
        disabled={!canScrollPrev}
        onClick={scrollPrev}
        {...props}
      >
        {/* <ArrowLeftIcon className="h-4 w-4" /> */}
        <IoIosArrowBack
          className={cn(
            `h-10 w-10 ${canScrollPrev ? "text-black hover:text-primary" : "text-black"}`,
            iconClassName
          )}
        />
        <span className="sr-only">Previous slide</span>
      </Button>
    );
  }
);
CarouselPrevious.displayName = "CarouselPrevious";

/**
 * CarouselNext is a button component that navigates to the next slide in a carousel.
 * It uses the `useCarousel` hook to access carousel state and control functions.
 *
 * @param {Object} props - The props for the CarouselNext component.
 * @param {string} [props.className] - Additional classNames for styling the button.
 * @param {string} [props.variant="outline"] - Variant for the button styling.
 * @param {string} [props.size="icon"] - Size of the button, defaults to icon size.
 * @param {string} [props.iconClassName] - ClassName to customize the styling of the IoIosArrowForward icon.
 * @param {React.Ref<HTMLButtonElement>} ref - Ref forwarded to the button element.
 * @param {boolean} canScrollNext - Indicates whether there are slides to scroll forward to.
 * @param {function} scrollNext - Function to scroll to the next slide.
 * @param {string} orientation - Determines the orientation of the carousel (horizontal or vertical).
 *
 * @returns {JSX.Element} A button that triggers scrolling to the next slide when clicked.
 * The button is hidden if there is no next slide to scroll to (`canScrollNext` is false).
 *
 * @example
 * ```
 * <CarouselNext className="my-carousel-next" iconClassName="custom-arrow-icon" />
 * ```
 */
const CarouselNext = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button> & { iconClassName?: string }
>(
  (
    { className, variant = "outline", size = "icon", iconClassName, ...props },
    ref
  ) => {
    const { orientation, scrollNext, canScrollNext } = useCarousel();

    return (
      <Button
        ref={ref}
        variant={variant}
        size={size}
        className={cn(
          "absolute h-8 w-8 rounded-full border-0 bg-transparent !shadow-none hover:!bg-transparent hover:!shadow-none",
          orientation === "horizontal"
            ? "-right-12 top-1/2 -translate-y-1/2"
            : "-bottom-12 left-1/2 -translate-x-1/2 rotate-90",
          canScrollNext ? "flex" : "hidden",

          className
        )}
        disabled={!canScrollNext}
        onClick={scrollNext}
        {...props}
      >
        {/* <ArrowRightIcon className="h-4 w-4" /> */}
        <IoIosArrowForward
          className={cn(
            `h-10 w-10 ${canScrollNext ? "text-black hover:text-primary" : "text-black"}`,
            iconClassName
          )}
        />
        <span className="sr-only">Next slide</span>
      </Button>
    );
  }
);
CarouselNext.displayName = "CarouselNext";

export {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
};
