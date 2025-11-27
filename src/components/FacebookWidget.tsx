import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Facebook } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface FacebookWidgetProps {
  width?: string;
  height?: string;
  showCard?: boolean;
}

const FacebookWidget = ({ width = "500", height = "400", showCard = true }: FacebookWidgetProps) => {
  const { t } = useLanguage();

  useEffect(() => {
    // Load Facebook SDK
    const script = document.createElement("script");
    script.src = "https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v18.0";
    script.async = true;
    script.defer = true;
    script.crossOrigin = "anonymous";
    document.body.appendChild(script);

    return () => {
      // Check if script still exists before removing
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const content = (
    <>
      <div id="fb-root"></div>
      <div
        className="fb-page"
        data-href="https://www.facebook.com/SabuyHUBlao"
        data-tabs="timeline"
        data-width={width}
        data-height={height}
        data-small-header="true"
        data-adapt-container-width="true"
        data-hide-cover="false"
        data-show-facepile="false"
      >
        <blockquote
          cite="https://www.facebook.com/SabuyHUBlao"
          className="fb-xfbml-parse-ignore"
        >
          <a href="https://www.facebook.com/SabuyHUBlao">SabuyHUB Lao</a>
        </blockquote>
      </div>
      <a
        href="https://www.facebook.com/SabuyHUBlao"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mt-4"
      >
        <Facebook className="w-4 h-4" />
        {t('updates.visit_page') || 'Visit our Facebook page'}
      </a>
    </>
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
            <CardTitle>{t('updates.hero.title') || 'Latest Updates'}</CardTitle>
            <CardDescription>{t('updates.hero.description') || 'Follow our latest news'}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {content}
      </CardContent>
    </Card>
  );
};

export default FacebookWidget;
