import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { enUS, ka as kaDateLocale } from "date-fns/locale";
import en from "./locales/en";
import ka from "./locales/ka";

export const SUPPORTED_LANGUAGES = ["en", "ka"] as const;
export type AppLanguage = (typeof SUPPORTED_LANGUAGES)[number];

function readSavedLanguage(): AppLanguage {
  try {
    const saved = localStorage.getItem("nergi_lang");
    return saved === "ka" ? "ka" : "en";
  } catch {
    return "en";
  }
}

i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, ka: { translation: ka } },
  lng: readSavedLanguage(),
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

// Keep <html lang> in sync for screen readers and correct Georgian font rendering.
document.documentElement.lang = i18n.language;
i18n.on("languageChanged", (lng) => {
  document.documentElement.lang = lng;
});

export function currentLanguage(): AppLanguage {
  return i18n.language === "ka" ? "ka" : "en";
}

/** date-fns locale matching the current UI language (month names, "3 days ago", etc.). */
export function dateLocale() {
  return currentLanguage() === "ka" ? kaDateLocale : enUS;
}

export default i18n;

/** Day + month, ordered naturally for the language ("Apr 15" / "15 აპრ"). */
export function shortDatePattern() {
  return currentLanguage() === "ka" ? "d MMM" : "MMM d";
}

/** Day, month and year ("Apr 15, 2027" / "15 აპრ 2027"). */
export function longDatePattern() {
  return currentLanguage() === "ka" ? "d MMM yyyy" : "MMM d, yyyy";
}
