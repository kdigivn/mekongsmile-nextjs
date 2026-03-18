"use client";

import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { cn } from "@heroui/react";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
declare global {
  interface Window {
    googleTranslateElementInit2: () => void;
    gt_translate_script?: HTMLScriptElement;
  }
}

type Language = {
  name: string;
  code: string;
};

const GoogleTranslate = () => {
  const [selectedValue, setSelectedValue] = useState("VI");

  useEffect(() => {
    const googleTranslateElementInit2 = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "vi",
          autoDisplay: false,
        },
        "google_translate_element2"
      );

      const currentLang = GTranslateGetCurrentLang();
      const supportedLanguages = ["vi", "en", "ko", "ja", "zh-CN"];

      if (currentLang) {
        if (supportedLanguages.includes(currentLang)) {
          setSelectedValue(currentLang.toUpperCase());
        } else {
          setSelectedValue(selectedValue); // Giữ nguyên giá trị hiện tại nếu không khớp
        }
      }
    };

    if (!window.gt_translate_script) {
      const script = document.createElement("script");
      script.src =
        "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit2";
      document.body.appendChild(script);
      window.gt_translate_script = script;
    }

    window.googleTranslateElementInit2 = googleTranslateElementInit2;
  }, [selectedValue]);

  const GTranslateGetCurrentLang = (): string | null => {
    const keyValue = document.cookie.match("(^|;) ?googtrans=([^;]*)(;|$)");
    return keyValue ? keyValue[2].split("/")[2] : null;
  };

  const GTranslateFireEvent = (element: HTMLElement, event: string) => {
    try {
      const evt = new Event(event, { bubbles: true, cancelable: true });
      element.dispatchEvent(evt);
    } catch (e) {
      console.error("Error firing event:", e);
    }
  };

  const doGTranslate = useCallback((language: Language) => {
    const lang_pair = language.code;
    setSelectedValue(language.name);
    const lang = lang_pair.split("|")[1];
    if (GTranslateGetCurrentLang() === null && lang === lang_pair.split("|")[0])
      return;

    const sel = document.getElementsByTagName("select");
    let teCombo: HTMLSelectElement | undefined;

    for (let i = 0; i < sel.length; i++) {
      if (sel[i].className.indexOf("goog-te-combo") !== -1) {
        teCombo = sel[i];
        break;
      }
    }

    if (
      !document.getElementById("google_translate_element2") ||
      !document.getElementById("google_translate_element2")?.innerHTML.length ||
      !teCombo ||
      !teCombo.innerHTML.length
    ) {
      setTimeout(() => {
        doGTranslate(language);
      }, 500);
    } else {
      teCombo.value = lang;
      GTranslateFireEvent(teCombo, "change");
      GTranslateFireEvent(teCombo, "change");
    }
  }, []);

  const langList = useMemo(
    () => [
      { name: "VI", code: "vi|vi" },
      { name: "EN", code: "vi|en" },
      { name: "KO", code: "vi|ko" }, // Hàn Quốc
      { name: "JA", code: "vi|ja" }, // Nhật Bản
      { name: "ZH", code: "vi|zh-CN" }, // Trung Quốc
    ],
    []
  );

  // Sử dụng useCallback để tối ưu hóa hàm xử lý click
  const handleLanguageChange = useCallback(
    (lang: Language) => {
      if (selectedValue !== lang.name) {
        doGTranslate(lang); // Chọn ngôn ngữ mới
      }
    },
    [doGTranslate, selectedValue]
  ); // Chỉ tạo lại hàm khi selectedValue thay đổi

  const memoizedLangList = useMemo(() => {
    // eslint-disable-next-line @arthurgeron/react-usememo/require-usememo
    return langList.map((lang) => (
      <DropdownMenuItem
        key={lang.code}
        onClick={() => handleLanguageChange(lang)}
        className={cn(
          `w-fit`,
          selectedValue === lang.name ? "bg-accent text-primary" : ""
        )}
      >
        <Image
          src={`/static-img/flag-${lang.name}.svg`}
          alt={lang.name}
          width={20}
          height={28}
          className="h-5 w-7"
          loading="lazy"
        />
      </DropdownMenuItem>
    ));
  }, [langList, selectedValue, handleLanguageChange]);

  const LanguageDropdown = () => {
    return (
      <>
        <div id="google_translate_element2" className="hidden"></div>

        <DropdownMenu>
          <DropdownMenuTrigger className="group flex h-11 w-11 items-center justify-center rounded-full px-0 hover:cursor-pointer hover:bg-gray-200">
            {/* Hiển thị cờ của ngôn ngữ đã chọn */}
            <Image
              src={`/static-img/flag-${selectedValue}.svg`} // Cờ tương ứng với ngôn ngữ đã chọn
              alt={selectedValue}
              width={20}
              height={28}
              className="h-5 w-7 transform transition-transform duration-300 ease-in-out group-hover:scale-110"
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="min-w-fit bg-white/80 shadow backdrop-blur"
            forceMount
          >
            {memoizedLangList}
          </DropdownMenuContent>
        </DropdownMenu>
      </>
    );
  };
  return (
    <>
      <div id="google_translate_element2" className="hidden"></div>

      {LanguageDropdown()}
    </>
  );
};

export default memo(GoogleTranslate);
