import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Users, Settings, Clock, Newspaper, Hand, TrendingUp, CheckCircle, Shield, BarChart3 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import EditableText from "@/components/EditableText";

const HybridMode = () => {
  const { t } = useLanguage();

  const features = [
    {
      icon: <TrendingUp className="h-6 w-6" />,
      titleKey: 'hybrid.features.autonomous_trade',
      descKey: 'hybrid.features.autonomous_trade_desc',
    },
    {
      icon: <Settings className="h-6 w-6" />,
      titleKey: 'hybrid.features.customizable_settings',
      descKey: 'hybrid.features.customizable_settings_desc',
    },
    {
      icon: <Newspaper className="h-6 w-6" />,
      titleKey: 'hybrid.features.news_protection',
      descKey: 'hybrid.features.news_protection_desc',
    },
    {
      icon: <Hand className="h-6 w-6" />,
      titleKey: 'hybrid.features.manual_order_control',
      descKey: 'hybrid.features.manual_order_control_desc',
    },
    {
      icon: <Clock className="h-6 w-6" />,
      titleKey: 'hybrid.features.trading_session_filter',
      descKey: 'hybrid.features.trading_session_filter_desc',
    },
    {
      icon: <Shield className="h-6 w-6" />,
      titleKey: 'hybrid.features.risk_management',
      descKey: 'hybrid.features.risk_management_desc',
    },
  ];

  const benefitKeys = [
    'hybrid.benefits.item1_new',
    'hybrid.benefits.item2_new',
    'hybrid.benefits.item3_new',
    'hybrid.benefits.item4_new',
    'hybrid.benefits.item5_new',
    'hybrid.benefits.item6_new',
  ];

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <div className="bg-gradient-hero p-3 rounded-2xl w-fit mx-auto mb-6">
            <Users className="h-12 w-12 text-primary-foreground" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-hero bg-clip-text text-transparent">
              <EditableText tKey="hybrid.hero.title" />
            </span>
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed mb-8">
            <EditableText tKey="hybrid.hero.description_new" />
          </p>
          <Button size="lg" className="bg-gradient-hero hover:opacity-90" asChild>
            <Link to="/download?mode=hybrid"><EditableText tKey="hybrid.hero.button" /></Link>
          </Button>
        </div>

        {/* How It Works */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-12 text-center">
            <EditableText tKey="hybrid.how_it_works.title" />
          </h2>
          <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <Card className="border-2 text-center">
              <CardHeader>
                <div className="bg-secondary rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-secondary-foreground">1</span>
                </div>
                <CardTitle className="text-lg">
                  <EditableText tKey="hybrid.how_it_works.step1_title_new" />
                </CardTitle>
                <CardDescription>
                  <EditableText tKey="hybrid.how_it_works.step1_desc_new" />
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 text-center">
              <CardHeader>
                <div className="bg-secondary rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-secondary-foreground">2</span>
                </div>
                <CardTitle className="text-lg">
                  <EditableText tKey="hybrid.how_it_works.step2_title_new" />
                </CardTitle>
                <CardDescription>
                  <EditableText tKey="hybrid.how_it_works.step2_desc_new" />
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 text-center">
              <CardHeader>
                <div className="bg-secondary rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-secondary-foreground">3</span>
                </div>
                <CardTitle className="text-lg">
                  <EditableText tKey="hybrid.how_it_works.step3_title_new" />
                </CardTitle>
                <CardDescription>
                  <EditableText tKey="hybrid.how_it_works.step3_desc_new" />
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 text-center">
              <CardHeader>
                <div className="bg-secondary rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-secondary-foreground">4</span>
                </div>
                <CardTitle className="text-lg">
                  <EditableText tKey="hybrid.how_it_works.step4_title_new" />
                </CardTitle>
                <CardDescription>
                  <EditableText tKey="hybrid.how_it_works.step4_desc_new" />
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        {/* Features Grid */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-12 text-center">
            <EditableText tKey="hybrid.features.title" />
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="border-2 hover:border-secondary transition-all duration-300">
                <CardHeader>
                  <div className="bg-secondary p-2 rounded-lg w-fit mb-3">
                    <div className="text-secondary-foreground">{feature.icon}</div>
                  </div>
                  <CardTitle className="text-lg">
                    <EditableText tKey={feature.titleKey} />
                  </CardTitle>
                  <CardDescription>
                    <EditableText tKey={feature.descKey} />
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        {/* Key Settings */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-12 text-center">
            <EditableText tKey="hybrid.parameters.title" />
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-secondary" />
                  <EditableText tKey="hybrid.parameters.trade_settings" />
                </CardTitle>
                <CardDescription>
                  <EditableText tKey="hybrid.parameters.trade_settings_desc" />
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-secondary" />
                  <EditableText tKey="hybrid.parameters.profit_loss_targets" />
                </CardTitle>
                <CardDescription>
                  <EditableText tKey="hybrid.parameters.profit_loss_targets_desc" />
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Newspaper className="h-5 w-5 text-secondary" />
                  <EditableText tKey="hybrid.parameters.news_filter" />
                </CardTitle>
                <CardDescription>
                  <EditableText tKey="hybrid.parameters.news_filter_desc" />
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5 text-secondary" />
                  <EditableText tKey="hybrid.parameters.trading_sessions" />
                </CardTitle>
                <CardDescription>
                  <EditableText tKey="hybrid.parameters.trading_sessions_desc" />
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-12 text-center">
            <EditableText tKey="hybrid.benefits.title" />
          </h2>
          <div className="max-w-3xl mx-auto">
            <p className="text-lg text-muted-foreground mb-6 text-center">
              <EditableText tKey="hybrid.benefits.description_new" />
            </p>
            <ul className="space-y-3">
              {benefitKeys.map((key, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-secondary flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">
                    <EditableText tKey={key} />
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Use Cases */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-12 text-center">
            <EditableText tKey="hybrid.perfect_for.title" />
          </h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card className="border-2">
              <CardHeader>
                <CardTitle><EditableText tKey="hybrid.perfect_for.busy_traders" /></CardTitle>
                <CardDescription>
                  <EditableText tKey="hybrid.perfect_for.busy_traders_desc" />
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <CardTitle><EditableText tKey="hybrid.perfect_for.risk_conscious" /></CardTitle>
                <CardDescription>
                  <EditableText tKey="hybrid.perfect_for.risk_conscious_desc" />
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <CardTitle><EditableText tKey="hybrid.perfect_for.control_seekers" /></CardTitle>
                <CardDescription>
                  <EditableText tKey="hybrid.perfect_for.control_seekers_desc" />
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section>
          <Card className="bg-gradient-hero border-0 text-primary-foreground">
            <CardContent className="py-16 px-8 text-center">
              <h2 className="text-4xl font-bold mb-4">
                <EditableText tKey="hybrid.cta.title" />
              </h2>
              <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
                <EditableText tKey="hybrid.cta.description_new" />
              </p>
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
