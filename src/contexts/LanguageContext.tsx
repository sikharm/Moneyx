import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Language {
  code: string;
  name: string;
  native_name: string;
}

interface LanguageContextType {
  currentLanguage: string;
  languages: Language[];
  setLanguage: (code: string) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    return localStorage.getItem('language') || 'en';
  });
  const [languages, setLanguages] = useState<Language[]>([]);
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [englishFallback, setEnglishFallback] = useState<Record<string, string>>({});

  useEffect(() => {
    loadLanguages();
    loadEnglishFallback();
  }, []);

  useEffect(() => {
    loadTranslations(currentLanguage);
  }, [currentLanguage]);

  const loadLanguages = async () => {
    const { data } = await supabase
      .from('languages')
      .select('code, name, native_name')
      .eq('is_active', true);
    
    if (data) setLanguages(data);
  };

  const loadEnglishFallback = async () => {
    const { data } = await supabase
      .from('translations')
      .select('translation_key, translation_value')
      .eq('language_code', 'en');
    
    if (data) {
      const translationMap: Record<string, string> = {};
      data.forEach(t => {
        translationMap[t.translation_key] = t.translation_value;
      });
      setEnglishFallback(translationMap);
    }
  };

  const loadTranslations = async (langCode: string) => {
    const { data } = await supabase
      .from('translations')
      .select('translation_key, translation_value')
      .eq('language_code', langCode);
    
    if (data) {
      const translationMap: Record<string, string> = {};
      data.forEach(t => {
        translationMap[t.translation_key] = t.translation_value;
      });
      setTranslations(translationMap);
    }
  };

  const setLanguage = (code: string) => {
    setCurrentLanguage(code);
    localStorage.setItem('language', code);
  };

  // Translation function with fallback to English, then to key
  const t = (key: string): string => {
    return translations[key] || englishFallback[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, languages, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
