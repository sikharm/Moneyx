import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Zap, Shield, BarChart3, RefreshCw, CheckCircle, Settings } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const AutoMode = () => {
  const { t } = useLanguage();

  const features = [
    {
      icon: <Zap className="h-6 w-6" />,
      title: t('auto.features.fully_automated'),
      description: t('auto.features.fully_automated_desc'),
    },
    {
      icon: <RefreshCw className="h-6 w-6" />,
      title: t('auto.features.24_7_operation'),
      description: t('auto.features.24_7_operation_desc'),
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: t('auto.features.risk_management'),
      description: t('auto.features.risk_management_desc'),
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: t('auto.features.real_time_analytics'),
      description: t('auto.features.real_time_analytics_desc'),
    },
    {
      icon: <Settings className="h-6 w-6" />,
      title: t('auto.features.customizable_settings'),
      description: t('auto.features.customizable_settings_desc'),
    },
    {
      icon: <CheckCircle className="h-6 w-6" />,
      title: t('auto.features.proven_strategy'),
      description: t('auto.features.proven_strategy_desc'),
    },
  ];

  const benefits = [
    t('auto.benefits.item1'),
    t('auto.benefits.item2'),
    t('auto.benefits.item3'),
    t('auto.benefits.item4'),
    t('auto.benefits.item5'),
    t('auto.benefits.item6'),
  ];

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <div className="bg-gradient-hero p-3 rounded-2xl w-fit mx-auto mb-6">
            <Zap className="h-12 w-12 text-primary-foreground" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-hero bg-clip-text text-transparent">{t('auto.hero.title')}</span>
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed mb-8">
            {t('auto.hero.description')}
          </p>
          <Button size="lg" className="bg-gradient-hero hover:opacity-90" asChild>
            <Link to="/download">{t('auto.hero.button')}</Link>
          </Button>
        </div>

        {/* How It Works */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-12 text-center">{t('auto.how_it_works.title')}</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="border-2 text-center">
              <CardHeader>
                <div className="bg-gradient-hero rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary-foreground">1</span>
                </div>
                <CardTitle>{t('auto.how_it_works.step1_title')}</CardTitle>
                <CardDescription>
                  {t('auto.how_it_works.step1_desc')}
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 text-center">
              <CardHeader>
                <div className="bg-gradient-hero rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary-foreground">2</span>
                </div>
                <CardTitle>{t('auto.how_it_works.step2_title')}</CardTitle>
                <CardDescription>
                  {t('auto.how_it_works.step2_desc')}
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 text-center">
              <CardHeader>
                <div className="bg-gradient-hero rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary-foreground">3</span>
                </div>
                <CardTitle>{t('auto.how_it_works.step3_title')}</CardTitle>
                <CardDescription>
                  {t('auto.how_it_works.step3_desc')}
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        {/* Features Grid */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-12 text-center">{t('auto.features.title')}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="border-2 hover:border-primary transition-all duration-300">
                <CardHeader>
                  <div className="bg-gradient-hero p-2 rounded-lg w-fit mb-3">
                    <div className="text-primary-foreground">{feature.icon}</div>
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        {/* Benefits Section */}
        <section className="mb-20">
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div>
              <h2 className="text-3xl font-bold mb-6">{t('auto.benefits.title')}</h2>
              <p className="text-lg text-muted-foreground mb-6">
                {t('auto.benefits.description')}
              </p>
              <ul className="space-y-3">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-accent flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Card className="border-2 bg-gradient-card">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <div className="text-5xl font-bold bg-gradient-success bg-clip-text text-transparent mb-2">
                    98.5%
                  </div>
                  <div className="text-muted-foreground">{t('auto.stats.win_rate')}</div>
                </div>
                <div className="text-center mb-6">
                  <div className="text-5xl font-bold bg-gradient-success bg-clip-text text-transparent mb-2">
                    3.2x
                  </div>
                  <div className="text-muted-foreground">{t('auto.stats.roi')}</div>
                </div>
                <div className="text-center">
                  <div className="text-5xl font-bold bg-gradient-success bg-clip-text text-transparent mb-2">
                    5000+
                  </div>
                  <div className="text-muted-foreground">{t('auto.stats.trades')}</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section>
          <Card className="bg-gradient-hero border-0 text-primary-foreground">
            <CardContent className="py-16 px-8 text-center">
              <h2 className="text-4xl font-bold mb-4">{t('auto.cta.title')}</h2>
              <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
                {t('auto.cta.description')}
              </p>
              <Button
                size="lg"
                variant="secondary"
                className="bg-background text-foreground hover:bg-background/90"
                asChild
              >
                <Link to="/download">{t('common.download_now')}</Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default AutoMode;
