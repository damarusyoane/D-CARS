import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslation from './locales/en.json';
import frTranslation from './locales/fr.json';

// Récupération de la langue préférée depuis localStorage ou utilisation de la langue par défaut
const savedLanguage = localStorage.getItem('userLanguage');
const browserLanguage = navigator.language.split('-')[0]; // Détecte la langue du navigateur (fr, en, etc.)
const defaultLanguage = savedLanguage || (browserLanguage === 'fr' ? 'fr' : 'en');

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslation,
      },
      fr: {
        translation: frTranslation,
      },
    },
    lng: defaultLanguage, // Utilise la langue sauvegardée ou détectée
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    // Activation de la détection automatique des changements de langue
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;