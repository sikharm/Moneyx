import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Facebook, ExternalLink, RefreshCw } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

// Extend Window interface for Facebook SDK
declare global {
  interface Window {
    FB?: {
      init: (params: { xfbml: boolean; version: string }) => void;
      XFBML: {
        parse: (element?: HTMLElement | null) => void;
      };
    };
    fbAsyncInit?: () => void;
  }
}

interface FacebookWidgetProps {
  width?: string;
  height?: string;
  showCard?: boolean;
}

const FACEBOOK_PAGE_URL = "https://www.facebook.com/SabuyHUBlao";
const SDK_LOAD_TIMEOUT = 15000; // 15 seconds timeout

const FacebookWidget = ({ width = "500", height = "400", showCard = true }: FacebookWidgetProps) => {
  const { t } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let isMounted = true;

    const initializeFacebookSDK = () => {
      // If SDK is already loaded, just parse the container
      if (window.FB) {
        if (containerRef.current && isMounted) {
          window.FB.XFBML.parse(containerRef.current);
          setIsLoading(false);
        }
        return;
      }

      // Define the async init callback
      window.fbAsyncInit = function () {
        window.FB?.init({
          xfbml: true,
          version: "v18.0",
        });

        if (containerRef.current && isMounted) {
          window.FB?.XFBML.parse(containerRef.current);
          setIsLoading(false);
        }
      };

      // Check if script is already in the DOM
      if (!document.getElementById("facebook-jssdk")) {
        const script = document.createElement("script");
        script.id = "facebook-jssdk";
        script.src = "https://connect.facebook.net/en_US/sdk.js";
        script.async = true;
        script.defer = true;
        script.crossOrigin = "anonymous";

        script.onerror = () => {
          if (isMounted) {
            setHasError(true);
            setIsLoading(false);
          }
        };

        document.body.appendChild(script);
      } else {
        // Script exists but FB not ready yet, wait a bit and try again
        setTimeout(() => {
          if (window.FB && containerRef.current && isMounted) {
            window.FB.XFBML.parse(containerRef.current);
            setIsLoading(false);
          }
        }, 1000);
      }
    };

    // Set timeout for loading
    timeoutId = setTimeout(() => {
      if (isMounted && isLoading) {
        setHasError(true);
        setIsLoading(false);
      }
    }, SDK_LOAD_TIMEOUT);

    // Small delay to ensure DOM is ready
    const initTimer = setTimeout(initializeFacebookSDK, 100);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      clearTimeout(initTimer);
    };
  }, []);

  const handleRetry = () => {
    setIsLoading(true);
    setHasError(false);

    // Force re-parse if SDK is loaded
    if (window.FB && containerRef.current) {
      window.FB.XFBML.parse(containerRef.current);
      setTimeout(() => setIsLoading(false), 1000);
    } else {
      // Reload the page to get fresh SDK
      window.location.reload();
    }
  };

  const LoadingSkeleton = () => (
    <div className="space-y-3" style={{ width: `${width}px`, maxWidth: "100%" }}>
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <Skeleton className="h-48 w-full rounded-lg" />
      <Skeleton className="h-20 w-full rounded-lg" />
      <Skeleton className="h-16 w-full rounded-lg" />
    </div>
  );

  const ErrorFallback = () => (
    <div
      className="flex flex-col items-center justify-center p-6 bg-muted/50 rounded-lg border border-border"
      style={{ width: `${width}px`, maxWidth: "100%", minHeight: `${Math.min(parseInt(height), 300)}px` }}
    >
      <div className="bg-[#1877F2] p-3 rounded-full mb-4">
        <Facebook className="h-8 w-8 text-white" />
      </div>
      <p className="text-center text-muted-foreground mb-4">
        {t("updates.widget_error") || "Unable to load Facebook feed"}
      </p>
      <div className="flex flex-col sm:flex-row gap-2">
        <Button variant="outline" size="sm" onClick={handleRetry} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          {t("common.retry") || "Retry"}
        </Button>
        <Button asChild size="sm" className="gap-2 bg-[#1877F2] hover:bg-[#1877F2]/90">
          <a href={FACEBOOK_PAGE_URL} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4" />
            {t("updates.visit_page") || "Visit our Facebook page"}
          </a>
        </Button>
      </div>
    </div>
  );

  const FacebookEmbed = () => (
    <div ref={containerRef}>
      <div id="fb-root"></div>
      <div
        className="fb-page"
        data-href={FACEBOOK_PAGE_URL}
        data-tabs="timeline"
        data-width={width}
        data-height={height}
        data-small-header="true"
        data-adapt-container-width="true"
        data-hide-cover="false"
        data-show-facepile="false"
      >
        <blockquote cite={FACEBOOK_PAGE_URL} className="fb-xfbml-parse-ignore">
          <a href={FACEBOOK_PAGE_URL}>SabuyHUB Lao</a>
        </blockquote>
      </div>
    </div>
  );

  const content = (
    <div className="space-y-4">
      {hasError ? (
        <ErrorFallback />
      ) : (
        <>
          {isLoading && <LoadingSkeleton />}
          <div className={isLoading ? "hidden" : "block"}>
            <FacebookEmbed />
          </div>
        </>
      )}
      {!hasError && (
        <a
          href={FACEBOOK_PAGE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <Facebook className="w-4 h-4" />
          {t("updates.visit_page") || "Visit our Facebook page"}
        </a>
      )}
    </div>
  );

  if (!showCard) {
    return <div>{content}</div>;
  }

  return (
    <Card className="border-2">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="bg-[#1877F2] p-2 rounded-lg">
            <Facebook className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle>{t("updates.hero.title") || "Latest Updates"}</CardTitle>
            <CardDescription>{t("updates.hero.description") || "Follow our latest news"}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  );
};

export default FacebookWidget;
