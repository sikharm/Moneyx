import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Zap, Shield, BarChart3, RefreshCw, CheckCircle, Settings } from "lucide-react";

const AutoMode = () => {
  const features = [
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Fully Automated",
      description: "No manual intervention required. The system handles everything from entry to exit.",
    },
    {
      icon: <RefreshCw className="h-6 w-6" />,
      title: "24/7 Operation",
      description: "Continuously monitors markets and executes trades around the clock.",
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Risk Management",
      description: "Built-in stop-loss, take-profit, and position sizing algorithms.",
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Real-Time Analytics",
      description: "Live performance tracking with detailed reporting and statistics.",
    },
    {
      icon: <Settings className="h-6 w-6" />,
      title: "Customizable Settings",
      description: "Adjust risk parameters, trade size, and strategy preferences.",
    },
    {
      icon: <CheckCircle className="h-6 w-6" />,
      title: "Proven Strategy",
      description: "Based on years of backtesting and live trading results.",
    },
  ];

  const benefits = [
    "Eliminate emotional trading decisions",
    "Never miss a trading opportunity",
    "Consistent execution without fatigue",
    "Precise entry and exit timing",
    "Diversify across multiple currency pairs",
    "Focus on other activities while trading",
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
            <span className="bg-gradient-hero bg-clip-text text-transparent">Auto Mode</span>
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed mb-8">
            Set it and forget it. Our fully automated trading system executes trades
            based on proven algorithms while you focus on what matters most.
          </p>
          <Button size="lg" className="bg-gradient-hero hover:opacity-90" asChild>
            <Link to="/download">Start Auto Trading</Link>
          </Button>
        </div>

        {/* How It Works */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-12 text-center">How Auto Mode Works</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="border-2 text-center">
              <CardHeader>
                <div className="bg-gradient-hero rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary-foreground">1</span>
                </div>
                <CardTitle>Configure Settings</CardTitle>
                <CardDescription>
                  Set your risk tolerance, trade size, and preferred currency pairs
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 text-center">
              <CardHeader>
                <div className="bg-gradient-hero rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary-foreground">2</span>
                </div>
                <CardTitle>Activate EA</CardTitle>
                <CardDescription>
                  Turn on the Expert Advisor and let it analyze market conditions
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 text-center">
              <CardHeader>
                <div className="bg-gradient-hero rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary-foreground">3</span>
                </div>
                <CardTitle>Watch It Trade</CardTitle>
                <CardDescription>
                  The system automatically executes trades and manages positions
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        {/* Features Grid */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-12 text-center">Key Features</h2>
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
              <h2 className="text-3xl font-bold mb-6">Why Choose Auto Mode?</h2>
              <p className="text-lg text-muted-foreground mb-6">
                Auto Mode is perfect for traders who want consistent results without spending
                hours monitoring charts. Our system combines sophisticated algorithms with
                proven trading strategies.
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
                  <div className="text-muted-foreground">Average Win Rate</div>
                </div>
                <div className="text-center mb-6">
                  <div className="text-5xl font-bold bg-gradient-success bg-clip-text text-transparent mb-2">
                    3.2x
                  </div>
                  <div className="text-muted-foreground">Average ROI</div>
                </div>
                <div className="text-center">
                  <div className="text-5xl font-bold bg-gradient-success bg-clip-text text-transparent mb-2">
                    5000+
                  </div>
                  <div className="text-muted-foreground">Successful Trades</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section>
          <Card className="bg-gradient-hero border-0 text-primary-foreground">
            <CardContent className="py-16 px-8 text-center">
              <h2 className="text-4xl font-bold mb-4">Ready to Automate Your Trading?</h2>
              <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
                Download Auto Mode now and experience the power of fully automated trading.
              </p>
              <Button
                size="lg"
                variant="secondary"
                className="bg-background text-foreground hover:bg-background/90"
                asChild
              >
                <Link to="/download">Download Now</Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default AutoMode;
