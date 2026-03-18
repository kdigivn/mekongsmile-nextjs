"use client";

import { memo, ReactNode, useMemo, useState } from "react";
import {
  MobileBottomNavActionsContext,
  MobileBottomNavContext,
} from "./mobile-bottom-nav-context";

interface NavProviderProps {
  children: ReactNode;
}

const MobileBottomNavProvider = ({ children }: NavProviderProps) => {
  const [isNavVisible, setIsNavVisible] = useState(false);
  const [isShowSupportForm, setIsShowSupportForm] = useState(false);
  const [isShowVoucherForm, setIsShowVoucherForm] = useState(false);

  const contextValue = useMemo(
    () => ({
      isNavVisible,
      isShowSupportForm,
      isShowVoucherForm,
    }),
    [isNavVisible, isShowSupportForm, isShowVoucherForm]
  );

  const toggleNavVisibility = () => {
    setIsNavVisible((prev) => !prev);
  };

  const hideNav = () => {
    setIsNavVisible(false);
  };

  const showNav = () => {
    setIsNavVisible(true);
  };

  const showForm = () => {
    setIsShowSupportForm(true);
  };

  const hideForm = () => {
    setIsShowSupportForm(false);
  };

  const showVoucher = () => {
    setIsShowVoucherForm(true);
  };

  const hideVoucher = () => {
    setIsShowVoucherForm(false);
  };

  const contextActionsValue = useMemo(
    () => ({
      toggleNavVisibility,
      hideNav,
      showNav,
      showForm,
      hideForm,
      showVoucher,
      hideVoucher,
    }),
    []
  );

  return (
    <MobileBottomNavContext.Provider value={contextValue}>
      <MobileBottomNavActionsContext.Provider value={contextActionsValue}>
        {children}
      </MobileBottomNavActionsContext.Provider>
    </MobileBottomNavContext.Provider>
  );
};

export default memo(MobileBottomNavProvider);
