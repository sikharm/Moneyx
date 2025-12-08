import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { ArrowRight, BarChart3, Zap, Shield, TrendingUp, Clock, Facebook, Calendar } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import FacebookWidget from "@/components/FacebookWidget";
import EconomicCalendarWidget from "@/components/EconomicCalendarWidget";
import EditableText from "@/components/EditableText";

const Home = () => {
  const { t } = useLanguage();

  const features = [
    { icon: <Zap className="h-8 w-8" />, titleKey: 'home.features.lightning_fast' },
    { icon: <Shield className="h-8 w-8" />, titleKey: 'home.features.secure_reliable' },
    { icon: <TrendingUp className="h-8 w-8" />, titleKey: 'home.features.proven_results' },
    { icon: <BarChart3 className="h-8 w-8" />, titleKey: 'home.features.advanced_analytics' },
    { icon: <Clock className="h-8 w-8" />, titleKey: 'home.features.trading_24_7' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-5"></div>
        <div className="container mx-auto text-center relative z-10">
          <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
            <EditableText tKey="home.hero.title" />
            <br />
            <span className="bg-gradient-hero bg-clip-text text-transparent">
              <EditableText tKey="home.hero.title_highlight" />
            </span>
          </h1>
          <Button size="lg" className="bg-gradient-hero hover:opacity-90 text-lg px-8" asChild>
            <Link to="/download">
              <EditableText tKey="common.download_now" /> <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Economic Calendar Section */}
      <section className="py-16 px-4 bg-gradient-card">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-8 items-center max-w-5xl mx-auto">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <Calendar className="h-6 w-6 text-primary" />
                <h2 className="text-3xl md:text-4xl font-bold">
                  <EditableText tKey="home.calendar.title" fallback="Economic Calendar" />
                </h2>
              </div>
              <Button variant="outline" className="gap-2" asChild>
                <a href="https://www.forexfactory.com/calendar" target="_blank" rel="noopener noreferrer">
                  <Calendar className="h-4 w-4" />
                  <EditableText tKey="home.calendar.view_full" fallback="View Full Calendar on Forex Factory" />
                </a>
              </Button>
            </div>
            <EconomicCalendarWidget showCard={false} height={350} />
          </div>
        </div>
      </section>

      {/* Social Updates Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-8 items-center max-w-5xl mx-auto">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <Facebook className="h-6 w-6 text-primary" />
                <h2 className="text-3xl md:text-4xl font-bold">
                  <EditableText tKey="home.updates.title" fallback="Latest Updates" />
                </h2>
              </div>
              <Button variant="outline" className="gap-2" asChild>
                <a href="https://www.facebook.com/SabuyHUBlao" target="_blank" rel="noopener noreferrer">
                  <Facebook className="h-4 w-4" />
                  <EditableText tKey="home.updates.follow_button" fallback="Follow Us on Facebook" />
                </a>
              </Button>
            </div>
            <FacebookWidget showCard={false} />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-12 text-center">
            <EditableText tKey="home.features.title" />
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="border-2 hover:border-primary transition-all duration-300 hover:shadow-strong text-center">
                <CardHeader className="pb-4">
                  <div className="bg-gradient-hero p-3 rounded-lg w-fit mx-auto mb-3">
                    <div className="text-primary-foreground">{feature.icon}</div>
                  </div>
                  <CardTitle className="text-base">
                    <EditableText tKey={feature.titleKey} />
                  </CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Modes Preview Section */}
      <section className="py-20 px-4 bg-gradient-card">
        <div className="container mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-12 text-center">
            <EditableText tKey="home.modes.title" />
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            <Card className="border-2 hover:border-primary transition-all duration-300 hover:shadow-strong text-center">
              <CardHeader className="pb-4">
                <div className="bg-gradient-hero p-3 rounded-lg w-fit mx-auto mb-3">
                  <Zap className="h-8 w-8 text-primary-foreground" />
                </div>
                <CardTitle className="text-2xl mb-4">
                  <EditableText tKey="home.modes.auto_title" />
                </CardTitle>
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/auto-mode"><EditableText tKey="common.learn_more" /></Link>
                </Button>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-secondary transition-all duration-300 hover:shadow-strong text-center">
              <CardHeader className="pb-4">
                <div className="bg-secondary p-3 rounded-lg w-fit mx-auto mb-3">
                  <TrendingUp className="h-8 w-8 text-secondary-foreground" />
                </div>
                <CardTitle className="text-2xl mb-4">
                  <EditableText tKey="home.modes.hybrid_title" />
                </CardTitle>
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/hybrid-mode"><EditableText tKey="common.learn_more" /></Link>
                </Button>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <Card className="bg-gradient-hero border-0 text-primary-foreground">
            <CardContent className="py-16 px-8 text-center">
              <h2 className="text-4xl md:text-5xl font-bold mb-8">
                <EditableText tKey="home.cta.title" />
              </h2>
              <Button
                size="lg"
                variant="secondary"
                className="text-lg px-8 bg-background text-foreground hover:bg-background/90"
                asChild
              >
                <Link to="/download">
                  <EditableText tKey="home.cta.button" /> <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Home;