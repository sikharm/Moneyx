import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download as DownloadIcon, FileText, CheckCircle } from "lucide-react";

const Download = () => {
  const requirements = [
    "MetaTrader 4 or MetaTrader 5 platform",
    "Windows 10 or later (or Wine on Mac/Linux)",
    "Minimum 4GB RAM recommended",
    "Stable internet connection",
    "Broker account with EA support enabled",
  ];

  const downloads = [
    {
      title: "EA Trading System (MT4)",
      description: "Compatible with MetaTrader 4",
      version: "v3.2.1",
      size: "2.4 MB",
    },
    {
      title: "EA Trading System (MT5)",
      description: "Compatible with MetaTrader 5",
      version: "v3.2.1",
      size: "2.6 MB",
    },
    {
      title: "User Manual",
      description: "Complete installation and setup guide",
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
            <span className="bg-gradient-hero bg-clip-text text-transparent">Download EA System</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Get started with our Expert Advisor trading system in minutes
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
                      <span>Version: {download.version}</span>
                      <span>Size: {download.size}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-gradient-hero hover:opacity-90">
                  <DownloadIcon className="mr-2 h-4 w-4" />
                  Download Now
                </Button>
              </CardContent>
            </Card>
          ))}
        </section>

        {/* System Requirements */}
        <section className="mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">System Requirements</CardTitle>
              <CardDescription>
                Ensure your system meets these requirements before installation
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
          <h2 className="text-3xl font-bold mb-8 text-center">Quick Installation Guide</h2>
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="bg-gradient-hero rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xl font-bold text-primary-foreground">1</span>
                  </div>
                  <CardTitle>Download the EA file</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Click the download button above to get the EA file for your MetaTrader platform.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="bg-gradient-hero rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xl font-bold text-primary-foreground">2</span>
                  </div>
                  <CardTitle>Copy to Experts folder</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Open MetaTrader, go to File → Open Data Folder → MQL4/5 → Experts, and paste the EA file.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="bg-gradient-hero rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xl font-bold text-primary-foreground">3</span>
                  </div>
                  <CardTitle>Restart MetaTrader</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Close and reopen MetaTrader to load the new Expert Advisor.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="bg-gradient-hero rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xl font-bold text-primary-foreground">4</span>
                  </div>
                  <CardTitle>Attach to chart</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  In the Navigator panel, find the EA under Expert Advisors and drag it onto your chart.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="bg-gradient-hero rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xl font-bold text-primary-foreground">5</span>
                  </div>
                  <CardTitle>Configure settings</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Set your preferred trading parameters and enable AutoTrading in MetaTrader.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Support Notice */}
        <Card className="bg-gradient-hero border-0 text-primary-foreground">
          <CardContent className="py-12 px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Need Help?</h2>
            <p className="text-lg mb-6 opacity-90">
              Our support team is here to assist you with installation and setup.
            </p>
            <Button
              size="lg"
              variant="secondary"
              className="bg-background text-foreground hover:bg-background/90"
            >
              Contact Support
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Download;
