import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink, ShieldCheck, RefreshCw } from "lucide-react";

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
  const [statsLoaded, setStatsLoaded] = useState(false);
  const [chartLoaded, setChartLoaded] = useState(false);
  const [key, setKey] = useState(0);

  // Auto-hide skeleton after timeout to handle cases where onLoad doesn't fire
  useEffect(() => {
    const statsTimer = setTimeout(() => {
      if (!statsLoaded) setStatsLoaded(true);
    }, 8000);
    
    const chartTimer = setTimeout(() => {
      if (!chartLoaded) setChartLoaded(true);
    }, 8000);

    return () => {
      clearTimeout(statsTimer);
      clearTimeout(chartTimer);
    };
  }, [statsLoaded, chartLoaded, key]);

  const handleRefresh = () => {
    setStatsLoaded(false);
    setChartLoaded(false);
    setKey(prev => prev + 1);
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">{accountName}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={handleRefresh}
              title="Refresh widgets"
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
          </div>
          {showVerifiedBadge && (
            <div className="flex items-center gap-2 text-accent text-sm">
              <ShieldCheck className="h-4 w-4" />
              <span className="font-medium">Verified by Myfxbook</span>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats Widget */}
        <div className="rounded-lg overflow-hidden border bg-card">
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
            key={`stats-${key}`}
            src={`https://widgets.myfxbook.com/widgets/${accountId}/large.html`}
            width="100%"
            height="300"
            style={{ 
              border: 'none',
              display: statsLoaded ? 'block' : 'none',
              minHeight: '300px',
              background: 'white'
            }}
            onLoad={() => setStatsLoaded(true)}
            title={`Myfxbook Stats - ${accountName}`}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        {/* Growth Chart Widget */}
        <div className="rounded-lg overflow-hidden border bg-card">
          {!chartLoaded && (
            <div className="p-6">
              <Skeleton className="h-[300px] w-full" />
            </div>
          )}
          <iframe
            key={`chart-${key}`}
            src={`https://widgets.myfxbook.com/widgets/${accountId}/chart.html`}
            width="100%"
            height="350"
            style={{ 
              border: 'none',
              display: chartLoaded ? 'block' : 'none',
              minHeight: '350px',
              background: 'white'
            }}
            onLoad={() => setChartLoaded(true)}
            title={`Myfxbook Growth Chart - ${accountName}`}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            referrerPolicy="no-referrer-when-downgrade"
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
              View Full Report
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MyfxbookWidget;
