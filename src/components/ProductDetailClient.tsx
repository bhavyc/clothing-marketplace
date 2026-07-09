"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { ShoppingBag, ChevronDown, ChevronUp, MessageSquare, Ruler, X } from "lucide-react";

export interface Variant {
  id: string;
  topSize: string | null;
  bottomSize: string | null;
  price: number;
  stock: number;
}

export interface Option {
  id: string;
  optionName: string;
  optionValue: string;
  priceAdjustment: number;
}

export interface ProductDetailProps {
  product: {
    id: string;
    title: string;
    description: string;
    images: string; // JSON string array
    category: string;
    collection: string | null;
    fabricDetails: string | null;
    careInstructions: string | null;
    deliveryTimeline: string;
    isSet: boolean;
    topLength: string | null;
    pantLength: string | null;
    sleeveLength: string | null;
    sizeChartType: string;
    sizeChartData: string | null;
    discountPercent?: number;
    seller: {
      shopName: string;
    };
    variants: Variant[];
    options: Option[];
  };
}

export default function ProductDetailClient({ product }: ProductDetailProps) {
  const { addItem } = useCart();

  // Parse Images safely
  let images: string[] = ["/placeholder.jpg"];
  try {
    images = JSON.parse(product.images);
  } catch (e) {
    if (typeof product.images === "string" && product.images.includes(",")) {
      images = product.images.split(",");
    } else {
      images = [product.images];
    }
  }

  const [activeImage, setActiveImage] = useState(images[0] || "/placeholder.jpg");
  const [selectedTopSize, setSelectedTopSize] = useState("");
  const [selectedBottomSize, setSelectedBottomSize] = useState("");
  const [selectedOptions, setSelectedOptions] = useState<Record<string, boolean>>({});
  const [quantity, setQuantity] = useState(1);
  const [showSizeChart, setShowSizeChart] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState<string | null>("details");
  const [cartSuccess, setCartSuccess] = useState(false);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  // Derive unique sizes listed for the dropdown options
  const topSizes = Array.from(
    new Set(product.variants.map((v) => v.topSize).filter(Boolean))
  ) as string[];
  const bottomSizes = Array.from(
    new Set(product.variants.map((v) => v.bottomSize).filter(Boolean))
  ) as string[];

  // Find active variant matching sizes
  const activeVariant = product.variants.find((v) => {
    const topMatch = !v.topSize || v.topSize === selectedTopSize;
    const bottomMatch = !product.isSet || !v.bottomSize || v.bottomSize === selectedBottomSize;
    return topMatch && bottomMatch;
  });

  // Calculate Base Price
  const basePrice = activeVariant
    ? activeVariant.price
    : product.variants.length > 0
    ? Math.min(...product.variants.map((v) => v.price))
    : 0;

  const discountPercent = product.discountPercent || 0;
  const discountedBasePrice = discountPercent > 0 
    ? basePrice * (1 - discountPercent / 100) 
    : basePrice;

  // Calculate Options Additions
  const chosenOptionsList = product.options.filter((opt) => selectedOptions[opt.id]);
  const optionsAdjustment = chosenOptionsList.reduce(
    (acc, opt) => acc + opt.priceAdjustment,
    0
  );

  // Total Unit Price
  const totalUnitPrice = discountedBasePrice + optionsAdjustment;
  
  // Total Quantity Price
  const totalPrice = totalUnitPrice * quantity;

  // Stock Status
  const isOutOfStock = activeVariant
    ? activeVariant.stock <= 0
    : product.variants.reduce((acc, v) => acc + v.stock, 0) === 0;

  // Options grouped by optionName (e.g., "Dupatta", "Inner")
  const optionsByName = product.options.reduce((acc, opt) => {
    if (!acc[opt.optionName]) {
      acc[opt.optionName] = [];
    }
    acc[opt.optionName].push(opt);
    return acc;
  }, {} as Record<string, Option[]>);

  // Toggle option selection
  const handleOptionToggle = (optionId: string, optionName: string) => {
    setSelectedOptions((prev) => {
      const next = { ...prev };
      
      // If we select a value, we must turn off other values of the SAME optionName (radio-like behavior)
      const optionsOfSameName = product.options.filter((o) => o.optionName === optionName);
      optionsOfSameName.forEach((o) => {
        if (o.id !== optionId) {
          next[o.id] = false;
        }
      });

      next[optionId] = !prev[optionId];
      return next;
    });
  };

  // Add to Bag action
  const handleAddToBag = () => {
    if (product.variants.some((v) => v.topSize) && !selectedTopSize) {
      alert("Please select a top size.");
      return;
    }
    if (product.isSet && product.variants.some((v) => v.bottomSize) && !selectedBottomSize) {
      alert("Please select a bottom/salwar size.");
      return;
    }
    if (!activeVariant) {
      alert("Selected size combination is unavailable.");
      return;
    }

    addItem({
      productId: product.id,
      productTitle: product.title,
      productImage: images[0] || "/placeholder.jpg",
      category: product.category,
      sellerShopName: product.seller.shopName,
      variantId: activeVariant.id,
      topSize: selectedTopSize || null,
      bottomSize: product.isSet ? selectedBottomSize || null : null,
      basePrice: discountedBasePrice,
      selectedOptions: chosenOptionsList.map((opt) => ({
        id: opt.id,
        optionName: opt.optionName,
        optionValue: opt.optionValue,
        priceAdjustment: opt.priceAdjustment,
      })),
      quantity,
      deliveryTimeline: product.deliveryTimeline,
    });

    setCartSuccess(true);
    setTimeout(() => setCartSuccess(false), 3000);
  };

  // WhatsApp Prepopulated Message Link
  const getWhatsAppLink = () => {
    const sizeDetails = [];
    if (selectedTopSize) sizeDetails.push(`Top: ${selectedTopSize}`);
    if (selectedBottomSize) sizeDetails.push(`Bottom: ${selectedBottomSize}`);
    
    const optionsText = chosenOptionsList.map((o) => `${o.optionName}: ${o.optionValue}`).join(", ");
    
    const message = `Hi! I am interested in customizing the following outfit from your boutique:\n\n*Product:* ${product.title}\n*Code/Link:* ${origin}/shop/${product.id}\n${sizeDetails.length > 0 ? `*Size Request:* ${sizeDetails.join(", ")}\n` : ""}${optionsText ? `*Options:* ${optionsText}\n` : ""}*Custom Styling Request:* (e.g. sleeves length adjustment, color changes)`;
    
    return `https://wa.me/919999999999?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Left Column: Photos Grid */}
        <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-12 gap-4">
          
          {/* Vertical Thumbnail List */}
          <div className="md:col-span-2 flex md:flex-col flex-row gap-2 order-2 md:order-1 overflow-x-auto md:overflow-x-visible scrollbar-none pb-2 md:pb-0">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(img)}
                className={`w-14 md:w-18 aspect-[3/4] rounded border flex-shrink-0 bg-brand-cream-dark overflow-hidden transition-all ${
                  activeImage === img ? "border-brand-gold ring-1 ring-brand-gold" : "border-[#E8DFC8] hover:border-brand-gold"
                }`}
              >
                <img src={img} alt={`Preview ${i}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>

          {/* Main Large Photo */}
          <div className="md:col-span-10 order-1 md:order-2 border border-[#E8DFC8] rounded-md overflow-hidden aspect-[3/4] bg-brand-cream-dark shadow-sm">
            <img src={activeImage} alt={product.title} className="w-full h-full object-cover" />
          </div>

        </div>

        {/* Right Column: Checkout Info Panel */}
        <div className="lg:col-span-5 space-y-6">
          <div className="border-b border-[#FAF5EC] pb-5">
            <div className="flex justify-between items-center">
              <span className="text-xs font-sans font-bold uppercase tracking-wider text-brand-gold">
                {product.category}
              </span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-brand-charcoal tracking-wide mt-2">
              {product.title}
            </h1>
            
            {/* Dynamic Price Display */}
            <div className="mt-4 flex items-baseline space-x-3 flex-wrap gap-y-1">
              <span className="font-sans text-2xl font-bold text-brand-charcoal">
                Rs. {totalUnitPrice.toLocaleString("en-IN")}
              </span>
              {discountPercent > 0 && (
                <>
                  <span className="font-sans text-sm line-through text-gray-400">
                    Rs. {(basePrice + optionsAdjustment).toLocaleString("en-IN")}
                  </span>
                  <span className="bg-red-50 border border-red-100 text-red-650 text-[10px] font-sans font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider animate-pulse">
                    {discountPercent}% OFF
                  </span>
                </>
              )}
              {!activeVariant && product.variants.length > 1 && (
                <span className="ml-2.5 font-sans text-xs text-brand-gold uppercase tracking-wider font-semibold">
                  (select size for exact price)
                </span>
              )}
            </div>
          </div>

          <p className="font-sans text-xs text-gray-500 leading-relaxed uppercase tracking-wider">
            {product.description}
          </p>

          {/* Sizing Section */}
          <div className="space-y-4 pt-2">
            
            {/* Top Size Selector */}
            {topSizes.length > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <label className="block text-[11px] font-sans font-bold uppercase tracking-widest text-brand-charcoal">
                    Top Size
                  </label>
                  <button
                    onClick={() => setShowSizeChart(true)}
                    className="text-[10px] font-sans font-bold uppercase tracking-widest text-brand-gold hover:text-brand-gold-light transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Ruler className="h-3.5 w-3.5" />
                    Size Chart
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {topSizes.map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setSelectedTopSize(sz)}
                      className={`px-4 py-2 border rounded text-xs font-sans tracking-wide transition-all uppercase ${
                        selectedTopSize === sz
                          ? "bg-brand-charcoal border-brand-charcoal text-brand-cream font-bold"
                          : "bg-white border-[#E8DFC8] text-gray-700 hover:border-brand-gold"
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Size Selector (For Sets) */}
            {product.isSet && bottomSizes.length > 0 && (
              <div className="space-y-2">
                <label className="block text-[11px] font-sans font-bold uppercase tracking-widest text-brand-charcoal">
                  Salwar / Bottom Size
                </label>
                <div className="flex flex-wrap gap-2">
                  {bottomSizes.map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setSelectedBottomSize(sz)}
                      className={`px-4 py-2 border rounded text-xs font-sans tracking-wide transition-all uppercase ${
                        selectedBottomSize === sz
                          ? "bg-brand-charcoal border-brand-charcoal text-brand-cream font-bold"
                          : "bg-white border-[#E8DFC8] text-gray-700 hover:border-brand-gold"
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Custom Options / Add-ons (e.g. Dupatta / Inner) */}
          {Object.keys(optionsByName).length > 0 && (
            <div className="space-y-4 border-t border-b border-[#FAF5EC] py-4">
              {Object.entries(optionsByName).map(([optionName, opts]) => (
                <div key={optionName} className="space-y-2">
                  <span className="block text-[11px] font-sans font-bold uppercase tracking-widest text-brand-charcoal">
                    {optionName} Options
                  </span>
                  <div className="flex gap-4">
                    {opts.map((opt) => {
                      const isSelected = !!selectedOptions[opt.id];
                      return (
                        <button
                          key={opt.id}
                          onClick={() => handleOptionToggle(opt.id, optionName)}
                          className={`flex items-center space-x-2 border py-2 px-3.5 rounded text-xs font-sans tracking-wide transition-all cursor-pointer ${
                            isSelected
                              ? "bg-brand-gold/5 border-brand-gold text-brand-gold font-bold shadow-xs"
                              : "bg-white border-[#E8DFC8] text-gray-600 hover:border-brand-gold"
                          }`}
                        >
                          <span className={`h-3.5 w-3.5 rounded-full border flex items-center justify-center ${
                            isSelected ? "border-brand-gold bg-brand-gold" : "border-gray-400 bg-white"
                          }`}>
                            {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                          </span>
                          <span>
                            {opt.optionValue}{" "}
                            {opt.priceAdjustment > 0 && (
                              <span className="font-semibold text-[10px]">
                                (+Rs. {opt.priceAdjustment.toLocaleString("en-IN")})
                              </span>
                            )}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quantity and Actions */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center space-x-4">
              <span className="text-[11px] font-sans font-bold uppercase tracking-widest text-brand-charcoal">
                Quantity
              </span>
              <select
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
                className="bg-white border border-[#E8DFC8] rounded py-1 px-3.5 text-xs font-sans text-brand-charcoal focus:outline-none focus:border-brand-gold cursor-pointer"
              >
                {[1, 2, 3, 4, 5].map((q) => (
                  <option key={q} value={q}>
                    {q}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col sm:flex-row gap-3.5 pt-2">
              {/* Add to Bag Button */}
              <button
                onClick={handleAddToBag}
                disabled={isOutOfStock || (product.variants.some((v) => v.topSize) && !selectedTopSize)}
                className="flex-1 flex justify-center items-center rounded-md bg-brand-charcoal py-3 px-6 text-xs font-sans uppercase font-bold tracking-widest text-brand-cream shadow-md hover:bg-opacity-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <ShoppingBag className="h-4 w-4 mr-2" />
                {isOutOfStock ? "Out of Stock" : cartSuccess ? "Added to Bag!" : "Add to Bag"}
              </button>
              
              {/* WhatsApp tailoring CTA */}
              <a
                href={getWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex justify-center items-center border border-[#A59578] rounded-md bg-white py-3 px-6 text-xs font-sans uppercase font-bold tracking-widest text-brand-gold hover:bg-[#FAF5EC] transition-all"
              >
                <MessageSquare className="h-4 w-4 mr-2 fill-brand-gold text-brand-gold" />
                Custom Order / Stitching
              </a>
            </div>
          </div>

          {/* Accordion Specs */}
          <div className="border-t border-[#FAF5EC] pt-4 space-y-2">
            
            {/* Specs Accordion 1: Details */}
            <div className="border border-[#FAF5EC] rounded bg-[#FAF6F0] overflow-hidden">
              <button
                onClick={() => setActiveAccordion(activeAccordion === "details" ? null : "details")}
                className="w-full flex items-center justify-between px-4 py-3.5 text-left text-xs font-sans font-bold uppercase tracking-wider text-brand-charcoal"
              >
                <span>Product Details & Silhouettes</span>
                {activeAccordion === "details" ? <ChevronUp className="h-4 w-4 text-brand-gold" /> : <ChevronDown className="h-4 w-4 text-[#A59578]" />}
              </button>
              {activeAccordion === "details" && (
                <div className="px-4 pb-4 font-sans text-xs text-stone-600 space-y-2 uppercase tracking-wide border-t border-[#F0E6D2] pt-3 bg-white">
                  {product.fabricDetails && (
                    <p>
                      <strong className="text-brand-charcoal font-semibold">Fabric:</strong> {product.fabricDetails}
                    </p>
                  )}
                  {product.topLength && (
                    <p>
                      <strong className="text-brand-charcoal font-semibold">Top Length:</strong> {product.topLength} inches
                    </p>
                  )}
                  {product.pantLength && (
                    <p>
                      <strong className="text-brand-charcoal font-semibold">Bottom Length:</strong> {product.pantLength} inches
                    </p>
                  )}
                  {product.sleeveLength && (
                    <p>
                      <strong className="text-brand-charcoal font-semibold">Sleeve Length:</strong> {product.sleeveLength} inches
                    </p>
                  )}
                  {product.careInstructions && (
                    <p>
                      <strong className="text-brand-charcoal font-semibold">Care:</strong> {product.careInstructions}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Specs Accordion 2: Delivery */}
            <div className="border border-[#FAF5EC] rounded bg-[#FAF6F0] overflow-hidden">
              <button
                onClick={() => setActiveAccordion(activeAccordion === "delivery" ? null : "delivery")}
                className="w-full flex items-center justify-between px-4 py-3.5 text-left text-xs font-sans font-bold uppercase tracking-wider text-brand-charcoal"
              >
                <span>Shipping & Delivery timeline</span>
                {activeAccordion === "delivery" ? <ChevronUp className="h-4 w-4 text-brand-gold" /> : <ChevronDown className="h-4 w-4 text-[#A59578]" />}
              </button>
              {activeAccordion === "delivery" && (
                <div className="px-4 pb-4 font-sans text-xs text-stone-600 space-y-2 uppercase tracking-wide border-t border-[#F0E6D2] pt-3 bg-white">
                  <p>
                    <strong className="text-brand-charcoal font-semibold">Delivery Time:</strong> {product.deliveryTimeline}
                  </p>
                  <p className="mt-1 font-sans text-[10px] text-gray-500 leading-normal normal-case">
                    *Every item is handcrafted by independent designers and tailoring boutiques. Shipping is absolutely free, nationwide.
                  </p>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>

      {/* Size Chart Modal */}
      {showSizeChart && (() => {
        let customChart: Record<string, { chest: string; waist: string; hip: string }> = {
          S: { chest: "36", waist: "30", hip: "39" },
          M: { chest: "38", waist: "32", hip: "41" },
          L: { chest: "40", waist: "34", hip: "43" },
          XL: { chest: "42", waist: "36", hip: "45" },
        };

        if (product.sizeChartType === "CUSTOM" && product.sizeChartData) {
          try {
            customChart = JSON.parse(product.sizeChartData);
          } catch (e) {
            console.error("Failed to parse custom size chart:", e);
          }
        }

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1C1917]/60 backdrop-blur-xs px-4">
            <div className="bg-brand-cream border border-[#E8DFC8] max-w-xl w-full p-6 sm:p-8 rounded-lg shadow-2xl space-y-6 relative animate-in fade-in zoom-in-95 duration-200">
              <button
                onClick={() => setShowSizeChart(false)}
                className="absolute top-4 right-4 text-brand-charcoal hover:text-brand-gold p-1 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="space-y-1">
                <h2 className="font-serif text-2xl text-brand-charcoal font-semibold lowercase tracking-wide flex items-center gap-2">
                  <Ruler className="h-5 w-5 text-brand-gold" /> size chart
                </h2>
                <p className="font-sans text-[10px] text-gray-500 uppercase tracking-widest">
                  {product.sizeChartType === "IMAGE" 
                    ? "Boutique Sizing Reference Graphic" 
                    : product.sizeChartType === "CUSTOM" 
                    ? "Custom Boutique Sizing Guidelines (Inches)" 
                    : "Standard Boutique Sizing Guidelines (Inches)"}
                </p>
              </div>

              {product.sizeChartType === "IMAGE" && product.sizeChartData ? (
                <div className="border border-[#E8DFC8] rounded-md overflow-hidden bg-brand-cream-dark max-h-[400px] flex items-center justify-center">
                  <img 
                    src={product.sizeChartData} 
                    alt="Product Size Chart Sizing Reference" 
                    className="max-w-full max-h-[400px] object-contain"
                  />
                </div>
              ) : (
                <div className="overflow-x-auto border border-[#E8DFC8] rounded-md">
                  <table className="w-full text-left text-xs font-sans border-collapse">
                    <thead>
                      <tr className="bg-[#FAF6F0] border-b border-[#E8DFC8] text-[#A59578] uppercase tracking-wider text-[9px] font-bold">
                        <th className="p-3">Size</th>
                        <th className="p-3">Chest</th>
                        <th className="p-3">Waist</th>
                        <th className="p-3">Hip</th>
                        <th className="p-3">Top Length</th>
                        {product.isSet && <th className="p-3">Bottom Length</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#FAF5EC] text-brand-charcoal font-medium">
                      {["S", "M", "L", "XL"].map((sz) => {
                        const chestVal = product.sizeChartType === "CUSTOM" ? customChart[sz]?.chest : sz === "S" ? "36" : sz === "M" ? "38" : sz === "L" ? "40" : "42";
                        const waistVal = product.sizeChartType === "CUSTOM" ? customChart[sz]?.waist : sz === "S" ? "30" : sz === "M" ? "32" : sz === "L" ? "34" : "36";
                        const hipVal = product.sizeChartType === "CUSTOM" ? customChart[sz]?.hip : sz === "S" ? "39" : sz === "M" ? "41" : sz === "L" ? "43" : "45";
                        
                        return (
                          <tr key={sz} className="hover:bg-[#FAF6F0]/50 transition-colors">
                            <td className="p-3 font-bold text-brand-gold">{sz}</td>
                            <td className="p-3">{chestVal}&quot;</td>
                            <td className="p-3">{waistVal}&quot;</td>
                            <td className="p-3">{hipVal}&quot;</td>
                            <td className="p-3">{product.topLength ? `${product.topLength}“` : "45“"}</td>
                            {product.isSet && <td className="p-3">{product.pantLength ? `${product.pantLength}“` : "38“"}</td>}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="space-y-1.5 pt-2 border-t border-[#FAF5EC] text-[10px] text-gray-500 font-sans tracking-wide leading-relaxed">
                <p className="font-bold text-[#A59578] uppercase">Custom Sizing Options:</p>
                <p>
                  * Pherans are designed with a relaxed, loose-fit ease (+2 to 3 inches excess on actual chest measurements).
                </p>
                <p>
                  * If you need exact fit customizations (e.g. custom top length, sleeves adjustment, custom bust sizes), please click the <strong className="text-brand-gold uppercase">Custom Order / Stitching</strong> WhatsApp button below to speak directly with our design consultants.
                </p>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
