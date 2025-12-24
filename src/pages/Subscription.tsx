import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Zap, Clock, Crown, Infinity, Sparkles, Star, Shield, TrendingUp, Settings2, Bot, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import EditableText from '@/components/EditableText';

const products = [
  {
    key: 'm1',
    name: 'MoneyX M1',
    riskLevel: 'low',
    riskDescKey: 'subscription.product.m1.risk_desc',
    riskDescFallback: 'Low drawdown, steady returns',
    system: 'hybrid',
    suitableKey: 'subscription.product.m1.suitable',
    suitableFallback: 'Conservative traders seeking stable growth',
    icon: Settings2,
    gradient: 'from-blue-500/20 to-cyan-500/10',
    iconGradient: 'from-blue-400 to-cyan-500',
  },
  {
    key: 'm2',
    name: 'MoneyX M2 (MaxProfit)',
    riskLevel: 'medium',
    riskDescKey: 'subscription.product.m2.risk_desc',
    riskDescFallback: 'Higher returns with moderate risk',
    system: 'hybrid',
    suitableKey: 'subscription.product.m2.suitable',
    suitableFallback: 'Traders seeking higher returns with active management',
    icon: TrendingUp,
    gradient: 'from-amber-500/20 to-orange-500/10',
    iconGradient: 'from-amber-400 to-orange-500',
  },
  {
    key: 'cm3',
    name: 'MoneyX C-M3 (Correlation)',
    riskLevel: 'low',
    riskDescKey: 'subscription.product.cm3.risk_desc',
    riskDescFallback: 'Multi-pair correlation strategy',
    system: 'auto',
    suitableKey: 'subscription.product.cm3.suitable',
    suitableFallback: 'Set-and-forget traders who prefer automation',
    icon: Shield,
    gradient: 'from-emerald-500/20 to-green-500/10',
    iconGradient: 'from-emerald-400 to-green-500',
  },
  {
    key: 'nm4',
    name: 'MoneyX N-M4 (Non-stop)',
    riskLevel: 'medium',
    riskDescKey: 'subscription.product.nm4.risk_desc',
    riskDescFallback: 'Continuous trading with active positions',
    system: 'auto',
    suitableKey: 'subscription.product.nm4.suitable',
    suitableFallback: 'Active traders comfortable with higher exposure',
    icon: Zap,
    gradient: 'from-purple-500/20 to-pink-500/10',
    iconGradient: 'from-purple-400 to-pink-500',
  },
  {
    key: 'g1',
    name: 'MoneyX G1',
    riskLevel: 'low',
    riskDescKey: 'subscription.product.g1.risk_desc',
    riskDescFallback: 'Gold-focused trading system',
    system: 'auto',
    suitableKey: 'subscription.product.g1.suitable',
    suitableFallback: 'Traders interested in gold/XAUUSD markets',
    icon: Bot,
    gradient: 'from-slate-500/20 to-gray-500/10',
    iconGradient: 'from-slate-400 to-gray-500',
  },
];

const plans = [
  {
    key: 'demo',
    duration: 0.5, // 2 weeks
    price: 500,
    icon: Sparkles,
    popular: false,
    isDemo: true,
    gradient: 'from-rose-500/10 to-pink-500/5',
    iconGradient: 'from-rose-400 to-pink-500',
  },
  {
    key: '1month',
    duration: 1,
    price: 3500, // +500 THB
    icon: Clock,
    popular: false,
    gradient: 'from-slate-500/10 to-slate-600/5',
    iconGradient: 'from-slate-400 to-slate-600',
  },
  {
    key: '3months',
    duration: 3,
    price: 8500, // +500 THB
    icon: Zap,
    popular: false,
    gradient: 'from-blue-500/10 to-cyan-500/5',
    iconGradient: 'from-blue-400 to-cyan-500',
  },
  {
    key: '6months',
    duration: 6,
    price: 15500, // +500 THB
    icon: Star,
    popular: true,
    gradient: 'from-primary/20 to-emerald-500/10',
    iconGradient: 'from-primary to-emerald-400',
  },
  {
    key: '12months',
    duration: 12,
    price: 25500, // +500 THB
    icon: Crown,
    popular: false,
    gradient: 'from-amber-500/10 to-orange-500/5',
    iconGradient: 'from-amber-400 to-orange-500',
  },
  {
    key: 'lifetime',
    duration: null,
    price: 35000, // No change for Lifetime
    icon: Infinity,
    popular: false,
    gradient: 'from-purple-500/10 to-pink-500/5',
    iconGradient: 'from-purple-400 to-pink-500',
  },
];

