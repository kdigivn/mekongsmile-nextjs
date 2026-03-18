"use client";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Post } from "@/services/infrastructure/wordpress/types/post";
import {
  memo,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";
import { BiCommand, BiSearchAlt } from "react-icons/bi";
import {
  IoIosArrowRoundDown,
  IoIosArrowRoundUp,
  IoIosSearch,
} from "react-icons/io";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import { useSearchDialog } from "./context/use-search-dialog";
import { useSearchDialogActions } from "./context/use-search-dialog-actions";
import SearchResults from "./search-results";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "../ui/drawer";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Input } from "../ui/input";
import { useMeilisearchSearchQuery } from "@/services/infrastructure/meilisearch/search.service";
type Props = {
  highLightPosts: Post[];
};

function Search({ highLightPosts }: Props) {
  const { isOpen } = useSearchDialog();
  const { toggleOpen, setIsOpen } = useSearchDialogActions();
  const searchBoxClassNames = useMemo(
    () => ({
      root: "w-full rounded-md py-2 space-y-0 px-4 m-0 transition-all duration-150 focus-within:border-primary border-2 border-default-100 flex-none flex shadow-sm",
      input:
        "w-full h-auto shadow-none focus-visible:ring-0 border-0 ml-8 mr-16 bg-transparent text-lg placeholder-neutral-400/80 caret-primary focus:outline-none focus:border-0",
    }),
    []
  );

  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const [requestSearchParams, setRequestSearchParams] = useState({
    query: "",
    filter: "",
  });

  const deferredQuery = useDeferredValue(requestSearchParams.query);
  const deferredSearchParams = useMemo(
    () => ({ ...requestSearchParams, query: deferredQuery }),
    [deferredQuery, requestSearchParams]
  );
  const { hits } = useMeilisearchSearchQuery(deferredSearchParams);

  // Add event listener for Ctrl+K or Cmd+K
  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      // Check for Ctrl+K on Windows/Linux or Cmd+K on Mac
      if (
        (event.ctrlKey && event.key === "k") || // Ctrl+K for Windows/Linux
        (event.metaKey && event.key === "k") // Cmd+K for Mac
      ) {
        event.preventDefault(); // Prevent browser's default search action
        toggleOpen(); // Toggle the custom dialog
      }
    };

    document.addEventListener("keydown", handleKeydown);

    return () => {
      document.removeEventListener("keydown", handleKeydown);
    };
  }, [toggleOpen]);

  const setFilter = useCallback((filter: string) => {
    setRequestSearchParams((prev) => ({ ...prev, filter }));
  }, []);

  const handleOnChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setRequestSearchParams((prev) => ({
        ...prev,
        query: event.target.value,
      }));
    },
    []
  );

  return (
    <>
      {isDesktop ? (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger
            className="hidden flex-row items-center justify-center lg:!flex"
            aria-label="Open search box"
          >
            <BiSearchAlt className="h-5 w-5 hover:text-primary group-hover:text-primary" />
          </DialogTrigger>
          <DialogContent
            className={`!hidden h-5/6 max-w-4xl flex-col rounded-lg p-5 transition-all duration-200 ease-soft-spring md:p-10 lg:!flex`}
            closeIconClassName="h-4 w-4"
            closeButtonClassName="border-2 border-default-100 p-1 rounded-md right-2 hover:border-primary"
          >
            <DialogTitle className="hidden">Search</DialogTitle>
            <DialogHeader className="relative block h-fit w-full space-y-0">
              <IoIosSearch className="absolute left-4 top-4 h-6 w-6" />
              <div className={searchBoxClassNames.root}>
                <Input
                  type="text"
                  placeholder="Tìm kiếm"
                  className={searchBoxClassNames.input}
                  onChange={handleOnChange}
                />
              </div>
              <div className="absolute right-4 top-4 !-mt-0.5 flex gap-2">
                <div className="flex items-center justify-center rounded bg-default-200 p-1">
                  <BiCommand className="h-5 w-5" />
                </div>
                <div className="flex items-center justify-center rounded bg-default-200 p-1 text-sm font-normal">
                  <div className="flex h-5 w-5 items-center justify-center">
                    K
                  </div>
                </div>
              </div>
            </DialogHeader>
            <ScrollArea className="h-full">
              <SearchResults
                highLightPosts={highLightPosts}
                searchResults={hits}
                setFilter={setFilter}
                query={deferredQuery}
              />
              <ScrollBar
                orientation="vertical"
                className="absolute !-right-4 top-0 h-full !w-0.5 bg-default-100"
              />
            </ScrollArea>
            <DialogFooter className="hidden items-center justify-center lg:flex">
              <div className="relative right-4 top-3 !-mt-0.5 flex flex-row items-center gap-2">
                <div className="flex items-center justify-center rounded border-1 border-white bg-default-200 p-1 drop-shadow-sm">
                  <IoIosArrowRoundUp className="h-5 w-5" />
                </div>
                <div className="flex items-center justify-center rounded border-1 border-white bg-default-200 p-1 drop-shadow-sm">
                  <IoIosArrowRoundDown className="h-5 w-5" />
                </div>
                <span className="h-5 text-sm">Để điều hướng lên xuống</span>
                <div className="flex items-center justify-center rounded border-1 border-white bg-default-200 px-3 py-1 text-sm font-normal drop-shadow-sm">
                  <div className="flex h-5 w-5 items-center justify-center">
                    Enter
                  </div>
                </div>
                <span className="h-5 text-sm">Để chọn</span>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : (
        <Drawer open={isOpen} onOpenChange={setIsOpen} modal={false}>
          <DrawerContent
            className={`!flex h-full flex-col rounded-none p-5 transition-all duration-200 ease-soft-spring md:p-10 lg:!hidden lg:rounded-lg`}
          >
            <DrawerTitle className="hidden">Search</DrawerTitle>
            <DrawerHeader className="relative block h-fit w-full px-0">
              <IoIosSearch className="absolute left-4 top-8 h-6 w-6" />
              {/* <SearchBox
                classNames={searchBoxClassNames}
                placeholder="Tìm kiếm"
                onChange={(event) => setQuery(event.currentTarget.value)}
              /> */}
              <div className={searchBoxClassNames.root}>
                <Input
                  type="text"
                  placeholder="Tìm kiếm"
                  className={searchBoxClassNames.input}
                  onChange={handleOnChange}
                />
              </div>
              {/* <div className="absolute right-4 top-7 !-mt-0.5 flex gap-2">
                <div className=" flex items-center justify-center rounded bg-default-200 p-1">
                  <BiCommand className="h-5 w-5" />
                </div>
                <div className=" flex items-center justify-center rounded bg-default-200 p-1 text-sm font-normal">
                  <div className="flex h-5 w-5 items-center justify-center">
                    K
                  </div>
                </div>
              </div> */}
            </DrawerHeader>
            <ScrollArea className="h-full">
              <SearchResults
                highLightPosts={highLightPosts}
                searchResults={hits}
                setFilter={setFilter}
                query={deferredQuery}
              />
              <ScrollBar
                orientation="vertical"
                className="absolute !-right-4 top-0 h-full !w-0.5 bg-default-100"
              />
            </ScrollArea>
          </DrawerContent>
        </Drawer>
      )}
    </>
  );
}

export default memo(Search);
