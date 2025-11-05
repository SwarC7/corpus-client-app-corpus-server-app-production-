import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import axios from "axios";

// HARDCODED for local testing
const API_BASE = "http://localhost:8000/api/v1";

console.log("[i18n.js] API_BASE configured as:", API_BASE);

// Initialize with empty resources
i18n
  .use(initReactI18next)
  .init({
    resources: {},
    fallbackLng: "en",
    debug: false,  // Disable for production
    interpolation: {
      escapeValue: false,
    },
  });

// Function to load translations from backend
export async function loadTranslations(lang) {
  try {
    console.log(`Loading translations for: ${lang}`);
    const response = await axios.get(`${API_BASE}/i18n/translations/${lang}`);
    const translations = response.data;
    
    console.log(`Loaded translations for ${lang}:`, translations);
    
    // Transform backend format to i18next format
    // Backend uses dot notation: "ui.login.title"
    // i18next can handle this directly
    i18n.addResourceBundle(lang, "translation", translations, true, true);
    await i18n.changeLanguage(lang);
    
    return translations;
  } catch (error) {
    console.error(`Failed to load translations for ${lang}:`, error);
    // Fallback to English if loading fails
    if (lang !== "en") {
      return loadTranslations("en");
    }
    throw error;
  }
}

export default i18n;
