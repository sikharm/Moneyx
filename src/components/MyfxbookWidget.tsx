import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, ShieldCheck, RefreshCw, Activity } from "lucide-react";

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
  const [sleekLoaded, setSleekLoaded] = useState(false);
  const [customLoaded, setCustomLoaded] = useState(false);
  const [chartLoaded, setChartLoaded] = useState(false);
  const [key, setKey] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const handleRefresh = () => {
    setSleekLoaded(false);
    setCustomLoaded(false);
    setChartLoaded(false);
    setKey(prev => prev + 1);
    setLastUpdated(new Date());
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Widget URLs based on user's provided embed codes
  const sleekWidgetUrl = `https://widget.myfxbook.com/widget/widget.png?accountOid=${accountId}&type=1&color=red&t=${key}`;
  const customWidgetUrl = `https://widget.myfxbook.com/widget/widget.png?accountOid=${accountId}&type=6&t=${key}`;
  const chartWidgetUrl = `https://widget.myfxbook.com/widget/widget.png?accountOid=${accountId}&type=2&color=red&t=${key}`;

  const allLoaded = sleekLoaded && customLoaded && chartLoaded;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <span className="text-lg">{accountName}</span>
            
            {/* Live Status Badge */}
            <Badge 
              variant="outline" 
              className="gap-1.5 border-emerald-500/50 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Live Data
            </Badge>

            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleRefresh}
              title="Refresh widgets"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${!allLoaded ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Last Updated Timestamp */}
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Activity className="h-3 w-3" />
              Updated {formatTime(lastUpdated)}
            </span>
            
            {showVerifiedBadge && (
              <div className="flex items-center gap-1.5 text-accent text-sm">
                <ShieldCheck className="h-4 w-4" />
                <span className="font-medium">Verified</span>
              </div>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Sleek Short Widget (type=1) - Quick Overview */}
        <div className="flex justify-center">
          <a 
            href={profileUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="block hover:opacity-90 transition-opacity"
          >
            {!sleekLoaded && (
              <Skeleton className="h-[60px] w-[400px] max-w-full" />
            )}
            <img
              key={`sleek-${key}`}
              src={sleekWidgetUrl}
              alt={`${accountName} - Quick Stats`}
              onLoad={() => setSleekLoaded(true)}
              className={sleekLoaded ? "block max-w-full h-auto" : "hidden"}
            />
          </a>
        </div>

        {/* Custom Widget (type=6) - Detailed Statistics */}
        <div className="flex justify-center">
          <a 
            href={profileUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="block hover:opacity-90 transition-opacity"
          >
            {!customLoaded && (
              <Skeleton className="h-[200px] w-[400px] max-w-full" />
            )}
            <img
              key={`custom-${key}`}
              src={customWidgetUrl}
              alt={`${accountName} - Detailed Stats`}
              onLoad={() => setCustomLoaded(true)}
              className={customLoaded ? "block max-w-full h-auto" : "hidden"}
            />
          </a>
        </div>

        {/* Chart Widget (type=2) - Growth Chart */}
        <div className="flex justify-center">
          <a 
            href={profileUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="block hover:opacity-90 transition-opacity"
          >
            {!chartLoaded && (
              <Skeleton className="h-[250px] w-[600px] max-w-full" />
            )}
            <img
              key={`chart-${key}`}
              src={chartWidgetUrl}
              alt={`${accountName} - Growth Chart`}
              onLoad={() => setChartLoaded(true)}
              className={chartLoaded ? "block max-w-full h-auto" : "hidden"}
            />
          </a>
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
