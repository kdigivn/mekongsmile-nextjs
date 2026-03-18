import { useContext } from "react";
import { MobileBottomNavContext } from "./mobile-bottom-nav-context";

export const useMobileBottomNav = () => {
  const context = useContext(MobileBottomNavContext);
  if (!context) {
    throw new Error(
      "useMobileBottomNav must be used within a MobileBottomNavProvider"
    );
  }
  return context;
};
