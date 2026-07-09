"use client";

import { useState } from "react";
import Link from "next/link";

export interface ProductCardProps {
  product: {
    id: string;
    title: string;
    description: string;
    images: string; // JSON string array
    category: string;
    collection: string | null;
    isBestseller: boolean;
    discountPercent?: number;
    seller: {
      shopName: string;
    };
    variants: Array<{
      price: number;
      stock: number;
    }>;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const [hovered, setHovered] = useState(false);

  // Parse images JSON safely
  let imageList: string[] = ["/placeholder.jpg"];
  try {
    if (product.images) {
      imageList = JSON.parse(product.images);
    }
  } catch (e) {
    if (typeof product.images === "string" && product.images.includes(",")) {
      imageList = product.images.split(",");
    } else if (typeof product.images === "string") {
      imageList = [product.images];
    }
  }

  // Calculate starting price
  const prices = product.variants.map((v) => v.price);
  const startingPrice = prices.length > 0 ? Math.min(...prices) : 0;
  
  const discountPercent = product.discountPercent || 0;
  const discountedPrice = discountPercent > 0
    ? startingPrice * (1 - discountPercent / 100)
    : startingPrice;
  
  // Check if out of stock completely
  const totalStock = product.variants.reduce((acc, v) => acc + v.stock, 0);
  const isOutOfStock = totalStock === 0;

  const mainImage = imageList[0] || "/placeholder.jpg";
  const hoverImage = imageList[1] || mainImage;

  return (
    <div className="group relative flex flex-col bg-transparent">
      {/* Product Image Wrapper */}
      <Link href={`/shop/${product.id}`} className="block">
        <div
          className="relative w-full aspect-[3/4] border border-[#E8DFC8] group-hover:border-brand-gold/50 rounded-md overflow-hidden bg-brand-cream-dark shadow-2xs group-hover:shadow-md transition-all duration-500 ease-out"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          {/* Inner gold frame overlay on hover */}
          <div className="absolute inset-2 border border-brand-gold/40 rounded-xs pointer-events-none opacity-0 scale-103 group-hover:opacity-100 group-hover:scale-100 transition-all duration-500 ease-out z-10" />

          {/* Badge: Bestseller / Sale / Out of Stock */}
          <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
            {isOutOfStock ? (
              <span className="bg-[#1C1917]/70 text-[#FAF6F0] text-[9px] uppercase tracking-widest font-sans font-bold px-2 py-1 rounded-sm backdrop-blur-xs">
                Sold Out
              </span>
            ) : (
              <>
                {product.isBestseller && (
                  <span className="bg-brand-gold text-[#FAF6F0] text-[9px] uppercase tracking-widest font-sans font-bold px-2.5 py-1 rounded-sm shadow-sm">
                    Bestseller
                  </span>
                )}
                {discountPercent > 0 && (
                  <span className="bg-red-650 text-[#FAF6F0] text-[9px] uppercase tracking-widest font-sans font-bold px-2.5 py-1 rounded-sm shadow-sm animate-pulse">
                    {discountPercent}% OFF
                  </span>
                )}
              </>
            )}
          </div>

          {/* Dynamic Hover Image */}
          <img
            src={hovered ? hoverImage : mainImage}
            alt={product.title}
            className="w-full h-full object-cover transition-all duration-700 transform scale-100 group-hover:scale-103 ease-out"
            loading="lazy"
          />
        </div>
      </Link>

      {/* Product Information */}
      <div className="mt-3 flex flex-col">
        <div className="flex items-center justify-between">
          <p className="text-[11px] text-brand-gold uppercase tracking-wider font-sans font-semibold">
            {product.category}
          </p>
        </div>

        <Link href={`/shop/${product.id}`} className="mt-1">
          <h3 className="font-serif text-base font-medium text-brand-charcoal hover:text-brand-gold transition-colors duration-200 line-clamp-1">
            {product.title}
          </h3>
        </Link>

        <div className="mt-1.5 font-sans text-sm font-semibold text-brand-charcoal flex items-center gap-2">
          <span>
            {prices.length > 1 ? "From " : ""}
            Rs. {discountedPrice.toLocaleString("en-IN")}
          </span>
          {discountPercent > 0 && (
            <span className="text-xs text-gray-400 line-through font-normal">
              Rs. {startingPrice.toLocaleString("en-IN")}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
