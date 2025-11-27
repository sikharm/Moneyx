import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download as DownloadIcon, FileText, CheckCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const Download = () => {
  const { t } = useLanguage();

  const requirements = [
    t('download.requirements.item1'),
    t('download.requirements.item2'),
    t('download.requirements.item3'),
    t('download.requirements.item4'),
    t('download.requirements.item5'),
  ];

  const downloads = [
    {
      title: t('download.files.mt5_title'),
      description: t('download.files.mt5_desc'),
      version: "v3.2.1",
      size: "2.6 MB",
    },
    {
      title: t('download.files.manual_title'),
      description: t('download.files.manual_desc'),
      version: "Latest",
      size: "8.2 MB",
    },
  ];

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="bg-gradient-hero p-3 rounded-2xl w-fit mx-auto mb-6">
            <DownloadIcon className="h-12 w-12 text-primary-foreground" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-hero bg-clip-text text-transparent">{t('download.hero.title')}</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            {t('download.hero.description')}
          </p>
        </div>

        {/* Download Cards */}
        <section className="mb-16 space-y-4">
          {downloads.map((download, index) => (
            <Card key={index} className="border-2 hover:border-primary transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div className="flex items-start gap-4">
                  <div className="bg-gradient-hero p-2 rounded-lg">
                    <FileText className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-xl mb-1">{download.title}</CardTitle>
                    <CardDescription>{download.description}</CardDescription>
                    <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                      <span>{t('download.files.version')}: {download.version}</span>
                      <span>{t('download.files.size')}: {download.size}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-gradient-hero hover:opacity-90">
                  <DownloadIcon className="mr-2 h-4 w-4" />
                  {t('common.download_now')}
                </Button>
              </CardContent>
            </Card>
          ))}
        </section>

        {/* System Requirements */}
        <section className="mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{t('download.requirements.title')}</CardTitle>
              <CardDescription>
                {t('download.requirements.subtitle')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {requirements.map((requirement, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{requirement}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* Installation Steps */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">{t('download.installation.title')}</h2>
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="bg-gradient-hero rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xl font-bold text-primary-foreground">1</span>
                  </div>
                  <CardTitle>{t('download.installation.step1_title')}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {t('download.installation.step1_desc')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="bg-gradient-hero rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xl font-bold text-primary-foreground">2</span>
                  </div>
                  <CardTitle>{t('download.installation.step2_title')}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {t('download.installation.step2_desc')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="bg-gradient-hero rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xl font-bold text-primary-foreground">3</span>
                  </div>
                  <CardTitle>{t('download.installation.step3_title')}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {t('download.installation.step3_desc')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="bg-gradient-hero rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xl font-bold text-primary-foreground">4</span>
                  </div>
                  <CardTitle>{t('download.installation.step4_title')}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {t('download.installation.step4_desc')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="bg-gradient-hero rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xl font-bold text-primary-foreground">5</span>
                  </div>
                  <CardTitle>{t('download.installation.step5_title')}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {t('download.installation.step5_desc')}
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Support Notice */}
        <Card className="bg-gradient-hero border-0 text-primary-foreground">
          <CardContent className="py-12 px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">{t('download.support.title')}</h2>
            <p className="text-lg mb-6 opacity-90">
              {t('download.support.description')}
            </p>
            <Button
              size="lg"
              variant="secondary"
              className="bg-background text-foreground hover:bg-background/90"
            >
              {t('common.contact_support')}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Download;
