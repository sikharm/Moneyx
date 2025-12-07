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
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    return localStorage.getItem('language') || 'lo';
  });
  const [languages, setLanguages] = useState<Language[]>([]);
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [englishFallback, setEnglishFallback] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await Promise.all([
        loadLanguages(),
        loadEnglishFallback(),
        loadTranslations(currentLanguage)
      ]);
      setIsLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      loadTranslations(currentLanguage);
    }
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
    
    // Apply Lao font and lang attribute when Lao language is selected
    if (code === 'lo') {
      document.documentElement.classList.add('lang-lao');
      document.documentElement.setAttribute('lang', 'lo');
    } else {
      document.documentElement.classList.remove('lang-lao');
      document.documentElement.setAttribute('lang', code);
    }
  };

  // Apply font and lang attribute on initial load
  useEffect(() => {
    if (currentLanguage === 'lo') {
      document.documentElement.classList.add('lang-lao');
      document.documentElement.setAttribute('lang', 'lo');
    } else {
      document.documentElement.setAttribute('lang', currentLanguage);
    }
  }, [currentLanguage]);

  // Translation function with fallback to English, then to key
  const t = (key: string): string => {
    return translations[key] || englishFallback[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, languages, setLanguage, t, isLoading }}>
      {isLoading ? (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        children
      )}
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
