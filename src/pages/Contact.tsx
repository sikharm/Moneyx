import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MapPin, Loader2, MessageCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";
import EditableText from "@/components/EditableText";
import EditableSetting from "@/components/EditableSetting";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  email: z.string().trim().email("Invalid email address").max(255, "Email must be less than 255 characters"),
  subject: z.string().trim().min(1, "Subject is required").max(200, "Subject must be less than 200 characters"),
  message: z.string().trim().min(1, "Message is required").max(2000, "Message must be less than 2000 characters"),
});

// Rate limiting constants
const RATE_LIMIT_KEY = 'contact_form_submissions';
const MAX_SUBMISSIONS = 3;
const TIME_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds
const MIN_SUBMISSION_TIME = 3000; // 3 seconds minimum to fill form

// Rate limiting helper functions
const checkRateLimit = (): { allowed: boolean; remaining: number } => {
  const now = Date.now();
  const submissions = JSON.parse(localStorage.getItem(RATE_LIMIT_KEY) || '[]');
  
  // Filter to only recent submissions within time window
  const recentSubmissions = submissions.filter(
    (timestamp: number) => now - timestamp < TIME_WINDOW
  );
  
  return {
    allowed: recentSubmissions.length < MAX_SUBMISSIONS,
    remaining: MAX_SUBMISSIONS - recentSubmissions.length
  };
};

const recordSubmission = () => {
  const now = Date.now();
  const submissions = JSON.parse(localStorage.getItem(RATE_LIMIT_KEY) || '[]');
  const recentSubmissions = submissions.filter(
    (timestamp: number) => now - timestamp < TIME_WINDOW
  );
  recentSubmissions.push(now);
  localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(recentSubmissions));
};

