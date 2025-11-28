import { Pencil, PencilOff } from 'lucide-react';
import { useAdminEdit } from '@/contexts/AdminEditContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const AdminEditToggle = () => {
  const { isAdmin } = useAuth();
  const { isEditMode, setEditMode } = useAdminEdit();

  // Only show for admins
  if (!isAdmin) return null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={isEditMode ? 'default' : 'outline'}
          size="icon"
          className={cn(
            'fixed bottom-20 right-4 z-50 h-12 w-12 rounded-full shadow-lg transition-all duration-300',
            isEditMode 
              ? 'bg-primary text-primary-foreground animate-pulse' 
              : 'bg-background border-2 hover:border-primary'
          )}
          onClick={() => setEditMode(!isEditMode)}
        >
          {isEditMode ? (
            <PencilOff className="h-5 w-5" />
          ) : (
            <Pencil className="h-5 w-5" />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="left">
        <p>{isEditMode ? 'Exit Edit Mode' : 'Enter Edit Mode'}</p>
      </TooltipContent>
    </Tooltip>
  );
};

export default AdminEditToggle;
