import { useContext } from "react";
import { MobileBottomNavActionsContext } from "./mobile-bottom-nav-context";

export const useMobileBottomNavActions = () => {
  const context = useContext(MobileBottomNavActionsContext);
  if (!context) {
    throw new Error(
      "useMobileBottomNavActions must be used within a MobileBottomNavProvider"
    );
  }
  return context;
};