const Contact = () => {
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formLoadTime] = useState(Date.now()); // Track when form loaded
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    website: "", // Honeypot field
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Honeypot check - silently "succeed" if bot detected
    if (formData.website) {
      toast.success(t('contact.form.success'));
      setFormData({ name: "", email: "", subject: "", message: "", website: "" });
      return;
    }
    
    // Time-based check - form filled too quickly (likely a bot)
    if (Date.now() - formLoadTime < MIN_SUBMISSION_TIME) {
      toast.error(t('contact.form.error'));
      return;
    }
    
    // Rate limit check
    const { allowed } = checkRateLimit();
    if (!allowed) {
      toast.error(t('contact.form.rate_limit') || "You've submitted too many messages. Please try again later.");
      return;
    }
    
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

      // Record successful submission for rate limiting
      recordSubmission();
      
      toast.success(t('contact.form.success'));
      setFormData({ name: "", email: "", subject: "", message: "", website: "" });
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
            <span className="bg-gradient-hero bg-clip-text text-transparent">
              <EditableText tKey="contact.hero.title" />
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            <EditableText tKey="contact.hero.description" />
          </p>
        </div>

        {/* Contact Info Cards */}
        <section className="mb-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-2 hover:border-primary transition-all duration-300 text-center">
              <CardHeader>
                <div className="bg-gradient-hero p-3 rounded-lg w-fit mx-auto mb-3">
                  <Mail className="h-6 w-6 text-primary-foreground" />
                </div>
                <CardTitle className="text-lg">
                  <EditableText tKey="contact.info.email" />
                </CardTitle>
                <CardDescription className="text-base font-semibold text-foreground">
                  <EditableSetting settingKey="contact_email" fallback="support@xaubot.com" />
                </CardDescription>
                <CardDescription className="text-sm">
                  <EditableText tKey="contact.info.email_desc" />
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary transition-all duration-300 text-center">
              <CardHeader>
                <div className="bg-gradient-hero p-3 rounded-lg w-fit mx-auto mb-3">
                  <Phone className="h-6 w-6 text-primary-foreground" />
                </div>
                <CardTitle className="text-lg">
                  <EditableText tKey="contact.info.phone" />
                </CardTitle>
                <CardDescription className="text-base font-semibold text-foreground">
                  <EditableSetting settingKey="contact_phone" fallback="+856 20 1234 5678" />
                </CardDescription>
                <CardDescription className="text-sm">
                  <EditableText tKey="contact.info.phone_desc" />
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary transition-all duration-300 text-center">
              <CardHeader>
                <div className="bg-gradient-hero p-3 rounded-lg w-fit mx-auto mb-3">
                  <MapPin className="h-6 w-6 text-primary-foreground" />
                </div>
                <CardTitle className="text-lg">
                  <EditableText tKey="contact.info.office" />
                </CardTitle>
                <CardDescription className="text-base font-semibold text-foreground">
                  <EditableSetting settingKey="contact_address" fallback="Vientiane, Laos" />
                </CardDescription>
                <CardDescription className="text-sm">
                  <EditableSetting settingKey="office_hours" fallback="Monday - Friday: 9:00 AM - 6:00 PM" />
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary transition-all duration-300 text-center">
              <CardHeader>
                <div className="bg-[#25D366] p-3 rounded-lg w-fit mx-auto mb-3">
                  <MessageCircle className="h-6 w-6 text-primary-foreground" />
                </div>
                <CardTitle className="text-lg">
                  <EditableText tKey="contact.info.whatsapp" fallback="WhatsApp" />
                </CardTitle>
                <CardDescription className="text-base font-semibold text-foreground">
                  <EditableSetting settingKey="contact_whatsapp" fallback="+856 20 1234 5678" />
                </CardDescription>
                <CardDescription className="text-sm">
                  <EditableText tKey="contact.info.whatsapp_desc" fallback="Quick responses" />
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        {/* Contact Form & Facebook Updates */}
        <section>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-2xl">
                  <EditableText tKey="contact.form.title" />
                </CardTitle>
                <CardDescription>
                  <EditableText tKey="contact.form.subtitle" />
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Honeypot field - hidden from users, bots will fill it */}
                  <div 
                    style={{ position: 'absolute', left: '-9999px', opacity: 0 }} 
                    aria-hidden="true"
                  >
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      name="website"
                      tabIndex={-1}
                      autoComplete="off"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    />
                  </div>

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
                  <CardTitle><EditableText tKey="contact.faq.title" /></CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2"><EditableText tKey="contact.faq.q1" /></h3>
                    <p className="text-muted-foreground">
                      <EditableText tKey="contact.faq.a1" />
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2"><EditableText tKey="contact.faq.q2" /></h3>
                    <p className="text-muted-foreground">
                      <EditableText tKey="contact.faq.a2" />
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2"><EditableText tKey="contact.faq.q3" /></h3>
                    <p className="text-muted-foreground">
                      <EditableText tKey="contact.faq.a3" />
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-hero border-0 text-primary-foreground">
                <CardContent className="py-8">
                  <h3 className="text-2xl font-bold mb-2">
                    <EditableText tKey="contact.urgent.title" />
                  </h3>
                  <p className="mb-4 opacity-90">
                    <EditableText tKey="contact.urgent.description" />
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <a href="mailto:support@xaubot.com" className="flex-1">
                      <Button
                        size="lg"
                        variant="secondary"
                        className="w-full bg-background text-foreground hover:bg-background/90"
                      >
                        <Mail className="mr-2 h-4 w-4" />
                        {t('common.email_us')}
                      </Button>
                    </a>
                    <a 
                      href="https://wa.me/8562012345678?text=Hello%2C%20I%20need%20help%20with%20XAUBot" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex-1"
                    >
                      <Button
                        size="lg"
                        variant="secondary"
                        className="w-full bg-[#25D366] text-primary-foreground hover:bg-[#25D366]/90"
                      >
                        <MessageCircle className="mr-2 h-4 w-4" />
                        {t('common.chat_whatsapp') || 'Chat on WhatsApp'}
                      </Button>
                    </a>
                  </div>
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
