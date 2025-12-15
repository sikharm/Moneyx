import { Calendar, Facebook, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";
import EconomicCalendarWidget from "./EconomicCalendarWidget";
import FacebookWidget from "./FacebookWidget";
import EditableText from "./EditableText";

const GlobalSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside 
      className={cn(
        "fixed right-0 top-16 bottom-0 z-40 transition-all duration-300 ease-in-out",
        "hidden xl:flex flex-col",
        isCollapsed ? "w-12" : "w-80"
      )}
    >
      {/* Collapse Toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -left-4 top-1/2 -translate-y-1/2 z-50 bg-card border border-border rounded-full p-1.5 shadow-lg hover:bg-muted transition-colors"
      >
        {isCollapsed ? (
          <ChevronLeft className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </button>

      {/* Collapsed State */}
      {isCollapsed && (
        <div className="flex flex-col items-center gap-4 py-4 bg-card/80 backdrop-blur-sm border-l border-border h-full">
          <div className="p-2 rounded-lg bg-primary/10">
            <Calendar className="h-5 w-5 text-primary" />
          </div>
          <div className="p-2 rounded-lg bg-[#1877F2]/10">
            <Facebook className="h-5 w-5 text-[#1877F2]" />
          </div>
        </div>
      )}

      {/* Expanded State */}
      {!isCollapsed && (
        <div className="flex flex-col h-full bg-card/80 backdrop-blur-sm border-l border-border overflow-y-auto">
          {/* Economic Calendar */}
          <div className="border-b border-border">
            <div className="flex items-center gap-2 px-4 py-3 bg-muted/30">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="font-medium text-sm">
                <EditableText tKey="home.calendar.title" fallback="Economic Calendar" />
              </span>
            </div>
            <div className="h-[280px]">
              <EconomicCalendarWidget showCard={false} height={280} />
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

          {/* Social Updates */}
          <div>
            <div className="flex items-center gap-2 px-4 py-3 bg-muted/30">
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
        </div>
      )}
    </aside>
  );
};

export default GlobalSidebar;
