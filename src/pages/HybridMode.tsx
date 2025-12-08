import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Users, Settings, Clock, Newspaper, Hand, TrendingUp, CheckCircle, Shield } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import EditableText from "@/components/EditableText";

const HybridMode = () => {
  const { t } = useLanguage();

  const features = [
    { icon: <TrendingUp className="h-6 w-6" />, titleKey: 'hybrid.features.autonomous_trade' },
    { icon: <Settings className="h-6 w-6" />, titleKey: 'hybrid.features.customizable_settings' },
    { icon: <Newspaper className="h-6 w-6" />, titleKey: 'hybrid.features.news_protection' },
    { icon: <Hand className="h-6 w-6" />, titleKey: 'hybrid.features.manual_order_control' },
    { icon: <Clock className="h-6 w-6" />, titleKey: 'hybrid.features.trading_session_filter' },
    { icon: <Shield className="h-6 w-6" />, titleKey: 'hybrid.features.risk_management' },
  ];

  const benefitKeys = [
    'hybrid.benefits.item1_new',
    'hybrid.benefits.item2_new',
    'hybrid.benefits.item3_new',
  ];

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <div className="bg-gradient-hero p-3 rounded-2xl w-fit mx-auto mb-6">
            <Users className="h-12 w-12 text-primary-foreground" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-8">
            <span className="bg-gradient-hero bg-clip-text text-transparent">
              <EditableText tKey="hybrid.hero.title" />
            </span>
          </h1>
          <Button size="lg" className="bg-gradient-hero hover:opacity-90" asChild>
            <Link to="/download?mode=hybrid"><EditableText tKey="hybrid.hero.button" /></Link>
          </Button>
        </div>

        {/* How It Works */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-12 text-center">
            <EditableText tKey="hybrid.how_it_works.title" />
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <Card className="border-2 text-center">
              <CardHeader className="pb-4">
                <div className="bg-secondary rounded-full w-10 h-10 flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-secondary-foreground">1</span>
                </div>
                <CardTitle className="text-sm">
                  <EditableText tKey="hybrid.how_it_works.step1_title_new" />
                </CardTitle>
              </CardHeader>
            </Card>

            <Card className="border-2 text-center">
              <CardHeader className="pb-4">
                <div className="bg-secondary rounded-full w-10 h-10 flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-secondary-foreground">2</span>
                </div>
                <CardTitle className="text-sm">
                  <EditableText tKey="hybrid.how_it_works.step2_title_new" />
                </CardTitle>
              </CardHeader>
            </Card>

            <Card className="border-2 text-center">
              <CardHeader className="pb-4">
                <div className="bg-secondary rounded-full w-10 h-10 flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-secondary-foreground">3</span>
                </div>
                <CardTitle className="text-sm">
                  <EditableText tKey="hybrid.how_it_works.step3_title_new" />
                </CardTitle>
              </CardHeader>
            </Card>

            <Card className="border-2 text-center">
              <CardHeader className="pb-4">
                <div className="bg-secondary rounded-full w-10 h-10 flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-secondary-foreground">4</span>
                </div>
                <CardTitle className="text-sm">
                  <EditableText tKey="hybrid.how_it_works.step4_title_new" />
                </CardTitle>
              </CardHeader>
            </Card>
          </div>
        </section>

        {/* Features Grid */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-12 text-center">
            <EditableText tKey="hybrid.features.title" />
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {features.map((feature, index) => (
              <Card key={index} className="border-2 hover:border-secondary transition-all duration-300 text-center">
                <CardHeader className="pb-4">
                  <div className="bg-secondary p-2 rounded-lg w-fit mx-auto mb-3">
                    <div className="text-secondary-foreground">{feature.icon}</div>
                  </div>
                  <CardTitle className="text-sm">
                    <EditableText tKey={feature.titleKey} />
                  </CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        {/* Benefits Section */}
        <section className="mb-20">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-8">
              <EditableText tKey="hybrid.benefits.title" />
            </h2>
            <div className="flex flex-wrap justify-center gap-4">
              {benefitKeys.map((key, index) => (
                <div key={index} className="flex items-center gap-2 bg-secondary/10 px-4 py-2 rounded-full">
                  <CheckCircle className="h-5 w-5 text-secondary flex-shrink-0" />
                  <span className="text-muted-foreground">
                    <EditableText tKey={key} />
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section>
          <Card className="bg-gradient-hero border-0 text-primary-foreground">
            <CardContent className="py-12 px-8 text-center">
              <h2 className="text-4xl font-bold mb-6">
                <EditableText tKey="hybrid.cta.title" />
              </h2>
              <Button
                size="lg"
                variant="secondary"
                className="bg-background text-foreground hover:bg-background/90"
                asChild
              >
                <Link to="/download?mode=hybrid"><EditableText tKey="common.download_now" /></Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default HybridMode;