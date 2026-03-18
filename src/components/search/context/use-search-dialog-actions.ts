import { useContext } from "react";
import { SearchDialogActionsContext } from "./search-dialog-context";

export const useSearchDialogActions = () => {
  const context = useContext(SearchDialogActionsContext);
  if (!context) {
    throw new Error(
      "useSearchDialogActions must be used within a SearchDialogProvider"
    );
  }
  return context;
};