const Subscription = () => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('th-TH').format(price);
  };

  const calculateMonthlyPrice = (price: number, months: number | null) => {
    if (!months) return null;
    return Math.round(price / months);
  };

  const calculateSavings = (price: number, months: number | null, key: string) => {
    if (!months || months === 1 || key === 'demo') return null;
    const monthlyRate = 3500; // Updated base rate
    const fullPrice = monthlyRate * months;
    const savings = Math.round(((fullPrice - price) / fullPrice) * 100);
    return savings > 0 ? savings : null;
  };

  const getRiskBadgeStyles = (level: string) => {
    switch (level) {
      case 'low':
        return 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
      case 'medium':
        return 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30';
      case 'high':
        return 'bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getSystemBadgeStyles = (system: string) => {
    switch (system) {
      case 'hybrid':
        return 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30';
      case 'auto':
        return 'bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            <EditableText tKey="subscription.title" fallback="Subscription Plans" />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            <span className="bg-gradient-hero bg-clip-text text-transparent">
              <EditableText tKey="subscription.title" fallback="Subscription Plans" />
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            <EditableText tKey="subscription.subtitle" fallback="Choose the plan that fits your trading needs" />
          </p>
        </div>

        {/* Products Section */}
        <div className="mb-20">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
            <span className="bg-gradient-success bg-clip-text text-transparent">
              <EditableText tKey="subscription.choose_product" fallback="Choose Your Trading System" />
            </span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product, index) => {
              const Icon = product.icon;
              
              return (
                <Card 
                  key={product.key}
                  className="group relative overflow-hidden transition-all duration-500 hover:-translate-y-2 border-border/50 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Gradient Background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${product.gradient} opacity-50 group-hover:opacity-100 transition-opacity duration-500`} />
                  
                  <CardHeader className="relative pb-2">
                    <div className="flex items-start justify-between gap-3">
                      {/* Icon */}
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${product.iconGradient} shadow-lg transition-transform duration-300 group-hover:scale-110`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      
                      {/* Badges */}
                      <div className="flex flex-col gap-2 items-end">
                        <Badge variant="outline" className={`text-xs font-medium ${getRiskBadgeStyles(product.riskLevel)}`}>
                          {product.riskLevel === 'low' ? (
                            <EditableText tKey="subscription.risk.low" fallback="Low Risk" />
                          ) : product.riskLevel === 'medium' ? (
                            <EditableText tKey="subscription.risk.medium" fallback="Medium Risk" />
                          ) : (
                            <EditableText tKey="subscription.risk.high" fallback="High Risk" />
                          )}
                        </Badge>
                        <Badge variant="outline" className={`text-xs font-medium ${getSystemBadgeStyles(product.system)}`}>
                          {product.system === 'hybrid' ? 'Hybrid' : 'Auto'}
                        </Badge>
                      </div>
                    </div>
                    
                    <CardTitle className="text-lg font-bold mt-3">
                      {product.name}
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="relative pt-0 space-y-4">
                    {/* Risk Description */}
                    <div className="flex items-start gap-2 text-sm">
                      <AlertTriangle className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">
                        <EditableText tKey={product.riskDescKey} fallback={product.riskDescFallback} />
                      </span>
                    </div>
                    
                    {/* Suitable For */}
                    <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
                      <p className="text-xs text-muted-foreground uppercase font-medium mb-1">
                        <EditableText tKey="subscription.suitable_for" fallback="Suitable For" />
                      </p>
                      <p className="text-sm text-foreground">
                        <EditableText tKey={product.suitableKey} fallback={product.suitableFallback} />
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Pricing Section Header */}
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold">
            <span className="bg-gradient-hero bg-clip-text text-transparent">
              <EditableText tKey="subscription.pricing_title" fallback="Subscription Plans" />
            </span>
          </h2>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-16">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            const isDemo = 'isDemo' in plan && plan.isDemo;
            const monthlyPrice = !isDemo ? calculateMonthlyPrice(plan.price, plan.duration) : null;
            const savings = calculateSavings(plan.price, plan.duration, plan.key);
            
            return (
              <Card 
                key={plan.key}
                className={`group relative overflow-hidden transition-all duration-500 hover:-translate-y-2 ${
                  plan.popular 
                    ? 'border-primary/50 shadow-2xl shadow-primary/20 ring-1 ring-primary/30' 
                    : isDemo
                    ? 'border-rose-500/30 hover:border-rose-500/50 hover:shadow-xl hover:shadow-rose-500/10'
                    : 'border-border/50 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10'
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${plan.gradient} opacity-50 group-hover:opacity-100 transition-opacity duration-500`} />
                
                {/* Glow Effect for Popular */}
                {plan.popular && (
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-emerald-500/10" />
                )}

                {/* Demo Badge */}
                {isDemo && (
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10">
                    <div className="bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg shadow-rose-500/30 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 fill-current" />
                      <EditableText tKey="subscription.demo_badge" fallback="Try It" />
                    </div>
                  </div>
                )}
                
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10">
                    <div className="bg-gradient-to-r from-primary to-emerald-500 text-primary-foreground text-xs font-bold px-3 py-1 rounded-full shadow-lg shadow-primary/30 flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current" />
                      <EditableText tKey="subscription.popular" fallback="Most Popular" />
                    </div>
                  </div>
                )}

                {/* Savings Badge */}
                {savings && !isDemo && (
                  <div className="absolute top-3 right-3 z-10">
                    <div className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold px-2 py-1 rounded-full">
                      -{savings}%
                    </div>
                  </div>
                )}
                
                <CardHeader className="relative text-center pt-10 pb-2">
                  {/* Icon with Gradient */}
                  <div className={`mx-auto w-14 h-14 rounded-2xl flex items-center justify-center mb-4 bg-gradient-to-br ${plan.iconGradient} shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold">
                    <EditableText 
                      tKey={`subscription.plan.${plan.key}`} 
                      fallback={plan.key === 'demo' ? 'Demo' :
                               plan.key === '1month' ? '1 Month' : 
                               plan.key === '3months' ? '3 Months' :
                               plan.key === '6months' ? '6 Months' :
                               plan.key === '12months' ? '12 Months' : 'Lifetime'} 
                    />
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
                    {monthlyPrice && !isDemo && (
                      <p className="text-sm text-muted-foreground mt-2">
                        ≈ ฿{formatPrice(monthlyPrice)}/<EditableText tKey="subscription.per_month" fallback="month" />
                      </p>
                    )}
                    {isDemo && (
                      <p className="text-xs text-rose-500 font-medium mt-2">
                        <EditableText tKey="subscription.demo_duration" fallback="2 Weeks (Demo Account Only)" />
                      </p>
                    )}
                    {plan.key === 'lifetime' && (
                      <p className="text-xs text-primary font-medium mt-2">
                        <EditableText tKey="subscription.one_time" fallback="One-time payment" />
                      </p>
                    )}
                  </div>
                  
                  {/* Divider */}
                  <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent mb-6" />
                  
                  {/* Features */}
                  <ul className="space-y-3 text-sm text-left mb-6">
                    {isDemo ? (
                      <>
                        <li className="flex items-center gap-3 group/item">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center bg-gradient-to-br ${plan.iconGradient} shadow-sm`}>
                            <Check className="w-3 h-3 text-white" />
                          </div>
                          <span className="text-muted-foreground group-hover/item:text-foreground transition-colors">
                            <EditableText tKey="subscription.feature.choose_one_ea" fallback="Choose 1 EA System" />
                          </span>
                        </li>
                        <li className="flex items-center gap-3 group/item">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center bg-gradient-to-br ${plan.iconGradient} shadow-sm`}>
                            <Check className="w-3 h-3 text-white" />
                          </div>
                          <span className="text-muted-foreground group-hover/item:text-foreground transition-colors">
                            <EditableText tKey="subscription.feature.demo_only" fallback="Demo Account Only" />
                          </span>
                        </li>
                        <li className="flex items-center gap-3 group/item">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center bg-gradient-to-br ${plan.iconGradient} shadow-sm`}>
                            <Check className="w-3 h-3 text-white" />
                          </div>
                          <span className="text-muted-foreground group-hover/item:text-foreground transition-colors">
                            <EditableText tKey="subscription.feature.vps_1month" fallback="Free VPS Setup (1 Month)" />
                          </span>
                        </li>
                        <li className="flex items-center gap-3 group/item">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center bg-gradient-to-br ${plan.iconGradient} shadow-sm`}>
                            <Check className="w-3 h-3 text-white" />
                          </div>
                          <span className="text-muted-foreground group-hover/item:text-foreground transition-colors">
                            <EditableText tKey="subscription.feature.support" fallback="24/7 Support" />
                          </span>
                        </li>
                      </>
                    ) : (
                      <>
                        <li className="flex items-center gap-3 group/item">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center bg-gradient-to-br ${plan.iconGradient} shadow-sm`}>
                            <Check className="w-3 h-3 text-white" />
                          </div>
                          <span className="text-muted-foreground group-hover/item:text-foreground transition-colors">
                            <EditableText tKey="subscription.feature.auto_mode" fallback="Auto Mode Access" />
                          </span>
                        </li>
                        <li className="flex items-center gap-3 group/item">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center bg-gradient-to-br ${plan.iconGradient} shadow-sm`}>
                            <Check className="w-3 h-3 text-white" />
                          </div>
                          <span className="text-muted-foreground group-hover/item:text-foreground transition-colors">
                            <EditableText tKey="subscription.feature.hybrid_mode" fallback="Hybrid Mode Access" />
                          </span>
                        </li>
                        <li className="flex items-center gap-3 group/item">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center bg-gradient-to-br ${plan.iconGradient} shadow-sm`}>
                            <Check className="w-3 h-3 text-white" />
                          </div>
                          <span className="text-muted-foreground group-hover/item:text-foreground transition-colors">
                            <EditableText tKey="subscription.feature.free_vps" fallback="Free Setup VPS" />
                          </span>
                        </li>
                        <li className="flex items-center gap-3 group/item">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center bg-gradient-to-br ${plan.iconGradient} shadow-sm`}>
                            <Check className="w-3 h-3 text-white" />
                          </div>
                          <span className="text-muted-foreground group-hover/item:text-foreground transition-colors">
                            <EditableText tKey="subscription.feature.updates" fallback="Free Updates" />
                          </span>
                        </li>
                        <li className="flex items-center gap-3 group/item">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center bg-gradient-to-br ${plan.iconGradient} shadow-sm`}>
                            <Check className="w-3 h-3 text-white" />
                          </div>
                          <span className="text-muted-foreground group-hover/item:text-foreground transition-colors">
                            <EditableText tKey="subscription.feature.support" fallback="24/7 Support" />
                          </span>
                        </li>
                      </>
                    )}
                  </ul>
                  
                  {/* CTA Button */}
                  <Button 
                    className={`w-full font-semibold transition-all duration-300 ${
                      plan.popular 
                        ? 'bg-gradient-to-r from-primary to-emerald-500 hover:from-primary/90 hover:to-emerald-500/90 shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40' 
                        : isDemo
                        ? 'bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-500/90 hover:to-pink-500/90 text-white shadow-lg shadow-rose-500/30'
                        : 'hover:bg-primary hover:text-primary-foreground'
                    }`}
                    variant={plan.popular || isDemo ? 'default' : 'outline'}
                    asChild
                  >
                    <Link to="/contact">
                      <EditableText tKey="subscription.contact_us" fallback="Contact Us" />
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
              <EditableText tKey="subscription.note" fallback="All prices are in Thai Baht (THB). Contact us for payment options." />
            </p>
            <Button variant="link" asChild className="text-primary font-semibold hover:text-primary/80">
              <Link to="/contact" className="flex items-center gap-2">
                <EditableText tKey="subscription.questions" fallback="Have questions? Contact us" />
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
