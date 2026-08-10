"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CollectionItem {
  title: string;
  subtitle: string;
  image: string;
  link: string;
}

interface CollectionCarouselProps {
  collections: CollectionItem[];
}

export default function CollectionCarousel({ collections }: CollectionCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.addEventListener("scroll", checkScroll, { passive: true });
      checkScroll();
      const timeout = setTimeout(checkScroll, 500);
      window.addEventListener("resize", checkScroll);
      return () => {
        el.removeEventListener("scroll", checkScroll);
        window.removeEventListener("resize", checkScroll);
        clearTimeout(timeout);
      };
    }
  }, [collections]);

  const handleScroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { clientWidth, scrollLeft } = scrollRef.current;
      const scrollAmount = direction === "left" ? -clientWidth * 0.75 : clientWidth * 0.75;
      scrollRef.current.scrollTo({
        left: scrollLeft + scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="relative group/carousel max-w-[1600px] mx-auto px-4 sm:px-12 lg:px-16 pb-10">
      {/* Scroll track container */}
      <div
        ref={scrollRef}
        className="flex overflow-x-auto gap-4 sm:gap-6 pb-6 pt-4 scrollbar-none snap-x snap-mandatory scroll-smooth"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {collections.map((col, index) => (
          <Link
            key={index}
            href={col.link}
            className="flex-shrink-0 w-[240px] sm:w-[280px] md:w-[calc(50%-12px)] lg:w-[calc(25%-18px)] snap-start group relative block aspect-[4/5] overflow-hidden rounded-md border border-[#E8DFC8]/75 cursor-pointer shadow-sm hover:shadow-xl transition-all duration-500"
          >
            {/* Card Image */}
            <img
              src={col.image}
              alt={col.title}
              className="w-full h-full object-cover transition-transform duration-1000 ease-out transform scale-100 group-hover:scale-105"
              loading="lazy"
            />

            {/* Ambient dark gradient overlay to pop typography */}
            <div className="absolute inset-0 bg-gradient-to-t from-brand-charcoal/80 via-brand-charcoal/20 to-transparent z-10 transition-opacity duration-500 group-hover:from-brand-charcoal/90" />

            {/* Card Text Content */}
            <div className="absolute bottom-5 left-5 right-5 text-white space-y-1.5 z-20 text-left">
              <span className="text-[10px] sm:text-[11px] font-sans font-bold uppercase tracking-[0.15em] text-brand-gold-light">
                {col.subtitle}
              </span>
              <h3 className="font-serif text-xl sm:text-2xl font-medium tracking-wide leading-tight">
                {col.title}
              </h3>
              <span className="inline-block text-[9px] font-sans font-semibold uppercase tracking-wider text-brand-gold border-b border-brand-gold/40 pb-0.5 mt-2 group-hover:border-brand-gold transition-all duration-300">
                Explore Collection
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Slide Navigation Buttons */}
      {canScrollLeft && (
        <button
          onClick={() => handleScroll("left")}
          className="absolute left-0 sm:left-8 top-[40%] transform -translate-y-1/2 p-3 rounded-full bg-white/90 hover:bg-white border border-[#E8DFC8]/60 hover:border-brand-gold text-brand-charcoal hover:text-brand-gold transition-all duration-300 shadow-md z-30 hidden sm:flex items-center justify-center cursor-pointer"
          aria-label="Previous Collections"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}
      {canScrollRight && (
        <button
          onClick={() => handleScroll("right")}
          className="absolute right-0 sm:right-8 top-[40%] transform -translate-y-1/2 p-3 rounded-full bg-white/90 hover:bg-white border border-[#E8DFC8]/60 hover:border-brand-gold text-brand-charcoal hover:text-brand-gold transition-all duration-300 shadow-md z-30 hidden sm:flex items-center justify-center cursor-pointer"
          aria-label="Next Collections"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
