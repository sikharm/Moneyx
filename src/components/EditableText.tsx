import { useState } from 'react';
import { Pencil } from 'lucide-react';
import { useAdminEdit } from '@/contexts/AdminEditContext';
import { useLanguage } from '@/contexts/LanguageContext';
import InlineEditDialog from './InlineEditDialog';
import { cn } from '@/lib/utils';

interface EditableTextProps {
  tKey: string;
  fallback?: string;
  className?: string;
  as?: 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div';
}

const EditableText = ({ tKey, fallback, className, as: Component = 'span' }: EditableTextProps) => {
  const { t } = useLanguage();
  const { canEdit } = useAdminEdit();
  const [dialogOpen, setDialogOpen] = useState(false);

  const text = t(tKey);
  const displayText = text === tKey ? (fallback || tKey) : text;

  const handleRefresh = () => {
    // Force reload translations by refreshing the page
    // In a more sophisticated implementation, we could use React Query to refetch
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
          'relative group cursor-pointer inline-flex items-center gap-1 hover:outline hover:outline-2 hover:outline-primary hover:outline-offset-2 rounded'
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
        onSave={handleRefresh}
      />
    </>
  );
};

export default EditableText;
