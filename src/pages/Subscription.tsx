import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Zap, Clock, Crown, Infinity, Sparkles, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const plans = [
  {
    key: '1month',
    duration: 1,
    price: 3000,
    icon: Clock,
    popular: false,
    gradient: 'from-slate-500/10 to-slate-600/5',
    iconGradient: 'from-slate-400 to-slate-600',
  },
  {
    key: '3months',
    duration: 3,
    price: 8000,
    icon: Zap,
    popular: false,
    gradient: 'from-blue-500/10 to-cyan-500/5',
    iconGradient: 'from-blue-400 to-cyan-500',
  },
  {
    key: '6months',
    duration: 6,
    price: 15000,
    icon: Star,
    popular: true,
    gradient: 'from-primary/20 to-emerald-500/10',
    iconGradient: 'from-primary to-emerald-400',
  },
  {
    key: '12months',
    duration: 12,
    price: 25000,
    icon: Crown,
    popular: false,
    gradient: 'from-amber-500/10 to-orange-500/5',
    iconGradient: 'from-amber-400 to-orange-500',
  },
  {
    key: 'lifetime',
    duration: null,
    price: 35000,
    icon: Infinity,
    popular: false,
    gradient: 'from-purple-500/10 to-pink-500/5',
    iconGradient: 'from-purple-400 to-pink-500',
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

  const calculateSavings = (price: number, months: number | null) => {
    if (!months || months === 1) return null;
    const monthlyRate = 3000;
    const fullPrice = monthlyRate * months;
    const savings = Math.round(((fullPrice - price) / fullPrice) * 100);
    return savings > 0 ? savings : null;
  };

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            {t('subscription.title')}
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            <span className="bg-gradient-hero bg-clip-text text-transparent">
              {t('subscription.title')}
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('subscription.subtitle')}
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-16">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            const monthlyPrice = calculateMonthlyPrice(plan.price, plan.duration);
            const savings = calculateSavings(plan.price, plan.duration);
            
            return (
              <Card 
                key={plan.key}
                className={`group relative overflow-hidden transition-all duration-500 hover:-translate-y-2 ${
                  plan.popular 
                    ? 'border-primary/50 shadow-2xl shadow-primary/20 ring-1 ring-primary/30 scale-105 z-10' 
                    : 'border-border/50 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10'
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${plan.gradient} opacity-50 group-hover:opacity-100 transition-opacity duration-500`} />
                
                {/* Glow Effect for Popular */}
                {plan.popular && (
                  <div className="absolute -inset-px bg-gradient-to-r from-primary/50 via-emerald-500/50 to-primary/50 rounded-xl blur-sm opacity-50 group-hover:opacity-75 transition-opacity" />
                )}
                
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="bg-gradient-to-r from-primary to-emerald-500 text-primary-foreground text-xs font-bold px-4 py-1.5 rounded-full shadow-lg shadow-primary/30 flex items-center gap-1.5">
                      <Star className="w-3 h-3 fill-current" />
                      {t('subscription.popular')}
                    </div>
                  </div>
                )}

                {/* Savings Badge */}
                {savings && !plan.popular && (
                  <div className="absolute top-3 right-3">
                    <div className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold px-2 py-1 rounded-full">
                      -{savings}%
                    </div>
                  </div>
                )}
                
                <CardHeader className={`relative text-center ${plan.popular ? 'pt-8' : 'pt-6'} pb-2`}>
                  {/* Icon with Gradient */}
                  <div className={`mx-auto w-14 h-14 rounded-2xl flex items-center justify-center mb-4 bg-gradient-to-br ${plan.iconGradient} shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold">
                    {t(`subscription.plan.${plan.key}`)}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="relative text-center pt-0">
                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-sm font-medium text-muted-foreground">฿</span>
                      <span className="text-4xl font-bold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                        {formatPrice(plan.price)}
                      </span>
                    </div>
                    {monthlyPrice && (
                      <p className="text-sm text-muted-foreground mt-2">
                        ≈ ฿{formatPrice(monthlyPrice)}/{t('subscription.per_month')}
                      </p>
                    )}
                    {plan.key === 'lifetime' && (
                      <p className="text-xs text-primary font-medium mt-2">
                        One-time payment
                      </p>
                    )}
                  </div>
                  
                  {/* Divider */}
                  <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent mb-6" />
                  
                  {/* Features */}
                  <ul className="space-y-3 text-sm text-left mb-6">
                    {features.map((feature, i) => (
                      <li 
                        key={feature} 
                        className="flex items-center gap-3 group/item"
                        style={{ animationDelay: `${(index * 100) + (i * 50)}ms` }}
                      >
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center bg-gradient-to-br ${plan.iconGradient} shadow-sm`}>
                          <Check className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-muted-foreground group-hover/item:text-foreground transition-colors">
                          {t(feature)}
                        </span>
                      </li>
                    ))}
                  </ul>
                  
                  {/* CTA Button */}
                  <Button 
                    className={`w-full font-semibold transition-all duration-300 ${
                      plan.popular 
                        ? 'bg-gradient-to-r from-primary to-emerald-500 hover:from-primary/90 hover:to-emerald-500/90 shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40' 
                        : 'hover:bg-primary hover:text-primary-foreground'
                    }`}
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
        <div className="text-center animate-fade-in">
          <div className="inline-flex flex-col items-center gap-4 p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50">
            <p className="text-muted-foreground">
              {t('subscription.note')}
            </p>
            <Button variant="link" asChild className="text-primary font-semibold hover:text-primary/80">
              <Link to="/contact" className="flex items-center gap-2">
                {t('subscription.questions')}
                <Sparkles className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscription;
