import { useState, useEffect } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { License } from "./LicenseTable";

interface AddLicenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  license?: License | null;
  onSuccess: () => void;
}

export const TRADING_SYSTEMS = [
  { value: "moneyx_m1", label: "MoneyX M1" },
  { value: "moneyx_m2", label: "MoneyX M2 (MaxProfit)" },
  { value: "moneyx_c_m3", label: "MoneyX C-M3 (Correlation)" },
  { value: "moneyx_n_m4", label: "MoneyX N-M4 (Non-stop)" },
  { value: "moneyx_g1", label: "MoneyX G1" },
];

interface FormData {
  account_id: string;
  license_type: string;
  expire_date: Date | undefined;
  broker: string;
  user_name: string;
  trading_system: string;
  account_size: string;
}

export function AddLicenseDialog({ open, onOpenChange, license, onSuccess }: AddLicenseDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    account_id: "",
    license_type: "full",
    expire_date: undefined,
    broker: "",
    user_name: "",
    trading_system: "",
    account_size: "",
  });

  useEffect(() => {
    if (license) {
      setFormData({
        account_id: license.account_id,
        license_type: license.license_type,
        expire_date: license.expire_date ? new Date(license.expire_date) : undefined,
        broker: license.broker || "",
        user_name: license.user_name || "",
        trading_system: license.trading_system || "",
        account_size: license.account_size?.toString() || "",
      });
    } else {
      setFormData({
        account_id: "",
        license_type: "full",
        expire_date: undefined,
        broker: "",
        user_name: "",
        trading_system: "",
        account_size: "",
      });
    }
  }, [license, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.account_id.trim()) {
      toast.error("Account ID is required");
      return;
    }

    setLoading(true);

    try {
      const licenseData = {
        account_id: formData.account_id.trim(),
        license_type: formData.license_type,
        expire_date: formData.expire_date ? format(formData.expire_date, "yyyy-MM-dd") : null,
        broker: formData.broker.trim() || null,
        user_name: formData.user_name.trim() || null,
        trading_system: formData.trading_system || null,
        account_size: formData.account_size ? parseFloat(formData.account_size) : 0,
      };

      if (license) {
        // Update existing license
        const { error } = await supabase
          .from('license_subscriptions')
          .update(licenseData)
          .eq('id', license.id);

        if (error) throw error;
        toast.success("License updated successfully");
      } else {
        // Create new license
        const { error } = await supabase
          .from('license_subscriptions')
          .insert(licenseData);

        if (error) {
          if (error.code === '23505') {
            throw new Error("A license with this Account ID already exists");
          }
          throw error;
        }
        toast.success("License created successfully");
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to save license");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{license ? "Edit License" : "Add License"}</DialogTitle>
          <DialogDescription>
            {license ? "Update the license details below." : "Enter the license details to add a new license."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="account_id">Account ID *</Label>
            <Input
              id="account_id"
              value={formData.account_id}
              onChange={(e) => setFormData({ ...formData, account_id: e.target.value })}
              placeholder="e.g., 96695168"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="license_type">License Type</Label>
            <Select
              value={formData.license_type}
              onValueChange={(value) => setFormData({ ...formData, license_type: value })}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select license type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full">Full</SelectItem>
                <SelectItem value="demo">Demo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Expire Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.expire_date && "text-muted-foreground"
                  )}
                  disabled={loading}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.expire_date ? format(formData.expire_date, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.expire_date}
                  onSelect={(date) => setFormData({ ...formData, expire_date: date })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="broker">Broker</Label>
            <Input
              id="broker"
              value={formData.broker}
              onChange={(e) => setFormData({ ...formData, broker: e.target.value })}
              placeholder="e.g., XM, EXNESS"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="user_name">User Name</Label>
            <Input
              id="user_name"
              value={formData.user_name}
              onChange={(e) => setFormData({ ...formData, user_name: e.target.value })}
              placeholder="e.g., John Doe"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="trading_system">Trading System</Label>
            <Select
              value={formData.trading_system}
              onValueChange={(value) => setFormData({ ...formData, trading_system: value })}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select trading system" />
              </SelectTrigger>
              <SelectContent>
                {TRADING_SYSTEMS.map((system) => (
                  <SelectItem key={system.value} value={system.value}>
                    {system.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="account_size">Account Size</Label>
            <Input
              id="account_size"
              type="number"
              value={formData.account_size}
              onChange={(e) => setFormData({ ...formData, account_size: e.target.value })}
              placeholder="e.g., 10000"
              disabled={loading}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : license ? "Update License" : "Add License"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
