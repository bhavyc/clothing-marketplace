"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Star, ChevronLeft, ChevronRight } from "lucide-react";

interface SlideItem {
  title1: string;
  title2: string;
  subtitle: string;
  description: string;
  image: string;
  link: string;
  buttonText: string;
}

interface HeroCarouselProps {
  mode: "LUXE" | "INDI";
}

export default function HeroCarousel({ mode }: HeroCarouselProps) {
  const [activeSlide, setActiveSlide] = useState(0);

  const luxeSlides: SlideItem[] = [
    {
      subtitle: "vamika & bhargavi luxe",
      title1: "exquisite luxury",
      title2: "couture.",
      description: "Discover premium hand-crafted ensembles, high-end design aesthetics, and heritage apparel curated for modern elegance.",
      image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=700&q=80",
      link: `/shop?mode=LUXE`,
      buttonText: "Explore Luxe Collection",
    },
    {
      subtitle: "custom styling services",
      title1: "tailored to your",
      title2: "perfection.",
      description: "Enjoy complimentary size customisation and custom fit adjustments directly with our boutique designers.",
      image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=700&q=80",
      link: `/shop?mode=LUXE`,
      buttonText: "Shop Tailored Fits",
    },
    {
      subtitle: "vamika & bhargavi indi",
      title1: "minimalist daily",
      title2: "wear.",
      description: "Discover lightweight daily-wear collections, comfortable coord outfits, and breathable silhouettes in our Indi range.",
      image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=700&q=80",
      link: `/?mode=INDI`,
      buttonText: "Explore Indi Collection",
    },
  ];

  const indiSlides: SlideItem[] = [
    {
      subtitle: "vamika & bhargavi indi",
      title1: "minimalist daily",
      title2: "wear.",
      description: "Discover lightweight daily-wear collections, comfortable coord outfits, and breathable silhouettes.",
      image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=700&q=80",
      link: `/shop?mode=INDI`,
      buttonText: "Explore Indi Collection",
    },
    {
      subtitle: "custom styling services",
      title1: "tailored to your",
      title2: "perfection.",
      description: "Enjoy complimentary size customisation and custom fit adjustments directly with our boutique designers.",
      image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=700&q=80",
      link: `/shop?mode=INDI`,
      buttonText: "Shop Tailored Fits",
    },
    {
      subtitle: "vamika & bhargavi luxe",
      title1: "exquisite luxury",
      title2: "couture.",
      description: "Discover premium hand-crafted ensembles, high-end design aesthetics, and heritage apparel curated for modern elegance in our Luxe range.",
      image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=700&q=80",
      link: `/?mode=LUXE`,
      buttonText: "Explore Luxe Collection",
    },
  ];

  const slides = mode === "LUXE" ? luxeSlides : indiSlides;

  // Auto slide effect
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length, mode]);

  // Reset slide index if mode changes
  useEffect(() => {
    setActiveSlide(0);
  }, [mode]);

  const handlePrev = () => {
    setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
    setActiveSlide((prev) => (prev + 1) % slides.length);
  };

  return (
    <div className="relative overflow-hidden bg-[#FAF6F0] border-b border-[#E8DFC8]">
      {/* Background Soft radial gradient glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(197,168,128,0.08),transparent_50%)] pointer-events-none" />
      
      {/* Carousel Tracks */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 lg:py-24 relative z-10">
        {slides.map((slide, index) => {
          const isActive = index === activeSlide;
          if (!isActive) return null;
          return (
            <div
              key={index}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10 animate-fade-in-slide"
            >
              {/* Slide Text Content */}
              <div className="lg:col-span-7 space-y-4 sm:space-y-6 text-left order-2 lg:order-1">
                <div className="inline-flex items-center space-x-2 bg-white border border-[#E8DFC8]/80 rounded-full px-4 py-1.5 text-[9px] font-sans font-bold uppercase tracking-widest text-brand-gold shadow-2xs">
                  <Star className="h-3 w-3 fill-brand-gold text-brand-gold animate-pulse" />
                  <span>{slide.subtitle}</span>
                </div>
                
                <h1 className="font-serif text-3xl sm:text-5xl lg:text-7xl font-semibold tracking-wide text-brand-charcoal leading-tight lowercase">
                  {slide.title1} <br />
                  <span className="text-brand-gold font-normal italic">{slide.title2}</span>
                </h1>
                
                <p className="font-sans text-[10px] sm:text-xs text-gray-500 max-w-lg leading-relaxed uppercase tracking-wider">
                  {slide.description}
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 sm:pt-4">
                  <Link
                    href={slide.link}
                    className="inline-flex items-center justify-center bg-brand-charcoal text-brand-cream px-8 py-3.5 text-xs font-sans font-bold uppercase tracking-widest rounded-md hover:bg-brand-charcoal/90 transition-all shadow-md hover:shadow-lg group cursor-pointer"
                  >
                    {slide.buttonText}
                    <ArrowRight className="ml-2.5 h-4 w-4 transform group-hover:translate-x-1 transition-transform duration-300" />
                  </Link>
                  <Link
                    href={`/shop?mode=${mode}`}
                    className="inline-flex items-center justify-center bg-transparent border border-[#C5B495] text-brand-gold px-8 py-3.5 text-xs font-sans font-bold uppercase tracking-widest rounded-md hover:bg-white transition-all shadow-2xs hover:shadow-xs cursor-pointer"
                  >
                    View All Silhouettes
                  </Link>
                </div>
              </div>

              {/* Slide Image collage wrapper */}
              <div className="lg:col-span-5 relative flex justify-center order-1 lg:order-2">
                {/* Visual Accent Box behind the image */}
                <div className="absolute inset-4 -right-1 -bottom-4 border border-brand-gold/40 rounded-lg pointer-events-none transform translate-x-2 translate-y-2 z-0" />
                
                <div className="relative w-full max-w-[280px] sm:max-w-[340px] aspect-[3/4] border-2 border-brand-gold rounded-lg shadow-xl overflow-hidden bg-brand-cream-dark z-10 group">
                  <img
                    src={slide.image}
                    alt={slide.title1}
                    className="w-full h-full object-cover transform scale-100 group-hover:scale-103 transition-transform duration-1000 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-charcoal/45 via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />
                  
                  {/* Decorative slide label */}
                  <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-xs p-3 rounded border border-[#E8DFC8] shadow-md transform translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
                    <span className="text-[8px] text-brand-gold uppercase tracking-widest font-sans font-bold block">Featured Look</span>
                    <span className="font-serif text-[10px] sm:text-xs uppercase tracking-widest text-brand-charcoal font-semibold">{slide.title1} {slide.title2}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Manual Slide Navigation Chevrons */}
      <button
        onClick={handlePrev}
        className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 p-1.5 sm:p-2 rounded-full bg-white/75 hover:bg-white border border-[#E8DFC8]/60 hover:border-brand-gold text-brand-charcoal hover:text-brand-gold transition-all cursor-pointer flex items-center justify-center shadow-xs z-20"
        aria-label="Previous Slide"
      >
        <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
      </button>
      <button
        onClick={handleNext}
        className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 p-1.5 sm:p-2 rounded-full bg-white/75 hover:bg-white border border-[#E8DFC8]/60 hover:border-brand-gold text-brand-charcoal hover:text-brand-gold transition-all cursor-pointer flex items-center justify-center shadow-xs z-20"
        aria-label="Next Slide"
      >
        <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
      </button>

      {/* Slide Indicators Dots at the Bottom */}
      <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 flex space-x-2.5 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setActiveSlide(index)}
            className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
              index === activeSlide ? "w-6 bg-brand-gold" : "w-2 bg-[#E8DFC8]"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
