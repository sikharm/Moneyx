import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Languages, Loader2, Check, AlertCircle, Search, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

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

interface ExpectedTranslation {
  value: string;
  category: string;
}

interface MissingKey {
  key: string;
  defaultValue: string;
  category: string;
}

const Translations = () => {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [allTranslations, setAllTranslations] = useState<Translation[]>([]);
  const [groupedTranslations, setGroupedTranslations] = useState<GroupedTranslation[]>([]);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [isTranslating, setIsTranslating] = useState(false);
  const [isBulkTranslating, setIsBulkTranslating] = useState(false);
  const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0 });
  const [newTranslation, setNewTranslation] = useState({
    key: '',
    value: '',
    category: 'general',
    sourceLang: 'en',
  });

  // Missing keys state
  const [missingKeys, setMissingKeys] = useState<MissingKey[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [showMissingKeys, setShowMissingKeys] = useState(true);
  const [isAddingMissing, setIsAddingMissing] = useState(false);
  const [addMissingProgress, setAddMissingProgress] = useState({ current: 0, total: 0 });

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

  // Scan for missing translation keys
  const handleScanMissingKeys = async () => {
    setIsScanning(true);
    try {
      // Fetch fresh translations from database to ensure we have latest data
      const { data: freshTranslations, error: fetchError } = await supabase
        .from('translations')
        .select('translation_key')
        .order('translation_key');
      
      if (fetchError) {
        throw new Error(fetchError.message || 'Failed to fetch existing translations');
      }

      // Get expected translations from edge function
      const { data, error } = await supabase.functions.invoke('get-expected-translations');
      
      if (error) {
        throw new Error(error.message || 'Failed to get expected translations');
      }

      const expectedTranslations = data.translations as Record<string, ExpectedTranslation>;
      // Use fresh data from database, not stale state
      const existingKeys = new Set(freshTranslations?.map(t => t.translation_key) || []);

      // Find missing keys
      const missing: MissingKey[] = [];
      for (const [key, info] of Object.entries(expectedTranslations)) {
        if (!existingKeys.has(key)) {
          missing.push({
            key,
            defaultValue: info.value,
            category: info.category,
          });
        }
      }

      setMissingKeys(missing);
      
      // Also refresh the state with latest data
      loadAllTranslations();
      
      if (missing.length === 0) {
        toast.success('All translation keys are present!');
      } else {
        toast.info(`Found ${missing.length} missing translation keys`);
      }
    } catch (error: any) {
      console.error('Scan error:', error);
      toast.error(error.message || 'Failed to scan for missing keys');
    } finally {
      setIsScanning(false);
    }
  };

  // Add and auto-translate all missing keys
  const handleAddAllMissingKeys = async () => {
    if (missingKeys.length === 0) {
      toast.info('No missing keys to add');
      return;
    }

    if (!confirm(`This will add and auto-translate ${missingKeys.length} missing keys to all languages. Continue?`)) {
      return;
    }

    setIsAddingMissing(true);
    setAddMissingProgress({ current: 0, total: missingKeys.length });

    const targetLangs = languages.map(l => l.code);
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < missingKeys.length; i++) {
      const missing = missingKeys[i];
      setAddMissingProgress({ current: i + 1, total: missingKeys.length });

      try {
        // Translate to all languages
        const translations = await translateText(missing.defaultValue, 'en', targetLangs);

        // Insert all translations
        const insertData = targetLangs.map(langCode => ({
          language_code: langCode,
          translation_key: missing.key,
          translation_value: translations[langCode] || missing.defaultValue,
          category: missing.category,
        }));

        const { error } = await supabase.from('translations').insert(insertData);
        if (error) throw error;

        successCount++;

        // Small delay to avoid rate limiting
        if (i < missingKeys.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } catch (error: any) {
        console.error(`Failed to add key ${missing.key}:`, error);
        errorCount++;

        // If rate limited, wait longer
        if (error.message?.includes('Rate limit') || error.message?.includes('429')) {
          toast.error('Rate limit reached. Waiting 10 seconds...');
          await new Promise(resolve => setTimeout(resolve, 10000));
        }
      }
    }

    setIsAddingMissing(false);
    setAddMissingProgress({ current: 0, total: 0 });
    loadAllTranslations();
    setMissingKeys([]);

    if (successCount > 0) {
      toast.success(`Successfully added ${successCount} translation keys`);
    }
    if (errorCount > 0) {
      toast.error(`Failed to add ${errorCount} keys`);
    }
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

  // Get groups that have missing translations
  const getGroupsWithMissingTranslations = () => {
    return groupedTranslations.filter(group => 
      languages.some(lang => !group.translations[lang.code]?.value)
    );
  };

  // Bulk translate all missing translations
  const handleBulkTranslateAll = async () => {
    const groupsToTranslate = getGroupsWithMissingTranslations();
    
    if (groupsToTranslate.length === 0) {
      toast.info('All translations are complete!');
      return;
    }

    if (!confirm(`This will auto-translate ${groupsToTranslate.length} keys with missing translations. Continue?`)) {
      return;
    }

    setIsBulkTranslating(true);
    setBulkProgress({ current: 0, total: groupsToTranslate.length });

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < groupsToTranslate.length; i++) {
      const group = groupsToTranslate[i];
      setBulkProgress({ current: i + 1, total: groupsToTranslate.length });

      try {
        // Find source translation (prefer English)
        const sourceLang = languages.find(l => l.code === 'en' && group.translations['en']?.value) 
          || languages.find(l => group.translations[l.code]?.value);
        
        if (!sourceLang) {
          console.warn(`No source translation for key: ${group.key}`);
          errorCount++;
          continue;
        }

        const sourceText = group.translations[sourceLang.code].value;
        const missingLangs = languages
          .filter(l => !group.translations[l.code]?.value)
          .map(l => l.code);

        if (missingLangs.length === 0) continue;

        const translations = await translateText(sourceText, sourceLang.code, missingLangs);

        const insertData = missingLangs.map(langCode => ({
          language_code: langCode,
          translation_key: group.key,
          translation_value: translations[langCode] || sourceText,
          category: group.category,
        }));

        const { error } = await supabase.from('translations').insert(insertData);
        if (error) throw error;

        successCount++;

        // Small delay to avoid rate limiting
        if (i < groupsToTranslate.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } catch (error: any) {
        console.error(`Failed to translate key ${group.key}:`, error);
        errorCount++;
        
        // If rate limited, wait longer
        if (error.message?.includes('Rate limit') || error.message?.includes('429')) {
          toast.error('Rate limit reached. Waiting 10 seconds...');
          await new Promise(resolve => setTimeout(resolve, 10000));
        }
      }
    }

    setIsBulkTranslating(false);
    setBulkProgress({ current: 0, total: 0 });
    loadAllTranslations();

    if (successCount > 0) {
      toast.success(`Successfully translated ${successCount} keys`);
    }
    if (errorCount > 0) {
      toast.error(`Failed to translate ${errorCount} keys`);
    }
  };

  const incompleteCount = getGroupsWithMissingTranslations().length;

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-bold mb-2">Translations</h1>
          <p className="text-muted-foreground">
            Add content in one language and auto-translate to all others using AI
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={handleScanMissingKeys}
            disabled={isScanning}
            variant="outline"
          >
            {isScanning ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Scan Missing Keys
              </>
            )}
          </Button>
          {incompleteCount > 0 && (
            <Button 
              onClick={handleBulkTranslateAll}
              disabled={isBulkTranslating}
              variant="default"
            >
              {isBulkTranslating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Translating {bulkProgress.current}/{bulkProgress.total}...
                </>
              ) : (
                <>
                  <Languages className="h-4 w-4 mr-2" />
                  Translate Incomplete ({incompleteCount})
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Progress bar for bulk operations */}
      {(isBulkTranslating || isAddingMissing) && (
        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
          <div 
            className="bg-primary h-full transition-all duration-300"
            style={{ 
              width: `${((isBulkTranslating ? bulkProgress.current : addMissingProgress.current) / 
                        (isBulkTranslating ? bulkProgress.total : addMissingProgress.total)) * 100}%` 
            }}
          />
        </div>
      )}

      {/* Missing Keys Section */}
      {missingKeys.length > 0 && (
        <Card className="border-2 border-destructive/50 bg-destructive/5">
          <Collapsible open={showMissingKeys} onOpenChange={setShowMissingKeys}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                  <CardTitle className="text-lg">Missing Keys Found ({missingKeys.length})</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleAddAllMissingKeys}
                    disabled={isAddingMissing}
                    size="sm"
                  >
                    {isAddingMissing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Adding {addMissingProgress.current}/{addMissingProgress.total}...
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4 mr-2" />
                        Auto-Translate All Missing
                      </>
                    )}
                  </Button>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm">
                      {showMissingKeys ? 'Hide' : 'Show'}
                    </Button>
                  </CollapsibleTrigger>
                </div>
              </div>
            </CardHeader>
            <CollapsibleContent>
              <CardContent className="pt-0">
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {missingKeys.map((missing) => (
                    <div key={missing.key} className="flex items-center justify-between p-2 bg-background rounded border">
                      <div>
                        <span className="font-mono text-sm">{missing.key}</span>
                        <Badge variant="secondary" className="ml-2 text-xs">{missing.category}</Badge>
                      </div>
                      <span className="text-sm text-muted-foreground truncate max-w-xs">
                        "{missing.defaultValue}"
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      )}

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
