import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type Lang = "en" | "ka";

type Messages = Record<string, Record<Lang, string>>;

const messages: Messages = {
  "nav.login": { en: "Log In", ka: "შესვლა" },
  "nav.getStarted": { en: "Get Started", ka: "დაიწყეთ" },
  "nav.myAccount": { en: "My Account", ka: "ჩემი ანგარიში" },
  "nav.myCrops": { en: "My Crops", ka: "ჩემი კულტურები" },
  "nav.dashboard": { en: "Dashboard", ka: "დეშბორდი" },
  "nav.addCrop": { en: "Add Crop", ka: "კულტურის დამატება" },
  "nav.signOut": { en: "Sign Out", ka: "გასვლა" },
  "nav.language": { en: "Language", ka: "ენა" },
  "nav.home": { en: "Home", ka: "მთავარი" },
  "nav.pricing": { en: "Pricing", ka: "ფასები" },
  "nav.about": { en: "About Us", ka: "ჩვენ შესახებ" },

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
  "addCrop.variety.placeholder": { en: "e.g., Golden Bantam", ka: "მაგ., Golden Bantam" },
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
  "addCrop.field.placeholder": { en: "e.g., North Field", ka: "მაგ., ჩრდილოეთი ველი" },
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

  // Home page – Features section
  "home.features.title": { en: "Why Farmers Choose Nergi", ka: "რატომ ირჩევენ ფერმერები Nergi-ს" },
  "home.features.subtitle": {
    en: "Comprehensive tools for modern agricultural decision-making",
    ka: "სრული ინსტრუმენტები თანამედროვე სოფლის მეურნეობაში გადაწყვეტილებების მისაღებად",
  },
  "home.features.cards.location.title": { en: "Location-Based Intelligence", ka: "მდებარეობაზე დაფუძნებული ანალიტიკა" },
  "home.features.cards.location.desc": {
    en: "Get region-specific recommendations tailored to your exact location and local climate conditions",
    ka: "მიიღეთ რეგიონზე და ადგილობრივ კლიმატზე მორგებული რეკომენდაციები",
  },
  "home.features.cards.soil.title": { en: "Soil Analysis", ka: "ნიადაგის ანალიზი" },
  "home.features.cards.soil.desc": {
    en: "Real-time soil pH, nutrient levels, and moisture data to optimize your crop selection and amendments",
    ka: "რეალურ დროში ნიადაგის pH, საკვები ელემენტები და ტენიანობის მონაცემები, თქვენი კულტურების შერჩევისა და გაუმჯობესებისთვის",
  },
  "home.features.cards.pest.title": { en: "Pest & Disease Alerts", ka: "მავნებლებისა და დაავადებების გაფრთხილებები" },
  "home.features.cards.pest.desc": {
    en: "Early warnings about fungal risks, insect threats, and weather hazards with safe mitigation strategies",
    ka: "ადრეული გაფრთხილებები სოკოვან რისკებზე, მწერების საფრთხეებსა და ამინდის რისკებზე უსაფრთხო მართვის სტრატეგიებით",
  },
  "home.features.cards.plans.title": { en: "4-Week Planting Plans", ka: "4-კვირიანი დარგვის გეგმები" },
  "home.features.cards.plans.desc": {
    en: "Detailed week-by-week task calendars with specific timings for watering, fertilizing, and monitoring",
    ka: "დეტალური, კვირების მიხედვით განაწილებული ამოცანები წყლის მიცემის, გამოკვების და მონიტორინგის ზუსტი დროებით",
  },
  "home.features.cards.database.title": { en: "Crop Database", ka: "კულტურების ბაზა" },
  "home.features.cards.database.desc": {
    en: "Extensive library of crops with optimal pH ranges, planting windows, and rotation recommendations",
    ka: "გაფართოებული ბიბლიოთეკა კულტურების ოპტიმალური pH დიაპაზონებით, დარგვის ფანჯრებით და მიმდევრობის რეკომენდაციებით",
  },
  "home.features.cards.safe.title": { en: "Safe Practices", ka: "უსაფრთხო პრაქტიკა" },
  "home.features.cards.safe.desc": {
    en: "AI assistant prioritizes organic and IPM methods, tracks chemical use, and ensures regulatory compliance",
    ka: "AI ასისტენტი ანიჭებს უპირატესობას ორგანულ და IPM მეთოდებს, აკონტროლებს ქიმიკატების გამოყენებას და უზრუნველყოფს ნორმებთან შესაბამისობას",
  },

  // Home page – CTA & Footer
  "home.cta.title": { en: "Ready to Grow Smarter?", ka: "მზად ხართ ჭკვიანად გაიზარდოთ?" },
  "home.cta.subtitle": {
    en: "Join Georgian farmers making data-driven planting decisions with Nergi",
    ka: "შემოუერთდით ქართულ ფერმერებს, რომლებიც Nergi-სთან მონაცემებზე დაფუძნებულ დარგვის გადაწყვეტილებებს იღებენ",
  },
  "home.cta.button": { en: "Get Started Free", ka: "დაიწყეთ უფასოდ" },
  "home.footer.copy": {
    en: "© 2025 Nergi. AI-powered agricultural assistant for Georgian farmers.",
    ka: "© 2025 Nergi. AI-ზე დაფუძნებული აგრარული ასისტენტი საქართველოს ფერმერებისთვის.",
  },

  // Auth page
  "auth.brand.tagline": {
    en: "AI-powered farming assistant for Georgian farmers",
    ka: "AI-ზე დაფუძნებული ფერმერული ასისტენტი საქართველოს ფერმერებისთვის",
  },
  "auth.title": { en: "Welcome", ka: "კეთილი იყოს თქვენი მობრძანება" },
  "auth.description": {
    en: "Sign in to access your personalized crop recommendations",
    ka: "შედით, რომ მიიღოთ პერსონალიზებული კულტურების რეკომენდაციები",
  },
  "auth.tabs.signin": { en: "Sign In", ka: "შესვლა" },
  "auth.tabs.signup": { en: "Sign Up", ka: "რეგისტრაცია" },
  "auth.labels.fullName": { en: "Full Name", ka: "სრული სახელი" },
  "auth.labels.email": { en: "Email", ka: "ელ. ფოსტა" },
  "auth.labels.password": { en: "Password", ka: "პაროლი" },
  "auth.placeholders.name": { en: "Your name", ka: "თქვენი სახელი" },
  "auth.placeholders.email": { en: "farmer@example.com", ka: "farmer@example.com" },
  "auth.buttons.signIn": { en: "Sign In", ka: "შესვლა" },
  "auth.buttons.signUp": { en: "Sign Up", ka: "რეგისტრაცია" },
  "auth.buttons.signingIn": { en: "Signing in...", ka: "შესვლა..." },
  "auth.buttons.creating": { en: "Creating account...", ka: "ანგარიშის შექმნა..." },
  "auth.toasts.signupSuccess": {
    en: "Account created! Please check your email to verify.",
    ka: "ანგარიში შეიქმნა! გთხოვთ გადაამოწმოთ ელ. ფოსტა დასადასტურებლად.",
  },
  "auth.toasts.signupFail": { en: "Failed to sign up", ka: "რეგისტრაცია ვერ შესრულდა" },
  "auth.toasts.signinSuccess": { en: "Welcome back!", ka: "კეთილი იყოს დაბრუნება!" },
  "auth.toasts.signinFail": { en: "Failed to sign in", ka: "შესვლა ვერ შესრულდა" },

  // Dashboard page
  "dashboard.loading": { en: "Loading your dashboard...", ka: "დეშბორდის ჩატვირთვა..." },
  "dashboard.welcome": { en: "Welcome,", ka: "კეთილი იყოს თქვენი მობრძანება," },
  "dashboard.location.set": { en: "Location set", ka: "მდებარეობა მითითებულია" },
  "dashboard.active": { en: "Active", ka: "აქტიური" },
  "dashboard.quick.addCrop.title": { en: "Add Crop", ka: "კულტურის დამატება" },
  "dashboard.quick.addCrop.desc": { en: "Plan a new crop or record a planted one", ka: "დაგეგმეთ ახალი კულტურა ან დაამატეთ უკვე დარგული" },
  "dashboard.quick.myCrops.title": { en: "My Crops", ka: "ჩემი კულტურები" },
  "dashboard.quick.myCrops.desc": { en: "View and manage your crops", ka: "ნახეთ და მართეთ თქვენი კულტურები" },
  "dashboard.quick.myCrops.active": { en: "Active crops", ka: "აქტიური კულტურები" },
  "dashboard.quick.alerts.title": { en: "Alerts", ka: "გაფრთხილებები" },
  "dashboard.quick.alerts.desc": { en: "Current warnings and recommendations", ka: "მიმდინარე გაფრთხილებები და რეკომენდაციები" },
  "dashboard.quick.alerts.active": { en: "Active alerts", ka: "აქტიური გაფრთხილებები" },
  "dashboard.soil.title": { en: "Soil Status", ka: "ნიადაგის სტატუსი" },
  "dashboard.soil.desc": { en: "Current soil conditions at your location", ka: "მიმდინარე ნიადაგის პირობები თქვენს მდებარეობაზე" },
  "dashboard.soil.ph": { en: "pH Level", ka: "pH დონე" },
  "dashboard.soil.nitrogen": { en: "Nitrogen", ka: "აზოტი" },
  "dashboard.soil.phosphorus": { en: "Phosphorus", ka: "ფოსფორი" },
  "dashboard.soil.potassium": { en: "Potassium", ka: "კალიუმი" },
  "dashboard.soil.moisture": { en: "Moisture", ka: "ტენიანობა" },
  "dashboard.badge.good": { en: "Good", ka: "კარგი" },
  "dashboard.badge.low": { en: "Low", ka: "დაბალი" },
  "dashboard.recommendation.title": { en: "Recommendation", ka: "რეკომენდაცია" },
  "dashboard.recommendation.text": {
    en: "Phosphorus levels are low. Consider adding organic compost or bone meal before planting phosphorus-demanding crops.",
    ka: "ფოსფორის დონე დაბალია. განიხილეთ ორგანული კომპოსტისა ან ძვლის ფქვილის დამატება, სანამ ფოსფორზე მაღალი მოთხოვნის მქონე კულტურებს დათესავთ.",
  },
  "dashboard.weather.title": { en: "Weather Alert", ka: "ამინდის გაფრთხილება" },
  "dashboard.weather.text": {
    en: "Moderate fungal risk: High humidity (78% avg) and recent rainfall increase fungal disease risk. Monitor plants closely and ensure good air circulation.",
    ka: "საშუალო სოკოვანი რისკი: მაღალი ტენიანობა (78% საშუალო) და ახლახან მოსული წვიმები ზრდის სოკოვანი დაავადებების რისკს. ყურადღებით აკონტროლეთ მცენარეები და უზრუნველყავით კარგი ვენტილაცია.",
  },
  "dashboard.weather.viewDetails": { en: "View Details", ka: "ვრცლად" },
  "dashboard.toasts.profileFail": { en: "Failed to load profile", ka: "პროფილის ჩატვირთვა ვერ მოხერხდა" },

  // MyCrops page
  "mycrops.loading": { en: "Loading your crops...", ka: "კულტურების ჩატვირთვა..." },
  "mycrops.title": { en: "My Crops", ka: "ჩემი კულტურები" },
  "mycrops.subtitle": { en: "Manage and track all your crops", ka: "მართეთ და აკონტროლეთ თქვენი ყველა კულტურა" },
  "mycrops.addCrop": { en: "Add Crop", ka: "კულტურის დამატება" },
  "mycrops.empty.title": { en: "No crops yet", ka: "ჯერ არ არის კულტურები" },
  "mycrops.empty.subtitle": { en: "Get started by adding your first crop. Track planting dates, receive recommendations, and manage your farm.", ka: "დაიწყეთ თქვენი პირველი კულტურის დამატებით. აკონტროლეთ დარგვის თარიღები, მიიღეთ რეკომენდაციები და მართეთ თქვენი მეურნეობა." },
  "mycrops.empty.addFirst": { en: "Add Your First Crop", ka: "დაამატეთ თქვენი პირველი კულტურა" },
  "mycrops.dates.planted": { en: "Planted:", ka: "დარგულია:" },
  "mycrops.dates.planned": { en: "Planned:", ka: "დაგეგმილი:" },
  "mycrops.addedPrefix": { en: "Added", ka: "დამატებულია" },
  "mycrops.view": { en: "View", ka: "ნახვა" },
  "mycrops.delete": { en: "Delete", ka: "წაშლა" },
  "mycrops.dialog.actions": { en: "Top Actions", ka: "ძირითადი მოქმედებები" },
  "mycrops.dialog.plan": { en: "4-Week Plan", ka: "4-კვირიანი გეგმა" },
  "mycrops.dialog.week": { en: "Week", ka: "კვირა" },
  "mycrops.dialog.risk": { en: "Risk Assessment", ka: "რისკების შეფასება" },
  "mycrops.dialog.mitigation": { en: "Mitigation:", ka: "შერბილება:" },
  "mycrops.dialog.amendments": { en: "Soil Amendments", ka: "ნიადაგის გაუმჯობესება" },
  "mycrops.confirm.title": { en: "Are you sure?", ka: "დარწმუნებული ხართ?" },
  "mycrops.confirm.desc": { en: "This action cannot be undone. This will permanently delete the crop and all associated data.", ka: "ქმედება შეუქცევადია. ეს სამუდამოდ წაშლის კულტურას და მასთან დაკავშირებულ ყველა მონაცემს." },
  "mycrops.confirm.cancel": { en: "Cancel", ka: "გაუქმება" },
  "mycrops.confirm.delete": { en: "Delete", ka: "წაშლა" },
  "mycrops.toasts.loadFail": { en: "Failed to load crops", ka: "კულტურების ჩატვირთვა ვერ მოხერხდა" },
  "mycrops.toasts.deleted": { en: "Crop deleted successfully", ka: "კულტურა წარმატებით წაიშალა" },
  "mycrops.toasts.deleteFail": { en: "Failed to delete crop", ka: "კულტურის წაშლა ვერ მოხერხდა" },

  // Navbar toasts
  "nav.languageUpdated": { en: "Language updated", ka: "ენა განახლებულია" },
  "nav.signedOut": { en: "Signed out", ka: "გასვლა შესრულებულია" },
  "nav.signOutFail": { en: "Failed to sign out", ka: "გასვლა ვერ შესრულდა" },

  // Location Permission
  "location.title": { en: "Location Access", ka: "მდებარეობაზე წვდომა" },
  "location.description": {
    en: "Nergi needs your location to provide personalized crop recommendations based on your local soil and weather conditions",
    ka: "Nergi-ს სჭირდება თქვენი მდებარეობა, რათა მოგაწოდოთ პერსონალიზებული რეკომენდაციები ადგილობრივი ნიადაგისა და ამინდის საფუძველზე",
  },
  "location.info.title": { en: "We use your location to:", ka: "ჩვენ ვიყენებთ თქვენს მდებარეობას შემდეგისთვის:" },
  "location.info.point1": { en: "Provide region-specific planting recommendations", ka: "რეგიონზე მორგებული დარგვის რეკომენდაციები" },
  "location.info.point2": { en: "Access local soil and weather data", ka: "ადგილობრივი ნიადაგისა და ამინდის მონაცემებზე წვდომა" },
  "location.info.point3": { en: "Warn about regional pest risks", ka: "რეგიონული მავნებლების რისკების შესახებ გაფრთხილება" },
  "location.info.point4": { en: "Suggest optimal planting times", ka: "ოპტიმალური დარგვის დროის შეთავაზება" },
  "location.button.loading": { en: "Getting location...", ka: "მდებარეობის მიღება..." },
  "location.button.grant": { en: "Grant Location Access", ka: "მიანიჭეთ წვდომა მდებარეობაზე" },
  "location.footer": {
    en: "Your location data is stored securely and used only for providing agricultural recommendations",
    ka: "თქვენი მდებარეობის მონაცემები უსაფრთხოდ ინახება და გამოიყენება მხოლოდ აგრარული რეკომენდაციებისათვის",
  },
  "location.toast.unsupported": { en: "Geolocation is not supported by your browser", ka: "გეოლოკაცია თქვენს ბრაუზერში მხარდაჭერილი არ არის" },
  "location.toast.saved": { en: "Location saved successfully!", ka: "მდებარეობა წარმატებით შენახულია!" },
  "location.toast.saveFail": { en: "Failed to save location:", ka: "მდებარეობის შენახვა ვერ მოხერხდა:" },
  "location.toast.getFail": { en: "Failed to get location. Please enable location services.", ka: "მდებარეობის მიღება ვერ მოხერხდა. ჩართეთ ლოკაციის სერვისები." },

  // Crop Search
  "cropSearch.label": { en: "Search Crop", ka: "კულტურის ძებნა" },
  "cropSearch.placeholder": { en: "Type to search crops...", ka: "აკრიფეთ კულტურის საძიებლად..." },
  "cropSearch.matching": { en: "Matching crops:", ka: "შემთხვევითი კულტურები:" },
  "cropSearch.popular": { en: "Popular crops:", ka: "პოპულარული კულტურები:" },
  "cropSearch.selected": { en: "Selected:", ka: "არჩევეული:" },

  // Recommendation Display
  "reco.topActions.title": { en: "Top 3 Actions", ka: "საუკეთესო 3 ქმედება" },
  "reco.topActions.desc": { en: "Immediate steps to take", ka: "დაუყოვნելի ნაბიჯები" },
  "reco.soilAmend.title": { en: "Soil Amendments", ka: "ნიადაგის გაუმჯობესება" },
  "reco.calendar.title": { en: "Task Calendar", ka: "ამოცანების კალენდარი" },
  "reco.calendar.desc": { en: "Green dates indicate medicine/pesticide application days", ka: "მწვანე თარიღები მიუთითებს წამლის/პესტიციდის გამოყენების დღეებზე" },
  "reco.calendar.legend": { en: "Medicine/Pesticide Application Dates", ka: "წამლის/პესტიციდის გამოყენების თარიღები" },
  "reco.calendar.upcoming": { en: "Upcoming Tasks by Week", ka: "მომდევნო ამოცანები კვირების მიხედვით" },
  "reco.calendar.week": { en: "Week", ka: "კვირა" },
  "reco.risk.title": { en: "Risk Assessment", ka: "რისკების შეფასება" },
  "reco.risk.desc": { en: "Potential threats and mitigation", ka: "პოტენციური საფრთხეები და შერბილება" },
  "reco.risk.mitigation": { en: "Mitigation:", ka: "შერბილება:" },
  "reco.sources": { en: "Data sources used:", ka: "გამოყენებული მონაცემთა წყაროები:" },
  
  // Pricing page
  "pricing.title": { en: "Simple pricing for every farm", ka: "მარტივი ფასები ნებისმიერი ფერმისთვის" },
  "pricing.subtitle": { en: "Start free, grow as you need. Cancel anytime.", ka: "დაიწყეთ უფასოდ და გაზარდეთ საჭიროებისამებრ. გაუქმება ნებისმიერ დროს." },
  "pricing.perMonth": { en: "/month", ka: "/თვე" },
  "pricing.badge.popular": { en: "Most popular", ka: "ყველაზე პოპულარული" },
  "pricing.cta.startFree": { en: "Start Free", ka: "დაიწყეთ უფასოდ" },
  "pricing.cta.choosePro": { en: "Choose Pro", ka: "აირჩიეთ Pro" },
  "pricing.cta.contactSales": { en: "Contact Sales", ka: "დაკავშირება გაყიდვებთან" },
  "pricing.contactNote": { en: "We’ll tailor the plan to your organization’s needs.", ka: "ჩვენ მოვარგებთ გეგმას თქვენი ორგანიზაციის საჭიროებებს." },
  
  "pricing.plans.free.title": { en: "Free", ka: "უფასო" },
  "pricing.plans.free.subtitle": { en: "Everything to get started", ka: "ყველაფერი დასაწყისისთვის" },
  "pricing.plans.free.price": { en: "$0", ka: "$0" },
  
  "pricing.plans.pro.title": { en: "Pro", ka: "Pro" },
  "pricing.plans.pro.subtitle": { en: "Advanced tools for serious growers", ka: "გაფართოებული ინსტრუმენტები სერიოზული მევენახეებისთვის" },
  "pricing.plans.pro.price": { en: "$19", ka: "$19" },
  
  "pricing.plans.enterprise.title": { en: "Enterprise", ka: "საწარმოო" },
  "pricing.plans.enterprise.subtitle": { en: "For cooperatives and large farms", ka: "კოოპერატივებისა და დიდი ფერმებისთვის" },
  "pricing.plans.enterprise.price": { en: "Custom", ka: "ინდივიდუალური" },
  
  "pricing.features.aiBasic": { en: "Basic AI recommendations", ka: "ბაზური AI რეკომენდაციები" },
  "pricing.features.cropDb": { en: "Access to crop database", ka: "წვდომა კულტურების ბაზასთან" },
  "pricing.features.community": { en: "Community support", ka: "საზოგადოების მხარდაჭერა" },
  
  "pricing.features.aiAdvanced": { en: "Advanced AI recommendations", ka: "გაფართოებული AI რეკომენდაციები" },
  "pricing.features.weeklyPlans": { en: "4-week planting plans", ka: "4-კვირიანი დარგვის გეგმები" },
  "pricing.features.weatherAlerts": { en: "Weather and pest alerts", ka: "ამინდისა და მავნებლების გაფრთხილებები" },
  "pricing.features.soilTracking": { en: "Soil readings & tracking", ka: "ნიადაგის მაჩვენებლები და მონიტორინგი" },
  
  "pricing.features.team": { en: "Multi-user team workspace", ka: "მრავალმომხმარებლიანი სამუშაო გარემო" },
  "pricing.features.api": { en: "API access", ka: "API-ზე წვდომა" },
  "pricing.features.customModels": { en: "Custom crop models", ka: "ინდივიდუალური კულტურის მოდელები" },
  "pricing.features.dedicatedSupport": { en: "Dedicated support", ka: "სპეციალური მხარდაჭერა" },

  // NotFound
  "notFound.subtitle": { en: "Oops! Page not found", ka: "სამწუხაროდ, გვერდი ვერ მოიძებნა" },
  "notFound.backHome": { en: "Return to Home", ka: "დაბრუნდეთ მთავარ გვერდზე" },

  // About page
  "about.title": { en: "About Nergi", ka: "Nergi შესახებ" },
  "about.subtitle": {
    en: "We build AI-powered tools that help Georgian farmers make smarter, safer, and more profitable decisions.",
    ka: "ჩვენ ვქმნით AI ინსტრუმენტებს, რომლებიც ქართულ ფერმერებს ეხმარება მიიღონ უფრო ჭკვიანი, უსაფრთხო და მომგებიანი გადაწყვეტილებები.",
  },
  "about.mission.title": { en: "Our Mission", ka: "ჩვენი მისია" },
  "about.mission.body": {
    en: "Empower every farmer in Georgia with accessible, data-driven insights—improving yields, protecting soil health, and building resilient communities.",
    ka: "საქართველოს თითოეული ფერმერის გაძლიერება ხელმისაწვდომი, მონაცემებზე დაფუძნებული ხედვებით—მოსავლიანობის გაუმჯობესება, ნიადაგის ჯანმრთელობის დაცვა და გამძლე თემების შექმნა.",
  },
  "about.vision.title": { en: "Our Vision", ka: "ჩვენი ხედვა" },
  "about.vision.body": {
    en: "A sustainable agricultural future where technology and tradition work hand-in-hand to feed the nation.",
    ka: "მდგრადი სოფლის მეურნეობის მომავალი, სადაც ტექნოლოგია და ტრადიცია ხელიხელჩაკიდებული კვებავენ ქვეყანას.",
  },
  "about.team.title": { en: "Our Team", ka: "ჩვენი გუნდი" },
  "about.team.body": {
    en: "We’re a small, dedicated team of engineers and agronomists passionate about sustainable farming.",
    ka: "ჩვენ ვართ პატარა, მაგრამ თავდადებული გუნდი—ინჟინრები და აგრონომები, რომლებსაც გული შესტკივათ მდგრად სოფლის მეურნეობაზე.",
  },
  "about.team.member1.name": { en: "Ana", ka: "ანა" },
  "about.team.member1.role": { en: "Agronomist", ka: "აგრონომი" },
  "about.team.member2.name": { en: "Giorgi", ka: "გიორგი" },
  "about.team.member2.role": { en: "ML Engineer", ka: "ML ინჟინერი" },
  "about.team.member3.name": { en: "Nino", ka: "ნინო" },
  "about.team.member3.role": { en: "Frontend Engineer", ka: "ფრონტენდის ინჟინერი" },
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
