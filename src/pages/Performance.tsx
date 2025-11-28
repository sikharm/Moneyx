import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Zap, Settings2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import MyfxbookWidget from "@/components/MyfxbookWidget";
import EditableText from "@/components/EditableText";

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

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <div className="bg-gradient-success p-3 rounded-2xl w-fit mx-auto mb-6">
            <TrendingUp className="h-12 w-12 text-accent-foreground" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-success bg-clip-text text-transparent">
              <EditableText tKey="performance.hero.title" />
            </span>
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            <EditableText tKey="performance.hero.description" />
          </p>
        </div>

        {/* Main Tabs Section */}
        <section className="mb-16">
          <Tabs defaultValue="hybrid" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
              <TabsTrigger value="hybrid" className="gap-2">
                <Settings2 className="h-4 w-4" />
                <EditableText tKey="performance.tabs.hybrid_system" />
              </TabsTrigger>
              <TabsTrigger value="auto" className="gap-2">
                <Zap className="h-4 w-4" />
                <EditableText tKey="performance.tabs.auto_system" />
              </TabsTrigger>
            </TabsList>

            {/* Hybrid System Tab */}
            <TabsContent value="hybrid" className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2">
                  <EditableText tKey="performance.hybrid.title" />
                </h2>
                <p className="text-muted-foreground">
                  <EditableText tKey="performance.hybrid.description" />
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
                <h2 className="text-2xl font-bold mb-2">
                  <EditableText tKey="performance.auto.title" />
                </h2>
                <p className="text-muted-foreground">
                  <EditableText tKey="performance.auto.description" />
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
          </Tabs>
        </section>

        {/* Disclaimer */}
        <Card className="bg-muted/50">
          <CardContent className="py-8 px-6">
            <p className="text-sm text-muted-foreground text-center">
              <strong><EditableText tKey="performance.disclaimer_label" /></strong>{' '}
              <EditableText tKey="performance.disclaimer" />
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Performance;
