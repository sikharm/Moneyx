import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
import { Pencil, Trash2, Link2, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LinkUserDialog } from "./LinkUserDialog";

interface License {
  id: string;
  account_id: string;
  license_type: string;
  expire_date: string | null;
  broker: string | null;
  user_name: string | null;
  trading_system: string | null;
  account_size: number | null;
  vps_expire_date: string | null;
  customer_id: number | null;
  user_id: string | null;
  linked_email?: string | null;
}

interface LicenseGroupedListProps {
  licenses: License[];
  onEdit: (license: License) => void;
  onRefresh: () => void;
}

interface UserGroup {
  userName: string;
  licenses: License[];
  stats: {
    total: number;
    fullCount: number;
    demoCount: number;
    expiringCount: number;
    totalSize: number;
  };
}

export function LicenseGroupedList({ licenses, onEdit, onRefresh }: LicenseGroupedListProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [linkDialogLicense, setLinkDialogLicense] = useState<License | null>(null);

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("license_subscriptions")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete license");
    } else {
      toast.success("License deleted");
      onRefresh();
    }
    setDeleteId(null);
  };

  const groupLicensesByUser = (licenses: License[]): UserGroup[] => {
    const groups: Record<string, License[]> = {};

    licenses.forEach((license) => {
      const key = (license.user_name || "").trim().toLowerCase() || "__unassigned__";
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(license);
    });

    const userGroups: UserGroup[] = Object.entries(groups).map(([key, groupLicenses]) => {
      const sortedLicenses = [...groupLicenses].sort((a, b) => 
        (a.customer_id || 0) - (b.customer_id || 0)
      );

      const now = new Date();
      const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      const stats = {
        total: sortedLicenses.length,
        fullCount: sortedLicenses.filter(l => l.license_type?.toLowerCase() === "full").length,
        demoCount: sortedLicenses.filter(l => l.license_type?.toLowerCase() === "demo").length,
        expiringCount: sortedLicenses.filter(l => {
          if (!l.expire_date) return false;
          const expDate = new Date(l.expire_date);
          return expDate <= sevenDaysFromNow && expDate >= now;
        }).length,
        totalSize: sortedLicenses.reduce((sum, l) => sum + (l.account_size || 0), 0),
      };

      return {
        userName: key === "__unassigned__" ? "Unassigned" : sortedLicenses[0]?.user_name || "Unassigned",
        licenses: sortedLicenses,
        stats,
      };
    });

    return userGroups.sort((a, b) => {
      if (a.userName === "Unassigned") return 1;
      if (b.userName === "Unassigned") return -1;
      return a.userName.localeCompare(b.userName);
    });
  };

  const getLicenseTypeBadge = (type: string) => {
    const normalized = type?.toLowerCase() || "full";
    if (normalized === "demo") {
      return <Badge variant="secondary">Demo</Badge>;
    }
    return <Badge variant="default">Full</Badge>;
  };

  const formatAccountSize = (size: number | null) => {
    if (!size) return "-";
    return `$${size.toLocaleString()}`;
  };

  const getDaysLeftDisplay = (expireDate: string | null) => {
    if (!expireDate) {
      return <span className="text-muted-foreground">No expiry</span>;
    }

    const now = new Date();
    const exp = new Date(expireDate);
    const diffTime = exp.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return <Badge variant="destructive">Expired</Badge>;
    } else if (diffDays <= 7) {
      return <Badge variant="outline" className="border-orange-500 text-orange-500">{diffDays}d left</Badge>;
    } else if (diffDays <= 30) {
      return <span className="text-yellow-600">{diffDays}d left</span>;
    }
    return <span className="text-muted-foreground">{diffDays}d left</span>;
  };

  const getTradingSystemLabel = (system: string | null) => {
    return system || "-";
  };

  const userGroups = groupLicensesByUser(licenses);

  if (licenses.length === 0) {
    return (
      <Card className="p-8 text-center text-muted-foreground">
        No licenses found
      </Card>
    );
  }

  return (
    <>
      <Card>
        <Accordion type="multiple" className="w-full" defaultValue={userGroups.map(g => g.userName)}>
          {userGroups.map((group) => (
            <AccordionItem key={group.userName} value={group.userName} className="border-b last:border-b-0">
              <AccordionTrigger className="px-4 hover:no-underline hover:bg-muted/50">
                <div className="flex items-center justify-between w-full pr-4">
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{group.userName}</span>
                    <Badge variant="secondary" className="ml-2">
                      {group.stats.total} {group.stats.total === 1 ? "account" : "accounts"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Full: {group.stats.fullCount}</span>
                    <span>Demo: {group.stats.demoCount}</span>
                    {group.stats.expiringCount > 0 && (
                      <Badge variant="outline" className="border-orange-500 text-orange-500">
                        {group.stats.expiringCount} expiring
                      </Badge>
                    )}
                    {group.stats.totalSize > 0 && (
                      <span>Total: ${group.stats.totalSize.toLocaleString()}</span>
                    )}
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Account ID</TableHead>
                      <TableHead>Trading System</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Broker</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead>Linked User</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {group.licenses.map((license) => (
                      <TableRow key={license.id}>
                        <TableCell className="font-mono">{license.account_id}</TableCell>
                        <TableCell>{getTradingSystemLabel(license.trading_system)}</TableCell>
                        <TableCell>{getLicenseTypeBadge(license.license_type)}</TableCell>
                        <TableCell>{formatAccountSize(license.account_size)}</TableCell>
                        <TableCell>{license.broker || "-"}</TableCell>
                        <TableCell>{getDaysLeftDisplay(license.expire_date)}</TableCell>
                        <TableCell>
                          {license.linked_email ? (
                            <span className="text-sm text-muted-foreground">{license.linked_email}</span>
                          ) : (
                            <span className="text-sm text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setLinkDialogLicense(license)}
                              title="Link to user"
                            >
                              <Link2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onEdit(license)}
                              title="Edit"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteId(license.id)}
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
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
            <AlertDialogAction onClick={() => deleteId && handleDelete(deleteId)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {linkDialogLicense && (
        <LinkUserDialog
          open={!!linkDialogLicense}
          onOpenChange={(open) => !open && setLinkDialogLicense(null)}
          licenseId={linkDialogLicense.id}
          currentUserId={linkDialogLicense.user_id}
          onSuccess={onRefresh}
        />
      )}
    </>
  );
}
