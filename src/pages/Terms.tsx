import { useLanguage } from "@/contexts/LanguageContext";
import { FileText, AlertTriangle, Scale, UserCheck, Copyright, ShieldX, Clock } from "lucide-react";

const Terms = () => {
  const { t } = useLanguage();

  const sections = [
    {
      icon: FileText,
      title: t("terms.service.title") || "Service Description",
      content: [
        t("terms.service.item1") || "MoneyX provides Expert Advisor (EA) software for automated forex trading",
        t("terms.service.item2") || "Available in Auto Mode and Hybrid Mode configurations",
        t("terms.service.item3") || "Rebate program based on trading volume",
        t("terms.service.item4") || "Compatible with MetaTrader 5 platform",
      ],
    },
    {
      icon: UserCheck,
      title: t("terms.eligibility.title") || "User Responsibilities",
      content: [
        t("terms.eligibility.item1") || "You must be at least 18 years old to use our services",
        t("terms.eligibility.item2") || "Provide accurate account information",
        t("terms.eligibility.item3") || "Maintain security of your MT5 credentials",
        t("terms.eligibility.item4") || "Comply with your broker's terms and regulations",
      ],
    },
    {
      icon: Copyright,
      title: t("terms.ip.title") || "Intellectual Property",
      content: [
        t("terms.ip.item1") || "MoneyX EA software is proprietary and protected by copyright",
        t("terms.ip.item2") || "License is non-transferable and for personal use only",
        t("terms.ip.item3") || "Reverse engineering or redistribution is prohibited",
        t("terms.ip.item4") || "All trademarks and logos are property of MoneyX",
      ],
    },
    {
      icon: ShieldX,
      title: t("terms.liability.title") || "Limitation of Liability",
      content: [
        t("terms.liability.item1") || "MoneyX is not liable for trading losses or missed opportunities",
        t("terms.liability.item2") || "Service interruptions due to technical issues or maintenance",
        t("terms.liability.item3") || "Actions taken by your broker or the MetaTrader platform",
        t("terms.liability.item4") || "Maximum liability limited to fees paid in the last 12 months",
      ],
    },
    {
      icon: Scale,
      title: t("terms.governing.title") || "Governing Law",
      content: [
        t("terms.governing.item1") || "These terms are governed by the laws of Lao PDR",
        t("terms.governing.item2") || "Disputes will be resolved in Vientiane, Laos",
        t("terms.governing.item3") || "We may update these terms with 30 days notice",
        t("terms.governing.item4") || "Continued use after updates constitutes acceptance",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
            <FileText className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            {t("terms.title") || "Terms of Service"}
          </h1>
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{t("terms.lastUpdated") || "Last updated"}: {t("terms.updateDate") || "January 2025"}</span>
          </div>
        </div>

        {/* Risk Disclaimer - Important for trading software */}
        <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-destructive/20 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-2">
                {t("terms.risk.title") || "Risk Disclaimer"}
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                {t("terms.risk.content1") ||
                  "Forex trading involves substantial risk of loss and is not suitable for all investors. Past performance is not indicative of future results."}
              </p>
              <p className="text-muted-foreground leading-relaxed">
                {t("terms.risk.content2") ||
                  "You should carefully consider whether trading is appropriate for you. Never trade with money you cannot afford to lose. MoneyX EA does not guarantee profits."}
              </p>
            </div>
          </div>
        </div>

        {/* Introduction */}
        <div className="bg-card rounded-xl p-6 mb-8 border border-border">
          <p className="text-muted-foreground leading-relaxed">
            {t("terms.intro") ||
              "By using MoneyX services, you agree to these terms. Please read them carefully before downloading or using our Expert Advisor software."}
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {sections.map((section, index) => (
            <div
              key={index}
              className="bg-card rounded-xl p-6 border border-border"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <section.icon className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">
                  {section.title}
                </h2>
              </div>
              <ul className="space-y-3">
                {section.content.map((item, itemIndex) => (
                  <li
                    key={itemIndex}
                    className="flex items-start gap-3 text-muted-foreground"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact */}
        <div className="mt-12 text-center">
          <p className="text-muted-foreground">
            {t("terms.contact") || "Questions about these terms? Contact us at"}{" "}
            <a
              href="mailto:moneyxwhale@gmail.com"
              className="text-primary hover:underline"
            >
              moneyxwhale@gmail.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Terms;
