import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Save } from 'lucide-react';

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

const Translations = () => {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [selectedLang, setSelectedLang] = useState('en');
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newTranslation, setNewTranslation] = useState({
    key: '',
    value: '',
    category: 'general',
  });

  useEffect(() => {
    loadLanguages();
  }, []);

  useEffect(() => {
    if (selectedLang) loadTranslations();
  }, [selectedLang]);

  const loadLanguages = async () => {
    const { data } = await supabase
      .from('languages')
      .select('code, name, native_name')
      .eq('is_active', true);
    
    if (data) setLanguages(data);
  };

  const loadTranslations = async () => {
    const { data } = await supabase
      .from('translations')
      .select('*')
      .eq('language_code', selectedLang)
      .order('translation_key');
    
    if (data) setTranslations(data);
  };

  const handleAdd = async () => {
    if (!newTranslation.key || !newTranslation.value) {
      toast.error('Key and value are required');
      return;
    }

    try {
      const { error } = await supabase.from('translations').insert({
        language_code: selectedLang,
        translation_key: newTranslation.key,
        translation_value: newTranslation.value,
        category: newTranslation.category,
      });

      if (error) throw error;
      toast.success('Translation added');
      setNewTranslation({ key: '', value: '', category: 'general' });
      loadTranslations();
    } catch (error: any) {
      toast.error(error.message || 'Failed to add translation');
    }
  };

  const handleUpdate = async (id: string, value: string) => {
    try {
      const { error } = await supabase
        .from('translations')
        .update({ translation_value: value, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      toast.success('Translation updated');
      setEditingId(null);
      loadTranslations();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update translation');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this translation?')) return;

    try {
      const { error } = await supabase.from('translations').delete().eq('id', id);
      if (error) throw error;
      toast.success('Translation deleted');
      loadTranslations();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete translation');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Translations</h1>
        <p className="text-muted-foreground">Manage multi-language content for your site</p>
      </div>

      <div className="flex gap-4 items-center">
        <Label>Language:</Label>
        <Select value={selectedLang} onValueChange={setSelectedLang}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {languages.map((lang) => (
              <SelectItem key={lang.code} value={lang.code}>
                {lang.native_name} ({lang.name})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add New Translation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Key</Label>
              <Input
                placeholder="home.welcome"
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
              <Label>&nbsp;</Label>
              <Button onClick={handleAdd} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Translation
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Value</Label>
            <Textarea
              placeholder="Translation value"
              value={newTranslation.value}
              onChange={(e) => setNewTranslation({ ...newTranslation, value: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {translations.map((trans) => (
          <Card key={trans.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm text-muted-foreground">{trans.translation_key}</span>
                    <span className="text-xs text-muted-foreground">({trans.category})</span>
                  </div>
                  {editingId === trans.id ? (
                    <Textarea
                      defaultValue={trans.translation_value}
                      onBlur={(e) => handleUpdate(trans.id, e.target.value)}
                      autoFocus
                    />
                  ) : (
                    <p className="text-sm">{trans.translation_value}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingId(editingId === trans.id ? null : trans.id)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(trans.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Translations;