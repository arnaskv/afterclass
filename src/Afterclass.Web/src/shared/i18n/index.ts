import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import { en } from "./locales/en";
import { lt, type Translations } from "./locales/lt";

export const defaultLanguage = "lt";

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "translation";
    resources: { translation: Translations };
  }
}

void i18n.use(initReactI18next).init({
  lng: defaultLanguage,
  fallbackLng: defaultLanguage,
  supportedLngs: ["lt", "en"],
  resources: {
    lt: { translation: lt },
    en: { translation: en },
  },
  interpolation: { escapeValue: false },
  returnNull: false,
});

export { i18n };
