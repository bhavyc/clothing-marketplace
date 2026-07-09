"use client";

import Link from "next/link";
import { useState } from "react";
import { X, Mail, Phone, Clock, ChevronDown } from "lucide-react";

export default function Footer() {
  const [activeModal, setActiveModal] = useState<"care" | "shipping" | "tailoring" | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <footer className="bg-[#FAF6F0] border-t border-[#E8DFC8] py-8 md:py-14 px-6 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-0 md:gap-10">
        
        {/* Brand Column */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left mb-8 md:mb-0">
          <h3 className="font-serif text-xl font-semibold lowercase tracking-widest text-brand-charcoal flex items-baseline gap-1.5 mb-4">
            vamika <span className="font-serif italic text-brand-gold font-normal">&</span> bhargavi
          </h3>
          <p className="font-sans text-xs text-stone-500 leading-relaxed uppercase tracking-wider mb-5">
            Exquisite handmade apparel, coord sets and traditional silhouettes tailored to perfection.
          </p>
          <div className="flex items-center space-x-2.5">
            <span className="text-[9px] font-sans font-bold uppercase tracking-[0.12em] text-brand-gold border border-brand-gold/30 px-2.5 py-1 rounded-xs bg-white shadow-3xs">
              Razorpay Secure Checkout
            </span>
          </div>
        </div>

        {/* Collections */}
        <div className="border-b border-[#E8DFC8]/40 md:border-none py-5 md:py-0">
          <button 
            type="button"
            onClick={() => toggleSection('collections')}
            className="flex items-center justify-between w-full md:cursor-default"
          >
            <h4 className="font-sans text-[11px] font-bold uppercase tracking-widest text-brand-gold">
              Collections
            </h4>
            <ChevronDown className={`h-4 w-4 text-brand-gold md:hidden transition-transform duration-300 ${expandedSection === 'collections' ? 'rotate-180' : ''}`} />
          </button>
          
          <div className={`overflow-hidden transition-all duration-300 md:max-h-full md:mt-4 ${expandedSection === 'collections' ? 'max-h-40 mt-4' : 'max-h-0'}`}>
            <ul className="space-y-3 font-sans text-xs w-full text-left">
              <li>
                <Link href="/shop?collection=Bestsellers" className="text-stone-600 hover:text-brand-gold transition-colors block">
                  Bestsellers Shelf
                </Link>
              </li>
              <li>
                <Link href="/shop" className="text-stone-600 hover:text-brand-gold transition-colors block">
                  Explore All
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* The Studio Column */}
        <div className="border-b border-[#E8DFC8]/40 md:border-none py-5 md:py-0">
          <button 
            type="button"
            onClick={() => toggleSection('studio')}
            className="flex items-center justify-between w-full md:cursor-default"
          >
            <h4 className="font-sans text-[11px] font-bold uppercase tracking-widest text-brand-gold">
              The Studio
            </h4>
            <ChevronDown className={`h-4 w-4 text-brand-gold md:hidden transition-transform duration-300 ${expandedSection === 'studio' ? 'rotate-180' : ''}`} />
          </button>

          <div className={`overflow-hidden transition-all duration-300 md:max-h-full md:mt-4 ${expandedSection === 'studio' ? 'max-h-48 mt-4' : 'max-h-0'}`}>
            <ul className="space-y-3 font-sans text-xs w-full text-left">
              <li>
                <Link href="/about" className="text-stone-600 hover:text-brand-gold transition-colors block">
                  Our Story
                </Link>
              </li>
              <li>
                <button type="button" onClick={() => setActiveModal("tailoring")} className="text-stone-600 hover:text-brand-gold transition-colors block text-left cursor-pointer font-sans">
                  Custom Tailoring
                </button>
              </li>
              <li>
                <button type="button" onClick={() => setActiveModal("care")} className="text-stone-600 hover:text-brand-gold transition-colors block text-left cursor-pointer font-sans">
                  Care Instructions
                </button>
              </li>
              <li>
                <button type="button" onClick={() => setActiveModal("shipping")} className="text-stone-600 hover:text-brand-gold transition-colors block text-left cursor-pointer font-sans">
                  Shipping & Returns
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Boutique Support Column */}
        <div className="py-5 md:py-0">
          <button 
            type="button"
            onClick={() => toggleSection('support')}
            className="flex items-center justify-between w-full md:cursor-default"
          >
            <h4 className="font-sans text-[11px] font-bold uppercase tracking-widest text-brand-gold">
              Boutique Support
            </h4>
            <ChevronDown className={`h-4 w-4 text-brand-gold md:hidden transition-transform duration-300 ${expandedSection === 'support' ? 'rotate-180' : ''}`} />
          </button>

          <div className={`overflow-hidden transition-all duration-300 md:max-h-full md:mt-4 ${expandedSection === 'support' ? 'max-h-32 mt-4' : 'max-h-0'}`}>
            <div className="space-y-3 text-xs text-stone-600 font-sans w-full text-left">
              <div className="flex items-center justify-start gap-2">
                <Mail className="h-3.5 w-3.5 text-[#A08260] shrink-0" />
                <a href="mailto:care@vamikabhargavi.com" className="hover:text-brand-gold transition-colors">
                  care@vamikabhargavi.com
                </a>
              </div>
              <div className="flex items-center justify-start gap-2">
                <Phone className="h-3.5 w-3.5 text-[#A08260] shrink-0" />
                <span>+91 99999 88888</span>
              </div>
            </div>
          </div>
        </div>

      </div>
      
      <div className="max-w-7xl mx-auto border-t border-[#F0E6D2] mt-12 pt-6 text-center font-sans text-[10px] text-gray-400 uppercase tracking-widest">
        &copy; {new Date().getFullYear()} Vamika & Bhargavi. All Rights Reserved.
      </div>

      {/* Info Modals */}
      {activeModal && (
        <div className="fixed inset-0 bg-[#1C1917]/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 transition-opacity duration-300">
          <div className="bg-[#FDFBF7] border border-[#E8DFC8] max-w-md w-full rounded-sm shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-[#FAF5EC] flex justify-between items-center bg-[#FAF6F0]">
              <h3 className="font-serif text-md font-semibold text-brand-charcoal lowercase tracking-wider">
                {activeModal === "care" && "Fabric Care Instructions"}
                {activeModal === "shipping" && "Shipping & Delivery Policy"}
                {activeModal === "tailoring" && "Custom Sizing & Alterations"}
              </h3>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="text-stone-400 hover:text-brand-charcoal transition-colors p-1 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto font-sans text-xs text-stone-600 space-y-5 leading-relaxed">
              {activeModal === "care" && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-serif text-xs uppercase tracking-wider text-brand-gold font-bold">Velvets & Heavy Silks</h4>
                    <p className="mt-1">Dry clean only. Do not iron directly on velvet or silk fibers; use steam or iron on the reverse side under a protective press cloth.</p>
                  </div>
                  <div>
                    <h4 className="font-serif text-xs uppercase tracking-wider text-brand-gold font-bold">Artisanal Loom Linens & Cottons</h4>
                    <p className="mt-1">Hand wash gently in cold water with mild detergent. Do not wring or tumble dry. Dry flat in shade to preserve colors. Warm iron on reverse.</p>
                  </div>
                  <div>
                    <h4 className="font-serif text-xs uppercase tracking-wider text-brand-gold font-bold">Zardozi & Aari Embroidery</h4>
                    <p className="mt-1">Garments with heavy hand embroidery should always be professionally dry cleaned. Store flat wrapped in muslin cloth to prevent metallic tarnishing.</p>
                  </div>
                </div>
              )}
              {activeModal === "shipping" && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-serif text-xs uppercase tracking-wider text-brand-gold font-bold">Tailoring & Processing Time</h4>
                    <p className="mt-1">Since we specialize in slow fashion, most of our luxury ensembles are custom stitched to order. Tailoring requires 7 to 10 business days before dispatch.</p>
                  </div>
                  <div>
                    <h4 className="font-serif text-xs uppercase tracking-wider text-brand-gold font-bold">Complimentary Shipping</h4>
                    <p className="mt-1">We offer complimentary express shipping across India. Orders are shipped via trusted partners and typically arrive within 3-5 days of dispatch.</p>
                  </div>
                  <div>
                    <h4 className="font-serif text-xs uppercase tracking-wider text-brand-gold font-bold">Returns & Exchanges</h4>
                    <p className="mt-1">As garments are custom tailored to your requirements, we do not support general returns or refunds. We gladly offer one-time size adjustments or alterations if needed.</p>
                  </div>
                </div>
              )}
              {activeModal === "tailoring" && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-serif text-xs uppercase tracking-wider text-brand-gold font-bold">Made-to-Measure Experience</h4>
                    <p className="mt-1">We offer complete custom fitting sizing options for all items. During checkout, you can specify custom height, sleeve length, bust, waist, and hip details.</p>
                  </div>
                  <div>
                    <h4 className="font-serif text-xs uppercase tracking-wider text-brand-gold font-bold">Standard Size Alterations</h4>
                    <p className="mt-1">If you prefer ordering standard size ranges (XS - 3XL), you can still request sleeve length modifications or specific top-to-bottom alterations free of charge.</p>
                  </div>
                  <div>
                    <h4 className="font-serif text-xs uppercase tracking-wider text-brand-gold font-bold">How to alter?</h4>
                    <p className="mt-1">For post-delivery tailoring alterations, reach out to our WhatsApp customer concierge or email us at <strong className="text-brand-charcoal">care@vamikabhargavi.com</strong>. We will arrange collection and alteration.</p>
                  </div>
                </div>
              )}
            </div>
            <div className="px-6 py-4 bg-[#FAF6F0] border-t border-[#FAF5EC] flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="bg-brand-charcoal text-white text-[10px] font-sans font-bold uppercase tracking-widest py-2 px-5 rounded-sm shadow-xs hover:bg-brand-gold transition-colors cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
