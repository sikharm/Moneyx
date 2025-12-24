import { FileText, AlertTriangle, Scale, UserCheck, Copyright, ShieldX, Clock } from "lucide-react";
import EditableText from "@/components/EditableText";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
            <FileText className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            <EditableText tKey="terms.title" fallback="Terms of Service" />
          </h1>
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>
              <EditableText tKey="terms.lastUpdated" fallback="Last updated" as="span" />: <EditableText tKey="terms.updateDate" fallback="January 2025" as="span" />
            </span>
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
                <EditableText tKey="terms.risk.title" fallback="Risk Disclaimer" />
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                <EditableText 
                  tKey="terms.risk.content1" 
                  fallback="Forex trading involves substantial risk of loss and is not suitable for all investors. Past performance is not indicative of future results." 
                  as="span"
                />
              </p>
              <p className="text-muted-foreground leading-relaxed">
                <EditableText 
                  tKey="terms.risk.content2" 
                  fallback="You should carefully consider whether trading is appropriate for you. Never trade with money you cannot afford to lose. MoneyX EA does not guarantee profits." 
                  as="span"
                />
              </p>
            </div>
          </div>
        </div>

        {/* Introduction */}
        <div className="bg-card rounded-xl p-6 mb-8 border border-border">
          <p className="text-muted-foreground leading-relaxed">
            <EditableText 
              tKey="terms.intro" 
              fallback="By using MoneyX services, you agree to these terms. Please read them carefully before downloading or using our Expert Advisor software." 
              as="span"
            />
          </p>
        </div>

        {/* Section 1: Service Description */}
        <div className="space-y-6">
          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">
                <EditableText tKey="terms.service.title" fallback="Service Description" />
              </h2>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <EditableText tKey="terms.service.item1" fallback="MoneyX provides Expert Advisor (EA) software for automated forex trading" as="span" />
              </li>
              <li className="flex items-start gap-3 text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <EditableText tKey="terms.service.item2" fallback="Available in Auto Mode and Hybrid Mode configurations" as="span" />
              </li>
              <li className="flex items-start gap-3 text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <EditableText tKey="terms.service.item3" fallback="Rebate program based on trading volume" as="span" />
              </li>
              <li className="flex items-start gap-3 text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <EditableText tKey="terms.service.item4" fallback="Compatible with MetaTrader 5 platform" as="span" />
              </li>
            </ul>
          </div>

          {/* Section 2: User Responsibilities */}
          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">
                <EditableText tKey="terms.eligibility.title" fallback="User Responsibilities" />
              </h2>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <EditableText tKey="terms.eligibility.item1" fallback="You must be at least 18 years old to use our services" as="span" />
              </li>
              <li className="flex items-start gap-3 text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <EditableText tKey="terms.eligibility.item2" fallback="Provide accurate account information" as="span" />
              </li>
              <li className="flex items-start gap-3 text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <EditableText tKey="terms.eligibility.item3" fallback="Maintain security of your MT5 credentials" as="span" />
              </li>
              <li className="flex items-start gap-3 text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <EditableText tKey="terms.eligibility.item4" fallback="Comply with your broker's terms and regulations" as="span" />
              </li>
            </ul>
          </div>

          {/* Section 3: Intellectual Property */}
          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Copyright className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">
                <EditableText tKey="terms.ip.title" fallback="Intellectual Property" />
              </h2>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <EditableText tKey="terms.ip.item1" fallback="MoneyX EA software is proprietary and protected by copyright" as="span" />
              </li>
              <li className="flex items-start gap-3 text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <EditableText tKey="terms.ip.item2" fallback="License is non-transferable and for personal use only" as="span" />
              </li>
              <li className="flex items-start gap-3 text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <EditableText tKey="terms.ip.item3" fallback="Reverse engineering or redistribution is prohibited" as="span" />
              </li>
              <li className="flex items-start gap-3 text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <EditableText tKey="terms.ip.item4" fallback="All trademarks and logos are property of MoneyX" as="span" />
              </li>
            </ul>
          </div>

          {/* Section 4: Limitation of Liability */}
          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <ShieldX className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">
                <EditableText tKey="terms.liability.title" fallback="Limitation of Liability" />
              </h2>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <EditableText tKey="terms.liability.item1" fallback="MoneyX is not liable for trading losses or missed opportunities" as="span" />
              </li>
              <li className="flex items-start gap-3 text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <EditableText tKey="terms.liability.item2" fallback="Service interruptions due to technical issues or maintenance" as="span" />
              </li>
              <li className="flex items-start gap-3 text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <EditableText tKey="terms.liability.item3" fallback="Actions taken by your broker or the MetaTrader platform" as="span" />
              </li>
              <li className="flex items-start gap-3 text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <EditableText tKey="terms.liability.item4" fallback="Maximum liability limited to fees paid in the last 12 months" as="span" />
              </li>
            </ul>
          </div>

          {/* Section 5: Governing Law */}
          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Scale className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">
                <EditableText tKey="terms.governing.title" fallback="Governing Law" />
              </h2>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <EditableText tKey="terms.governing.item1" fallback="These terms are governed by the laws of Lao PDR" as="span" />
              </li>
              <li className="flex items-start gap-3 text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <EditableText tKey="terms.governing.item2" fallback="Disputes will be resolved in Vientiane, Laos" as="span" />
              </li>
              <li className="flex items-start gap-3 text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <EditableText tKey="terms.governing.item3" fallback="We may update these terms with 30 days notice" as="span" />
              </li>
              <li className="flex items-start gap-3 text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <EditableText tKey="terms.governing.item4" fallback="Continued use after updates constitutes acceptance" as="span" />
              </li>
            </ul>
          </div>
        </div>

        {/* Contact */}
        <div className="mt-12 text-center">
          <p className="text-muted-foreground">
            <EditableText tKey="terms.contact" fallback="Questions about these terms? Contact us at" as="span" />{" "}
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