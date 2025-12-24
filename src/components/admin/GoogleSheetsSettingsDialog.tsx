import { useState, useEffect } from "react";
import { Settings, Copy, Check, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

const SERVICE_ACCOUNT_EMAIL = "license-sync@license-manager-482206.iam.gserviceaccount.com";

interface GoogleSheetsSettingsDialogProps {
  trigger?: React.ReactNode;
}

export function GoogleSheetsSettingsDialog({ trigger }: GoogleSheetsSettingsDialogProps) {
  const [open, setOpen] = useState(false);
  const [sheetId, setSheetId] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (open) {
      loadCurrentSheetId();
    }
  }, [open]);

  const loadCurrentSheetId = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('setting_value')
        .eq('setting_key', 'google_sheet_id')
        .maybeSingle();

      if (error) throw error;
      setSheetId(data?.setting_value || "");
    } catch (error: any) {
      console.error("Failed to load sheet ID:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('app_settings')
        .upsert({
          setting_key: 'google_sheet_id',
          setting_value: sheetId.trim(),
          updated_by: user?.id,
        }, {
          onConflict: 'setting_key'
        });

      if (error) throw error;
      toast.success("Google Sheet ID saved successfully");
      setOpen(false);
    } catch (error: any) {
      toast.error("Failed to save: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCopyEmail = async () => {
    await navigator.clipboard.writeText(SERVICE_ACCOUNT_EMAIL);
    setCopied(true);
    toast.success("Email copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const maskSheetId = (id: string) => {
    if (!id || id.length <= 10) return id || "Not configured";
    return `${id.slice(0, 8)}...${id.slice(-4)}`;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Google Sheets Configuration</DialogTitle>
          <DialogDescription>
            Configure the Google Sheet to sync your license data
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Current Sheet ID Display */}
          {!loading && sheetId && (
            <div className="text-sm text-muted-foreground">
              Current: <code className="bg-muted px-1 rounded">{maskSheetId(sheetId)}</code>
            </div>
          )}

          {/* Sheet ID Input */}
          <div className="space-y-2">
            <Label htmlFor="sheetId">Google Sheet ID</Label>
            <Input
              id="sheetId"
              placeholder="e.g., 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms"
              value={sheetId}
              onChange={(e) => setSheetId(e.target.value)}
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              Find this in your Google Sheet URL: docs.google.com/spreadsheets/d/<span className="text-primary font-medium">[SHEET_ID]</span>/edit
            </p>
          </div>

          {/* Service Account Instructions */}
          <Alert>
            <AlertDescription className="space-y-3">
              <p className="font-medium">Important: Share your Google Sheet</p>
              <p className="text-sm">
                You must share your Google Sheet with the following service account email as an <strong>Editor</strong>:
              </p>
              <div className="flex items-center gap-2 bg-muted p-2 rounded text-xs font-mono break-all">
                <span className="flex-1">{SERVICE_ACCOUNT_EMAIL}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0"
                  onClick={handleCopyEmail}
                >
                  {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                </Button>
              </div>
              <a
                href="https://support.google.com/docs/answer/2494822"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline inline-flex items-center gap-1"
              >
                How to share a Google Sheet
                <ExternalLink className="h-3 w-3" />
              </a>
            </AlertDescription>
          </Alert>

          {/* Column Info */}
          <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded">
            <p className="font-medium mb-1">Sync will create these columns (A-G):</p>
            <p>AccountID, LicenseType, ExpireDate, Broker, Username, TradingSystem, AccountSize</p>
            <p className="mt-1">Make sure your sheet has a tab named <code className="bg-muted px-1 rounded">Sheet1</code></p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || loading}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
