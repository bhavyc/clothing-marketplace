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

export default function HeroCarousel() {
  const [activeSlide, setActiveSlide] = useState(0);

  const slides: SlideItem[] = [
    {
      subtitle: "vamika & bhargavi",
      title1: "handcrafted",
      title2: "elegance.",
      description: "Discover our curated collection of timeless silhouettes designed for the modern woman.",
      image: "https://images.unsplash.com/photo-1608748010899-18f300247112?auto=format&fit=crop&w=1920&h=800&crop=faces,edges&q=80",
      link: "/shop",
      buttonText: "Shop Collection",
    },
    {
      subtitle: "tailored perfection",
      title1: "bespoke",
      title2: "styling.",
      description: "Made to measure outfits crafted with precision, celebrating your unique style and comfort.",
      image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1920&h=800&crop=faces,edges&q=80",
      link: "/shop",
      buttonText: "Explore Catalog",
    },
    {
      subtitle: "new arrivals",
      title1: "everyday",
      title2: "classics.",
      description: "Effortless styles and breathable fabrics for your daily wardrobe essentials.",
      image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1920&h=800&crop=faces,edges&q=80",
      link: "/shop",
      buttonText: "Shop Now",
    },
  ];

  // Auto slide effect
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const handlePrev = () => {
    setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
    setActiveSlide((prev) => (prev + 1) % slides.length);
  };

  // Swipe handling
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    
    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrev();
    }
    
    setTouchStart(0);
    setTouchEnd(0);
  };

  return (
    <div 
      className="relative w-full h-[70vh] sm:h-[80vh] overflow-hidden bg-stone-900 group"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      
      {/* Carousel Tracks */}
      {slides.map((slide, index) => {
        const isActive = index === activeSlide;
        // Generate a portrait crop URL for mobile
        const mobileImage = slide.image.replace('w=1920&h=800', 'w=800&h=1200');
        
        return (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
            }`}
          >
            {/* Desktop Background Image */}
            <div
              className="hidden sm:block absolute inset-0 bg-cover bg-center transform scale-100 transition-transform duration-[10s] ease-out"
              style={{
                backgroundImage: `url('${slide.image}')`,
                transform: isActive ? "scale(1.05)" : "scale(1)",
              }}
            />
            {/* Mobile Background Image (Portrait Crop) */}
            <div
              className="block sm:hidden absolute inset-0 bg-cover bg-center transform scale-100 transition-transform duration-[10s] ease-out"
              style={{
                backgroundImage: `url('${mobileImage}')`,
                transform: isActive ? "scale(1.05)" : "scale(1)",
              }}
            />
            
            {/* Gradient Overlay for Text Readability */}
            <div className="absolute inset-0 bg-black/40 sm:bg-black/30" />
            
            {/* Slide Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 sm:px-6 z-20 animate-fade-in-slide">
              <span className="text-[10px] sm:text-xs font-sans font-bold uppercase tracking-[0.2em] text-white/90 mb-4 drop-shadow-md">
                {slide.subtitle}
              </span>
              
              <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-semibold tracking-wide text-white leading-tight lowercase drop-shadow-lg mb-6">
                {slide.title1} <br />
                <span className="font-normal italic text-brand-gold">{slide.title2}</span>
              </h1>
              
              <p className="font-sans text-xs sm:text-sm text-white/80 max-w-lg leading-relaxed uppercase tracking-widest drop-shadow-md mb-8">
                {slide.description}
              </p>
              
              <Link
                href={slide.link}
                className="inline-flex items-center justify-center bg-brand-gold text-brand-charcoal px-10 py-4 text-xs font-sans font-bold uppercase tracking-widest rounded-sm hover:bg-white transition-colors duration-300 shadow-xl cursor-pointer"
              >
                {slide.buttonText}
              </Link>
            </div>
          </div>
        );
      })}

      {/* Manual Navigation Arrows */}
      <button
        onClick={handlePrev}
        className="hidden sm:flex absolute left-4 top-1/2 transform -translate-y-1/2 p-3 rounded-full bg-black/20 hover:bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-all cursor-pointer items-center justify-center backdrop-blur-sm z-30"
        aria-label="Previous Slide"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={handleNext}
        className="hidden sm:flex absolute right-4 top-1/2 transform -translate-y-1/2 p-3 rounded-full bg-black/20 hover:bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-all cursor-pointer items-center justify-center backdrop-blur-sm z-30"
        aria-label="Next Slide"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3 z-30">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setActiveSlide(index)}
            className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
              index === activeSlide ? "w-8 bg-brand-gold" : "w-4 bg-white/50 hover:bg-white/80"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
