import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Users, Settings, Clock, Newspaper, Hand, TrendingUp, CheckCircle, Shield, BarChart3 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const HybridMode = () => {
  const { t } = useLanguage();

  const features = [
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "Autonomous Trade Execution",
      description: "EA automatically analyzes the market and executes trades based on your configured strategy and settings.",
    },
    {
      icon: <Settings className="h-6 w-6" />,
      title: "Customizable Settings",
      description: "Full control over lot size, volume, order quantity, grid settings, profit targets, and trading sessions.",
    },
    {
      icon: <Newspaper className="h-6 w-6" />,
      title: "News Event Protection",
      description: "EA automatically pauses trading before and after high-impact news events to protect your capital.",
    },
    {
      icon: <Hand className="h-6 w-6" />,
      title: "Manual Order Control",
      description: "Close individual orders, all buy/sell orders, or all profitable positions with one click anytime.",
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Trading Session Filter",
      description: "Set specific trading hours and sessions to match your preferred market conditions.",
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Risk Management",
      description: "Built-in hedging settings, fixed money loss limits, and grid profit/loss targets for protection.",
    },
  ];

  const benefits = [
    "Automated trading with full manual override capability",
    "Customizable lot sizes and grid trading parameters",
    "News filter with adjustable pause times before and after events",
    "Multiple trading sessions for different market hours",
    "Real-time P/L tracking (Daily, Weekly, Monthly, All Time)",
    "One-click order management (Close All, Close Buy, Close Sell)",
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
            <span className="bg-gradient-hero bg-clip-text text-transparent">{t('hybrid.hero.title')}</span>
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed mb-8">
            The perfect balance between automated trading and manual control. EA executes trades autonomously while you maintain full control over settings and can intervene anytime.
          </p>
          <Button size="lg" className="bg-gradient-hero hover:opacity-90" asChild>
            <Link to="/download">{t('hybrid.hero.button')}</Link>
          </Button>
        </div>

        {/* How It Works */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-12 text-center">{t('hybrid.how_it_works.title')}</h2>
          <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <Card className="border-2 text-center">
              <CardHeader>
                <div className="bg-secondary rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-secondary-foreground">1</span>
                </div>
                <CardTitle className="text-lg">Configure Settings</CardTitle>
                <CardDescription>
                  Set your lot size, grid parameters, profit targets, and trading sessions
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 text-center">
              <CardHeader>
                <div className="bg-secondary rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-secondary-foreground">2</span>
                </div>
                <CardTitle className="text-lg">EA Trades Automatically</CardTitle>
                <CardDescription>
                  The EA analyzes the market and executes trades based on your configured strategy
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 text-center">
              <CardHeader>
                <div className="bg-secondary rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-secondary-foreground">3</span>
                </div>
                <CardTitle className="text-lg">News Protection Active</CardTitle>
                <CardDescription>
                  Trading automatically pauses before and after high-impact news events
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 text-center">
              <CardHeader>
                <div className="bg-secondary rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-secondary-foreground">4</span>
                </div>
                <CardTitle className="text-lg">Manual Override Anytime</CardTitle>
                <CardDescription>
                  Close orders manually whenever you want with one-click buttons
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        {/* Features Grid */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-12 text-center">{t('hybrid.features.title')}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="border-2 hover:border-secondary transition-all duration-300">
                <CardHeader>
                  <div className="bg-secondary p-2 rounded-lg w-fit mb-3">
                    <div className="text-secondary-foreground">{feature.icon}</div>
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        {/* Key Settings */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-12 text-center">Configurable Parameters</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-secondary" />
                  Trade Settings
                </CardTitle>
                <CardDescription>
                  Lot size, trade type mode, signal strategy, grid settings
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-secondary" />
                  Profit/Loss Targets
                </CardTitle>
                <CardDescription>
                  Grid TP points, target profit per group, fixed money loss
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Newspaper className="h-5 w-5 text-secondary" />
                  News Filter
                </CardTitle>
                <CardDescription>
                  Filter high impact news, custom news, pause times before/after
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5 text-secondary" />
                  Trading Sessions
                </CardTitle>
                <CardDescription>
                  Multiple tradable sessions, specific hours for each day
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-12 text-center">{t('hybrid.benefits.title')}</h2>
          <div className="max-w-3xl mx-auto">
            <p className="text-lg text-muted-foreground mb-6 text-center">
              Get the best of both worlds - automated efficiency with manual control when you need it.
            </p>
            <ul className="space-y-3">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-secondary flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Use Cases */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-12 text-center">{t('hybrid.perfect_for.title')}</h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card className="border-2">
              <CardHeader>
                <CardTitle>Busy Traders</CardTitle>
                <CardDescription>
                  Let the EA trade while you work, step in to manage positions when convenient
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <CardTitle>Risk-Conscious Traders</CardTitle>
                <CardDescription>
                  Benefit from news protection and manual override to manage risk effectively
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <CardTitle>Control Seekers</CardTitle>
                <CardDescription>
                  Enjoy automated execution while maintaining full control over settings and closures
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section>
          <Card className="bg-gradient-hero border-0 text-primary-foreground">
            <CardContent className="py-16 px-8 text-center">
              <h2 className="text-4xl font-bold mb-4">{t('hybrid.cta.title')}</h2>
              <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
                Experience the perfect balance of automation and control with Hybrid Mode.
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

export default HybridMode;
