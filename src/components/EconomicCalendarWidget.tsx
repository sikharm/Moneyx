import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTheme } from "@/components/ThemeProvider";

interface EconomicCalendarWidgetProps {
  width?: string;
  height?: number;
  showCard?: boolean;
}

const EconomicCalendarWidget = ({ 
  width = "100%", 
  height = 400,
  showCard = true 
}: EconomicCalendarWidgetProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { theme, resolvedTheme } = useTheme();

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear any existing content
    containerRef.current.innerHTML = '';

    // Determine color theme based on current resolved theme
    const colorTheme = resolvedTheme === 'dark' ? 'dark' : 'light';

    // Create the widget container
    const widgetContainer = document.createElement('div');
    widgetContainer.className = 'tradingview-widget-container';
    widgetContainer.style.width = width;
    widgetContainer.style.height = `${height}px`;

    const widgetDiv = document.createElement('div');
    widgetDiv.className = 'tradingview-widget-container__widget';
    widgetDiv.style.width = '100%';
    widgetDiv.style.height = '100%';
    widgetContainer.appendChild(widgetDiv);

    // Create and append the script
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-events.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      colorTheme: colorTheme,
      isTransparent: false,
      width: "100%",
      height: "100%",
      locale: "en",
      importanceFilter: "-1,0,1",
      countryFilter: "us"
    });

    widgetContainer.appendChild(script);
    containerRef.current.appendChild(widgetContainer);

    // Set loading to false after a delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => {
      clearTimeout(timer);
    };
  }, [resolvedTheme, width, height]);

  const LoadingSkeleton = () => (
    <div className="space-y-3 p-4">
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-6 w-full" />
      <Skeleton className="h-6 w-full" />
      <Skeleton className="h-6 w-5/6" />
      <Skeleton className="h-6 w-full" />
      <Skeleton className="h-6 w-4/5" />
      <Skeleton className="h-6 w-full" />
      <Skeleton className="h-6 w-3/4" />
    </div>
  );

  const content = (
    <div 
      className="relative w-full overflow-hidden rounded-xl border border-border/50 bg-card shadow-lg" 
      style={{ minHeight: height }}
    >
      {isLoading && (
        <div className="absolute inset-0 z-10 bg-card rounded-xl">
          <LoadingSkeleton />
        </div>
      )}
      <div 
        ref={containerRef} 
        className="w-full rounded-xl overflow-hidden"
        style={{ height: height }}
      />
    </div>
  );

  if (!showCard) {
    return content;
  }

  return (
    <Card className="overflow-hidden border-border/50 shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Economic Calendar</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {content}
      </CardContent>
    </Card>
  );
};

export default EconomicCalendarWidget;
