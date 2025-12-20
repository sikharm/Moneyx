import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Calendar, AlertTriangle, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format, differenceInDays } from 'date-fns';

interface UserSubscription {
  id: string;
  product_key: string;
  plan_duration: string;
  start_date: string;
  end_date: string;
  status: string;
}

const SubscriptionStatusCard = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadSubscription();
    }
  }, [user]);

  const loadSubscription = async () => {
    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error) throw error;
      setSubscription(data);
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProductName = (key: string) => {
    const names: Record<string, string> = {
      m1: 'MoneyX M1',
      m2: 'MoneyX M2 (MaxProfit)',
      cm3: 'MoneyX C-M3 (Correlation)',
      nm4: 'MoneyX N-M4 (Non-stop)',
      g1: 'MoneyX G1',
    };
    return names[key] || key.toUpperCase();
  };

  const getStatusDisplay = (status: string, daysLeft: number) => {
    if (status === 'cancelled') {
      return {
        icon: <XCircle className="h-5 w-5 text-gray-500" />,
        badge: <Badge className="bg-gray-500/20 text-gray-500 border-gray-500/30">Cancelled</Badge>,
        color: 'text-gray-500',
      };
    }
    if (daysLeft < 0) {
      return {
        icon: <XCircle className="h-5 w-5 text-red-500" />,
        badge: <Badge className="bg-red-500/20 text-red-500 border-red-500/30">Expired</Badge>,
        color: 'text-red-500',
      };
    }
    if (daysLeft <= 7) {
      return {
        icon: <AlertTriangle className="h-5 w-5 text-amber-500" />,
        badge: <Badge className="bg-amber-500/20 text-amber-500 border-amber-500/30">Expiring Soon</Badge>,
        color: 'text-amber-500',
      };
    }
    return {
      icon: <CheckCircle className="h-5 w-5 text-green-500" />,
      badge: <Badge className="bg-green-500/20 text-green-500 border-green-500/30">Active</Badge>,
      color: 'text-green-500',
    };
  };

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader className="pb-2">
          <div className="h-4 bg-muted rounded w-32"></div>
        </CardHeader>
        <CardContent>
          <div className="h-16 bg-muted rounded"></div>
        </CardContent>
      </Card>
    );
  }

  if (!subscription) {
    return (
      <Card className="border-dashed">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Subscription Status</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-4 text-center">
            <XCircle className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground mb-3">No Active Subscription</p>
            <Link to="/subscription">
              <Button size="sm" className="bg-gradient-hero">
                <ExternalLink className="h-4 w-4 mr-2" />
                View Plans
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  const daysLeft = differenceInDays(new Date(subscription.end_date), new Date());
  const statusDisplay = getStatusDisplay(subscription.status, daysLeft);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Your Subscription</CardTitle>
        {statusDisplay.icon}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold">{getProductName(subscription.product_key)}</span>
            {statusDisplay.badge}
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Valid Until</span>
            </div>
            <div className="text-right font-medium">
              {format(new Date(subscription.end_date), 'MMM d, yyyy')}
            </div>
            
            <div className="text-muted-foreground">Days Remaining</div>
            <div className={`text-right font-medium ${statusDisplay.color}`}>
              {daysLeft < 0 ? `Expired ${Math.abs(daysLeft)}d ago` : `${daysLeft} days`}
            </div>
          </div>

          <Link to="/subscription" className="block">
            <Button variant="outline" size="sm" className="w-full mt-2">
              <ExternalLink className="h-4 w-4 mr-2" />
              View Subscription Plans
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default SubscriptionStatusCard;