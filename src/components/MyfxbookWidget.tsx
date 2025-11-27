import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const MYFXBOOK_ACCOUNT_ID = "11691566";
const MYFXBOOK_PROFILE_URL = "https://www.myfxbook.com/members/SikharmThongin/moneyx/11691566";

const MyfxbookWidget = () => {
  const { t } = useLanguage();
  const [statsLoaded, setStatsLoaded] = useState(false);
  const [chartLoaded, setChartLoaded] = useState(false);

  return (
    <div className="space-y-6">
      {/* Verified Badge */}
      <div className="flex items-center justify-center gap-2 text-accent">
        <ShieldCheck className="h-5 w-5" />
        <span className="font-medium">{t('performance.myfxbook.verified') || 'Verified by Myfxbook'}</span>
      </div>

      {/* Stats Widget */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
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
            src={`https://widgets.myfxbook.com/widgets/${MYFXBOOK_ACCOUNT_ID}/large.html`}
            width="100%"
            height="300"
            style={{ 
              border: 'none',
              display: statsLoaded ? 'block' : 'none'
            }}
            onLoad={() => setStatsLoaded(true)}
            title="Myfxbook Stats Widget"
            loading="lazy"
          />
        </CardContent>
      </Card>

      {/* Growth Chart Widget */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {!chartLoaded && (
            <div className="p-6">
              <Skeleton className="h-[300px] w-full" />
            </div>
          )}
          <iframe
            src={`https://widgets.myfxbook.com/widgets/${MYFXBOOK_ACCOUNT_ID}/chart.html`}
            width="100%"
            height="350"
            style={{ 
              border: 'none',
              display: chartLoaded ? 'block' : 'none'
            }}
            onLoad={() => setChartLoaded(true)}
            title="Myfxbook Growth Chart"
            loading="lazy"
          />
        </CardContent>
      </Card>

      {/* View Full Report Link */}
      <div className="flex justify-center">
        <Button 
          variant="outline" 
          size="lg" 
          asChild
          className="gap-2"
        >
          <a 
            href={MYFXBOOK_PROFILE_URL} 
            target="_blank" 
            rel="noopener noreferrer"
          >
            {t('performance.myfxbook.view_full_report') || 'View Full Report on Myfxbook'}
            <ExternalLink className="h-4 w-4" />
          </a>
        </Button>
      </div>
    </div>
  );
};

export default MyfxbookWidget;
