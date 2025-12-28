import { useState, useEffect, useMemo } from "react";
import { differenceInDays, parseISO } from "date-fns";
import { RefreshCw, Plus, FileSpreadsheet, Key, Download, AlertTriangle, Users, Loader2, Settings, Upload, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { License } from "@/components/admin/LicenseTable";
import { AddLicenseDialog, TRADING_SYSTEMS } from "@/components/admin/AddLicenseDialog";
import { LicenseFlatList } from "@/components/admin/LicenseFlatList";
import { GoogleSheetsSettingsDialog } from "@/components/admin/GoogleSheetsSettingsDialog";
import { ImportLicenseDialog } from "@/components/admin/ImportLicenseDialog";
import { ManageTradingSystemsDialog } from "@/components/admin/ManageTradingSystemsDialog";
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

interface DashboardStats {
  total: number;
  fullLicenses: number;
  demoLicenses: number;
  expiringSoon: number;
  totalCustomers: number;
}

export default function Subscriptions() {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    fullLicenses: 0,
    demoLicenses: 0,
    expiringSoon: 0,
    totalCustomers: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [licenseTypeFilter, setLicenseTypeFilter] = useState<string>("all");
  const [tradingSystemFilter, setTradingSystemFilter] = useState<string>("all");
  const [customerIdFilter, setCustomerIdFilter] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLicense, setEditingLicense] = useState<License | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [tradingSystems, setTradingSystems] = useState(TRADING_SYSTEMS);

  useEffect(() => {
    loadLicenses();
    loadTradingSystems();
  }, []);

  const loadTradingSystems = async () => {
    try {
      const { data, error } = await supabase
        .from('trading_systems')
        .select('value, label')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      if (data && data.length > 0) {
        setTradingSystems(data);
      }
    } catch (error) {
      console.error('Failed to load trading systems:', error);
    }
  };

  const loadLicenses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('license_subscriptions')
        .select('*')
        .order('customer_id', { ascending: true });

      if (error) throw error;

      const licensesData = data || [];
      setLicenses(licensesData);

      // Calculate stats
      const now = new Date();
      const expiringSoon = licensesData.filter(l => {
        if (!l.expire_date) return false;
        const daysLeft = differenceInDays(parseISO(l.expire_date), now);
        return daysLeft >= 0 && daysLeft <= 7;
      }).length;

      // Count unique customers by customer_id (excluding 0)
      const uniqueCustomers = new Set(licensesData.filter(l => l.customer_id && l.customer_id > 0).map(l => l.customer_id)).size;

      setStats({
        total: licensesData.length,
        fullLicenses: licensesData.filter(l => l.license_type === 'full').length,
        demoLicenses: licensesData.filter(l => l.license_type === 'demo').length,
        expiringSoon,
        totalCustomers: uniqueCustomers,
      });
    } catch (error: any) {
      toast.error("Failed to load licenses: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncToSheets = async () => {
    setSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke('sync-license-to-sheets');
      
      if (error) throw error;
      
      if (data?.success) {
        toast.success(data.message || "Successfully synced to Google Sheets");
      } else {
        throw new Error(data?.error || "Sync failed");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to sync to Google Sheets");
    } finally {
      setSyncing(false);
    }
  };

  const formatDateToDDMMYYYY = (dateStr: string | null) => {
    if (!dateStr) return '';
    const date = parseISO(dateStr);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const formatTradingSystem = (system: string | null) => {
    if (!system) return '';
    // Convert "moneyx_g1" to "Moneyx G1"
    return system
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatAccountSize = (size: number | null) => {
    if (!size) return '0';
    return size.toLocaleString('en-US');
  };

  // CSV Export - Updated format v3 with CustomerID
  const handleExportCSV = () => {
    const headers = ['AccountID', 'LicenseType', 'ExpireDate', 'Broker', 'UserName', 'TradingSystem', 'AccountSize(cents)', 'VPS ExpireDate', 'CustomerID'];
    
    const rows = filteredLicenses.map(l => {
      const licenseType = l.license_type === 'full' ? 'Full' : 'Demo';
      const expireDate = formatDateToDDMMYYYY(l.expire_date);
      const broker = l.broker || '';
      const userName = l.user_name || '';
      const tradingSystem = formatTradingSystem(l.trading_system);
      const accountSize = formatAccountSize(l.account_size);
      const vpsExpireDate = formatDateToDDMMYYYY(l.vps_expire_date);
      const customerId = l.customer_id || 0;
      
      return [l.account_id, licenseType, expireDate, broker, userName, tradingSystem, accountSize, vpsExpireDate, customerId].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `licenses_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success("CSV exported successfully");
  };

  const handleEdit = (license: License) => {
    setEditingLicense(license);
    setDialogOpen(true);
  };

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setEditingLicense(null);
    }
  };

  const handleDeleteAll = async () => {
    setDeleting(true);
    try {
      const { error } = await supabase.from('license_subscriptions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (error) throw error;
      toast.success("All licenses deleted successfully");
      loadLicenses();
    } catch (error: any) {
      toast.error("Failed to delete licenses: " + error.message);
    } finally {
      setDeleting(false);
    }
  };

  const filteredLicenses = licenses.filter(license => {
    const matchesSearch = 
      license.account_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (license.broker?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (license.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    
    const matchesType = licenseTypeFilter === "all" || license.license_type === licenseTypeFilter;
    const matchesTradingSystem = tradingSystemFilter === "all" || license.trading_system === tradingSystemFilter;
    const matchesCustomerId = !customerIdFilter || String(license.customer_id || 0) === customerIdFilter;

    return matchesSearch && matchesType && matchesTradingSystem && matchesCustomerId;
  });

  // Get unique customer IDs for filter dropdown
  const uniqueCustomerIds = useMemo(() => {
    const ids = [...new Set(licenses.map(l => l.customer_id || 0))].sort((a, b) => a - b);
    return ids;
  }, [licenses]);

  // Sort licenses by customer_id ASC to group accounts by customer
  const sortedLicenses = useMemo(() => {
    return [...filteredLicenses].sort((a, b) => {
      const aId = a.customer_id || 0;
      const bId = b.customer_id || 0;
      return aId - bId; // ASC = lowest customer_id first
    });
  }, [filteredLicenses]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Key className="h-8 w-8" />
            License Management
          </h1>
          <p className="text-muted-foreground">
            Manage EA licenses and sync to Google Sheets
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={loadLicenses} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <ImportLicenseDialog
            trigger={
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
            }
            onSuccess={loadLicenses}
          />
          <Button variant="outline" onClick={handleExportCSV} disabled={licenses.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <GoogleSheetsSettingsDialog
            trigger={
              <Button variant="outline" size="icon" title="Google Sheets Settings">
                <Settings className="h-4 w-4" />
              </Button>
            }
          />
          <ManageTradingSystemsDialog onSystemsUpdated={loadTradingSystems} />
          <Button variant="outline" onClick={handleSyncToSheets} disabled={syncing}>
            <FileSpreadsheet className={`h-4 w-4 mr-2 ${syncing ? 'animate-pulse' : ''}`} />
            {syncing ? "Syncing..." : "Sync to Sheets"}
          </Button>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add License
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={licenses.length === 0 || deleting}>
                <Trash2 className="h-4 w-4 mr-2" />
                {deleting ? "Deleting..." : "Delete All"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete All Licenses?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete all {licenses.length} licenses. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteAll} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Delete All
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Licenses</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Full Licenses</CardTitle>
            <div className="h-3 w-3 rounded-full bg-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">{stats.fullLicenses}</div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Demo Licenses</CardTitle>
            <div className="h-3 w-3 rounded-full bg-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">{stats.demoLicenses}</div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCustomers}</div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Expiring Soon</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-400">{stats.expiringSoon}</div>
            <p className="text-xs text-muted-foreground">Within 7 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row">
        <Input
          placeholder="Search by Account ID, Broker, or User..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="md:max-w-sm"
        />
        <Select value={licenseTypeFilter} onValueChange={setLicenseTypeFilter}>
          <SelectTrigger className="md:w-[180px]">
            <SelectValue placeholder="License Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="full">Full</SelectItem>
            <SelectItem value="demo">Demo</SelectItem>
          </SelectContent>
        </Select>
        <Select value={tradingSystemFilter} onValueChange={setTradingSystemFilter}>
          <SelectTrigger className="md:w-[220px]">
            <SelectValue placeholder="Trading System" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Systems</SelectItem>
            {tradingSystems.map((system) => (
              <SelectItem key={system.value} value={system.value}>
                {system.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="number"
          placeholder="Customer ID"
          value={customerIdFilter}
          onChange={(e) => setCustomerIdFilter(e.target.value)}
          className="md:w-[140px]"
        />
      </div>

      {/* Licenses List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : sortedLicenses.length === 0 ? (
        <Card className="bg-card/50 border-border/50">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No licenses found. Add your first license to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <LicenseFlatList
          licenses={sortedLicenses}
          onEdit={handleEdit}
          onRefresh={loadLicenses}
        />
      )}

      {/* Add/Edit Dialog */}
      <AddLicenseDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        license={editingLicense}
        onSuccess={loadLicenses}
      />
    </div>
  );
}
