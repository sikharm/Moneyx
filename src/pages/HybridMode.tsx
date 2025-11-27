import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Users, Brain, ThumbsUp, AlertCircle, CheckCircle, TrendingUp } from "lucide-react";

const HybridMode = () => {
  const features = [
    {
      icon: <Brain className="h-6 w-6" />,
      title: "AI-Powered Signals",
      description: "Advanced algorithms analyze markets and suggest high-probability trade opportunities.",
    },
    {
      icon: <ThumbsUp className="h-6 w-6" />,
      title: "Manual Approval",
      description: "Review and approve each trade before execution. You're always in control.",
    },
    {
      icon: <AlertCircle className="h-6 w-6" />,
      title: "Real-Time Alerts",
      description: "Instant notifications when trading opportunities match your criteria.",
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "Smart Recommendations",
      description: "Get entry points, stop-loss, and take-profit levels for every signal.",
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Learning Mode",
      description: "Perfect for traders who want to learn while the EA assists them.",
    },
    {
      icon: <CheckCircle className="h-6 w-6" />,
      title: "Flexible Control",
      description: "Modify suggested trades or create your own with EA assistance.",
    },
  ];

  const benefits = [
    "Learn from AI-generated insights",
    "Maintain full control over your trades",
    "Reduce analysis time significantly",
    "Get confirmation on your trade ideas",
    "Perfect for part-time traders",
    "Build confidence in your decisions",
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
            <span className="bg-gradient-hero bg-clip-text text-transparent">Hybrid Mode</span>
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed mb-8">
            The perfect balance between automation and control. Get AI-powered trade suggestions
            while maintaining full approval authority over every position.
          </p>
          <Button size="lg" className="bg-gradient-hero hover:opacity-90" asChild>
            <Link to="/download">Start Hybrid Trading</Link>
          </Button>
        </div>

        {/* How It Works */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-12 text-center">How Hybrid Mode Works</h2>
          <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <Card className="border-2 text-center">
              <CardHeader>
                <div className="bg-secondary rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-secondary-foreground">1</span>
                </div>
                <CardTitle className="text-lg">EA Analyzes</CardTitle>
                <CardDescription>
                  System scans markets for opportunities
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 text-center">
              <CardHeader>
                <div className="bg-secondary rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-secondary-foreground">2</span>
                </div>
                <CardTitle className="text-lg">You Receive Alert</CardTitle>
                <CardDescription>
                  Get notified with trade details
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 text-center">
              <CardHeader>
                <div className="bg-secondary rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-secondary-foreground">3</span>
                </div>
                <CardTitle className="text-lg">Review & Decide</CardTitle>
                <CardDescription>
                  Approve, modify, or reject the trade
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 text-center">
              <CardHeader>
                <div className="bg-secondary rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-secondary-foreground">4</span>
                </div>
                <CardTitle className="text-lg">Trade Executes</CardTitle>
                <CardDescription>
                  EA places your approved trade
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

        {/* Comparison Section */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-12 text-center">Why Choose Hybrid Mode?</h2>
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div>
              <p className="text-lg text-muted-foreground mb-6">
                Hybrid Mode is ideal for traders who value both efficiency and control.
                You get the analytical power of our Expert Advisor combined with your own
                trading intuition and market knowledge.
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
            <div className="space-y-6">
              <Card className="border-2 border-accent">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">Signal Accuracy</span>
                    <span className="text-2xl font-bold text-accent">96%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-accent w-[96%]"></div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-secondary">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">User Satisfaction</span>
                    <span className="text-2xl font-bold text-secondary">97%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-secondary w-[97%]"></div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-primary">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">Time Saved</span>
                    <span className="text-2xl font-bold text-primary">80%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-[80%]"></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-12 text-center">Perfect For</h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card className="border-2">
              <CardHeader>
                <CardTitle>Learning Traders</CardTitle>
                <CardDescription>
                  Study AI-generated signals to improve your own trading skills and market understanding.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <CardTitle>Part-Time Traders</CardTitle>
                <CardDescription>
                  Let the EA do the heavy analysis while you focus on final decisions during your available time.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <CardTitle>Risk-Conscious Traders</CardTitle>
                <CardDescription>
                  Maintain complete control over every trade while benefiting from advanced algorithmic analysis.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section>
          <Card className="bg-gradient-hero border-0 text-primary-foreground">
            <CardContent className="py-16 px-8 text-center">
              <h2 className="text-4xl font-bold mb-4">Ready to Trade Smarter?</h2>
              <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
                Experience the perfect balance of automation and control with Hybrid Mode.
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

export default HybridMode;
