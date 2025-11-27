import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, MessageSquare, Phone, MapPin, Facebook } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const Contact = () => {
  const { t } = useLanguage();

  useEffect(() => {
    // Load Facebook SDK
    const script = document.createElement("script");
    script.src = "https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v18.0";
    script.async = true;
    script.defer = true;
    script.crossOrigin = "anonymous";
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const contactInfo = [
    {
      icon: <Mail className="h-6 w-6" />,
      title: t('contact.info.email'),
      content: "support@eatrading.com",
      description: t('contact.info.email_desc'),
    },
    {
      icon: <Phone className="h-6 w-6" />,
      title: t('contact.info.phone'),
      content: "+1 (555) 123-4567",
      description: t('contact.info.phone_desc'),
    },
    {
      icon: <MapPin className="h-6 w-6" />,
      title: t('contact.info.office'),
      content: "123 Trading Street",
      description: "New York, NY 10001",
    },
    {
      icon: <MessageSquare className="h-6 w-6" />,
      title: t('contact.info.live_chat'),
      content: t('contact.info.live_chat_content'),
      description: t('contact.info.live_chat_desc'),
    },
  ];

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-hero bg-clip-text text-transparent">{t('contact.hero.title')}</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('contact.hero.description')}
          </p>
        </div>

        {/* Contact Info Cards */}
        <section className="mb-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((info, index) => (
              <Card key={index} className="border-2 hover:border-primary transition-all duration-300 text-center">
                <CardHeader>
                  <div className="bg-gradient-hero p-3 rounded-lg w-fit mx-auto mb-3">
                    <div className="text-primary-foreground">{info.icon}</div>
                  </div>
                  <CardTitle className="text-lg">{info.title}</CardTitle>
                  <CardDescription className="text-base font-semibold text-foreground">
                    {info.content}
                  </CardDescription>
                  <CardDescription className="text-sm">{info.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        {/* Contact Form & Facebook Updates */}
        <section>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-2xl">{t('contact.form.title')}</CardTitle>
                <CardDescription>
                  {t('contact.form.subtitle')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t('common.name')}</Label>
                    <Input id="name" placeholder={t('contact.form.name_placeholder')} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">{t('common.email')}</Label>
                    <Input id="email" type="email" placeholder={t('contact.form.email_placeholder')} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">{t('common.subject')}</Label>
                    <Input id="subject" placeholder={t('contact.form.subject_placeholder')} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">{t('common.message')}</Label>
                    <Textarea
                      id="message"
                      placeholder={t('contact.form.message_placeholder')}
                      rows={6}
                    />
                  </div>

                  <Button type="submit" className="w-full bg-gradient-hero hover:opacity-90" size="lg">
                    {t('common.send_message')}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="space-y-6">
              {/* Facebook Updates Section */}
              <Card className="border-2">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="bg-[#1877F2] p-2 rounded-lg">
                      <Facebook className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle>{t('updates.hero.title')}</CardTitle>
                      <CardDescription>{t('updates.hero.description')}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div id="fb-root"></div>
                  <div
                    className="fb-page"
                    data-href="https://www.facebook.com/SabuyHUBlao"
                    data-tabs="timeline"
                    data-width="500"
                    data-height="400"
                    data-small-header="true"
                    data-adapt-container-width="true"
                    data-hide-cover="false"
                    data-show-facepile="false"
                  >
                    <blockquote
                      cite="https://www.facebook.com/SabuyHUBlao"
                      className="fb-xfbml-parse-ignore"
                    >
                      <a href="https://www.facebook.com/SabuyHUBlao">SabuyHUB Lao</a>
                    </blockquote>
                  </div>
                  <a
                    href="https://www.facebook.com/SabuyHUBlao"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mt-4"
                  >
                    <Facebook className="w-4 h-4" />
                    {t('updates.visit_page')}
                  </a>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader>
                  <CardTitle>{t('contact.faq.title')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">{t('contact.faq.q1')}</h3>
                    <p className="text-muted-foreground">
                      {t('contact.faq.a1')}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">{t('contact.faq.q2')}</h3>
                    <p className="text-muted-foreground">
                      {t('contact.faq.a2')}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">{t('contact.faq.q3')}</h3>
                    <p className="text-muted-foreground">
                      {t('contact.faq.a3')}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-hero border-0 text-primary-foreground">
                <CardContent className="py-8">
                  <h3 className="text-2xl font-bold mb-2">{t('contact.urgent.title')}</h3>
                  <p className="mb-4 opacity-90">
                    {t('contact.urgent.description')}
                  </p>
                  <Button
                    size="lg"
                    variant="secondary"
                    className="w-full bg-background text-foreground hover:bg-background/90"
                  >
                    {t('common.start_live_chat')}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Contact;
