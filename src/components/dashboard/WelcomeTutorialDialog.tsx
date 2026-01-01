import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, Key, CreditCard, Wallet, CheckCircle, ChevronRight, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import EditableText from '@/components/EditableText';

interface WelcomeTutorialDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const steps = [
  {
    icon: Sparkles,
    titleKey: 'dashboard.tutorial.welcome.title',
    titleFallback: 'Welcome to MoneyX!',
    descriptionKey: 'dashboard.tutorial.welcome.description',
    descriptionFallback: "Let's take a quick tour of your dashboard",
    gradient: 'from-amber-500 to-orange-600',
  },
  {
    icon: Key,
    titleKey: 'dashboard.tutorial.licenses.title',
    titleFallback: 'Your Trading Licenses',
    descriptionKey: 'dashboard.tutorial.licenses.description',
    descriptionFallback: 'View linked EA licenses and expiration dates',
    gradient: 'from-blue-500 to-indigo-600',
  },
  {
    icon: CreditCard,
    titleKey: 'dashboard.tutorial.subscriptions.title',
    titleFallback: 'Subscription Status',
    descriptionKey: 'dashboard.tutorial.subscriptions.description',
    descriptionFallback: 'Track your plan and renewal dates',
    gradient: 'from-purple-500 to-pink-600',
  },
  {
    icon: Wallet,
    titleKey: 'dashboard.tutorial.investments.title',
    titleFallback: 'MT5 Account Tracking',
    descriptionKey: 'dashboard.tutorial.investments.description',
    descriptionFallback: 'Add accounts to monitor performance',
    gradient: 'from-green-500 to-emerald-600',
  },
  {
    icon: CheckCircle,
    titleKey: 'dashboard.tutorial.complete.title',
    titleFallback: "You're All Set!",
    descriptionKey: 'dashboard.tutorial.complete.description',
    descriptionFallback: 'Explore your dashboard',
    gradient: 'from-teal-500 to-cyan-600',
  },
];

const WelcomeTutorialDialog = ({ open, onOpenChange }: WelcomeTutorialDialogProps) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
        setIsAnimating(false);
      }, 150);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(prev => prev - 1);
        setIsAnimating(false);
      }, 150);
    }
  };

  const handleComplete = async () => {
    if (user) {
      await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('id', user.id);
    }
    onOpenChange(false);
    setCurrentStep(0);
  };

  const handleSkip = async () => {
    if (user) {
      await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('id', user.id);
    }
    onOpenChange(false);
    setCurrentStep(0);
  };

  const step = steps[currentStep];
  const Icon = step.icon;
  const isLastStep = currentStep === steps.length - 1;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border-0 bg-gradient-to-b from-background to-muted/50">
        <div className="relative">
          {/* Skip button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSkip}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground z-10"
          >
            <EditableText
              tKey="dashboard.tutorial.skip"
              fallback="Skip"
              as="span"
            />
          </Button>

          {/* Content */}
          <div className={cn(
            "flex flex-col items-center text-center p-8 pt-12 transition-opacity duration-150",
            isAnimating && "opacity-0"
          )}>
            {/* Icon */}
            <div className={cn(
              "w-20 h-20 rounded-2xl flex items-center justify-center mb-6 bg-gradient-to-br shadow-lg",
              step.gradient
            )}>
              <Icon className="h-10 w-10 text-white" />
            </div>

            {/* Title */}
            <EditableText
              tKey={step.titleKey}
              fallback={step.titleFallback}
              as="h2"
              className="text-2xl font-bold mb-3"
            />

            {/* Description */}
            <EditableText
              tKey={step.descriptionKey}
              fallback={step.descriptionFallback}
              as="p"
              className="text-muted-foreground mb-8 max-w-xs"
            />

            {/* Step indicators */}
            <div className="flex gap-2 mb-6">
              {steps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentStep(index)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all",
                    index === currentStep
                      ? "bg-primary w-6"
                      : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  )}
                />
              ))}
            </div>

            {/* Navigation buttons */}
            <div className="flex gap-3 w-full max-w-xs">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="flex-1"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  <EditableText
                    tKey="dashboard.tutorial.back"
                    fallback="Back"
                    as="span"
                  />
                </Button>
              )}
              
              {isLastStep ? (
                <Button
                  onClick={handleComplete}
                  className="flex-1 bg-gradient-to-r from-primary to-primary/80"
                >
                  <EditableText
                    tKey="dashboard.tutorial.start"
                    fallback="Get Started"
                    as="span"
                  />
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  className={cn("flex-1", currentStep === 0 && "w-full")}
                >
                  <EditableText
                    tKey="dashboard.tutorial.next"
                    fallback="Next"
                    as="span"
                  />
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomeTutorialDialog;
