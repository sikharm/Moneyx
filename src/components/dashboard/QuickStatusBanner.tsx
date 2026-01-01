import { Key, CreditCard, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import EditableText from '@/components/EditableText';
import { cn } from '@/lib/utils';

interface QuickStatusBannerProps {
  licenseCount: number;
  subscriptionStatus: 'active' | 'expiring_soon' | 'expired' | 'none';
  daysRemaining: number | null;
}

const QuickStatusBanner = ({ licenseCount, subscriptionStatus, daysRemaining }: QuickStatusBannerProps) => {
  const getStatusColor = () => {
    switch (subscriptionStatus) {
      case 'active':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'expiring_soon':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'expired':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getStatusLabel = () => {
    switch (subscriptionStatus) {
      case 'active':
        return { key: 'dashboard.status.active', fallback: 'Active' };
      case 'expiring_soon':
        return { key: 'dashboard.status.expiring', fallback: 'Expiring Soon' };
      case 'expired':
        return { key: 'dashboard.status.expired', fallback: 'Expired' };
      default:
        return { key: 'dashboard.status.none', fallback: 'No Subscription' };
    }
  };

  const status = getStatusLabel();

  return (
    <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border border-primary/20 rounded-xl p-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Licenses */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <Key className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <div className="text-2xl font-bold">{licenseCount}</div>
            <EditableText
              tKey="dashboard.banner.licenses"
              fallback="Licenses"
              as="p"
              className="text-xs text-muted-foreground"
            />
          </div>
        </div>

        {/* Subscription Status */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
            <CreditCard className="h-5 w-5 text-purple-500" />
          </div>
          <div>
            <Badge variant="outline" className={cn("font-medium", getStatusColor())}>
              <EditableText
                tKey={status.key}
                fallback={status.fallback}
                as="span"
              />
            </Badge>
            <EditableText
              tKey="dashboard.banner.subscription"
              fallback="Subscription"
              as="p"
              className="text-xs text-muted-foreground mt-0.5"
            />
          </div>
        </div>

        {/* Days Remaining */}
        {daysRemaining !== null && subscriptionStatus !== 'none' && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <div className={cn(
                "text-2xl font-bold",
                daysRemaining <= 7 ? "text-amber-500" : "",
                daysRemaining <= 0 ? "text-red-500" : ""
              )}>
                {daysRemaining > 0 ? daysRemaining : 0}
              </div>
              <EditableText
                tKey="dashboard.banner.days_left"
                fallback="Days Left"
                as="p"
                className="text-xs text-muted-foreground"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuickStatusBanner;
