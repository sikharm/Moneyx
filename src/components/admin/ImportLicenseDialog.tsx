import { useState, useRef } from "react";
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import * as XLSX from "xlsx";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface ParsedRow {
  account_id: string;
  license_type: string;
  expire_date: string | null;
  broker: string | null;
  user_name: string | null;
  isValid: boolean;
  isDuplicate?: boolean;
}

interface ImportLicenseDialogProps {
  trigger: React.ReactNode;
  onSuccess: () => void;
}

export function ImportLicenseDialog({ trigger, onSuccess }: ImportLicenseDialogProps) {
  const [open, setOpen] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [importMode, setImportMode] = useState<"skip" | "update">("skip");
  const [fileName, setFileName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setParsedData([]);
    setFileName("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const parseDateDDMMYYYY = (dateStr: string | null | undefined): string | null => {
    if (!dateStr) return null;
    
    // Handle Excel date serial number
    if (typeof dateStr === "number") {
      const excelEpoch = new Date(1899, 11, 30);
      const date = new Date(excelEpoch.getTime() + dateStr * 86400000);
      return date.toISOString().split("T")[0];
    }

    const str = String(dateStr).trim();
    if (!str) return null;

    // Try DD.MM.YYYY or DD-MM-YYYY or DD/MM/YYYY
    const match = str.match(/^(\d{1,2})[.\-/](\d{1,2})[.\-/](\d{4})$/);
    if (match) {
      const [, day, month, year] = match;
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    }

    // Try YYYY-MM-DD (already in correct format)
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
      return str;
    }

    return null;
  };

  const normalizeAccountId = (value: any): string => {
    if (value === null || value === undefined) return "";
    // Convert to string and trim
    return String(value).trim();
  };

  const normalizeLicenseType = (value: string | null | undefined): string => {
    if (!value) return "full";
    const lower = String(value).toLowerCase().trim();
    if (lower === "demo" || lower === "d") return "demo";
    return "full";
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

      // Skip header row
      const rows = jsonData.slice(1).filter((row) => row.length > 0 && row[0]);

      // Fetch existing account IDs to check for duplicates
      const { data: existingLicenses } = await supabase
        .from("license_subscriptions")
        .select("account_id");
      
      const existingAccountIds = new Set(existingLicenses?.map((l) => l.account_id) || []);

      const parsed: ParsedRow[] = rows.map((row) => {
        const accountId = normalizeAccountId(row[0]);
        const licenseType = normalizeLicenseType(row[1]);
        const expireDate = parseDateDDMMYYYY(row[2]);
        const broker = row[3] ? String(row[3]).trim() : null;
        const userName = row[4] ? String(row[4]).trim() : null;

        return {
          account_id: accountId,
          license_type: licenseType,
          expire_date: expireDate,
          broker,
          user_name: userName,
          isValid: !!accountId,
          isDuplicate: existingAccountIds.has(accountId),
        };
      });

      setParsedData(parsed);
    } catch (error: any) {
      toast.error("Failed to parse file: " + error.message);
      resetState();
    }
  };

  const handleImport = async () => {
    const validRows = parsedData.filter((row) => row.isValid);
    
    if (validRows.length === 0) {
      toast.error("No valid rows to import");
      return;
    }

    setImporting(true);
    let imported = 0;
    let skipped = 0;
    let updated = 0;
    let errors = 0;

    try {
      for (const row of validRows) {
        if (row.isDuplicate) {
          if (importMode === "skip") {
            skipped++;
            continue;
          } else {
            // Update existing
            const { error } = await supabase
              .from("license_subscriptions")
              .update({
                license_type: row.license_type,
                expire_date: row.expire_date,
                broker: row.broker,
                user_name: row.user_name,
                updated_at: new Date().toISOString(),
              })
              .eq("account_id", row.account_id);

            if (error) {
              errors++;
            } else {
              updated++;
            }
          }
        } else {
          // Insert new
          const { error } = await supabase.from("license_subscriptions").insert({
            account_id: row.account_id,
            license_type: row.license_type,
            expire_date: row.expire_date,
            broker: row.broker,
            user_name: row.user_name,
          });

          if (error) {
            errors++;
          } else {
            imported++;
          }
        }
      }

      const messages: string[] = [];
      if (imported > 0) messages.push(`${imported} imported`);
      if (updated > 0) messages.push(`${updated} updated`);
      if (skipped > 0) messages.push(`${skipped} skipped`);
      if (errors > 0) messages.push(`${errors} errors`);

      toast.success(`Import complete: ${messages.join(", ")}`);
      onSuccess();
      setOpen(false);
      resetState();
    } catch (error: any) {
      toast.error("Import failed: " + error.message);
    } finally {
      setImporting(false);
    }
  };

  const validCount = parsedData.filter((r) => r.isValid).length;
  const duplicateCount = parsedData.filter((r) => r.isDuplicate).length;
  const invalidCount = parsedData.filter((r) => !r.isValid).length;

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetState(); }}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Import Licenses
          </DialogTitle>
          <DialogDescription>
            Import licenses from CSV or Excel file. Expected columns: AccountID, LicenseType, ExpireDate, Broker, User name
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden space-y-4">
          {/* File Input */}
          <div className="flex items-center gap-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Select File
            </Button>
            {fileName && (
              <span className="text-sm text-muted-foreground">{fileName}</span>
            )}
          </div>

          {/* Preview */}
          {parsedData.length > 0 && (
            <>
              {/* Stats */}
              <div className="flex gap-4 text-sm">
                <Badge variant="outline" className="gap-1">
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                  {validCount} valid
                </Badge>
                {duplicateCount > 0 && (
                  <Badge variant="outline" className="gap-1">
                    <AlertCircle className="h-3 w-3 text-yellow-500" />
                    {duplicateCount} duplicates
                  </Badge>
                )}
                {invalidCount > 0 && (
                  <Badge variant="outline" className="gap-1">
                    <AlertCircle className="h-3 w-3 text-red-500" />
                    {invalidCount} invalid
                  </Badge>
                )}
              </div>

              {/* Import Mode */}
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">Handle duplicates:</span>
                <Select value={importMode} onValueChange={(v) => setImportMode(v as "skip" | "update")}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="skip">Skip existing</SelectItem>
                    <SelectItem value="update">Update existing</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Table */}
              <ScrollArea className="h-[300px] rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">Status</TableHead>
                      <TableHead>Account ID</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Expire Date</TableHead>
                      <TableHead>Broker</TableHead>
                      <TableHead>User Name</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedData.map((row, index) => (
                      <TableRow key={index} className={!row.isValid ? "opacity-50" : ""}>
                        <TableCell>
                          {!row.isValid ? (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          ) : row.isDuplicate ? (
                            <AlertCircle className="h-4 w-4 text-yellow-500" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-sm">{row.account_id || "-"}</TableCell>
                        <TableCell>
                          <Badge variant={row.license_type === "full" ? "default" : "secondary"}>
                            {row.license_type === "full" ? "Full" : "Demo"}
                          </Badge>
                        </TableCell>
                        <TableCell>{row.expire_date || "-"}</TableCell>
                        <TableCell>{row.broker || "-"}</TableCell>
                        <TableCell>{row.user_name || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={importing || validCount === 0}
          >
            {importing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Import {validCount} License{validCount !== 1 ? "s" : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
