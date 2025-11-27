import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, BarChart3, Zap, Settings2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import MyfxbookWidget from "@/components/MyfxbookWidget";

const MYFXBOOK_ACCOUNTS = {
  hybrid: [
    { id: "11691566", name: "MoneyX", url: "https://www.myfxbook.com/members/SikharmThongin/moneyx/11691566" },
    { id: "11775709", name: "MoneyX Max Profit", url: "https://www.myfxbook.com/members/SikharmThongin/moneyx-max-profit/11775709" },
    { id: "11808475", name: "MoneyX N M4", url: "https://www.myfxbook.com/members/SikharmThongin/moneyx-n-m4/11808475" },
  ],
  auto: [
    { id: "11808434", name: "MoneyX C M3", url: "https://www.myfxbook.com/members/SikharmThongin/moneyx-c-m3/11808434" },
  ],
};

const Performance = () => {
  const { t } = useLanguage();

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

        {/* Main Tabs Section */}
        <section className="mb-16">
          <Tabs defaultValue="hybrid" className="w-full">
            <TabsList className="grid w-full max-w-lg mx-auto grid-cols-3 mb-8">
              <TabsTrigger value="hybrid" className="gap-2">
                <Settings2 className="h-4 w-4" />
                Hybrid System
              </TabsTrigger>
              <TabsTrigger value="auto" className="gap-2">
                <Zap className="h-4 w-4" />
                Auto System
              </TabsTrigger>
              <TabsTrigger value="backtest" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                {t('performance.tabs.backtest_data')}
              </TabsTrigger>
            </TabsList>

            {/* Hybrid System Tab */}
            <TabsContent value="hybrid" className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2">Hybrid System Performance</h2>
                <p className="text-muted-foreground">
                  Live verified results from our hybrid trading systems
                </p>
              </div>
              {MYFXBOOK_ACCOUNTS.hybrid.map((account, index) => (
                <MyfxbookWidget
                  key={account.id}
                  accountId={account.id}
                  accountName={account.name}
                  profileUrl={account.url}
                  showVerifiedBadge={index === 0}
                />
              ))}
            </TabsContent>

            {/* Auto System Tab */}
            <TabsContent value="auto" className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2">Auto System Performance</h2>
                <p className="text-muted-foreground">
                  Live verified results from our fully automated trading systems
                </p>
              </div>
              {MYFXBOOK_ACCOUNTS.auto.map((account, index) => (
                <MyfxbookWidget
                  key={account.id}
                  accountId={account.id}
                  accountName={account.name}
                  profileUrl={account.url}
                  showVerifiedBadge={index === 0}
                />
              ))}
            </TabsContent>

            {/* Backtest Data Tab */}
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
