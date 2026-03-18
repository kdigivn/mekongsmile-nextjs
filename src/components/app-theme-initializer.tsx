"use client";

import { useTheme } from "next-themes";
import { memo, useEffect } from "react";

/**
 * This component is used for setting theme after the client available
 * @returns
 */
function AppThemeInitializer() {
  const { theme, setTheme, themes } = useTheme();

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!theme || (theme && !themes.includes(theme))) {
      // set default theme
      setTheme(themes[0]);
    }
  }, [setTheme, theme, themes]);

  return null;
}

export default memo(AppThemeInitializer);
