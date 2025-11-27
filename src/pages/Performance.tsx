import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Calendar, DollarSign, Target, BarChart3, Award } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const Performance = () => {
  const { t } = useLanguage();

  const monthlyResults = [
    { month: "January 2025", profit: "+12.4%", trades: 156, winRate: "98.1%" },
    { month: "December 2024", profit: "+15.2%", trades: 178, winRate: "98.9%" },
    { month: "November 2024", profit: "+11.8%", trades: 143, winRate: "97.9%" },
    { month: "October 2024", profit: "+13.6%", trades: 167, winRate: "98.5%" },
    { month: "September 2024", profit: "+10.9%", trades: 134, winRate: "98.2%" },
    { month: "August 2024", profit: "+14.7%", trades: 189, winRate: "99.1%" },
  ];

  const backtestData = {
    period: "2019-2024 (5 Years)",
    totalTrades: 8547,
    winRate: "98.5%",
    avgProfit: "12.8% per month",
    maxDrawdown: "3.2%",
    profitFactor: "4.7",
    sharpeRatio: "2.8",
  };

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <div className="bg-gradient-success p-3 rounded-2xl w-fit mx-auto mb-6">
            <TrendingUp className="h-12 w-12 text-accent-foreground" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-success bg-clip-text text-transparent">{t('performance.hero.title')}</span>
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            {t('performance.hero.description')}
          </p>
        </div>

        {/* Key Metrics */}
        <section className="mb-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <Card className="border-2 border-accent">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <Award className="h-8 w-8 text-accent mb-2" />
                  <div className="text-3xl font-bold text-accent mb-1">98.5%</div>
                  <div className="text-sm text-muted-foreground">{t('performance.metrics.win_rate')}</div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <DollarSign className="h-8 w-8 text-primary mb-2" />
                  <div className="text-3xl font-bold text-primary mb-1">12.8%</div>
                  <div className="text-sm text-muted-foreground">{t('performance.metrics.avg_monthly')}</div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-secondary">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <BarChart3 className="h-8 w-8 text-secondary mb-2" />
                  <div className="text-3xl font-bold text-secondary mb-1">4.7</div>
                  <div className="text-sm text-muted-foreground">{t('performance.metrics.profit_factor')}</div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-destructive">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <Target className="h-8 w-8 text-destructive mb-2" />
                  <div className="text-3xl font-bold text-destructive mb-1">3.2%</div>
                  <div className="text-sm text-muted-foreground">{t('performance.metrics.max_drawdown')}</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Tabs Section */}
        <section className="mb-16">
          <Tabs defaultValue="live" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
              <TabsTrigger value="live">{t('performance.tabs.live_results')}</TabsTrigger>
              <TabsTrigger value="backtest">{t('performance.tabs.backtest_data')}</TabsTrigger>
            </TabsList>

            <TabsContent value="live" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    {t('performance.live.title')}
                  </CardTitle>
                  <CardDescription>{t('performance.live.subtitle')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {monthlyResults.map((result, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 rounded-lg bg-gradient-card border"
                      >
                        <div>
                          <div className="font-semibold">{result.month}</div>
                          <div className="text-sm text-muted-foreground">
                            {result.trades} {t('performance.live.trades')} • {result.winRate} {t('performance.live.win_rate')}
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-accent">{result.profit}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="backtest" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    {t('performance.backtest.title')}
                  </CardTitle>
                  <CardDescription>
                    {t('performance.backtest.subtitle')} {backtestData.period}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-4 rounded-lg bg-muted">
                        <span className="text-muted-foreground">{t('performance.backtest.test_period')}</span>
                        <span className="font-semibold">{backtestData.period}</span>
                      </div>
                      <div className="flex justify-between items-center p-4 rounded-lg bg-muted">
                        <span className="text-muted-foreground">{t('performance.backtest.total_trades')}</span>
                        <span className="font-semibold">{backtestData.totalTrades.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center p-4 rounded-lg bg-muted">
                        <span className="text-muted-foreground">{t('performance.metrics.win_rate')}</span>
                        <span className="font-semibold text-accent">{backtestData.winRate}</span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-4 rounded-lg bg-muted">
                        <span className="text-muted-foreground">{t('performance.backtest.average_profit')}</span>
                        <span className="font-semibold text-accent">{backtestData.avgProfit}</span>
                      </div>
                      <div className="flex justify-between items-center p-4 rounded-lg bg-muted">
                        <span className="text-muted-foreground">{t('performance.metrics.max_drawdown')}</span>
                        <span className="font-semibold text-destructive">{backtestData.maxDrawdown}</span>
                      </div>
                      <div className="flex justify-between items-center p-4 rounded-lg bg-muted">
                        <span className="text-muted-foreground">{t('performance.metrics.profit_factor')}</span>
                        <span className="font-semibold">{backtestData.profitFactor}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t('performance.methodology.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-muted-foreground">
                    <li className="flex gap-2">
                      <span className="text-accent">•</span>
                      <span>{t('performance.methodology.item1')}</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-accent">•</span>
                      <span>{t('performance.methodology.item2')}</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-accent">•</span>
                      <span>{t('performance.methodology.item3')}</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-accent">•</span>
                      <span>{t('performance.methodology.item4')}</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-accent">•</span>
                      <span>{t('performance.methodology.item5')}</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </section>

        {/* Disclaimer */}
        <Card className="bg-muted/50">
          <CardContent className="py-8 px-6">
            <p className="text-sm text-muted-foreground text-center">
              <strong>{t('performance.disclaimer_label')}</strong> {t('performance.disclaimer')}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Performance;
