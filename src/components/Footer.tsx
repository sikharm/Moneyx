import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Mail, Phone, MapPin, MessageCircle } from 'lucide-react';
import EditableText from './EditableText';
import EditableSetting from './EditableSetting';

const Footer = () => {
  const { t } = useLanguage();

  const quickLinks = [
    { to: '/', label: t('nav.home') || 'Home' },
    { to: '/about', label: t('nav.about') || 'About' },
    { to: '/auto-mode', label: t('nav.autoMode') === 'nav.autoMode' ? 'Auto Mode' : t('nav.autoMode') },
    { to: '/hybrid-mode', label: t('nav.hybridMode') === 'nav.hybridMode' ? 'Hybrid Mode' : t('nav.hybridMode') },
    { to: '/performance', label: t('nav.performance') || 'Performance' },
    { to: '/download', label: t('nav.download') || 'Download' },
    { to: '/contact', label: t('nav.contact') || 'Contact' },
  ];

  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-foreground">
              <EditableText tKey="site.title" fallback="Moneyx" />
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              <EditableText 
                tKey="footer.description" 
                fallback="Advanced forex trading solutions with Expert Advisors. We provide automated and hybrid trading modes to help you achieve consistent profits in the forex market." 
              />
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-foreground">
              <EditableText tKey="footer.quickLinks" fallback="Quick Links" />
            </h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.to}>
                  <Link 
                    to={link.to} 
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-foreground">
              <EditableText tKey="footer.contactUs" fallback="Contact Us" />
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-muted-foreground text-sm">
                <Mail className="h-4 w-4 text-primary flex-shrink-0" />
                <EditableSetting settingKey="contact_email" fallback="contact@moneyx.com" />
              </li>
              <li className="flex items-center gap-3 text-muted-foreground text-sm">
                <Phone className="h-4 w-4 text-primary flex-shrink-0" />
                <EditableSetting settingKey="contact_phone" fallback="+856 20 xxxx xxxx" />
              </li>
              <li className="flex items-center gap-3 text-muted-foreground text-sm">
                <MessageCircle className="h-4 w-4 text-primary flex-shrink-0" />
                <span>WhatsApp: </span>
                <EditableSetting settingKey="contact_whatsapp" fallback="+856 20 xxxx xxxx" />
              </li>
              <li className="flex items-start gap-3 text-muted-foreground text-sm">
                <MapPin className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                <EditableSetting settingKey="contact_address" fallback="Vientiane, Laos" />
              </li>
            </ul>
          </div>

          {/* Trading Hours */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-foreground">
              <EditableText tKey="footer.tradingHours" fallback="Trading Hours" />
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              <EditableText 
                tKey="footer.tradingHoursDetail" 
                fallback="Forex market operates 24/5. Our EA runs automatically during market hours. Support available Mon-Fri, 9AM-6PM (Laos Time)." 
              />
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()}{' '}
            <EditableText tKey="site.title" fallback="Moneyx" />
            . <EditableText tKey="footer.allRightsReserved" fallback="All rights reserved." />
          </p>
          
          {/* Social Media Links */}
          <div className="flex items-center gap-4">
            <a 
              href="https://www.facebook.com/MonXGold" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="Facebook"
            >
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
            <a 
              href="https://www.youtube.com/@MoneyX-la" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="YouTube"
            >
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>
          </div>
          
          <div className="flex gap-6">
            <Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors text-sm">
              <EditableText tKey="footer.privacy" fallback="Privacy Policy" />
            </Link>
            <Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors text-sm">
              <EditableText tKey="footer.terms" fallback="Terms of Service" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
