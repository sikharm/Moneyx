import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Target, Lightbulb, Award } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import EditableText from "@/components/EditableText";

const About = () => {
  const { t } = useLanguage();

  const values = [
    { icon: <Users className="h-8 w-8" />, titleKey: 'about.values.trader_focused' },
    { icon: <Target className="h-8 w-8" />, titleKey: 'about.values.results_driven' },
    { icon: <Lightbulb className="h-8 w-8" />, titleKey: 'about.values.innovation_first' },
    { icon: <Award className="h-8 w-8" />, titleKey: 'about.values.proven_excellence' },
  ];

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <EditableText tKey="about.hero.title" /> <span className="bg-gradient-hero bg-clip-text text-transparent"><EditableText tKey="about.hero.subtitle" /></span>
          </h1>
        </div>

        {/* Mission Section */}
        <section className="mb-20">
          <Card className="border-2">
            <CardContent className="py-12 px-8">
              <h2 className="text-3xl font-bold mb-6 text-center">
                <EditableText tKey="about.mission.title" />
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto text-center">
                <EditableText tKey="about.mission.description" />
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Values Section */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-12 text-center">
            <EditableText tKey="about.values.title" />
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <Card key={index} className="border-2 hover:border-primary transition-all duration-300 text-center">
                <CardHeader>
                  <div className="bg-gradient-hero p-3 rounded-lg w-fit mx-auto mb-4">
                    <div className="text-primary-foreground">{value.icon}</div>
                  </div>
                  <CardTitle className="text-lg">
                    <EditableText tKey={value.titleKey} />
                  </CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
};

export default About;