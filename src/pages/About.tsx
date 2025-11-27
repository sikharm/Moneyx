import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Target, Lightbulb, Award } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const About = () => {
  const { t } = useLanguage();

  const values = [
    {
      icon: <Users className="h-8 w-8" />,
      title: t('about.values.trader_focused'),
      description: t('about.values.trader_focused_desc'),
    },
    {
      icon: <Target className="h-8 w-8" />,
      title: t('about.values.results_driven'),
      description: t('about.values.results_driven_desc'),
    },
    {
      icon: <Lightbulb className="h-8 w-8" />,
      title: t('about.values.innovation_first'),
      description: t('about.values.innovation_first_desc'),
    },
    {
      icon: <Award className="h-8 w-8" />,
      title: t('about.values.proven_excellence'),
      description: t('about.values.proven_excellence_desc'),
    },
  ];

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            {t('about.hero.title')} <span className="bg-gradient-hero bg-clip-text text-transparent">{t('about.hero.subtitle')}</span>
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            {t('about.hero.description')}
          </p>
        </div>

        {/* Mission Section */}
        <section className="mb-20">
          <Card className="border-2">
            <CardContent className="py-12 px-8">
              <h2 className="text-3xl font-bold mb-6 text-center">{t('about.mission.title')}</h2>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto text-center">
                {t('about.mission.description')}
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Story Section */}
        <section className="mb-20">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">{t('about.story.title')}</h2>
            <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
              <p>{t('about.story.p1')}</p>
              <p>{t('about.story.p2')}</p>
              <p>{t('about.story.p3')}</p>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-12 text-center">{t('about.values.title')}</h2>
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

      </div>
    </div>
  );
};

export default About;
