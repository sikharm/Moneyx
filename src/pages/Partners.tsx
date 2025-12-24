import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, MapPin, Mail, Phone, Star, Facebook, Twitter, Linkedin, Instagram } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import EditableText from "@/components/EditableText";

interface Partner {
  id: string;
  name: string;
  logo_url: string | null;
  website_url: string | null;
  description: string | null;
  map_embed_url: string | null;
  trustpilot_url: string | null;
  facebook_url: string | null;
  twitter_url: string | null;
  linkedin_url: string | null;
  instagram_url: string | null;
  youtube_url: string | null;
  tiktok_url: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  display_order: number;
}

// Helper to extract embed URL from iframe HTML or use plain URL
const getEmbedUrl = (input: string | null): string | null => {
  if (!input) return null;
  
  // If it's already a plain embed URL, use it
  if (input.startsWith('https://www.google.com/maps/embed')) return input;
  
  // If it's an iframe, extract the src attribute
  const iframeSrcMatch = input.match(/src="([^"]+)"/);
  if (iframeSrcMatch) return iframeSrcMatch[1];
  
  return input;
};

const Partners = () => {
  const { t } = useLanguage();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPartners = async () => {
      const { data, error } = await supabase
        .from("partners")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (!error && data) {
        setPartners(data);
      }
      setLoading(false);
    };

    fetchPartners();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-hero bg-clip-text text-transparent">
            <EditableText tKey="partners.title" fallback="Our Partners" />
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            <EditableText tKey="partners.subtitle" fallback="Trusted partners who help us deliver excellence" />
          </p>
        </div>

        {/* Partners Grid */}
        {partners.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">
              <EditableText tKey="partners.no_partners" fallback="No partners to display yet" />
            </p>
          </div>
        ) : (
          <div className="grid gap-8">
            {partners.map((partner) => (
              <Card key={partner.id} className="overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300">
                <div className="grid md:grid-cols-3 gap-6">
                  {/* Logo & Basic Info */}
                  <CardHeader className="md:col-span-1 flex flex-col items-center justify-center text-center border-r border-border/30 bg-gradient-to-br from-primary/5 to-transparent">
                    {partner.logo_url ? (
                      <img 
                        src={partner.logo_url} 
                        alt={partner.name} 
                        className="w-32 h-32 object-contain rounded-xl mb-4 bg-background p-2"
                      />
                    ) : (
                      <div className="w-32 h-32 bg-gradient-hero rounded-xl flex items-center justify-center mb-4">
                        <span className="text-4xl font-bold text-primary-foreground">
                          {partner.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <CardTitle className="text-xl">{partner.name}</CardTitle>
                    
                    {/* Social Links */}
                    <div className="flex gap-2 mt-4 flex-wrap">
                      {partner.facebook_url && (
                        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                          <a href={partner.facebook_url} target="_blank" rel="noopener noreferrer">
                            <Facebook className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      {partner.twitter_url && (
                        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                          <a href={partner.twitter_url} target="_blank" rel="noopener noreferrer">
                            <Twitter className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      {partner.linkedin_url && (
                        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                          <a href={partner.linkedin_url} target="_blank" rel="noopener noreferrer">
                            <Linkedin className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      {partner.instagram_url && (
                        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                          <a href={partner.instagram_url} target="_blank" rel="noopener noreferrer">
                            <Instagram className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      {partner.youtube_url && (
                        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                          <a href={partner.youtube_url} target="_blank" rel="noopener noreferrer">
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                            </svg>
                          </a>
                        </Button>
                      )}
                      {partner.tiktok_url && (
                        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                          <a href={partner.tiktok_url} target="_blank" rel="noopener noreferrer">
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                            </svg>
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardHeader>

                  {/* Details */}
                  <CardContent className="md:col-span-2 pt-6 space-y-4">
                    {partner.description && (
                      <p className="text-muted-foreground">{partner.description}</p>
                    )}

                    <div className="flex flex-wrap gap-4 pt-4">
                      {partner.website_url && (
                        <Button variant="outline" size="sm" className="gap-2" asChild>
                          <a href={partner.website_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                            Website
                          </a>
                        </Button>
                      )}
                      {partner.trustpilot_url && (
                        <Button variant="outline" size="sm" className="gap-2 border-green-500/50 text-green-600 hover:bg-green-500/10" asChild>
                          <a href={partner.trustpilot_url} target="_blank" rel="noopener noreferrer">
                            <Star className="h-4 w-4" />
                            Trustpilot
                          </a>
                        </Button>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground pt-2">
                      {partner.email && (
                        <a href={`mailto:${partner.email}`} className="flex items-center gap-1 hover:text-primary transition-colors">
                          <Mail className="h-4 w-4" />
                          {partner.email}
                        </a>
                      )}
                      {partner.phone && (
                        <a href={`tel:${partner.phone}`} className="flex items-center gap-1 hover:text-primary transition-colors">
                          <Phone className="h-4 w-4" />
                          {partner.phone}
                        </a>
                      )}
                      {partner.address && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {partner.address}
                        </span>
                      )}
                    </div>

                    {/* Map Embed */}
                    {partner.map_embed_url && getEmbedUrl(partner.map_embed_url) && (
                      <div className="pt-4">
                        <iframe
                          src={getEmbedUrl(partner.map_embed_url)!}
                          width="100%"
                          height="200"
                          style={{ border: 0, borderRadius: '0.5rem' }}
                          allowFullScreen
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                        />
                      </div>
                    )}
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Partners;
