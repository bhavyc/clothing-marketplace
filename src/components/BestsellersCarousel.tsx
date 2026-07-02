"use client";

import { useRef, useState, useEffect } from "react";
import ProductCard from "./ProductCard";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ProductItem {
  id: string;
  title: string;
  description: string;
  images: string;
  category: string;
  collection: string | null;
  isBestseller: boolean;
  seller: {
    shopName: string;
  };
  variants: Array<{
    price: number;
    stock: number;
  }>;
}

interface BestsellersCarouselProps {
  products: ProductItem[];
}

export default function BestsellersCarousel({ products }: BestsellersCarouselProps) {
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
  }, [products]);

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
    <div className="relative group/carousel px-1">
      {/* Scroll track container */}
      <div
        ref={scrollRef}
        className="flex overflow-x-auto gap-6 pb-6 pt-4 scrollbar-none snap-x snap-mandatory scroll-smooth"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {products.map((product) => (
          <div
            key={product.id}
            className="flex-shrink-0 w-[240px] sm:w-[280px] md:w-[calc(50%-12px)] lg:w-[calc(25%-18px)] snap-start"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      {/* Slide Navigation Buttons */}
      {canScrollLeft && (
        <button
          onClick={() => handleScroll("left")}
          className="absolute -left-4 top-[35%] transform -translate-y-1/2 p-3 rounded-full bg-white/90 hover:bg-white border border-[#E8DFC8]/60 hover:border-brand-gold text-brand-charcoal hover:text-brand-gold transition-all duration-300 shadow-md z-30 hidden sm:flex items-center justify-center cursor-pointer"
          aria-label="Previous Bestsellers"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}
      {canScrollRight && (
        <button
          onClick={() => handleScroll("right")}
          className="absolute -right-4 top-[35%] transform -translate-y-1/2 p-3 rounded-full bg-white/90 hover:bg-white border border-[#E8DFC8]/60 hover:border-brand-gold text-brand-charcoal hover:text-brand-gold transition-all duration-300 shadow-md z-30 hidden sm:flex items-center justify-center cursor-pointer"
          aria-label="Next Bestsellers"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
