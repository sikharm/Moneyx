import { useState, useEffect, useRef } from 'react';
import { Pencil } from 'lucide-react';
import { useAdminEdit } from '@/contexts/AdminEditContext';
import { useLanguage } from '@/contexts/LanguageContext';
import InlineEditDialog from './InlineEditDialog';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface EditableTextProps {
  tKey: string;
  fallback?: string;
  className?: string;
  as?: 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div';
}

// Cache to prevent duplicate registration attempts in the same session
const registrationCache = new Set<string>();

const EditableText = ({ tKey, fallback, className, as: Component = 'span' }: EditableTextProps) => {
  const { t } = useLanguage();
  const { canEdit } = useAdminEdit();
  const [dialogOpen, setDialogOpen] = useState(false);
  const hasAttemptedRegistration = useRef(false);

  const text = t(tKey);
  // If the translation returns the key itself, it means no translation exists
  const isMissing = text === tKey;
  const displayText = isMissing ? (fallback || tKey) : text;

  // Auto-register missing translations
  useEffect(() => {
    if (isMissing && fallback && !hasAttemptedRegistration.current && !registrationCache.has(tKey)) {
      hasAttemptedRegistration.current = true;
      registrationCache.add(tKey);
      
      // Extract category from key (e.g., "admin.subscriptions.title" -> "admin")
      const category = tKey.split('.')[0] || 'general';
      
      // Fire and forget - don't block rendering
      supabase.functions.invoke('auto-register-translation', {
        body: { 
          translationKey: tKey, 
          fallbackText: fallback,
          category 
        }
      }).then(({ error }) => {
        if (error) {
          console.warn(`Failed to auto-register translation for ${tKey}:`, error);
        } else {
          console.log(`Auto-registered translation: ${tKey}`);
        }
      }).catch(err => {
        console.warn(`Error auto-registering translation for ${tKey}:`, err);
      });
    }
  }, [tKey, fallback, isMissing]);

  const handleRefresh = () => {
    // Force reload translations by refreshing the page
    window.location.reload();
  };

  if (!canEdit) {
    return <Component className={className}>{displayText}</Component>;
  }

  return (
    <>
      <Component
        className={cn(
          className,
          'relative group cursor-pointer inline-flex items-center gap-1 hover:outline hover:outline-2 hover:outline-primary hover:outline-offset-2 rounded',
          isMissing && 'outline outline-1 outline-dashed outline-amber-500/50'
        )}
        onClick={() => setDialogOpen(true)}
      >
        {displayText}
        <Pencil className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-primary flex-shrink-0" />
      </Component>

      <InlineEditDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        translationKey={tKey}
        defaultValue={fallback}
        onSave={handleRefresh}
      />
    </>
  );
};

export default EditableText;
