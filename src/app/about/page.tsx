import Link from "next/link";
import { ArrowRight, Sparkles, Heart, Shield, Compass } from "lucide-react";

export const revalidate = 0; // Fresh render

export default async function AboutPage() {
  return (
    <div className="bg-brand-cream-dark min-h-screen">
      {/* Hero Section */}
      <section className="py-14 sm:py-24 px-4 text-center max-w-4xl mx-auto space-y-6">
        <p className="text-xs uppercase tracking-[0.25em] font-sans font-bold text-brand-gold animate-pulse">
          A Legacy of Luxury & Slow Fashion
        </p>
        <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-brand-charcoal font-semibold lowercase tracking-tight leading-none">
          the story of <span className="font-normal italic text-brand-gold">vamika & bhargavi</span>
        </h1>
        <div className="w-16 h-0.5 bg-brand-gold mx-auto my-4" />
        <p className="font-sans text-xs sm:text-sm text-gray-500 max-w-2xl mx-auto leading-relaxed uppercase tracking-wider font-light">
          A sanctuary where traditional Indian heritage meets modern, tailored silhouettes. Built on slow-fashion principles, exquisite handloom fabrics, and uncompromising design details.
        </p>
      </section>

      {/* Narrative Section - Two Columns */}
      <section className="py-16 bg-[#FDFBF7] border-t border-b border-[#F0E6D2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-12 lg:px-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Image side */}
          <div className="relative aspect-3/4 max-w-lg mx-auto w-full rounded-md overflow-hidden border border-[#E8DFC8] shadow-lg group">
            <img
              src="/about_boutique_interior.png"
              alt="Vamika & Bhargavi Showroom Interior"
              className="w-full h-full object-cover transform scale-100 group-hover:scale-103 transition-transform duration-1000 ease-out"
            />
            <div className="absolute inset-0 bg-brand-charcoal/10" />
          </div>

          {/* Text side */}
          <div className="space-y-6 text-left">
            <h2 className="font-serif text-2.5xl sm:text-4xl text-brand-charcoal font-semibold tracking-wide lowercase">
              our boutique <span className="italic font-normal text-brand-gold">origins</span>
            </h2>
            <div className="w-12 h-0.5 bg-brand-gold" />
            <p className="font-sans text-sm text-gray-600 leading-relaxed">
              Founded by two sisters with a shared passion for Indian weaves and custom tailoring, Vamika & Bhargavi is a love letter to the country's rich textile heritage. What started as a small design studio tailoring custom outfits for close clients has blossomed into a premium fashion house.
            </p>
            <p className="font-sans text-sm text-gray-600 leading-relaxed">
              We curate exquisite collections for our patrons. From high-end, hand-embroidered velvet pheran sets, pure raw silks, and festive couture, to artisanal tunics and minimalist silhouettes suited for daily comfort in breathable organic linens.
            </p>
            <p className="font-sans text-sm text-gray-600 leading-relaxed font-medium italic">
              "We believe clothing should not just be worn; it should be felt. Every thread, every stitch of Aari embroidery is a testament to the artisan's soul."
            </p>
            <div className="pt-4">
              <Link
                href="/shop"
                className="inline-flex items-center text-xs font-sans font-bold uppercase tracking-widest text-brand-gold hover:text-brand-gold-light transition-colors border-b border-brand-gold/30 pb-1 hover:border-brand-gold"
              >
                Browse Our Collections
                <ArrowRight className="ml-2 h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Craftsmanship Section - Dark Palette for Premium Contrast */}
      <section className="py-20 bg-brand-charcoal text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-12 lg:px-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text side */}
          <div className="space-y-6 text-left order-2 lg:order-1">
            <p className="text-[10px] text-brand-gold uppercase tracking-[0.25em] font-sans font-bold">
              The Art of Slow Fashion
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#FDFBF7] font-semibold tracking-wide lowercase">
              exquisite artisan <span className="italic font-normal text-brand-gold">craftsmanship</span>
            </h2>
            <div className="w-12 h-0.5 bg-brand-gold" />
            <p className="font-sans text-sm text-gray-300 leading-relaxed">
              Every garment in our catalog is crafted with deliberate care. We employ master craftspeople who have spent decades perfecting traditional Kashmiri Aari embroidery, zardozi needlework, and custom-collared linen tailoring.
            </p>
            <p className="font-sans text-sm text-gray-300 leading-relaxed">
              Unlike mass-produced fast fashion, we work with micro-batches. This ensures that every piece meets our premium guarantee, showing respect to our artisans, our environment, and our buyers.
            </p>
            
            <div className="grid grid-cols-2 gap-6 pt-4">
              <div className="space-y-1">
                <h4 className="font-serif text-lg text-brand-gold font-medium">100% Authentic</h4>
                <p className="text-xs text-gray-400">Pure raw silks, micro-velvets & organic loom linens.</p>
              </div>
              <div className="space-y-1">
                <h4 className="font-serif text-lg text-brand-gold font-medium">Hand Embroidered</h4>
                <p className="text-xs text-gray-400">Delivered by native master craftsmen.</p>
              </div>
            </div>
          </div>

          {/* Image side */}
          <div className="relative aspect-3/4 max-w-lg mx-auto w-full rounded-md overflow-hidden border border-[#A08260]/30 shadow-2xl group order-1 lg:order-2">
            <img
              src="/about_embroidery_artisan.png"
              alt="Artisan doing embroidery work"
              className="w-full h-full object-cover transform scale-100 group-hover:scale-103 transition-transform duration-1000 ease-out"
            />
            <div className="absolute inset-0 bg-brand-charcoal/20" />
          </div>
        </div>
      </section>

      {/* Values Grid / Pillars */}
      <section className="py-20 bg-brand-cream-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-12 lg:px-16 text-center space-y-12">
          <div className="space-y-2">
            <p className="text-[10px] text-brand-gold uppercase tracking-[0.2em] font-sans font-bold">What We Stand For</p>
            <h2 className="font-serif text-3xl sm:text-4xl text-brand-charcoal font-semibold lowercase">
              our core boutique <span className="italic font-normal text-brand-gold">pillars</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="bg-[#FDFBF7] p-8 rounded-lg border border-[#E8DFC8]/40 space-y-4 text-center hover:shadow-md transition-shadow duration-300">
              <div className="p-3 bg-[#FAF6F0] rounded-full text-brand-gold w-fit mx-auto border border-[#E8DFC8]">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="font-serif text-lg text-brand-charcoal font-medium">Artisanal Roots</h3>
              <p className="font-sans text-xs text-gray-500 leading-relaxed">
                Directly supporting independent weavers and local craft families, ensuring fair trade and preservation of regional heritage.
              </p>
            </div>

            <div className="bg-[#FDFBF7] p-8 rounded-lg border border-[#E8DFC8]/40 space-y-4 text-center hover:shadow-md transition-shadow duration-300">
              <div className="p-3 bg-[#FAF6F0] rounded-full text-brand-gold w-fit mx-auto border border-[#E8DFC8]">
                <Heart className="h-6 w-6" />
              </div>
              <h3 className="font-serif text-lg text-brand-charcoal font-medium">Slow-Fashion Philosophy</h3>
              <p className="font-sans text-xs text-gray-500 leading-relaxed">
                Conscious small-batch production, reducing landfill waste and celebrating durability and timeless, seasonless designs.
              </p>
            </div>

            <div className="bg-[#FDFBF7] p-8 rounded-lg border border-[#E8DFC8]/40 space-y-4 text-center hover:shadow-md transition-shadow duration-300">
              <div className="p-3 bg-[#FAF6F0] rounded-full text-brand-gold w-fit mx-auto border border-[#E8DFC8]">
                <Compass className="h-6 w-6" />
              </div>
              <h3 className="font-serif text-lg text-brand-charcoal font-medium">Custom Precision</h3>
              <p className="font-sans text-xs text-gray-500 leading-relaxed">
                We believe in body inclusivity. Many of our garments offer custom fit tailoring coordinates to match your unique dimensions perfectly.
              </p>
            </div>

            <div className="bg-[#FDFBF7] p-8 rounded-lg border border-[#E8DFC8]/40 space-y-4 text-center hover:shadow-md transition-shadow duration-300">
              <div className="p-3 bg-[#FAF6F0] rounded-full text-brand-gold w-fit mx-auto border border-[#E8DFC8]">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="font-serif text-lg text-brand-charcoal font-medium">Premium Guarantee</h3>
              <p className="font-sans text-xs text-gray-500 leading-relaxed">
                Rigorous fabric sourcing checks. If it is not the highest grade linen, cotton, or raw silk, it does not leave our boutique shelves.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-brand-cream border-t border-[#F0E6D2] text-center space-y-6">
        <h2 className="font-serif text-3xl sm:text-5xl text-brand-charcoal font-semibold lowercase">
          experience <span className="font-normal italic text-brand-gold">thoughtful luxury</span>
        </h2>
        <p className="font-sans text-xs sm:text-sm text-gray-500 uppercase tracking-widest max-w-md mx-auto">
          Explore our handpicked curation tailored to your lifestyle.
        </p>
        <div className="pt-4">
          <Link
            href="/shop"
            className="inline-block bg-brand-gold hover:bg-brand-gold-light text-white text-xs font-sans font-bold uppercase tracking-widest py-4 px-8 rounded-sm shadow-md transition-all duration-300 hover:-translate-y-0.5"
          >
            Shop The Catalog
          </Link>
        </div>
      </section>
    </div>
  );
}
