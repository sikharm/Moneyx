import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Edit, Trash2, Ban } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format, differenceInDays } from 'date-fns';
import EditableText from '@/components/EditableText';

interface SubscriptionWithUser {
  id: string;
  user_id: string;
  product_key: string;
  plan_duration: string;
  start_date: string;
  end_date: string;
  status: string;
  amount_paid: number;
  notes: string | null;
  created_at: string;
  user_email?: string;
  user_name?: string;
}

interface SubscriptionTableProps {
  subscriptions: SubscriptionWithUser[];
  loading: boolean;
  onEdit: (subscription: SubscriptionWithUser) => void;
  onRefresh: () => void;
}

const SubscriptionTable = ({ subscriptions, loading, onEdit, onRefresh }: SubscriptionTableProps) => {
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleCancel = async () => {
    if (!cancelId) return;
    
    try {
      const { error } = await supabase
        .from('user_subscriptions')
        .update({ status: 'cancelled' })
        .eq('id', cancelId);

      if (error) throw error;
      toast.success('Subscription cancelled');
      onRefresh();
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast.error('Failed to cancel subscription');
    } finally {
      setCancelId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    
    try {
      const { error } = await supabase
        .from('user_subscriptions')
        .delete()
        .eq('id', deleteId);

      if (error) throw error;
      toast.success('Subscription deleted');
      onRefresh();
    } catch (error) {
      console.error('Error deleting subscription:', error);
      toast.error('Failed to delete subscription');
    } finally {
      setDeleteId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500/20 text-green-500 border-green-500/30">Active</Badge>;
      case 'expiring_soon':
        return <Badge className="bg-amber-500/20 text-amber-500 border-amber-500/30">Expiring Soon</Badge>;
      case 'expired':
        return <Badge className="bg-red-500/20 text-red-500 border-red-500/30">Expired</Badge>;
      case 'cancelled':
        return <Badge className="bg-gray-500/20 text-gray-500 border-gray-500/30">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getDaysLeftDisplay = (endDate: string) => {
    const daysLeft = differenceInDays(new Date(endDate), new Date());
    
    if (daysLeft < 0) {
      return <span className="text-red-500 font-medium">Expired {Math.abs(daysLeft)}d ago</span>;
    } else if (daysLeft <= 7) {
      return <span className="text-amber-500 font-medium">{daysLeft}d left</span>;
    } else if (daysLeft <= 30) {
      return <span className="text-yellow-500 font-medium">{daysLeft}d left</span>;
    } else {
      return <span className="text-green-500 font-medium">{daysLeft}d left</span>;
    }
  };

  const getProductName = (key: string) => {
    const names: Record<string, string> = {
      m1: 'MoneyX M1',
      m2: 'MoneyX M2',
      cm3: 'MoneyX C-M3',
      nm4: 'MoneyX N-M4',
      g1: 'MoneyX G1',
    };
    return names[key] || key.toUpperCase();
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            <EditableText tKey="admin.subscriptions.table.title" fallback="Subscriptions" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (subscriptions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            <EditableText tKey="admin.subscriptions.table.title" fallback="Subscriptions" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-10 text-muted-foreground">
            <EditableText tKey="admin.subscriptions.table.no_data" fallback="No subscriptions found" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>
            <EditableText tKey="admin.subscriptions.table.title" fallback="Subscriptions" /> ({subscriptions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <EditableText tKey="admin.subscriptions.table.user" fallback="User" />
                  </TableHead>
                  <TableHead>
                    <EditableText tKey="admin.subscriptions.table.email" fallback="Email" />
                  </TableHead>
                  <TableHead>
                    <EditableText tKey="admin.subscriptions.table.product" fallback="Product" />
                  </TableHead>
                  <TableHead>
                    <EditableText tKey="admin.subscriptions.table.start_date" fallback="Start Date" />
                  </TableHead>
                  <TableHead>
                    <EditableText tKey="admin.subscriptions.table.end_date" fallback="End Date" />
                  </TableHead>
                  <TableHead>
                    <EditableText tKey="admin.subscriptions.table.days_left" fallback="Days Left" />
                  </TableHead>
                  <TableHead>
                    <EditableText tKey="admin.subscriptions.table.status" fallback="Status" />
                  </TableHead>
                  <TableHead>
                    <EditableText tKey="admin.subscriptions.table.amount" fallback="Amount" />
                  </TableHead>
                  <TableHead className="text-right">
                    <EditableText tKey="admin.subscriptions.table.actions" fallback="Actions" />
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscriptions.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell className="font-medium">{sub.user_name || 'Unknown'}</TableCell>
                    <TableCell className="text-muted-foreground">{sub.user_email}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{getProductName(sub.product_key)}</Badge>
                    </TableCell>
                    <TableCell>{format(new Date(sub.start_date), 'MMM d, yyyy')}</TableCell>
                    <TableCell>{format(new Date(sub.end_date), 'MMM d, yyyy')}</TableCell>
                    <TableCell>{getDaysLeftDisplay(sub.end_date)}</TableCell>
                    <TableCell>{getStatusBadge(sub.status)}</TableCell>
                    <TableCell>${sub.amount_paid?.toFixed(2) || '0.00'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(sub)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {sub.status !== 'cancelled' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setCancelId(sub.id)}
                          >
                            <Ban className="h-4 w-4 text-amber-500" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(sub.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Cancel Confirmation */}
      <AlertDialog open={!!cancelId} onOpenChange={() => setCancelId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              <EditableText tKey="admin.subscriptions.dialog.cancel_title" fallback="Cancel Subscription?" />
            </AlertDialogTitle>
            <AlertDialogDescription>
              <EditableText tKey="admin.subscriptions.dialog.cancel_desc" fallback="This will mark the subscription as cancelled. The user will no longer have access." />
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              <EditableText tKey="admin.subscriptions.dialog.keep_active" fallback="Keep Active" />
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleCancel} className="bg-amber-500 hover:bg-amber-600">
              <EditableText tKey="admin.subscriptions.dialog.cancel_confirm" fallback="Cancel Subscription" />
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              <EditableText tKey="admin.subscriptions.dialog.delete_title" fallback="Delete Subscription?" />
            </AlertDialogTitle>
            <AlertDialogDescription>
              <EditableText tKey="admin.subscriptions.dialog.delete_desc" fallback="This action cannot be undone. The subscription record will be permanently deleted." />
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              <EditableText tKey="common.cancel" fallback="Cancel" />
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
              <EditableText tKey="common.delete" fallback="Delete" />
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default SubscriptionTable;
