import { useContext } from "react";
import { SearchDialogContext } from "./search-dialog-context";

export const useSearchDialog = () => {
  const context = useContext(SearchDialogContext);
  if (!context) {
    throw new Error(
      "useSearchDialog must be used within a SearchDialogProvider"
    );
  }
  return context;
};
