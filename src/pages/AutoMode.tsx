import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Zap, Shield, BarChart3, RefreshCw, CheckCircle, Settings } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import EditableText from "@/components/EditableText";

const AutoMode = () => {
  const { t } = useLanguage();

  const features = [
    { icon: <Zap className="h-6 w-6" />, titleKey: 'auto.features.fully_automated' },
    { icon: <RefreshCw className="h-6 w-6" />, titleKey: 'auto.features.24_7_operation' },
    { icon: <Shield className="h-6 w-6" />, titleKey: 'auto.features.risk_management' },
    { icon: <BarChart3 className="h-6 w-6" />, titleKey: 'auto.features.real_time_analytics' },
    { icon: <Settings className="h-6 w-6" />, titleKey: 'auto.features.customizable_settings' },
    { icon: <CheckCircle className="h-6 w-6" />, titleKey: 'auto.features.proven_strategy' },
  ];

  const benefitKeys = [
    'auto.benefits.item1',
    'auto.benefits.item2',
    'auto.benefits.item3',
  ];

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <div className="bg-gradient-hero p-3 rounded-2xl w-fit mx-auto mb-6">
            <Zap className="h-12 w-12 text-primary-foreground" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-8">
            <span className="bg-gradient-hero bg-clip-text text-transparent">
              <EditableText tKey="auto.hero.title" />
            </span>
          </h1>
          <Button size="lg" className="bg-gradient-hero hover:opacity-90" asChild>
            <Link to="/download"><EditableText tKey="auto.hero.button" /></Link>
          </Button>
        </div>

        {/* How It Works */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-12 text-center">
            <EditableText tKey="auto.how_it_works.title" />
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card className="border-2 text-center">
              <CardHeader>
                <div className="bg-gradient-hero rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary-foreground">1</span>
                </div>
                <CardTitle><EditableText tKey="auto.how_it_works.step1_title" /></CardTitle>
              </CardHeader>
            </Card>

            <Card className="border-2 text-center">
              <CardHeader>
                <div className="bg-gradient-hero rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary-foreground">2</span>
                </div>
                <CardTitle><EditableText tKey="auto.how_it_works.step2_title" /></CardTitle>
              </CardHeader>
            </Card>

            <Card className="border-2 text-center">
              <CardHeader>
                <div className="bg-gradient-hero rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary-foreground">3</span>
                </div>
                <CardTitle><EditableText tKey="auto.how_it_works.step3_title" /></CardTitle>
              </CardHeader>
            </Card>
          </div>
        </section>

        {/* Features Grid */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-12 text-center">
            <EditableText tKey="auto.features.title" />
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {features.map((feature, index) => (
              <Card key={index} className="border-2 hover:border-primary transition-all duration-300 text-center">
                <CardHeader className="pb-4">
                  <div className="bg-gradient-hero p-2 rounded-lg w-fit mx-auto mb-3">
                    <div className="text-primary-foreground">{feature.icon}</div>
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
              <EditableText tKey="auto.benefits.title" />
            </h2>
            <div className="flex flex-wrap justify-center gap-4">
              {benefitKeys.map((key, index) => (
                <div key={index} className="flex items-center gap-2 bg-accent/10 px-4 py-2 rounded-full">
                  <CheckCircle className="h-5 w-5 text-accent flex-shrink-0" />
                  <span className="text-muted-foreground">
                    <EditableText tKey={key} />
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default AutoMode;