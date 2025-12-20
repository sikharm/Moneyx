import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { addMonths, format } from 'date-fns';

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

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
}

interface AddSubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subscription: SubscriptionWithUser | null;
  onSuccess: () => void;
}

const AddSubscriptionDialog = ({ open, onOpenChange, subscription, onSuccess }: AddSubscriptionDialogProps) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);
  
  const [formData, setFormData] = useState({
    user_id: '',
    product_key: '',
    plan_duration: '1_month',
    start_date: format(new Date(), 'yyyy-MM-dd'),
    end_date: format(addMonths(new Date(), 1), 'yyyy-MM-dd'),
    status: 'active',
    amount_paid: '',
    notes: '',
  });

  useEffect(() => {
    if (open) {
      loadUsers();
      if (subscription) {
        setFormData({
          user_id: subscription.user_id,
          product_key: subscription.product_key,
          plan_duration: subscription.plan_duration,
          start_date: subscription.start_date,
          end_date: subscription.end_date,
          status: subscription.status,
          amount_paid: subscription.amount_paid?.toString() || '',
          notes: subscription.notes || '',
        });
      } else {
        setFormData({
          user_id: '',
          product_key: '',
          plan_duration: '1_month',
          start_date: format(new Date(), 'yyyy-MM-dd'),
          end_date: format(addMonths(new Date(), 1), 'yyyy-MM-dd'),
          status: 'active',
          amount_paid: '',
          notes: '',
        });
      }
    }
  }, [open, subscription]);

  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .order('email');

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handlePlanDurationChange = (duration: string) => {
    setFormData(prev => {
      const startDate = new Date(prev.start_date);
      let months = 1;
      switch (duration) {
        case '3_months': months = 3; break;
        case '6_months': months = 6; break;
        case '12_months': months = 12; break;
        default: months = 1;
      }
      return {
        ...prev,
        plan_duration: duration,
        end_date: format(addMonths(startDate, months), 'yyyy-MM-dd'),
      };
    });
  };

  const handleStartDateChange = (date: string) => {
    setFormData(prev => {
      const startDate = new Date(date);
      let months = 1;
      switch (prev.plan_duration) {
        case '3_months': months = 3; break;
        case '6_months': months = 6; break;
        case '12_months': months = 12; break;
        default: months = 1;
      }
      return {
        ...prev,
        start_date: date,
        end_date: format(addMonths(startDate, months), 'yyyy-MM-dd'),
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.user_id || !formData.product_key) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        user_id: formData.user_id,
        product_key: formData.product_key,
        plan_duration: formData.plan_duration,
        start_date: formData.start_date,
        end_date: formData.end_date,
        status: formData.status as 'active' | 'expiring_soon' | 'expired' | 'cancelled',
        amount_paid: parseFloat(formData.amount_paid) || 0,
        notes: formData.notes || null,
      };

      if (subscription) {
        // Update existing
        const { error } = await supabase
          .from('user_subscriptions')
          .update(payload)
          .eq('id', subscription.id);

        if (error) throw error;
        toast.success('Subscription updated');
      } else {
        // Check if user already has a subscription
        const { data: existing } = await supabase
          .from('user_subscriptions')
          .select('id')
          .eq('user_id', formData.user_id)
          .maybeSingle();

        if (existing) {
          toast.error('This user already has a subscription. Edit their existing subscription instead.');
          setLoading(false);
          return;
        }

        // Create new
        const { error } = await supabase
          .from('user_subscriptions')
          .insert(payload);

        if (error) throw error;

        // Create admin notification
        const user = users.find(u => u.id === formData.user_id);
        await supabase.from('admin_notifications').insert({
          title: 'New Subscription',
          message: `${user?.full_name || user?.email} subscribed to ${formData.product_key.toUpperCase()}`,
          type: 'new_subscription',
        });

        toast.success('Subscription created');
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error saving subscription:', error);
      toast.error(error.message || 'Failed to save subscription');
    } finally {
      setLoading(false);
    }
  };

  const products = [
    { key: 'm1', name: 'MoneyX M1' },
    { key: 'm2', name: 'MoneyX M2 (MaxProfit)' },
    { key: 'cm3', name: 'MoneyX C-M3 (Correlation)' },
    { key: 'nm4', name: 'MoneyX N-M4 (Non-stop)' },
    { key: 'g1', name: 'MoneyX G1' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{subscription ? 'Edit Subscription' : 'Add Subscription'}</DialogTitle>
          <DialogDescription>
            {subscription ? 'Update subscription details' : 'Create a new subscription for a user'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="user">User *</Label>
            <Select 
              value={formData.user_id} 
              onValueChange={(v) => setFormData(prev => ({ ...prev, user_id: v }))}
              disabled={!!subscription}
            >
              <SelectTrigger>
                <SelectValue placeholder={loadingUsers ? 'Loading users...' : 'Select user'} />
              </SelectTrigger>
              <SelectContent>
                {users.map(user => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.full_name || 'No name'} ({user.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="product">Product *</Label>
            <Select 
              value={formData.product_key} 
              onValueChange={(v) => setFormData(prev => ({ ...prev, product_key: v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select product" />
              </SelectTrigger>
              <SelectContent>
                {products.map(p => (
                  <SelectItem key={p.key} value={p.key}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="plan_duration">Plan Duration</Label>
              <Select 
                value={formData.plan_duration} 
                onValueChange={handlePlanDurationChange}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1_month">1 Month</SelectItem>
                  <SelectItem value="3_months">3 Months</SelectItem>
                  <SelectItem value="6_months">6 Months</SelectItem>
                  <SelectItem value="12_months">12 Months</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(v) => setFormData(prev => ({ ...prev, status: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="expiring_soon">Expiring Soon</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                type="date"
                value={formData.start_date}
                onChange={(e) => handleStartDateChange(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">End Date</Label>
              <Input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount_paid">Amount Paid ($)</Label>
            <Input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.amount_paid}
              onChange={(e) => setFormData(prev => ({ ...prev, amount_paid: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              placeholder="Optional notes about this subscription..."
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-gradient-hero">
              {loading ? 'Saving...' : subscription ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddSubscriptionDialog;