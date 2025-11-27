import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Target, Lightbulb, Award } from "lucide-react";

const About = () => {
  const values = [
    {
      icon: <Users className="h-8 w-8" />,
      title: "Trader-Focused",
      description: "Built by experienced traders who understand the market's challenges and opportunities.",
    },
    {
      icon: <Target className="h-8 w-8" />,
      title: "Results-Driven",
      description: "Every feature is designed with one goal: maximizing your trading profitability.",
    },
    {
      icon: <Lightbulb className="h-8 w-8" />,
      title: "Innovation First",
      description: "Continuously evolving with cutting-edge AI and trading technologies.",
    },
    {
      icon: <Award className="h-8 w-8" />,
      title: "Proven Excellence",
      description: "Recognized by industry experts and trusted by thousands of traders worldwide.",
    },
  ];

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            About <span className="bg-gradient-hero bg-clip-text text-transparent">EA Trading</span>
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            We're revolutionizing automated trading with intelligent Expert Advisor systems
            that combine advanced algorithms with proven trading strategies.
          </p>
        </div>

        {/* Mission Section */}
        <section className="mb-20">
          <Card className="border-2">
            <CardContent className="py-12 px-8">
              <h2 className="text-3xl font-bold mb-6 text-center">Our Mission</h2>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto text-center">
                To empower traders of all levels with professional-grade automated trading tools
                that are both powerful and easy to use. We believe that successful trading should
                be accessible to everyone, not just institutional investors.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Story Section */}
        <section className="mb-20">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">Our Story</h2>
            <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
              <p>
                EA Trading was founded by a team of professional traders and software engineers
                who were frustrated with the complexity and unreliability of existing automated
                trading solutions. We knew there had to be a better way.
              </p>
              <p>
                After years of research and development, we created an Expert Advisor system that
                combines the precision of algorithmic trading with the flexibility that modern
                traders demand. Our platform has been refined through countless market conditions
                and real-world trading scenarios.
              </p>
              <p>
                Today, we're proud to serve thousands of traders worldwide, helping them achieve
                consistent profitability through our Auto Mode and Hybrid Mode trading systems.
              </p>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-12 text-center">Our Core Values</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {values.map((value, index) => (
              <Card key={index} className="border-2 hover:border-primary transition-all duration-300">
                <CardHeader>
                  <div className="bg-gradient-hero p-3 rounded-lg w-fit mb-4">
                    <div className="text-primary-foreground">{value.icon}</div>
                  </div>
                  <CardTitle className="text-2xl">{value.title}</CardTitle>
                  <CardDescription className="text-base pt-2">
                    {value.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        {/* Stats Section */}
        <section className="bg-gradient-card rounded-2xl p-12">
          <h2 className="text-3xl font-bold mb-12 text-center">By The Numbers</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold bg-gradient-hero bg-clip-text text-transparent mb-2">
                2019
              </div>
              <div className="text-muted-foreground">Founded</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold bg-gradient-hero bg-clip-text text-transparent mb-2">
                10K+
              </div>
              <div className="text-muted-foreground">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold bg-gradient-hero bg-clip-text text-transparent mb-2">
                $50M+
              </div>
              <div className="text-muted-foreground">Traded Volume</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold bg-gradient-hero bg-clip-text text-transparent mb-2">
                98.5%
              </div>
              <div className="text-muted-foreground">Satisfaction</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;
