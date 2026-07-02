"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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

// Circular modulo helper
const getCircularDiff = (index: number, activeIndex: number, length: number) => {
  let diff = index - activeIndex;
  const half = Math.floor(length / 2);
  while (diff > half) diff -= length;
  while (diff < -half) diff += length;
  return diff;
};

export default function CollectionCarousel({ collections }: CollectionCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const router = useRouter();

  // Touch gesture states
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + collections.length) % collections.length);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % collections.length);
  };

  const handleCardClick = (index: number, link: string) => {
    const diff = getCircularDiff(index, activeIndex, collections.length);
    if (diff === 0) {
      router.push(link);
    } else {
      setActiveIndex(index);
    }
  };

  // Touch event handlers
  const minSwipeDistance = 50;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrev();
    }
  };

  // Auto-slide every 7 seconds for visual dynamism
  useEffect(() => {
    const timer = setInterval(() => {
      handleNext();
    }, 7000);
    return () => clearInterval(timer);
  }, [collections.length, activeIndex]);

  const getStyle = (index: number): React.CSSProperties => {
    const diff = getCircularDiff(index, activeIndex, collections.length);

    if (diff === 0) {
      return {
        transform: "translateX(0) scale(1.05)",
        opacity: 1,
        zIndex: 30,
        pointerEvents: "auto",
      };
    } else if (diff === -1) {
      return {
        transform: "translateX(calc(-1 * var(--cc-translate-adj, 22vw))) scale(0.88)",
        opacity: 0.85,
        zIndex: 20,
        pointerEvents: "auto",
      };
    } else if (diff === 1) {
      return {
        transform: "translateX(var(--cc-translate-adj, 22vw)) scale(0.88)",
        opacity: 0.85,
        zIndex: 20,
        pointerEvents: "auto",
      };
    } else if (diff === -2) {
      return {
        transform: "translateX(calc(-1 * var(--cc-translate-far, 40vw))) scale(0.78)",
        opacity: 0.7,
        zIndex: 10,
        pointerEvents: "none",
      };
    } else if (diff === 2) {
      return {
        transform: "translateX(var(--cc-translate-far, 40vw)) scale(0.78)",
        opacity: 0.7,
        zIndex: 10,
        pointerEvents: "none",
      };
    } else {
      return {
        transform: "translateX(0) scale(0.5)",
        opacity: 0,
        zIndex: 0,
        pointerEvents: "none",
      };
    }
  };

  return (
    <div
      className="cc-wrapper"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <style>{`
        .cc-wrapper {
          --cc-height: 290px;
          --cc-width: calc(var(--cc-height) * 0.68);
          --cc-translate-adj: 22vw;
          --cc-translate-far: 40vw;

          position: relative;
          width: 100%;
          height: var(--cc-height);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          padding: 0.5rem 0;
          user-select: none;
        }
        .cc-stack {
          position: relative;
          width: var(--cc-width);
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: width 0.3s ease;
        }
        .cc-card {
          position: absolute;
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          border-radius: 0.375rem;
          overflow: hidden;
          border: 1px solid rgba(232, 223, 200, 0.75);
          cursor: pointer;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
          transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .cc-card:hover {
          box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
        }
        .cc-btn-prev,
        .cc-btn-next {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          padding: 0.875rem;
          border-radius: 9999px;
          background: rgba(255,255,255,0.9);
          border: 1px solid rgba(232, 223, 200, 0.6);
          color: #1C1917;
          z-index: 40;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
          transition: all 0.3s ease;
        }
        .cc-btn-prev:hover,
        .cc-btn-next:hover {
          background: white;
          border-color: #A08260;
          color: #A08260;
        }
        .cc-btn-prev {
          left: 1rem;
        }
        .cc-btn-next {
          right: 1rem;
        }
        @media (min-width: 640px) {
          .cc-wrapper {
            --cc-height: 330px;
            --cc-translate-adj: 20vw;
            --cc-translate-far: 38vw;
          }
        }
        @media (min-width: 768px) {
          .cc-wrapper {
            --cc-height: 350px;
            --cc-translate-adj: 18vw;
            --cc-translate-far: 34vw;
          }
          .cc-btn-prev {
            left: 1.5rem;
          }
          .cc-btn-next {
            right: 1.5rem;
          }
        }
        @media (min-width: 1024px) {
          .cc-wrapper {
            --cc-height: clamp(310px, 48vh, 420px);
            --cc-width: calc(var(--cc-height) * 0.7);
            --cc-translate-adj: calc(var(--cc-width) * 0.965 + 20px);
            --cc-translate-far: calc(var(--cc-width) * 1.795 + 40px);
          }
          .cc-btn-prev {
            left: 3rem;
          }
          .cc-btn-next {
            right: 3rem;
          }
        }
        @media (min-width: 1280px) {
          .cc-wrapper {
            --cc-height: clamp(310px, 48vh, 440px);
            --cc-width: calc(var(--cc-height) * 0.7);
          }
        }
        @media (min-width: 1536px) {
          .cc-wrapper {
            --cc-height: clamp(310px, 48vh, 460px);
            --cc-width: calc(var(--cc-height) * 0.7);
          }
        }
      `}</style>

      {/* Cards stack container */}
      <div className="cc-stack">
        {collections.map((col, index) => {
          const style = getStyle(index);
          const diff = getCircularDiff(index, activeIndex, collections.length);
          const isCenter = diff === 0;

          return (
            <div
              key={index}
              style={style}
              onClick={() => handleCardClick(index, col.link)}
              className="cc-card group"
            >
              {/* Inner gold frame overlay (active center only) */}
              <div
                className={`absolute inset-4 border border-brand-gold/45 rounded-xs pointer-events-none transition-opacity duration-500 z-20 ${
                  isCenter ? "opacity-100 scale-100" : "opacity-0 scale-102"
                }`}
              />

              {/* Card Image */}
              <img
                src={col.image}
                alt={col.title}
                className="w-full h-full object-cover transition-transform duration-1000 ease-out transform scale-100 group-hover:scale-103"
                loading="lazy"
              />

              {/* Ambient dark gradient overlay to pop typography */}
              <div className="absolute inset-0 bg-gradient-to-t from-brand-charcoal/75 via-brand-charcoal/30 to-transparent z-10" />

              {/* Side cards dimming layer */}
              <div
                className={`absolute inset-0 bg-brand-charcoal transition-opacity duration-600 z-15 ${
                  isCenter ? "opacity-0" : "opacity-55 group-hover:opacity-45"
                }`}
              />

              {/* Card Text Content */}
              <div className="absolute bottom-5 left-4 right-4 sm:bottom-7 sm:left-6 sm:right-6 text-white space-y-1 z-20 transition-all duration-500 text-left">
                <span className="text-[8px] sm:text-[9px] font-sans font-bold uppercase tracking-[0.15em] text-brand-gold-light">
                  {col.subtitle}
                </span>
                <h3 className="font-serif text-base sm:text-xl font-medium tracking-wide leading-tight">
                  {col.title}
                </h3>
                {isCenter && (
                  <span className="inline-block text-[8px] font-sans font-semibold uppercase tracking-wider text-brand-gold border-b border-brand-gold/40 pb-0.5 mt-1 group-hover:border-brand-gold transition-all duration-300">
                    Explore Collection
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Manual Slide Navigation Chevrons */}
      <button
        onClick={handlePrev}
        className="cc-btn-prev"
        aria-label="Previous Slide"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={handleNext}
        className="cc-btn-next"
        aria-label="Next Slide"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Navigation Dot Indicators */}
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2 z-40">
        {collections.map((_, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
              index === activeIndex ? "w-6 bg-brand-gold" : "w-1.5 bg-[#E8DFC8]"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
