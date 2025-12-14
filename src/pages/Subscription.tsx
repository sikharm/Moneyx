import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Zap, Clock, Crown, Infinity } from 'lucide-react';
import { Link } from 'react-router-dom';

const plans = [
  {
    key: '1month',
    duration: 1,
    price: 3000,
    icon: Clock,
    popular: false,
  },
  {
    key: '3months',
    duration: 3,
    price: 8000,
    icon: Zap,
    popular: false,
  },
  {
    key: '6months',
    duration: 6,
    price: 15000,
    icon: Zap,
    popular: true,
  },
  {
    key: '12months',
    duration: 12,
    price: 25000,
    icon: Crown,
    popular: false,
  },
  {
    key: 'lifetime',
    duration: null,
    price: 35000,
    icon: Infinity,
    popular: false,
  },
];

const features = [
  'subscription.feature.auto_mode',
  'subscription.feature.hybrid_mode',
  'subscription.feature.updates',
  'subscription.feature.support',
];

const Subscription = () => {
  const { t } = useLanguage();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('th-TH').format(price);
  };

  const calculateMonthlyPrice = (price: number, months: number | null) => {
    if (!months) return null;
    return Math.round(price / months);
  };

  return (
    <div className="min-h-screen bg-background py-16 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            {t('subscription.title')}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('subscription.subtitle')}
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-12">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const monthlyPrice = calculateMonthlyPrice(plan.price, plan.duration);
            
            return (
              <Card 
                key={plan.key}
                className={`relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                  plan.popular 
                    ? 'border-primary shadow-lg ring-2 ring-primary/20' 
                    : 'border-border'
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-bl-lg">
                    {t('subscription.popular')}
                  </div>
                )}
                
                <CardHeader className="text-center pb-2">
                  <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
                    plan.popular ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                  }`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-lg">
                    {t(`subscription.plan.${plan.key}`)}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="text-center">
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-foreground">
                      ฿{formatPrice(plan.price)}
                    </span>
                    {monthlyPrice && (
                      <p className="text-sm text-muted-foreground mt-1">
                        ≈ ฿{formatPrice(monthlyPrice)}/{t('subscription.per_month')}
                      </p>
                    )}
                  </div>
                  
                  <ul className="space-y-2 text-sm text-left mb-6">
                    {features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-primary flex-shrink-0" />
                        <span className="text-muted-foreground">{t(feature)}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className={`w-full ${plan.popular ? '' : 'variant-outline'}`}
                    variant={plan.popular ? 'default' : 'outline'}
                    asChild
                  >
                    <Link to="/contact">
                      {t('subscription.contact_us')}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Bottom Info */}
        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            {t('subscription.note')}
          </p>
          <Button variant="link" asChild>
            <Link to="/contact" className="text-primary">
              {t('subscription.questions')}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Subscription;
