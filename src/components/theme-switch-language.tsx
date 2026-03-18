"use client";

import { cn } from "@/lib/utils";
import { enumToArray } from "@/services/helpers/enumUtils";
import { ELanguages } from "@/services/i18n/language-enum";
import useLanguage from "@/services/i18n/use-language";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { memo, useMemo, useState } from "react";
import LocaleIcon from "./icons/icon-locale";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

function ThemeSwitchLanguage() {
  const pathname = usePathname();
  const router = useRouter();
  // Strip the locale path from path name
  let currentPath = pathname.slice(3);
  const queryParams = useSearchParams();
  currentPath = currentPath + "?";
  for (const key of queryParams.keys()) {
    currentPath += `${key}=${queryParams.get(key)}&`;
  }
  const currentLanguageKey = useLanguage();
  const availableLanguages = useMemo(() => enumToArray(ELanguages), []);
  const mappedCurrentLanguage = useMemo(
    () =>
      availableLanguages.find(
        (language) => language.key === currentLanguageKey
      ),
    [availableLanguages, currentLanguageKey]
  );

  const [selectedLanguage, setSelectedLanguage] = useState<
    (typeof availableLanguages)[0] | undefined
  >(mappedCurrentLanguage);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex h-10 items-center justify-center gap-2 rounded-md bg-default-200 focus-visible:ring-0"
        >
          <LocaleIcon />
          {selectedLanguage?.value}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent aria-label="Select language">
        {
          // eslint-disable-next-line @arthurgeron/react-usememo/require-usememo
          availableLanguages.map((item) => (
            <DropdownMenuItem
              key={item.key}
              className={cn(
                selectedLanguage?.key === item.key
                  ? "bg-primary-100 text-primary focus:bg-primary-100 focus:text-primary"
                  : "hover:cursor-pointer"
              )}
              onClick={() => {
                if (!(selectedLanguage?.key === item.key)) {
                  setSelectedLanguage(item);
                  router.push(`/${item.key}${currentPath}`);
                }
              }}
            >
              {item.value}
            </DropdownMenuItem>
          ))
        }
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default memo(ThemeSwitchLanguage);
