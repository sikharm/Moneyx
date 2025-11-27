import { useEffect } from "react";
import { Facebook } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const FacebookUpdates = () => {
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
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#1877F2]/10 mb-4">
            <Facebook className="w-8 h-8 text-[#1877F2]" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-hero bg-clip-text text-transparent">
            {t('updates.hero.title')}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('updates.hero.description')}
          </p>
        </div>

        {/* Facebook Page Plugin */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-card rounded-lg shadow-elegant border border-border overflow-hidden">
            <div id="fb-root"></div>
            <div
              className="fb-page"
              data-href="https://www.facebook.com/SabuyHUBlao"
              data-tabs="timeline"
              data-width="500"
              data-height="600"
              data-small-header="false"
              data-adapt-container-width="true"
              data-hide-cover="false"
              data-show-facepile="true"
            >
              <blockquote
                cite="https://www.facebook.com/SabuyHUBlao"
                className="fb-xfbml-parse-ignore"
              >
                <a href="https://www.facebook.com/SabuyHUBlao">SabuyHUB Lao</a>
              </blockquote>
            </div>
          </div>
          
          {/* Direct Link */}
          <div className="text-center mt-8">
            <a
              href="https://www.facebook.com/SabuyHUBlao"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <Facebook className="w-4 h-4" />
              {t('updates.visit_page')}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacebookUpdates;
