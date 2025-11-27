import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface MyfxbookWidgetProps {
  accountId: string;
  accountName: string;
  profileUrl: string;
  showVerifiedBadge?: boolean;
}

const MyfxbookWidget = ({ 
  accountId, 
  accountName, 
  profileUrl, 
  showVerifiedBadge = false 
}: MyfxbookWidgetProps) => {
  const { t } = useLanguage();
  const [statsLoaded, setStatsLoaded] = useState(false);
  const [chartLoaded, setChartLoaded] = useState(false);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <span className="text-lg">{accountName}</span>
          {showVerifiedBadge && (
            <div className="flex items-center gap-2 text-accent text-sm">
              <ShieldCheck className="h-4 w-4" />
              <span className="font-medium">{t('performance.myfxbook.verified') || 'Verified by Myfxbook'}</span>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats Widget */}
        <div className="rounded-lg overflow-hidden border">
          {!statsLoaded && (
            <div className="p-6 space-y-4">
              <Skeleton className="h-8 w-48 mx-auto" />
              <div className="grid grid-cols-3 gap-4">
                <Skeleton className="h-16" />
                <Skeleton className="h-16" />
                <Skeleton className="h-16" />
              </div>
            </div>
          )}
          <iframe
            src={`https://widgets.myfxbook.com/widgets/${accountId}/large.html`}
            width="100%"
            height="300"
            style={{ 
              border: 'none',
              display: statsLoaded ? 'block' : 'none'
            }}
            onLoad={() => setStatsLoaded(true)}
            title={`Myfxbook Stats - ${accountName}`}
            loading="lazy"
          />
        </div>

        {/* Growth Chart Widget */}
        <div className="rounded-lg overflow-hidden border">
          {!chartLoaded && (
            <div className="p-6">
              <Skeleton className="h-[300px] w-full" />
            </div>
          )}
          <iframe
            src={`https://widgets.myfxbook.com/widgets/${accountId}/chart.html`}
            width="100%"
            height="350"
            style={{ 
              border: 'none',
              display: chartLoaded ? 'block' : 'none'
            }}
            onLoad={() => setChartLoaded(true)}
            title={`Myfxbook Growth Chart - ${accountName}`}
            loading="lazy"
          />
        </div>

        {/* View Full Report Link */}
        <div className="flex justify-center pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            asChild
            className="gap-2"
          >
            <a 
              href={profileUrl} 
              target="_blank" 
              rel="noopener noreferrer"
            >
              {t('performance.myfxbook.view_full_report') || 'View Full Report'}
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MyfxbookWidget;
