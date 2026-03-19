import { getEnumKeyByEnumValue, getEnumKeys } from "../helpers/enumUtils";
import { ELanguages } from "./language-enum";

export const fallbackLanguage = getEnumKeyByEnumValue(
  ELanguages,
  ELanguages.en
);
export const languages = getEnumKeys(ELanguages);
export const defaultNamespace = "common";
export const cookieName = "i18next";

export function getOptions(
  language: string = fallbackLanguage,
  namespace = defaultNamespace
) {
  return {
    debug: process.env.ENABLE_I18NEXT_DEBUG === "true",
    supportedLngs: languages,
    fallbackLng: fallbackLanguage,
    lng: language,
    fallbackNS: defaultNamespace,
    defaultNS: defaultNamespace,
    ns: namespace,
  };
}
