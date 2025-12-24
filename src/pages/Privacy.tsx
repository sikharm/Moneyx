import { Shield, Database, Lock, Users, Mail, Clock } from "lucide-react";
import EditableText from "@/components/EditableText";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            <EditableText tKey="privacy.title" fallback="Privacy Policy" />
          </h1>
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>
              <EditableText tKey="privacy.lastUpdated" fallback="Last updated" as="span" />: <EditableText tKey="privacy.updateDate" fallback="January 2025" as="span" />
            </span>
          </div>
        </div>

        {/* Introduction */}
        <div className="bg-card rounded-xl p-6 mb-8 border border-border">
          <p className="text-muted-foreground leading-relaxed">
            <EditableText 
              tKey="privacy.intro" 
              fallback="This privacy policy explains how MoneyX collects, uses, and protects your personal information when you use our Expert Advisor software and services." 
              as="span"
            />
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {/* Section 1: Data Collection */}
          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Database className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">
                <EditableText tKey="privacy.collection.title" fallback="Information We Collect" />
              </h2>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <EditableText tKey="privacy.collection.item1" fallback="Account information (email, name, MT5 login details)" as="span" />
              </li>
              <li className="flex items-start gap-3 text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <EditableText tKey="privacy.collection.item2" fallback="Trading performance data for rebate calculations" as="span" />
              </li>
              <li className="flex items-start gap-3 text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <EditableText tKey="privacy.collection.item3" fallback="Device and usage information for service improvement" as="span" />
              </li>
              <li className="flex items-start gap-3 text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <EditableText tKey="privacy.collection.item4" fallback="Communication records for customer support" as="span" />
              </li>
            </ul>
          </div>

          {/* Section 2: Data Usage */}
          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">
                <EditableText tKey="privacy.usage.title" fallback="How We Use Your Data" />
              </h2>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <EditableText tKey="privacy.usage.item1" fallback="Provide and maintain our EA software services" as="span" />
              </li>
              <li className="flex items-start gap-3 text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <EditableText tKey="privacy.usage.item2" fallback="Calculate and process rebate payments" as="span" />
              </li>
              <li className="flex items-start gap-3 text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <EditableText tKey="privacy.usage.item3" fallback="Send important updates about your subscription" as="span" />
              </li>
              <li className="flex items-start gap-3 text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <EditableText tKey="privacy.usage.item4" fallback="Improve our services based on usage patterns" as="span" />
              </li>
            </ul>
          </div>

          {/* Section 3: Data Security */}
          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Lock className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">
                <EditableText tKey="privacy.security.title" fallback="Data Security" />
              </h2>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <EditableText tKey="privacy.security.item1" fallback="Industry-standard encryption for data transmission" as="span" />
              </li>
              <li className="flex items-start gap-3 text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <EditableText tKey="privacy.security.item2" fallback="Secure storage with regular security audits" as="span" />
              </li>
              <li className="flex items-start gap-3 text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <EditableText tKey="privacy.security.item3" fallback="Access controls limiting who can view your data" as="span" />
              </li>
              <li className="flex items-start gap-3 text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <EditableText tKey="privacy.security.item4" fallback="Regular backups to prevent data loss" as="span" />
              </li>
            </ul>
          </div>

          {/* Section 4: Third Party */}
          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">
                <EditableText tKey="privacy.thirdparty.title" fallback="Third Party Sharing" />
              </h2>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <EditableText tKey="privacy.thirdparty.item1" fallback="We do not sell your personal data to third parties" as="span" />
              </li>
              <li className="flex items-start gap-3 text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <EditableText tKey="privacy.thirdparty.item2" fallback="Data may be shared with partner brokers for rebate processing" as="span" />
              </li>
              <li className="flex items-start gap-3 text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <EditableText tKey="privacy.thirdparty.item3" fallback="Legal disclosure when required by law" as="span" />
              </li>
            </ul>
          </div>

          {/* Section 5: Your Rights */}
          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">
                <EditableText tKey="privacy.rights.title" fallback="Your Rights" />
              </h2>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <EditableText tKey="privacy.rights.item1" fallback="Request access to your personal data" as="span" />
              </li>
              <li className="flex items-start gap-3 text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <EditableText tKey="privacy.rights.item2" fallback="Request correction of inaccurate information" as="span" />
              </li>
              <li className="flex items-start gap-3 text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <EditableText tKey="privacy.rights.item3" fallback="Request deletion of your account and data" as="span" />
              </li>
              <li className="flex items-start gap-3 text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <EditableText tKey="privacy.rights.item4" fallback="Opt out of marketing communications" as="span" />
              </li>
            </ul>
          </div>
        </div>

        {/* Contact */}
        <div className="mt-12 text-center">
          <p className="text-muted-foreground">
            <EditableText tKey="privacy.contact" fallback="Questions about your privacy? Contact us at" as="span" />{" "}
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

export default Privacy;