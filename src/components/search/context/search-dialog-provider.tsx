"use client";

import { memo, ReactNode, useMemo, useState } from "react";
import {
  SearchDialogActionsContext,
  SearchDialogContext,
} from "./search-dialog-context";

interface SearchDialogProviderProps {
  children: ReactNode;
}

const SearchDialogProvider = ({ children }: SearchDialogProviderProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const contextValue = useMemo(
    () => ({
      isOpen,
    }),
    [isOpen]
  );

  const toggleOpen = () => {
    setIsOpen((prev) => !prev);
  };

  const close = () => {
    setIsOpen(false);
  };

  const open = () => {
    setIsOpen(true);
  };

  const contextActionsValue = useMemo(
    () => ({
      setIsOpen,
      toggleOpen,
      close,
      open,
    }),
    []
  );

  return (
    <SearchDialogContext.Provider value={contextValue}>
      <SearchDialogActionsContext.Provider value={contextActionsValue}>
        {children}
      </SearchDialogActionsContext.Provider>
    </SearchDialogContext.Provider>
  );
};

export default memo(SearchDialogProvider);
