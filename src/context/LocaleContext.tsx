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

  // Add Crop page
  "addCrop.back": { en: "Back to Dashboard", ka: "დაბრუნება დაფაზე" },
  "addCrop.title": { en: "Add Crop", ka: "კულტურის დამატება" },
  "addCrop.description": {
    en: "Search for your crop and provide details to get AI-powered recommendations",
    ka: "იპოვეთ თქვენი კულტურა და მიუთითეთ დეტალები, რათა მიიღოთ AI რეკომენდაციები",
  },
  "addCrop.variety.label": { en: "Variety (optional)", ka: "სორტი (არასავალდებულო)" },
  "addCrop.variety.placeholder": { en: "e.g., Golden Bantam", ka: " напр., Golden Bantam" },
  "addCrop.status.label": { en: "Status", ka: "სტატუსი" },
  "addCrop.status.planned": { en: "Planning to plant", ka: "დარგვის დაგეგმვა" },
  "addCrop.status.planted": { en: "Already planted", ka: "უკვე დარგულია" },
  "addCrop.date.planned": { en: "Planned Planting Date", ka: "დაგეგმილი დარგვის თარიღი" },
  "addCrop.date.planting": { en: "Planting Date", ka: "დარგვის თარიღი" },
  "addCrop.area.label": { en: "Area", ka: "ფართობი" },
  "addCrop.unit.label": { en: "Unit", ka: "ერთეული" },
  "addCrop.unit.m2": { en: "Square meters (m²)", ka: "კვადრატული მეტრი (მ²)" },
  "addCrop.unit.ha": { en: "Hectares (ha)", ka: "ჰექტარი (ჰა)" },
  "addCrop.method.label": { en: "Planting Method", ka: "დარგვის მეთოდი" },
  "addCrop.method.direct": { en: "Direct Seed", ka: "დაუყოვნებლივი თესვა" },
  "addCrop.method.transplant": { en: "Transplant", ka: "გადარგვა" },
  "addCrop.field.label": { en: "Field/Location Name (optional)", ka: "ველის/ლოკაციის სახელი (არასავალდებულო)" },
  "addCrop.field.placeholder": { en: "e.g., North Field", ka: " напр., ჩრდილოეთი ველი" },
  "addCrop.chem.label": { en: "Recent chemical/pesticide use?", ka: "ახლახან ქიმიური/პესტიციდის გამოყენება?" },
  "addCrop.chem.no": { en: "No", ka: "არა" },
  "addCrop.chem.yes": { en: "Yes", ka: "კი" },
  "addCrop.chem.name": { en: "Chemical/Pesticide Name", ka: "ქიმიური/პესტიციდის სახელწოდება" },
  "addCrop.chem.name.placeholder": { en: "Product name", ka: "პროდუქტის სახელი" },
  "addCrop.chem.date": { en: "Application Date", ka: "გამოყენების თარიღი" },
  "addCrop.notes.label": { en: "Notes (optional)", ka: "შენიშვნები (არასავალდებულო)" },
  "addCrop.notes.placeholder": { en: "Any additional information...", ka: "დამატებითი ინფორმაცია..." },
  "addCrop.cta.recommend": { en: "Get Recommendation", ka: "მიიღეთ რეკომენდაცია" },
  "addCrop.cta.analyzing": { en: "Analyzing...", ka: "ანალიზი..." },
  "addCrop.cta.save": { en: "Save Crop", ka: "კულტურის შენახვა" },

  // Toasts / validation
  "addCrop.toast.selectCrop": { en: "Please select a crop first", ka: "ჯერ აირჩიეთ კულტურა" },
  "addCrop.toast.enterPlanned": { en: "Please enter planned planting date", ka: "შეიყვანეთ დაგეგმილი დარგვის თარიღი" },
  "addCrop.toast.enterPlanting": { en: "Please enter planting date", ka: "შეიყვანეთ დარგვის თარიღი" },
  "addCrop.toast.generated": { en: "Recommendation generated!", ka: "რეკომენდაცია მიღებულია!" },
  "addCrop.toast.saveFirst": { en: "Please get a recommendation first", ka: "ჯერ მიიღეთ რეკომენდაცია" },
  "addCrop.toast.saved": { en: "Crop saved successfully!", ka: "კულტურა წარმატებით შეინახა!" },
  "addCrop.toast.failGet": { en: "Failed to get recommendation", ka: "რეკომენდაციის მიღება ვერ მოხერხდა" },
  "addCrop.toast.failSave": { en: "Failed to save crop", ka: "კულტურის შენახვა ვერ მოხერხდა" },
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
