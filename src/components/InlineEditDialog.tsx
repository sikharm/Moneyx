import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Languages, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAdminEdit } from '@/contexts/AdminEditContext';
import { toast } from 'sonner';

interface Language {
  code: string;
  name: string;
  native_name: string;
}

interface InlineEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  translationKey: string;
  onSave: () => void;
}

const InlineEditDialog = ({ open, onOpenChange, translationKey, onSave }: InlineEditDialogProps) => {
  const { saveTranslation } = useAdminEdit();
  const [languages, setLanguages] = useState<Language[]>([]);
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [translating, setTranslating] = useState(false);

  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open, translationKey]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load languages
      const { data: langData } = await supabase
        .from('languages')
        .select('code, name, native_name')
        .eq('is_active', true)
        .order('code');

      if (langData) setLanguages(langData);

      // Load existing translations for this key
      const { data: transData } = await supabase
        .from('translations')
        .select('language_code, translation_value')
        .eq('translation_key', translationKey);

      if (transData) {
        const transMap: Record<string, string> = {};
        transData.forEach(t => {
          transMap[t.language_code] = t.translation_value;
        });
        setTranslations(transMap);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTranslationChange = (langCode: string, value: string) => {
    setTranslations(prev => ({ ...prev, [langCode]: value }));
  };

  const handleAutoTranslate = async () => {
    const englishText = translations['en'];
    if (!englishText) {
      toast.error('Please enter English text first');
      return;
    }

    setTranslating(true);
    try {
      const { data, error } = await supabase.functions.invoke('translate', {
        body: { 
          text: englishText,
          targetLanguages: languages.filter(l => l.code !== 'en').map(l => l.code)
        }
      });

      if (error) throw error;

      if (data?.translations) {
        setTranslations(prev => ({
          ...prev,
          ...data.translations
        }));
        toast.success('Translation completed!');
      }
    } catch (error) {
      console.error('Translation error:', error);
      toast.error('Failed to auto-translate');
    } finally {
      setTranslating(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const [langCode, value] of Object.entries(translations)) {
        if (value.trim()) {
          await saveTranslation(translationKey, langCode, value.trim());
        }
      }
      toast.success('Translations saved!');
      onSave();
      onOpenChange(false);
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save translations');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Languages className="h-5 w-5" />
            Edit Translation
          </DialogTitle>
          <p className="text-sm text-muted-foreground font-mono break-all">
            Key: {translationKey}
          </p>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            {languages.map((lang) => (
              <div key={lang.code} className="space-y-2">
                <Label className="flex items-center gap-2">
                  <span className="font-medium">{lang.name}</span>
                  <span className="text-muted-foreground">({lang.native_name})</span>
                </Label>
                <Textarea
                  value={translations[lang.code] || ''}
                  onChange={(e) => handleTranslationChange(lang.code, e.target.value)}
                  placeholder={`Enter ${lang.name} translation...`}
                  rows={3}
                />
              </div>
            ))}

            <Button
              variant="outline"
              className="w-full"
              onClick={handleAutoTranslate}
              disabled={translating || !translations['en']}
            >
              {translating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Translating...
                </>
              ) : (
                <>
                  <Languages className="mr-2 h-4 w-4" />
                  Auto-translate from English
                </>
              )}
            </Button>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save All
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InlineEditDialog;
