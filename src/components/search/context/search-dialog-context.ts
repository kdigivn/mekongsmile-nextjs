"use client";

import { createContext } from "react";

// Define the context types
interface SearchDialogContextProps {
  isOpen: boolean;
}

// Create the context with default values
export const SearchDialogContext = createContext<
  SearchDialogContextProps | undefined
>(undefined);

interface SearchDialogActionContextProps {
  setIsOpen: (state: boolean) => void;
  toggleOpen: () => void;
  close: () => void;
  open: () => void;
}

export const SearchDialogActionsContext = createContext<
  SearchDialogActionContextProps | undefined
>(undefined);
