import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, MessageSquare, Phone, MapPin, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  email: z.string().trim().email("Invalid email address").max(255, "Email must be less than 255 characters"),
  subject: z.string().trim().min(1, "Subject is required").max(200, "Subject must be less than 200 characters"),
  message: z.string().trim().min(1, "Message is required").max(2000, "Message must be less than 2000 characters"),
});

const Contact = () => {
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    const validation = contactSchema.safeParse(formData);
    if (!validation.success) {
      const firstError = validation.error.errors[0];
      toast.error(firstError.message);
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('contact_messages')
        .insert({
          name: formData.name.trim(),
          email: formData.email.trim(),
          subject: formData.subject.trim(),
          message: formData.message.trim(),
        });

      if (error) throw error;

      toast.success(t('contact.form.success'));
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error: any) {
      console.error('Error submitting contact form:', error);
      toast.error(t('contact.form.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

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
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t('common.name')}</Label>
                    <Input 
                      id="name" 
                      placeholder={t('contact.form.name_placeholder')}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      disabled={isSubmitting}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">{t('common.email')}</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder={t('contact.form.email_placeholder')}
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      disabled={isSubmitting}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">{t('common.subject')}</Label>
                    <Input 
                      id="subject" 
                      placeholder={t('contact.form.subject_placeholder')}
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      disabled={isSubmitting}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">{t('common.message')}</Label>
                    <Textarea
                      id="message"
                      placeholder={t('contact.form.message_placeholder')}
                      rows={6}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      disabled={isSubmitting}
                      required
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-hero hover:opacity-90" 
                    size="lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t('common.sending')}
                      </>
                    ) : (
                      t('common.send_message')
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="space-y-6">
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
