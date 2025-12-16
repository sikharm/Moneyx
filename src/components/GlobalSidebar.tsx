import { Calendar, Facebook, ArrowRight, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";
import EconomicCalendarWidget from "./EconomicCalendarWidget";
import FacebookWidget from "./FacebookWidget";
import EditableText from "./EditableText";

const GlobalSidebar = () => {
  const [activePanel, setActivePanel] = useState<'calendar' | 'facebook' | null>(null);

  const togglePanel = (panel: 'calendar' | 'facebook') => {
    setActivePanel(activePanel === panel ? null : panel);
  };

  return (
    <>
      {/* Floating Icon Buttons - Right Side (myfxbook style) */}
      <div className="fixed right-0 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col gap-2">
        <button
          onClick={() => togglePanel('calendar')}
          className={cn(
            "p-3 rounded-l-lg shadow-lg transition-all duration-200",
            activePanel === 'calendar' 
              ? "bg-primary text-primary-foreground" 
              : "bg-card hover:bg-muted border border-r-0 border-border"
          )}
          title="Economic Calendar"
        >
          <Calendar className="h-5 w-5" />
        </button>
        <button
          onClick={() => togglePanel('facebook')}
          className={cn(
            "p-3 rounded-l-lg shadow-lg transition-all duration-200",
            activePanel === 'facebook' 
              ? "bg-[#1877F2] text-white" 
              : "bg-card hover:bg-muted border border-r-0 border-border"
          )}
          title="Latest Updates"
        >
          <Facebook className="h-5 w-5" />
        </button>
      </div>

      {/* Expanded Panel */}
      {activePanel && (
        <aside className="fixed right-12 top-1/2 -translate-y-1/2 z-40 hidden lg:block w-80 max-h-[70vh] bg-card border border-border rounded-l-xl shadow-xl overflow-hidden animate-slide-in-right">
          <button
            onClick={() => setActivePanel(null)}
            className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-muted/80 hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4" />
          </button>

          {activePanel === 'calendar' && (
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-2 px-4 py-3 bg-muted/30 border-b border-border">
                <Calendar className="h-4 w-4 text-primary" />
                <span className="font-medium text-sm">
                  <EditableText tKey="home.calendar.title" fallback="Economic Calendar" />
                </span>
              </div>
              <div className="h-[320px]">
                <EconomicCalendarWidget showCard={false} height={320} />
              </div>
              <div className="px-4 py-2 bg-muted/20 border-t border-border/50">
                <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground hover:text-primary gap-1 p-0" asChild>
                  <a href="https://www.forexfactory.com/calendar" target="_blank" rel="noopener noreferrer">
                    <EditableText tKey="home.calendar.view_full" fallback="View Full Calendar" />
                    <ArrowRight className="h-3 w-3" />
                  </a>
                </Button>
              </div>
            </div>
          )}

          {activePanel === 'facebook' && (
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-2 px-4 py-3 bg-muted/30 border-b border-border">
                <Facebook className="h-4 w-4 text-[#1877F2]" />
                <span className="font-medium text-sm">
                  <EditableText tKey="home.updates.title" fallback="Latest Updates" />
                </span>
              </div>
              <div className="h-[320px] overflow-hidden">
                <FacebookWidget showCard={false} />
              </div>
              <div className="px-4 py-2 bg-muted/20 border-t border-border/50">
                <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground hover:text-[#1877F2] gap-1 p-0" asChild>
                  <a href="https://www.facebook.com/MonXGold" target="_blank" rel="noopener noreferrer">
                    <EditableText tKey="home.updates.follow_button" fallback="Follow Us" />
                    <ArrowRight className="h-3 w-3" />
                  </a>
                </Button>
              </div>
            </div>
          )}
        </aside>
      )}

      {/* Mobile/Tablet: Bottom floating bar */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 lg:hidden flex gap-2 bg-card/95 backdrop-blur-sm rounded-full shadow-lg border border-border p-2">
        <button
          onClick={() => togglePanel('calendar')}
          className={cn(
            "p-3 rounded-full transition-all duration-200",
            activePanel === 'calendar' 
              ? "bg-primary text-primary-foreground" 
              : "hover:bg-muted"
          )}
        >
          <Calendar className="h-5 w-5" />
        </button>
        <button
          onClick={() => togglePanel('facebook')}
          className={cn(
            "p-3 rounded-full transition-all duration-200",
            activePanel === 'facebook' 
              ? "bg-[#1877F2] text-white" 
              : "hover:bg-muted"
          )}
        >
          <Facebook className="h-5 w-5" />
        </button>
      </div>

      {/* Mobile Panel - Slides up from bottom */}
      {activePanel && (
        <div className="fixed inset-x-0 bottom-20 z-40 lg:hidden mx-4">
          <div className="bg-card border border-border rounded-xl shadow-xl overflow-hidden max-h-[60vh]">
            <button
              onClick={() => setActivePanel(null)}
              className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-muted/80 hover:bg-muted transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            {activePanel === 'calendar' && (
              <div className="flex flex-col">
                <div className="flex items-center gap-2 px-4 py-3 bg-muted/30 border-b border-border">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="font-medium text-sm">
                    <EditableText tKey="home.calendar.title" fallback="Economic Calendar" />
                  </span>
                </div>
                <div className="h-[280px]">
                  <EconomicCalendarWidget showCard={false} height={280} />
                </div>
              </div>
            )}

            {activePanel === 'facebook' && (
              <div className="flex flex-col">
                <div className="flex items-center gap-2 px-4 py-3 bg-muted/30 border-b border-border">
                  <Facebook className="h-4 w-4 text-[#1877F2]" />
                  <span className="font-medium text-sm">
                    <EditableText tKey="home.updates.title" fallback="Latest Updates" />
                  </span>
                </div>
                <div className="h-[280px] overflow-hidden">
                  <FacebookWidget showCard={false} />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default GlobalSidebar;
