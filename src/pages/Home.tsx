import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { ArrowRight, BarChart3, Zap, Shield, TrendingUp, Clock, Facebook, Calendar } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import FacebookWidget from "@/components/FacebookWidget";
import EconomicCalendarWidget from "@/components/EconomicCalendarWidget";
import EditableText from "@/components/EditableText";
const Home = () => {
  const { t } = useLanguage();

  const features = [
    {
      icon: <Zap className="h-8 w-8" />,
      titleKey: 'home.features.lightning_fast',
      descKey: 'home.features.lightning_fast_desc',
    },
    {
      icon: <Shield className="h-8 w-8" />,
      titleKey: 'home.features.secure_reliable',
      descKey: 'home.features.secure_reliable_desc',
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      titleKey: 'home.features.proven_results',
      descKey: 'home.features.proven_results_desc',
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      titleKey: 'home.features.advanced_analytics',
      descKey: 'home.features.advanced_analytics_desc',
    },
    {
      icon: <Clock className="h-8 w-8" />,
      titleKey: 'home.features.trading_24_7',
      descKey: 'home.features.trading_24_7_desc',
    },
  ];


  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-5"></div>
        <div className="container mx-auto text-center relative z-10">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <EditableText tKey="home.hero.title" />
            <br />
            <span className="bg-gradient-hero bg-clip-text text-transparent">
              <EditableText tKey="home.hero.title_highlight" />
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            <EditableText tKey="home.hero.description" />
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-gradient-hero hover:opacity-90 text-lg px-8" asChild>
              <Link to="/download">
                <EditableText tKey="common.download_now" /> <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8" asChild>
              <Link to="/performance"><EditableText tKey="common.view_performance" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Economic Calendar Section */}
      <section className="py-16 px-4 bg-gradient-card">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-8 items-center max-w-5xl mx-auto">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="h-6 w-6 text-primary" />
                <h2 className="text-3xl md:text-4xl font-bold">
                  <EditableText tKey="home.calendar.title" fallback="Economic Calendar" />
                </h2>
              </div>
              <p className="text-lg text-muted-foreground mb-6">
                <EditableText tKey="home.calendar.description" fallback="Stay informed about important economic events that can impact the forex market. Track high-impact news releases in real-time." />
              </p>
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
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                <EditableText tKey="home.updates.title" fallback="Latest Updates" />
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                <EditableText tKey="home.updates.description" fallback="Stay connected with our community. See our latest trading results and updates on Facebook." />
              </p>
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
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <EditableText tKey="home.features.title" />
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              <EditableText tKey="home.features.subtitle" />
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="border-2 hover:border-primary transition-all duration-300 hover:shadow-strong">
                <CardHeader>
                  <div className="bg-gradient-hero p-3 rounded-lg w-fit mb-4">
                    <div className="text-primary-foreground">{feature.icon}</div>
                  </div>
                  <CardTitle className="text-xl">
                    <EditableText tKey={feature.titleKey} />
                  </CardTitle>
                  <CardDescription className="text-base">
                    <EditableText tKey={feature.descKey} />
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Modes Preview Section */}
      <section className="py-20 px-4 bg-gradient-card">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <EditableText tKey="home.modes.title" />
            </h2>
            <p className="text-xl text-muted-foreground">
              <EditableText tKey="home.modes.subtitle" />
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <Card className="border-2 hover:border-primary transition-all duration-300 hover:shadow-strong">
              <CardHeader>
                <CardTitle className="text-2xl">
                  <EditableText tKey="home.modes.auto_title" />
                </CardTitle>
                <CardDescription className="text-base">
                  <EditableText tKey="home.modes.auto_desc" />
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-accent"></div>
                    <EditableText tKey="home.modes.auto_feature1" as="span" />
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-accent"></div>
                    <EditableText tKey="home.modes.auto_feature2" as="span" />
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-accent"></div>
                    <EditableText tKey="home.modes.auto_feature3" as="span" />
                  </li>
                </ul>
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/auto-mode"><EditableText tKey="common.learn_more" /></Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-secondary transition-all duration-300 hover:shadow-strong">
              <CardHeader>
                <CardTitle className="text-2xl">
                  <EditableText tKey="home.modes.hybrid_title" />
                </CardTitle>
                <CardDescription className="text-base">
                  <EditableText tKey="home.modes.hybrid_desc" />
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-secondary"></div>
                    <EditableText tKey="home.modes.hybrid_feature1" as="span" />
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-secondary"></div>
                    <EditableText tKey="home.modes.hybrid_feature2" as="span" />
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-secondary"></div>
                    <EditableText tKey="home.modes.hybrid_feature3" as="span" />
                  </li>
                </ul>
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/hybrid-mode"><EditableText tKey="common.learn_more" /></Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <Card className="bg-gradient-hero border-0 text-primary-foreground">
            <CardContent className="py-16 px-8 text-center">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                <EditableText tKey="home.cta.title" />
              </h2>
              <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
                <EditableText tKey="home.cta.description" />
              </p>
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
