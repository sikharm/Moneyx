import { useState } from "react";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shield, FileText, Lock, Users, Scale, Download } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface TermsAcceptanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccept: () => void;
  fileName?: string;
}

const TermsAcceptanceDialog = ({ open, onOpenChange, onAccept, fileName }: TermsAcceptanceDialogProps) => {
  const { t } = useLanguage();
  const [accepted, setAccepted] = useState(false);

  const handleAccept = () => {
    if (accepted) {
      onAccept();
      setAccepted(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setAccepted(false);
    }
    onOpenChange(isOpen);
  };

  const keyPoints = [
    {
      icon: Lock,
      titleKey: "download.terms.point1_title",
      descKey: "download.terms.point1_desc"
    },
    {
      icon: Users,
      titleKey: "download.terms.point2_title",
      descKey: "download.terms.point2_desc"
    },
    {
      icon: Shield,
      titleKey: "download.terms.point3_title",
      descKey: "download.terms.point3_desc"
    },
    {
      icon: Scale,
      titleKey: "download.terms.point4_title",
      descKey: "download.terms.point4_desc"
    }
  ];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-gradient-hero p-2 rounded-lg">
              <FileText className="h-5 w-5 text-primary-foreground" />
            </div>
            <DialogTitle className="text-xl">
              {t("download.terms.dialog_title")}
            </DialogTitle>
          </div>
          <DialogDescription>
            {t("download.terms.dialog_description")}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 max-h-[40vh] pr-4">
          <div className="space-y-4 py-2">
            {keyPoints.map((point, index) => (
              <div key={index} className="flex gap-3 p-3 rounded-lg bg-muted/50">
                <point.icon className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-sm">{t(point.titleKey)}</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t(point.descKey)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 rounded-lg border border-border/50 bg-background">
            <p className="text-sm text-muted-foreground">
              {t("download.terms.full_policy_note")}{" "}
              <Link to="/privacy" className="text-primary hover:underline" target="_blank">
                {t("footer.privacy")}
              </Link>{" "}
              {t("common.and")}{" "}
              <Link to="/terms" className="text-primary hover:underline" target="_blank">
                {t("footer.terms")}
              </Link>
            </p>
          </div>
        </ScrollArea>

        <div className="border-t pt-4 mt-4">
          <div className="flex items-start gap-3 mb-4">
            <Checkbox
              id="terms-accept"
              checked={accepted}
              onCheckedChange={(checked) => setAccepted(checked === true)}
              className="mt-0.5"
            />
            <label
              htmlFor="terms-accept"
              className="text-sm cursor-pointer leading-relaxed"
            >
              {t("download.terms.checkbox_label")}
            </label>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => handleOpenChange(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              onClick={handleAccept}
              disabled={!accepted}
              className="bg-gradient-hero hover:opacity-90"
            >
              <Download className="mr-2 h-4 w-4" />
              {t("download.terms.accept_button")}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TermsAcceptanceDialog;
