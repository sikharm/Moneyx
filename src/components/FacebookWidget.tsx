import { useEffect, useRef, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Facebook, ExternalLink } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

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

const FACEBOOK_PAGE_URL = "https://www.facebook.com/MonXGold";
const SDK_LOAD_TIMEOUT = 8000; // 8 seconds to show loading

const FacebookWidget = ({ width: propWidth, height: propHeight, showCard = true }: FacebookWidgetProps) => {
  const isMobile = useIsMobile();
  
  // Use smaller dimensions on mobile
  const width = propWidth || (isMobile ? "320" : "500");
  const height = propHeight || (isMobile ? "350" : "400");
  const { t } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sdkLoaded, setSdkLoaded] = useState(false);

  const parseFacebookPlugin = useCallback(() => {
    if (window.FB && containerRef.current) {
      try {
        window.FB.XFBML.parse(containerRef.current);
        setSdkLoaded(true);
        setIsLoading(false);
      } catch (e) {
        console.log("Facebook XFBML parse error:", e);
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const initializeFacebookSDK = () => {
      // If SDK is already loaded, just parse the container
      if (window.FB) {
        parseFacebookPlugin();
        return;
      }

      // Define the async init callback
      window.fbAsyncInit = function () {
        window.FB?.init({
          xfbml: true,
          version: "v18.0",
        });

        if (isMounted) {
          parseFacebookPlugin();
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

        // Don't set error state on script error - just stop loading
        script.onerror = () => {
          if (isMounted) {
            setIsLoading(false);
          }
        };

        script.onload = () => {
          // Give SDK time to initialize
          setTimeout(() => {
            if (isMounted && window.FB) {
              parseFacebookPlugin();
            } else if (isMounted) {
              setIsLoading(false);
            }
          }, 500);
        };

        document.body.appendChild(script);
      } else {
        // Script exists, wait for FB to be ready
        const checkFB = setInterval(() => {
          if (window.FB) {
            clearInterval(checkFB);
            if (isMounted) {
              parseFacebookPlugin();
            }
          }
        }, 200);

        // Stop checking after timeout
        setTimeout(() => {
          clearInterval(checkFB);
          if (isMounted && !sdkLoaded) {
            setIsLoading(false);
          }
        }, SDK_LOAD_TIMEOUT);
      }
    };

    // Set timeout for loading state
    const loadingTimeout = setTimeout(() => {
      if (isMounted) {
        setIsLoading(false);
      }
    }, SDK_LOAD_TIMEOUT);

    // Small delay to ensure DOM is ready
    const initTimer = setTimeout(initializeFacebookSDK, 100);

    return () => {
      isMounted = false;
      clearTimeout(loadingTimeout);
      clearTimeout(initTimer);
    };
  }, [parseFacebookPlugin, sdkLoaded]);

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
    </div>
  );

  const content = (
    <div className="space-y-4">
      {/* Always show loading skeleton while loading */}
      {isLoading && <LoadingSkeleton />}

      {/* Always render the Facebook embed container */}
      <div ref={containerRef} className={isLoading ? "hidden" : "block"}>
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

      {/* Show fallback link if SDK didn't load after timeout */}
      {!isLoading && !sdkLoaded && (
        <div className="flex flex-col items-center justify-center p-6 bg-muted/30 rounded-lg border border-border/50">
          <div className="bg-[#1877F2] p-3 rounded-full mb-3">
            <Facebook className="h-6 w-6 text-white" />
          </div>
          <p className="text-center text-sm text-muted-foreground mb-3">
            {t("updates.follow_facebook") || "Follow us on Facebook for the latest updates"}
          </p>
          <Button asChild size="sm" className="gap-2 bg-[#1877F2] hover:bg-[#1877F2]/90">
            <a href={FACEBOOK_PAGE_URL} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
              {t("updates.visit_page") || "Visit our Facebook page"}
            </a>
          </Button>
        </div>
      )}

      {/* Always show the visit page link */}
      <a
        href={FACEBOOK_PAGE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
      >
        <Facebook className="w-4 h-4" />
        {t("updates.visit_page") || "Visit our Facebook page"}
      </a>
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
