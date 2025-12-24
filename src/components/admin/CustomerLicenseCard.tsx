import { useState } from "react";
import { format, differenceInDays, parseISO } from "date-fns";
import { Edit, Trash2, ChevronDown, ChevronUp, User, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { License } from "./LicenseTable";
import { TRADING_SYSTEMS } from "./AddLicenseDialog";

interface CustomerGroup {
  userName: string;
  licenses: License[];
  totalAccounts: number;
  expiringSoon: number;
}

interface CustomerLicenseCardProps {
  customer: CustomerGroup;
  onEdit: (license: License) => void;
  onRefresh: () => void;
}

export function CustomerLicenseCard({ customer, onEdit, onRefresh }: CustomerLicenseCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const { error } = await supabase
        .from('license_subscriptions')
        .delete()
        .eq('id', deleteId);

      if (error) throw error;

      toast.success("License deleted successfully");
      onRefresh();
    } catch (error: any) {
      toast.error("Failed to delete license: " + error.message);
    } finally {
      setDeleteId(null);
    }
  };

  const getLicenseTypeBadge = (type: string) => {
    switch (type) {
      case 'full':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Full</Badge>;
      case 'demo':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Demo</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const getTradingSystemLabel = (system: string | null) => {
    if (!system) return <span className="text-muted-foreground">-</span>;
    const found = TRADING_SYSTEMS.find(s => s.value === system);
    return found ? found.label : system;
  };

  const formatAccountSize = (size: number | null) => {
    if (!size) return <span className="text-muted-foreground">-</span>;
    // Size is in cents, convert to dollars for display
    const dollars = size / 100;
    return `$${dollars.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getDaysLeftDisplay = (expireDate: string | null) => {
    if (!expireDate) return <span className="text-muted-foreground">No expiry</span>;
    
    const daysLeft = differenceInDays(parseISO(expireDate), new Date());
    
    if (daysLeft < 0) {
      return <span className="text-red-400 font-medium">Expired ({Math.abs(daysLeft)}d ago)</span>;
    } else if (daysLeft <= 7) {
      return <span className="text-yellow-400 font-medium">{daysLeft} days left</span>;
    } else if (daysLeft <= 30) {
      return <span className="text-orange-400">{daysLeft} days left</span>;
    }
    return <span className="text-green-400">{daysLeft} days left</span>;
  };

  return (
    <>
      <Card className="bg-card/50 border-border/50">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">
                      {customer.userName || "Unknown Customer"}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{customer.totalAccounts} account{customer.totalAccounts !== 1 ? 's' : ''}</span>
                      {customer.expiringSoon > 0 && (
                        <span className="flex items-center gap-1 text-yellow-400">
                          <AlertTriangle className="h-3 w-3" />
                          {customer.expiringSoon} expiring soon
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="icon">
                  {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </Button>
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/50 hover:bg-transparent">
                      <TableHead className="text-muted-foreground">Account ID</TableHead>
                      <TableHead className="text-muted-foreground">License Type</TableHead>
                      <TableHead className="text-muted-foreground">Trading System</TableHead>
                      <TableHead className="text-muted-foreground">Account Size</TableHead>
                      <TableHead className="text-muted-foreground">Expire Date</TableHead>
                      <TableHead className="text-muted-foreground">Status</TableHead>
                      <TableHead className="text-muted-foreground">Broker</TableHead>
                      <TableHead className="text-muted-foreground text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customer.licenses.map((license) => (
                      <TableRow key={license.id} className="border-border/50">
                        <TableCell className="font-mono font-medium">{license.account_id}</TableCell>
                        <TableCell>{getLicenseTypeBadge(license.license_type)}</TableCell>
                        <TableCell>{getTradingSystemLabel(license.trading_system)}</TableCell>
                        <TableCell>{formatAccountSize(license.account_size)}</TableCell>
                        <TableCell>
                          {license.expire_date 
                            ? format(parseISO(license.expire_date), "MMM dd, yyyy")
                            : <span className="text-muted-foreground">-</span>
                          }
                        </TableCell>
                        <TableCell>{getDaysLeftDisplay(license.expire_date)}</TableCell>
                        <TableCell>{license.broker || <span className="text-muted-foreground">-</span>}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onEdit(license)}
                              className="h-8 w-8"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteId(license.id)}
                              className="h-8 w-8 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete License</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this license? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
