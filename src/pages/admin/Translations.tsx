import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Languages, Loader2, Check, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Translation {
  id: string;
  language_code: string;
  translation_key: string;
  translation_value: string;
  category: string;
}

interface Language {
  code: string;
  name: string;
  native_name: string;
}

interface GroupedTranslation {
  key: string;
  category: string;
  translations: Record<string, { id: string; value: string }>;
}

const Translations = () => {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [allTranslations, setAllTranslations] = useState<Translation[]>([]);
  const [groupedTranslations, setGroupedTranslations] = useState<GroupedTranslation[]>([]);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [isTranslating, setIsTranslating] = useState(false);
  const [newTranslation, setNewTranslation] = useState({
    key: '',
    value: '',
    category: 'general',
    sourceLang: 'en',
  });

  useEffect(() => {
    loadLanguages();
    loadAllTranslations();
  }, []);

  useEffect(() => {
    groupTranslationsByKey();
  }, [allTranslations, languages]);

  const loadLanguages = async () => {
    const { data } = await supabase
      .from('languages')
      .select('code, name, native_name')
      .eq('is_active', true);
    
    if (data) setLanguages(data);
  };

  const loadAllTranslations = async () => {
    const { data } = await supabase
      .from('translations')
      .select('*')
      .order('translation_key');
    
    if (data) setAllTranslations(data);
  };

  const groupTranslationsByKey = () => {
    const grouped: Record<string, GroupedTranslation> = {};
    
    allTranslations.forEach(trans => {
      if (!grouped[trans.translation_key]) {
        grouped[trans.translation_key] = {
          key: trans.translation_key,
          category: trans.category,
          translations: {},
        };
      }
      grouped[trans.translation_key].translations[trans.language_code] = {
        id: trans.id,
        value: trans.translation_value,
      };
    });

    setGroupedTranslations(Object.values(grouped).sort((a, b) => a.key.localeCompare(b.key)));
  };

  const translateText = async (text: string, sourceLang: string, targetLangs: string[]) => {
    const { data, error } = await supabase.functions.invoke('translate', {
      body: { text, sourceLanguage: sourceLang, targetLanguages: targetLangs },
    });

    if (error) {
      console.error('Translation error:', error);
      throw new Error(error.message || 'Translation failed');
    }

    return data.translations as Record<string, string>;
  };

  const handleAddWithAutoTranslate = async () => {
    if (!newTranslation.key || !newTranslation.value) {
      toast.error('Key and value are required');
      return;
    }

    setIsTranslating(true);
    
    try {
      // Get all target languages
      const targetLangs = languages.map(l => l.code);
      
      // Translate to all languages
      const translations = await translateText(
        newTranslation.value,
        newTranslation.sourceLang,
        targetLangs
      );

      // Insert all translations
      const insertData = targetLangs.map(langCode => ({
        language_code: langCode,
        translation_key: newTranslation.key,
        translation_value: translations[langCode] || newTranslation.value,
        category: newTranslation.category,
      }));

      const { error } = await supabase.from('translations').insert(insertData);

      if (error) throw error;

      toast.success(`Translation added in ${targetLangs.length} languages`);
      setNewTranslation({ key: '', value: '', category: 'general', sourceLang: 'en' });
      loadAllTranslations();
    } catch (error: any) {
      console.error('Add translation error:', error);
      toast.error(error.message || 'Failed to add translation');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleStartEdit = (group: GroupedTranslation) => {
    setEditingKey(group.key);
    const values: Record<string, string> = {};
    languages.forEach(lang => {
      values[lang.code] = group.translations[lang.code]?.value || '';
    });
    setEditValues(values);
  };

  const handleSaveEdit = async (group: GroupedTranslation) => {
    try {
      for (const lang of languages) {
        const existing = group.translations[lang.code];
        const newValue = editValues[lang.code];

        if (existing) {
          // Update existing
          await supabase
            .from('translations')
            .update({ translation_value: newValue, updated_at: new Date().toISOString() })
            .eq('id', existing.id);
        } else if (newValue) {
          // Insert new
          await supabase.from('translations').insert({
            language_code: lang.code,
            translation_key: group.key,
            translation_value: newValue,
            category: group.category,
          });
        }
      }

      toast.success('Translations updated');
      setEditingKey(null);
      loadAllTranslations();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update');
    }
  };

  const handleAutoTranslateExisting = async (group: GroupedTranslation) => {
    // Find the first available translation to use as source
    const sourceLang = languages.find(l => group.translations[l.code]?.value);
    if (!sourceLang) {
      toast.error('No source translation found');
      return;
    }

    const sourceText = group.translations[sourceLang.code].value;
    const missingLangs = languages
      .filter(l => !group.translations[l.code]?.value)
      .map(l => l.code);

    if (missingLangs.length === 0) {
      toast.info('All translations already exist');
      return;
    }

    setIsTranslating(true);
    try {
      const translations = await translateText(sourceText, sourceLang.code, missingLangs);

      const insertData = missingLangs.map(langCode => ({
        language_code: langCode,
        translation_key: group.key,
        translation_value: translations[langCode] || sourceText,
        category: group.category,
      }));

      const { error } = await supabase.from('translations').insert(insertData);
      if (error) throw error;

      toast.success(`Added ${missingLangs.length} missing translations`);
      loadAllTranslations();
    } catch (error: any) {
      toast.error(error.message || 'Auto-translate failed');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleDelete = async (key: string) => {
    if (!confirm(`Delete all translations for "${key}"?`)) return;

    try {
      const { error } = await supabase
        .from('translations')
        .delete()
        .eq('translation_key', key);

      if (error) throw error;
      toast.success('Translations deleted');
      loadAllTranslations();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete');
    }
  };

  const getLanguageStatus = (group: GroupedTranslation, langCode: string) => {
    return group.translations[langCode]?.value ? 'complete' : 'missing';
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Translations</h1>
        <p className="text-muted-foreground">
          Add content in one language and auto-translate to all others using AI
        </p>
      </div>

      {/* Add New Translation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Languages className="h-5 w-5" />
            Add New Translation (Auto-Translate)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Key</Label>
              <Input
                placeholder="nav.home"
                value={newTranslation.key}
                onChange={(e) => setNewTranslation({ ...newTranslation, key: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Input
                placeholder="general"
                value={newTranslation.category}
                onChange={(e) => setNewTranslation({ ...newTranslation, category: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Source Language</Label>
              <Select
                value={newTranslation.sourceLang}
                onValueChange={(val) => setNewTranslation({ ...newTranslation, sourceLang: val })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.native_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button 
                onClick={handleAddWithAutoTranslate} 
                className="w-full"
                disabled={isTranslating}
              >
                {isTranslating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Translating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Add & Auto-Translate
                  </>
                )}
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Value (in {languages.find(l => l.code === newTranslation.sourceLang)?.native_name || 'English'})</Label>
            <Textarea
              placeholder="Enter the text in your source language..."
              value={newTranslation.value}
              onChange={(e) => setNewTranslation({ ...newTranslation, value: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Translation List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">All Translations ({groupedTranslations.length})</h2>
        
        {groupedTranslations.map((group) => (
          <Card key={group.key}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-sm font-medium">{group.key}</span>
                    <Badge variant="secondary" className="text-xs">{group.category}</Badge>
                  </div>
                  <div className="flex gap-1">
                    {languages.map(lang => (
                      <Badge
                        key={lang.code}
                        variant={getLanguageStatus(group, lang.code) === 'complete' ? 'default' : 'outline'}
                        className="text-xs"
                      >
                        {getLanguageStatus(group, lang.code) === 'complete' ? (
                          <Check className="h-3 w-3 mr-1" />
                        ) : (
                          <AlertCircle className="h-3 w-3 mr-1" />
                        )}
                        {lang.code.toUpperCase()}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  {languages.some(l => !group.translations[l.code]?.value) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAutoTranslateExisting(group)}
                      disabled={isTranslating}
                    >
                      {isTranslating ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Languages className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editingKey === group.key ? setEditingKey(null) : handleStartEdit(group)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(group.key)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {editingKey === group.key ? (
                <div className="space-y-3">
                  {languages.map(lang => (
                    <div key={lang.code} className="space-y-1">
                      <Label className="text-xs">{lang.native_name} ({lang.code})</Label>
                      <Textarea
                        value={editValues[lang.code] || ''}
                        onChange={(e) => setEditValues({ ...editValues, [lang.code]: e.target.value })}
                        rows={2}
                      />
                    </div>
                  ))}
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" onClick={() => handleSaveEdit(group)}>
                      Save All
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingKey(null)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {languages.map(lang => (
                    <div key={lang.code} className="bg-muted/50 rounded p-2">
                      <span className="text-xs text-muted-foreground block mb-1">
                        {lang.native_name}
                      </span>
                      <p className="text-sm">
                        {group.translations[lang.code]?.value || (
                          <span className="text-muted-foreground italic">Not translated</span>
                        )}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {groupedTranslations.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              No translations yet. Add your first translation above.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Translations;
