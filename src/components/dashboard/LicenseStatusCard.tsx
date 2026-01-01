import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Key, Calendar, AlertTriangle, CheckCircle, Server } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { differenceInDays, parseISO, format } from 'date-fns';

interface License {
  id: string;
  account_id: string;
  license_type: string;
  expire_date: string | null;
  vps_expire_date: string | null;
  trading_system: string | null;
  broker: string | null;
  account_size: number | null;
}

// Trading system labels
const TRADING_SYSTEM_LABELS: Record<string, string> = {
  moneyx_m1: 'MoneyX M1',
  moneyx_m2: 'MoneyX M2 (MaxProfit)',
  moneyx_c_m3: 'MoneyX C-M3 (Correlation)',
  moneyx_n_m4: 'MoneyX N-M4 (Non-stop)',
  moneyx_g1: 'MoneyX G1',
};

const LicenseStatusCard = () => {
  const { user } = useAuth();
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLicenses();
  }, [user]);

  const loadLicenses = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('license_subscriptions')
        .select('id, account_id, license_type, expire_date, vps_expire_date, trading_system, broker, account_size')
        .eq('user_id', user.id)
        .order('expire_date', { ascending: true });

      if (error) throw error;
      setLicenses(data || []);
    } catch (error) {
      console.error('Error loading licenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysLeft = (dateStr: string | null) => {
    if (!dateStr) return null;
    return differenceInDays(parseISO(dateStr), new Date());
  };

  const getStatusBadge = (daysLeft: number | null) => {
    if (daysLeft === null) {
      return <Badge variant="outline" className="text-muted-foreground">No expiry</Badge>;
    }
    if (daysLeft < 0) {
      return <Badge variant="destructive">Expired</Badge>;
    }
    if (daysLeft <= 7) {
      return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Expiring soon</Badge>;
    }
    return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Active</Badge>;
  };

  const getTradingSystemLabel = (system: string | null) => {
    if (!system) return '-';
    return TRADING_SYSTEM_LABELS[system] || system;
  };

  const formatAccountSize = (size: number | null) => {
    if (!size) return '-';
    const dollars = size / 100;
    return `$${dollars.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader className="pb-2">
          <div className="h-5 bg-muted rounded w-32"></div>
        </CardHeader>
        <CardContent>
          <div className="h-16 bg-muted rounded"></div>
        </CardContent>
      </Card>
    );
  }

  if (licenses.length === 0) {
    return (
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Key className="h-5 w-5" />
            License Status
          </CardTitle>
          <CardDescription>Your EA trading licenses</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-6">
          <Key className="h-10 w-10 text-muted-foreground mb-3" />
          <p className="text-muted-foreground text-sm text-center">
            No licenses linked to your account yet.
          </p>
          <p className="text-xs text-muted-foreground text-center mt-1">
            Contact admin to link your licenses.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Summary stats
  const activeLicenses = licenses.filter(l => {
    const days = getDaysLeft(l.expire_date);
    return days === null || days >= 0;
  }).length;
  
  const expiringSoon = licenses.filter(l => {
    const days = getDaysLeft(l.expire_date);
    return days !== null && days >= 0 && days <= 7;
  }).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Key className="h-5 w-5" />
          License Status
        </CardTitle>
        <CardDescription>
          {licenses.length} license{licenses.length !== 1 ? 's' : ''} linked to your account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary row */}
        <div className="flex gap-4 pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm">{activeLicenses} Active</span>
          </div>
          {expiringSoon > 0 && (
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <span className="text-sm text-yellow-500">{expiringSoon} Expiring soon</span>
            </div>
          )}
        </div>

        {/* License list */}
        <div className="space-y-3">
          {licenses.map((license) => {
            const daysLeft = getDaysLeft(license.expire_date);
            const vpsDaysLeft = getDaysLeft(license.vps_expire_date);

            return (
              <div 
                key={license.id}
                className="p-3 bg-muted/50 rounded-lg space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-medium">{license.account_id}</span>
                    <Badge variant={license.license_type === 'full' ? 'default' : 'secondary'}>
                      {license.license_type === 'full' ? 'Full' : 'Demo'}
                    </Badge>
                  </div>
                  {getStatusBadge(daysLeft)}
                </div>

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <span>{getTradingSystemLabel(license.trading_system)}</span>
                  {license.broker && <span>• {license.broker}</span>}
                  <span>• {formatAccountSize(license.account_size)}</span>
                </div>

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>
                      License: {license.expire_date 
                        ? `${format(parseISO(license.expire_date), 'MMM dd, yyyy')} (${daysLeft! >= 0 ? `${daysLeft} days left` : 'Expired'})`
                        : 'No expiry'
                      }
                    </span>
                  </div>
                  {license.vps_expire_date && (
                    <div className="flex items-center gap-1">
                      <Server className="h-3 w-3" />
                      <span className={vpsDaysLeft !== null && vpsDaysLeft <= 7 ? 'text-yellow-500' : ''}>
                        VPS: {format(parseISO(license.vps_expire_date), 'MMM dd, yyyy')} 
                        ({vpsDaysLeft! >= 0 ? `${vpsDaysLeft} days` : 'Expired'})
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default LicenseStatusCard;
