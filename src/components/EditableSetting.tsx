import { useState, useEffect } from 'react';
import { Pencil, Loader2, Save } from 'lucide-react';
import { useAdminEdit } from '@/contexts/AdminEditContext';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface EditableSettingProps {
  settingKey: string;
  fallback?: string;
  className?: string;
  as?: 'span' | 'p' | 'div' | 'a';
  href?: string;
}

const EditableSetting = ({ settingKey, fallback = '', className, as: Component = 'span', href }: EditableSettingProps) => {
  const { canEdit, saveSetting } = useAdminEdit();
  const [value, setValue] = useState<string>(fallback);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSetting();
  }, [settingKey]);

  const loadSetting = async () => {
    try {
      const { data } = await supabase
        .from('site_settings')
        .select('setting_value')
        .eq('setting_key', settingKey)
        .maybeSingle();

      if (data) {
        setValue(data.setting_value);
      }
    } catch (error) {
      console.error('Error loading setting:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = () => {
    setEditValue(value);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveSetting(settingKey, editValue.trim());
      setValue(editValue.trim());
      toast.success('Setting saved!');
      setDialogOpen(false);
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save setting');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <span className={className}>{fallback}</span>;
  }

  const displayValue = value || fallback;

  // If it's a link and not in edit mode
  if (Component === 'a' && href && !canEdit) {
    return (
      <a href={href} className={className}>
        {displayValue}
      </a>
    );
  }

  if (!canEdit) {
    if (Component === 'a' && href) {
      return <a href={href} className={className}>{displayValue}</a>;
    }
    return <Component className={className}>{displayValue}</Component>;
  }

  return (
    <>
      <Component
        className={cn(
          className,
          'relative group cursor-pointer inline-flex items-center gap-1 hover:outline hover:outline-2 hover:outline-secondary hover:outline-offset-2 rounded'
        )}
        onClick={handleOpenDialog}
      >
        {displayValue}
        <Pencil className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-secondary flex-shrink-0" />
      </Component>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Setting</DialogTitle>
            <p className="text-sm text-muted-foreground font-mono">
              Key: {settingKey}
            </p>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Value</Label>
              <Input
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                placeholder="Enter value..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
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
                  Save
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EditableSetting;
