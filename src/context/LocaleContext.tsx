import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type Lang = "en" | "ka";

type Messages = Record<string, Record<Lang, string>>;

const messages: Messages = {
  "nav.login": { en: "Log In", ka: "შესვლა" },
  "nav.getStarted": { en: "Get Started", ka: "დაიწყეთ" },
  "nav.myAccount": { en: "My Account", ka: "ჩემი ანგარიში" },
  "nav.dashboard": { en: "Dashboard", ka: "დეშბორდი" },
  "nav.addCrop": { en: "Add Crop", ka: "კულტურის დამატება" },
  "nav.signOut": { en: "Sign Out", ka: "გასვლა" },
  "nav.language": { en: "Language", ka: "ენა" },

  "hero.title": { en: "Smart Farming for Georgian Agriculture", ka: "ჭკვიანი სოფლის მეურნეობა საქართველოსთვის" },
  "hero.subtitle": {
    en: "Get AI-powered crop recommendations based on your location, soil conditions, and weather forecasts. Make informed planting decisions and maximize your harvest.",
    ka: "მიიღეთ AI რეკომენდაციები კულტურებზე თქვენი მდებარეობის, ნიადაგის და ამინდის საფუძველზე. მიიღეთ გააზრებული გადაწყვეტილებები და გაზარდეთ მოსავალი.",
  },
  "hero.ctaPrimary": { en: "Start Free", ka: "დაიწყეთ უფასოდ" },
  "hero.ctaLogin": { en: "Log In", ka: "შესვლა" },
  "hero.right.title": { en: "What you’ll get", ka: "რას მიიღებთ" },
  "hero.right.point1": {
    en: "Accurate crop suggestions based on region, soil pH, and weather.",
    ka: "ზუსტი რჩევები კულტურებზე რეგიონზე, ნიადაგის pH-ზე და ამინდზე დაყრდნობით.",
  },
  "hero.right.point2": {
    en: "Weekly planting plans with clear tasks and timings.",
    ka: "კვირეული დარგვის გეგმები კონკრეტული ამოცანებით და დროთი.",
  },
  "hero.right.point3": {
    en: "Proactive alerts for pests, diseases, and climate risks.",
    ka: "გაფრთხილებები მავნებლების, დაავადებების და კლიმატური რისკების შესახებ.",
  },
};

type LocaleContextType = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: keyof typeof messages) => string;
};

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export const LocaleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Lang>(() => (localStorage.getItem("lang") as Lang) || "en");

  useEffect(() => {
    document.documentElement.lang = lang;
    localStorage.setItem("lang", lang);
  }, [lang]);

  const setLang = (l: Lang) => setLangState(l);

  const t = useMemo(
    () => (key: keyof typeof messages) => {
      const entry = messages[key];
      return entry ? entry[lang] : String(key);
    },
    [lang]
  );

  const value = useMemo(() => ({ lang, setLang, t }), [lang, t]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
};

export const useLocale = () => {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
};
