import { Shield, Database, Lock, Users, Mail, Clock } from "lucide-react";

const Privacy = () => {
  const sections = [
    {
      icon: Database,
      title: "Information We Collect",
      content: [
        "Personal information (name, email) when you create an account",
        "MT5 account details for EA connectivity",
        "Trading activity data for rebate calculations",
        "Device and browser information for security",
      ],
    },
    {
      icon: Shield,
      title: "How We Use Your Data",
      content: [
        "Provide and improve our Expert Advisor services",
        "Calculate and process rebate payments",
        "Send important service updates",
        "Ensure platform security and prevent fraud",
      ],
    },
    {
      icon: Lock,
      title: "Data Security",
      content: [
        "All data is encrypted in transit and at rest",
        "MT5 credentials are securely stored and never shared",
        "Regular security audits and monitoring",
        "Access controls limit data to authorized personnel only",
      ],
    },
    {
      icon: Users,
      title: "Third-Party Services",
      content: [
        "MetaTrader 5 platform for trading execution",
        "Secure payment processors for rebate disbursement",
        "We do not sell your personal data to third parties",
      ],
    },
    {
      icon: Mail,
      title: "Your Rights",
      content: [
        "Request access to your personal data",
        "Request correction of inaccurate data",
        "Request deletion of your account and data",
        "Contact us at: privacy@moneyx.la",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Privacy Policy
          </h1>
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>Last updated: December 2024</span>
          </div>
        </div>

        {/* Introduction */}
        <div className="bg-card rounded-xl p-6 mb-8 border border-border">
          <p className="text-muted-foreground leading-relaxed">
            MoneyX is committed to protecting your privacy. This policy explains how we collect, use, and safeguard your information when you use our Expert Advisor services.
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
            Questions about this policy? Contact us at{" "}
            <a
              href="mailto:privacy@moneyx.la"
              className="text-primary hover:underline"
            >
              privacy@moneyx.la
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Privacy;