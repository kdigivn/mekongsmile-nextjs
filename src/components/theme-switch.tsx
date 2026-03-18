import { useTheme } from "next-themes";
import { memo, useCallback, useEffect, useState } from "react";
import MoonIcon from "./icons/icon-moon";
import SunIcon from "./icons/icon-sun";
import { Toggle } from "./ui/toggle";

function ThemeSwitch() {
  const { theme, setTheme } = useTheme();
  const [isSelected, setIsSelected] = useState(false);
  const [mounted, setMounted] = useState(false);

  const handleSelectChange = useCallback(
    (isSelected: boolean) => {
      if (isSelected) {
        setTheme("dark");
      } else {
        setTheme("light");
      }

      setIsSelected(isSelected);
    },
    [setTheme]
  );

  useEffect(() => {
    setMounted(true);

    // Init switch base on theme
    if (theme === "dark") {
      setIsSelected(true);
    }
  }, [theme]);

  if (!mounted) return null;

  return (
    <Toggle
      pressed={isSelected}
      onPressedChange={handleSelectChange}
      className="flex h-8 w-8 items-center justify-center rounded-lg bg-default-100 p-0 hover:bg-default-200 hover:text-foreground hover:opacity-100"
    >
      {isSelected ? <MoonIcon /> : <SunIcon />}
    </Toggle>
  );
}

export default memo(ThemeSwitch);
