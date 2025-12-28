import { useState, useEffect } from "react";
import { Plus, Trash2, GripVertical, Loader2, Settings2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface TradingSystem {
  id: string;
  value: string;
  label: string;
  is_active: boolean;
  display_order: number;
}

interface ManageTradingSystemsDialogProps {
  trigger?: React.ReactNode;
  onSystemsUpdated?: () => void;
}

export function ManageTradingSystemsDialog({ trigger, onSystemsUpdated }: ManageTradingSystemsDialogProps) {
  const [open, setOpen] = useState(false);
  const [systems, setSystems] = useState<TradingSystem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // New system form
  const [newValue, setNewValue] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (open) {
      loadSystems();
    }
  }, [open]);

  const loadSystems = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('trading_systems')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      setSystems(data || []);
    } catch (error: any) {
      toast.error("Failed to load trading systems: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSystem = async () => {
    if (!newValue.trim() || !newLabel.trim()) {
      toast.error("Both value and label are required");
      return;
    }

    // Validate value format (lowercase, underscores only)
    const valueFormat = /^[a-z0-9_]+$/;
    if (!valueFormat.test(newValue.trim())) {
      toast.error("Value must be lowercase letters, numbers, and underscores only");
      return;
    }

    setAdding(true);
    try {
      const maxOrder = systems.length > 0 ? Math.max(...systems.map(s => s.display_order)) : 0;
      
      const { error } = await supabase
        .from('trading_systems')
        .insert({
          value: newValue.trim().toLowerCase(),
          label: newLabel.trim(),
          display_order: maxOrder + 1,
        });

      if (error) {
        if (error.code === '23505') {
          throw new Error("A trading system with this value already exists");
        }
        throw error;
      }

      toast.success("Trading system added successfully");
      setNewValue("");
      setNewLabel("");
      loadSystems();
      onSystemsUpdated?.();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setAdding(false);
    }
  };

  const handleToggleActive = async (system: TradingSystem) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('trading_systems')
        .update({ is_active: !system.is_active })
        .eq('id', system.id);

      if (error) throw error;

      setSystems(systems.map(s => 
        s.id === system.id ? { ...s, is_active: !s.is_active } : s
      ));
      onSystemsUpdated?.();
    } catch (error: any) {
      toast.error("Failed to update: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (system: TradingSystem) => {
    try {
      const { error } = await supabase
        .from('trading_systems')
        .delete()
        .eq('id', system.id);

      if (error) throw error;

      toast.success("Trading system deleted");
      setSystems(systems.filter(s => s.id !== system.id));
      onSystemsUpdated?.();
    } catch (error: any) {
      toast.error("Failed to delete: " + error.message);
    }
  };

  const handleUpdateLabel = async (system: TradingSystem, newLabel: string) => {
    if (!newLabel.trim()) return;
    
    try {
      const { error } = await supabase
        .from('trading_systems')
        .update({ label: newLabel.trim() })
        .eq('id', system.id);

      if (error) throw error;

      setSystems(systems.map(s => 
        s.id === system.id ? { ...s, label: newLabel.trim() } : s
      ));
      onSystemsUpdated?.();
    } catch (error: any) {
      toast.error("Failed to update label: " + error.message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="icon" title="Manage Trading Systems">
            <Settings2 className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Manage Trading Systems
          </DialogTitle>
          <DialogDescription>
            Add, edit, or disable trading systems. Disabled systems won't appear in dropdowns.
          </DialogDescription>
        </DialogHeader>

        {/* Add New System Form */}
        <div className="border rounded-lg p-4 bg-muted/30 space-y-3">
          <Label className="text-sm font-medium">Add New Trading System</Label>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label htmlFor="new-value" className="text-xs text-muted-foreground">Value (internal)</Label>
              <Input
                id="new-value"
                placeholder="e.g., moneyx_v2"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                disabled={adding}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="new-label" className="text-xs text-muted-foreground">Label (display)</Label>
              <Input
                id="new-label"
                placeholder="e.g., MoneyX V2"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                disabled={adding}
              />
            </div>
          </div>
          <Button 
            onClick={handleAddSystem} 
            disabled={adding || !newValue.trim() || !newLabel.trim()}
            className="w-full"
          >
            {adding ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Plus className="h-4 w-4 mr-2" />
            )}
            Add Trading System
          </Button>
        </div>

        {/* Systems List */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Existing Trading Systems</Label>
          
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : systems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No trading systems found. Add one above.
            </div>
          ) : (
            <div className="space-y-2">
              {systems.map((system) => (
                <div 
                  key={system.id} 
                  className={`flex items-center gap-3 p-3 rounded-lg border ${
                    system.is_active ? 'bg-card' : 'bg-muted/50 opacity-60'
                  }`}
                >
                  <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                  
                  <div className="flex-1 min-w-0">
                    <Input
                      defaultValue={system.label}
                      onBlur={(e) => {
                        if (e.target.value !== system.label) {
                          handleUpdateLabel(system, e.target.value);
                        }
                      }}
                      className="h-8 text-sm"
                    />
                    <p className="text-xs text-muted-foreground mt-1 font-mono">{system.value}</p>
                  </div>

                  <Switch
                    checked={system.is_active}
                    onCheckedChange={() => handleToggleActive(system)}
                    disabled={saving}
                    title={system.is_active ? "Disable" : "Enable"}
                  />

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Trading System?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete "{system.label}". Existing licenses using this system will keep their value but won't be able to select it again.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleDelete(system)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
