import { useRef, useState, useEffect } from "react";
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
  
  const autoplayPlugin = useRef(
    Autoplay({ delay: 5000, stopOnInteraction: false, stopOnMouseEnter: true })
  );

  useEffect(() => {
    if (!api) return;

    setCurrent(api.selectedScrollSnap());
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  return (
    <section className="relative w-full">
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
          {slides.map((slide) => {
            const Icon = slide.icon;
            return (
              <CarouselItem key={slide.id} className="pl-0">
                <div
                  className="relative min-h-[60vh] md:min-h-[70vh] flex items-center justify-center overflow-hidden"
                >
                  {/* Background Image */}
                  <div 
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: `url(${slide.image})` }}
                  />
                  {/* Dark Overlay for text readability */}
                  <div className="absolute inset-0 bg-black/50" />
                  
                  {/* Content */}
                  <div className="container mx-auto px-4 text-center space-y-6 animate-fade-in relative z-10">
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

      {/* Dot Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => api?.scrollTo(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              current === index
                ? "bg-primary w-8"
                : "bg-white/50 hover:bg-white/70"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
