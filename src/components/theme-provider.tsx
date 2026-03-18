"use client";

import { HeroUIProvider } from "@heroui/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useRouter } from "next/navigation";
import { PropsWithChildren } from "react";

type Props = {
  availableThemes?: string[];
};
function ThemeProvider({
  availableThemes = ["condao-express-light"],
  children,
}: PropsWithChildren<Props>) {
  // NextUI config
  const router = useRouter();

  return (
    <HeroUIProvider navigate={router.push}>
      <NextThemesProvider
        attribute="class"
        enableSystem={false}
        defaultTheme={availableThemes[0]}
        themes={availableThemes}
        disableTransitionOnChange={true}
      >
        {children}
      </NextThemesProvider>
    </HeroUIProvider>
  );
}

export default ThemeProvider;
