import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const translations = {
  en: {
    // Navigation & Buttons
    howItWorks: "How It Works",
    features: "Features",
    privacy: "Privacy",
    startTracking: "Start Tracking Free →",
    loginRegister: "Log In / Register",
    dashboard: "Dashboard",
    tracker: "Calendar",
    insights: "Insights",
    wellness: "Nuskhe",
    logOut: "Log Out",
    loggedIn: "Logged in",
    uploadPhoto: "Upload Photo",
    saveName: "Save Name",
    editProfile: "Edit Profile Name",

    // Dashboard Header & Cards
    goodMorning: "Good morning",
    goodAfternoon: "Good afternoon",
    goodEvening: "Good evening",
    wellnessOverview: "Here is your wellness overview for today.",
    dailyLogTitle: "Daily Wellness Log",
    dailyLogDesc: "Log your flow, mood & symptoms to update your daily guidance",
    menstrualFlow: "💧 Menstrual Flow",
    flowNone: "None",
    flowLight: "Light",
    flowMedium: "Medium",
    flowHeavy: "Heavy",
    todaysMood: "😊 Today's Mood",
    discomfortLog: "🩹 Discomfort Symptoms Log",
    waterIntakeTitle: "💧 Water Intake Today (ml)",
    sleepLoggedTitle: "🌙 Hours of Sleep Logged",
    moodStatusTitle: "Mood & Energy Status",
    confirmSave: "Save Today's Log",
    fullLogForm: "Full Log Form",

    // Dashboard Action Plan & Remedies
    dailyActionPlan: "Daily Action Plan",
    symptomRemedies: "Symptom Remedies",
    noDiscomfort: "No physical discomfort logged for today 🎉",
    discomfortSub: "Select a symptom in the log form above to view personalized natural Desi Nuskhe remedies!",
    phase: "Phase",

    // Symptoms
    cramps: "⚡ Cramps",
    bloating: "🎈 Bloating",
    headache: "🤕 Headache",
    fatigue: "😴 Fatigue",
    back_pain: "🦴 Back Pain",
    acne: "✨ Acne",
    mood_swings: "🌊 Mood Swings",
    cravings: "🍫 Cravings",
    nausea: "🤢 Nausea",
    breast_tenderness: "🌸 Sensitivity",
  },
  hi: {
    // Navigation & Buttons
    howItWorks: "यह कैसे काम करता है",
    features: "विशेषताएं",
    privacy: "गोपनीयता",
    startTracking: "मुफ्त में शुरू करें →",
    loginRegister: "लॉग इन / रजिस्टर",
    dashboard: "डैशबोर्ड",
    tracker: "कैलेंडर",
    insights: "इनसाइट्स",
    wellness: "देशी नुस्खे",
    logOut: "लॉग आउट",
    loggedIn: "लॉग इन हैं",
    uploadPhoto: "फोटो बदलें",
    saveName: "नाम सेव करें",
    editProfile: "नाम बदलें",

    // Dashboard Header & Cards
    goodMorning: "शुभ प्रभात",
    goodAfternoon: "नमस्कार",
    goodEvening: "शुभ संध्या",
    wellnessOverview: "यह आज का आपका स्वास्थ्य अवलोकन है।",
    dailyLogTitle: "दैनिक स्वास्थ्य लॉग",
    dailyLogDesc: "अपनी सलाह अपडेट करने के लिए फ्लो, मूड और लक्षण दर्ज करें",
    menstrualFlow: "💧 मेंस्ट्रुअल फ्लो",
    flowNone: "कुछ नहीं",
    flowLight: "हल्का",
    flowMedium: "मध्यम",
    flowHeavy: "भारी",
    todaysMood: "😊 आज का मूड",
    discomfortLog: "🩹 लक्षण व असुविधा दर्ज करें",
    waterIntakeTitle: "💧 आज का पानी (मि.ली.)",
    sleepLoggedTitle: "🌙 आज की नींद (घंटे)",
    moodStatusTitle: "मूड और ऊर्जा की स्थिति",
    confirmSave: "आज का लॉग सेव करें",
    fullLogForm: "पूरा लॉग फॉर्म",

    // Dashboard Action Plan & Remedies
    dailyActionPlan: "दैनिक कार्य योजना",
    symptomRemedies: "घरेलू उपचार (देशी नुस्खे)",
    noDiscomfort: "आज कोई शारीरिक असुविधा दर्ज नहीं की गई है 🎉",
    discomfortSub: "ऊपर लॉग फॉर्म में लक्षण चुनें और प्राकृतिक देशी नुस्खे देखें!",
    phase: "फेज",

    // Symptoms
    cramps: "⚡ ऐंठन / दर्द",
    bloating: "🎈 पेट फूलना",
    headache: "🤕 सिर दर्द",
    fatigue: "😴 थकान",
    back_pain: "🦴 कमर दर्द",
    acne: "✨ मुहांसे / एक्ने",
    mood_swings: "🌊 चिड़चिड़ापन",
    cravings: "🍫 मीठे की चाहत",
    nausea: "🤢 जी मिचलाना",
    breast_tenderness: "🌸 संवेदनशीलता",
  }
};

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => localStorage.getItem('app_lang') || 'en');

  useEffect(() => {
    localStorage.setItem('app_lang', lang);
  }, [lang]);

  const toggleLanguage = () => {
    setLang(prev => prev === 'en' ? 'hi' : 'en');
  };

  const t = (key) => {
    return translations[lang]?.[key] || translations['en']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
