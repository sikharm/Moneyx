import { useRef, useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import Autoplay from "embla-carousel-autoplay";
import { TrendingUp, Bot, Sliders, Download } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import EditableText from "@/components/EditableText";
import { useLanguage } from "@/contexts/LanguageContext";

// Import hero images
import heroPerformance from "@/assets/hero-slide-performance.jpg";
import heroAuto from "@/assets/hero-slide-auto.jpg";
import heroHybrid from "@/assets/hero-slide-hybrid.jpg";
import heroDownload from "@/assets/hero-slide-download.jpg";

const AUTOPLAY_DELAY = 5000; // 5 seconds

const slides = [
  {
    id: 1,
    titleKey: "home.hero.slide1.title",
    subtitleKey: "home.hero.slide1.subtitle",
    icon: TrendingUp,
    link: "/performance",
    buttonKey: "home.hero.slide1.button",
    image: heroPerformance,
  },
  {
    id: 2,
    titleKey: "home.hero.slide2.title",
    subtitleKey: "home.hero.slide2.subtitle",
    icon: Bot,
    link: "/auto-mode",
    buttonKey: "home.hero.slide2.button",
    image: heroAuto,
  },
  {
    id: 3,
    titleKey: "home.hero.slide3.title",
    subtitleKey: "home.hero.slide3.subtitle",
    icon: Sliders,
    link: "/hybrid-mode",
    buttonKey: "home.hero.slide3.button",
    image: heroHybrid,
  },
  {
    id: 4,
    titleKey: "home.hero.slide4.title",
    subtitleKey: "home.hero.slide4.subtitle",
    icon: Download,
    link: "/download",
    buttonKey: "home.hero.slide4.button",
    image: heroDownload,
  },
];

export function HeroCarousel() {
  const { t } = useLanguage();
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  const autoplayPlugin = useRef(
    Autoplay({ delay: AUTOPLAY_DELAY, stopOnInteraction: false, stopOnMouseEnter: true })
  );

  // Reset progress when slide changes
  const resetProgress = useCallback(() => {
    setProgress(0);
  }, []);

  useEffect(() => {
    if (!api) return;

    setCurrent(api.selectedScrollSnap());
    resetProgress();
    
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
      resetProgress();
    });
  }, [api, resetProgress]);

  // Progress bar animation
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 0;
        return prev + (100 / (AUTOPLAY_DELAY / 50)); // Update every 50ms
      });
    }, 50);

    return () => clearInterval(interval);
  }, [current, isPaused]);

  return (
    <section 
      className="relative w-full"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <Carousel
        setApi={setApi}
        plugins={[autoplayPlugin.current]}
        opts={{
          loop: true,
          align: "start",
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-0">
          {slides.map((slide, index) => {
            const Icon = slide.icon;
            const isActive = current === index;
            return (
              <CarouselItem key={slide.id} className="pl-0">
                <div
                  className="relative min-h-[60vh] md:min-h-[70vh] flex items-center justify-center overflow-hidden"
                >
                  {/* Background Image with Ken Burns zoom effect */}
                  <div 
                    className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-[5000ms] ease-linear ${
                      isActive ? "scale-110" : "scale-100"
                    }`}
                    style={{ backgroundImage: `url(${slide.image})` }}
                  />
                  {/* Dark Overlay for text readability */}
                  <div className="absolute inset-0 bg-black/50" />
                  
                  {/* Content with fade-in animation */}
                  <div className={`container mx-auto px-4 text-center space-y-6 relative z-10 transition-all duration-700 ${
                    isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                  }`}>
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/20 backdrop-blur-sm mb-4">
                      <Icon className="w-10 h-10 text-primary" />
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white drop-shadow-lg">
                      <EditableText tKey={slide.titleKey} />
                    </h1>
                    <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto drop-shadow-md">
                      <EditableText tKey={slide.subtitleKey} />
                    </p>
                    <div className="pt-4">
                      <Button asChild size="lg" className="text-lg px-8">
                        <Link to={slide.link}>
                          {t(slide.buttonKey) || "Learn More"}
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        
        {/* Navigation Arrows */}
        <CarouselPrevious className="left-4 bg-white/20 hover:bg-white/40 border-white/30 text-white" />
        <CarouselNext className="right-4 bg-white/20 hover:bg-white/40 border-white/30 text-white" />
      </Carousel>

      {/* Progress Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              api?.scrollTo(index);
              resetProgress();
            }}
            className="group relative flex flex-col items-center gap-1"
            aria-label={`Go to slide ${index + 1}`}
          >
            {/* Progress bar container */}
            <div className={`h-1 rounded-full overflow-hidden transition-all duration-300 ${
              current === index ? "w-12 bg-white/30" : "w-3 bg-white/20"
            }`}>
              {/* Progress fill - only show on active slide */}
              {current === index && (
                <div 
                  className="h-full bg-primary transition-all duration-75 ease-linear"
                  style={{ width: `${progress}%` }}
                />
              )}
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
