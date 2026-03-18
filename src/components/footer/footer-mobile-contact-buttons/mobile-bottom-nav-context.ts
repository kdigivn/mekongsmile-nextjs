"use client";

import { createContext } from "react";

// Define the context types
interface MobileBottomNavContextProps {
  isNavVisible: boolean;
  isShowSupportForm: boolean;
  isShowVoucherForm: boolean;
}

// Create the context with default values
export const MobileBottomNavContext = createContext<
  MobileBottomNavContextProps | undefined
>(undefined);

interface MobileBottomNavActionContextProps {
  toggleNavVisibility: () => void;
  hideNav: () => void;
  showNav: () => void;
  showForm: () => void;
  hideForm: () => void;
  showVoucher: () => void;
  hideVoucher: () => void;
}

export const MobileBottomNavActionsContext = createContext<
  MobileBottomNavActionContextProps | undefined
>(undefined);
