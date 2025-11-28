import { createContext, useContext, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AdminEditContextType {
  isEditMode: boolean;
  setEditMode: (mode: boolean) => void;
  canEdit: boolean;
  saveTranslation: (key: string, languageCode: string, value: string) => Promise<void>;
  saveSetting: (key: string, value: string) => Promise<void>;
}

const AdminEditContext = createContext<AdminEditContextType | undefined>(undefined);

export const AdminEditProvider = ({ children }: { children: React.ReactNode }) => {
  const { isAdmin } = useAuth();
  const [isEditMode, setIsEditMode] = useState(false);

  const canEdit = isAdmin && isEditMode;

  const setEditMode = useCallback((mode: boolean) => {
    if (!isAdmin && mode) {
      toast.error('Only admins can enable edit mode');
      return;
    }
    setIsEditMode(mode);
  }, [isAdmin]);

  const saveTranslation = useCallback(async (key: string, languageCode: string, value: string) => {
    const { error } = await supabase
      .from('translations')
      .upsert({
        translation_key: key,
        language_code: languageCode,
        translation_value: value,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'translation_key,language_code'
      });

    if (error) {
      console.error('Error saving translation:', error);
      throw error;
    }
  }, []);

  const saveSetting = useCallback(async (key: string, value: string) => {
    const { error } = await supabase
      .from('site_settings')
      .upsert({
        setting_key: key,
        setting_value: value,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'setting_key'
      });

    if (error) {
      console.error('Error saving setting:', error);
      throw error;
    }
  }, []);

  return (
    <AdminEditContext.Provider value={{ isEditMode, setEditMode, canEdit, saveTranslation, saveSetting }}>
      {children}
    </AdminEditContext.Provider>
  );
};

export const useAdminEdit = () => {
  const context = useContext(AdminEditContext);
  if (context === undefined) {
    throw new Error('useAdminEdit must be used within an AdminEditProvider');
  }
  return context;
};
