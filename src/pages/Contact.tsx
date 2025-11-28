import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, MapPin, MessageCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import EditableText from "@/components/EditableText";
import EditableSetting from "@/components/EditableSetting";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const Contact = () => {
  const { t } = useLanguage();
  const [contactEmail, setContactEmail] = useState("support@xaubot.com");
  const [contactPhone, setContactPhone] = useState("+856 20 1234 5678");
  const [contactWhatsapp, setContactWhatsapp] = useState("+856 20 1234 5678");

  // Load settings for clickable actions
  useEffect(() => {
    const loadSettings = async () => {
      const { data } = await supabase
        .from('site_settings')
        .select('setting_key, setting_value')
        .in('setting_key', ['contact_email', 'contact_phone', 'contact_whatsapp']);
      
      if (data) {
        data.forEach(setting => {
          if (setting.setting_key === 'contact_email') setContactEmail(setting.setting_value);
          if (setting.setting_key === 'contact_phone') setContactPhone(setting.setting_value);
          if (setting.setting_key === 'contact_whatsapp') setContactWhatsapp(setting.setting_value);
        });
      }
    };
    loadSettings();
  }, []);

  const handleEmailClick = () => {
    window.location.href = `mailto:${contactEmail}`;
  };

  const handlePhoneClick = () => {
    const cleanPhone = contactPhone.replace(/\s/g, '');
    window.location.href = `tel:${cleanPhone}`;
  };

  const handleWhatsappClick = () => {
    const cleanPhone = contactWhatsapp.replace(/\s/g, '').replace('+', '');
    window.open(`https://wa.me/${cleanPhone}`, '_blank');
  };

  const handleOfficeClick = () => {
    window.open('https://maps.google.com/?q=Vientiane,Laos', '_blank');
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
            <Card 
              className="border-2 hover:border-primary transition-all duration-300 text-center cursor-pointer hover:shadow-lg"
              onClick={handleEmailClick}
            >
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

            <Card 
              className="border-2 hover:border-primary transition-all duration-300 text-center cursor-pointer hover:shadow-lg"
              onClick={handlePhoneClick}
            >
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

            <Card 
              className="border-2 hover:border-primary transition-all duration-300 text-center cursor-pointer hover:shadow-lg"
              onClick={handleOfficeClick}
            >
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

            <Card 
              className="border-2 hover:border-primary transition-all duration-300 text-center cursor-pointer hover:shadow-lg"
              onClick={handleWhatsappClick}
            >
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

        {/* FAQ Section */}
        <section>
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
        </section>
      </div>
    </div>
  );
};

export default Contact;
