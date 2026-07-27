import Link from "next/link";
import { ArrowRight, Sparkles, Heart, Shield, Compass } from "lucide-react";

export const revalidate = 0; // Fresh render

export default async function AboutPage() {
  return (
    <div className="bg-brand-cream-dark min-h-screen font-sans selection:bg-brand-gold/20 selection:text-brand-charcoal">
      {/* Hero Section */}
      <section className="py-20 sm:py-32 px-4 text-center max-w-4xl mx-auto space-y-6 animate-fade-in-slide">
        <span className="text-[11px] uppercase tracking-[0.4em] font-sans font-semibold text-brand-gold block mb-2">
          A Mother-Daughter Legacy
        </span>
        <h1 className="font-serif text-4xl sm:text-6xl text-brand-charcoal font-semibold tracking-normal leading-tight">
          About <span className="font-normal italic text-brand-gold">Vamika &Bhargavi</span>
        </h1>
        <div className="flex items-center justify-center gap-4 my-6">
          <div className="w-16 h-px bg-gradient-to-r from-transparent to-brand-gold/60" />
          <Sparkles className="h-4 w-4 text-brand-gold animate-pulse" />
          <div className="w-16 h-px bg-gradient-to-l from-transparent to-brand-gold/60" />
        </div>
        <p className="font-serif text-lg sm:text-xl text-brand-charcoal/80 max-w-3xl mx-auto leading-relaxed italic font-light">
          "Vamika Bhargavi was born from a simple yet meaningful idea—to celebrate the timeless bond between a mother and daughter through fashion."
        </p>
      </section>

      {/* Narrative Section - Premium Storytelling Showcase */}
      <section className="py-24 bg-[#FAF8F5] border-t border-b border-[#F0E6D2] relative overflow-hidden">
        {/* Soft luxury background details */}
        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#C5A880_1px,transparent_1px)] [background-size:24px_24px]" />
        
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          {/* Brand Emblem */}
          <div className="flex justify-center items-center gap-2 mb-6">
            <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-brand-gold" />
            <span className="text-brand-gold text-lg font-serif italic">§</span>
            <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-brand-gold" />
          </div>

          <div className="space-y-4">
            <span className="text-[10px] tracking-[0.35em] text-brand-gold uppercase font-sans font-bold block">
              Our Story
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-brand-charcoal font-medium leading-tight">
              born of <span className="font-normal italic text-brand-gold">love & legacy</span>
            </h2>
          </div>

          <div className="w-16 h-px bg-brand-gold/60 mx-auto my-8" />

          {/* Luxury text panel */}
          <div className="max-w-2xl mx-auto space-y-8 text-stone-700 font-serif text-sm sm:text-base md:text-lg leading-relaxed font-light italic">
            <p className="first-letter:text-3xl first-letter:font-serif first-letter:font-bold first-letter:text-brand-gold first-letter:float-left first-letter:mr-2 first-letter:leading-none">
              Founded by Bhargavi and inspired by her daughter Vamika, our brand is a reflection of love, legacy, and individuality. Every collection is thoughtfully curated to bring together the richness of Indian craftsmanship with a modern, effortless aesthetic.
            </p>
            <p>
              As a mother-daughter brand, our vision extends beyond creating beautiful garments. We aspire to build a label that is cherished across generations—a name associated with authenticity, craftsmanship, and thoughtful design.
            </p>
          </div>

          {/* Decorative tail divider */}
          <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-brand-gold/40 to-transparent mx-auto my-8" />

          <div className="pt-2 flex justify-center">
            <Link
              href="/shop"
              className="group inline-flex items-center text-xs font-bold uppercase tracking-[0.2em] text-brand-gold hover:text-brand-gold-light transition-all duration-300 hover:tracking-[0.25em] border-b border-brand-gold/30 pb-1 hover:border-brand-gold"
            >
              Explore the collections
              <ArrowRight className="ml-2 h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* Immersive Quote Section - Dark Palette for Premium Contrast */}
      <section className="py-24 bg-brand-charcoal text-[#FDFBF7] text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#C5A880_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="max-w-4xl mx-auto px-6 relative z-10 space-y-8">
          <div className="p-3 bg-brand-gold/10 rounded-full text-brand-gold w-fit mx-auto border border-brand-gold/20">
            <Heart className="h-6 w-6 animate-pulse" />
          </div>
          <blockquote className="font-serif text-xl sm:text-3xl text-gray-200 font-light leading-relaxed italic max-w-3xl mx-auto">
            "We believe clothing is more than what you wear—it is a way of expressing your personality, celebrating traditions, and creating memories."
          </blockquote>
          <div className="w-12 h-px bg-brand-gold/50 mx-auto" />
          <p className="font-sans text-xs uppercase tracking-[0.25em] text-brand-gold-light max-w-2xl mx-auto leading-relaxed">
            Whether it’s a festive gathering, an intimate celebration, or an everyday statement, each piece is selected and designed to make you feel confident, graceful, and uniquely yourself.
          </p>
        </div>
      </section>

      {/* Curation & Craftsmanship Section */}
      <section className="py-20 bg-brand-cream border-b border-[#F0E6D2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-12 lg:px-16 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Text side */}
          <div className="space-y-8 text-left order-2 lg:order-1">
            <div className="space-y-3">
              <span className="text-[10px] text-brand-gold uppercase tracking-[0.25em] font-bold">our philosophy</span>
              <h2 className="font-serif text-3xl sm:text-4xl text-brand-charcoal font-semibold tracking-wide lowercase">
                curated with <span className="italic font-normal text-brand-gold">intention</span>
              </h2>
            </div>
            <div className="w-12 h-0.5 bg-brand-gold" />
            <div className="space-y-6 text-gray-600 text-sm sm:text-base leading-relaxed font-light">
              <p>
                At Vamika Bhargavi, we focus on curated fashion that balances timeless elegance with contemporary design. From handpicked fabrics and intricate embroideries to refined silhouettes and meticulous finishing, every detail is chosen with intention.
              </p>
              <p>
                Our collections celebrate the richness of Indian heritage while embracing the requirements of the modern wardrobe. Every single element, from weave selection to custom stitching, undergoes strict refinement.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-6 pt-4">
              <div className="space-y-2">
                <h4 className="font-serif text-base text-brand-gold font-medium">intricate details</h4>
                <p className="text-xs text-gray-500 font-light">Fine embroidery and premium finishing in every thread.</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-serif text-base text-brand-gold font-medium">handpicked fabrics</h4>
                <p className="text-xs text-gray-500 font-light">Sourced with authenticity and respect for regional weavers.</p>
              </div>
            </div>
          </div>

          {/* Image side */}
          <div className="relative aspect-3/4 max-w-lg mx-auto w-full rounded-sm overflow-hidden border border-[#E8DFC8] shadow-md group order-1 lg:order-2">
            <img
              src="/about_embroidery_artisan.png"
              alt="Intricate Hand Embroidery Work"
              className="w-full h-full object-cover transform scale-100 group-hover:scale-102 transition-transform duration-1000 ease-out"
            />
            <div className="absolute inset-0 bg-brand-charcoal/5" />
          </div>
        </div>
      </section>

      {/* Core Pillars / Brand Values */}
      <section className="py-24 bg-brand-cream-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-12 lg:px-16 text-center space-y-16">
          <div className="space-y-3">
            <p className="text-[10px] text-brand-gold uppercase tracking-[0.25em] font-bold">our pillars</p>
            <h2 className="font-serif text-3xl sm:text-4xl text-brand-charcoal font-semibold lowercase">
              the values we <span className="italic font-normal text-brand-gold">cherish</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="bg-brand-cream p-8 rounded-sm border border-[#E8DFC8]/40 space-y-4 text-center hover:shadow-md transition-shadow duration-300">
              <div className="p-3 bg-[#FAF6F0] rounded-full text-brand-gold w-fit mx-auto border border-[#E8DFC8]/40">
                <Heart className="h-5 w-5" />
              </div>
              <h3 className="font-serif text-lg text-brand-charcoal font-medium">Love & Legacy</h3>
              <p className="font-sans text-xs text-gray-500 leading-relaxed font-light">
                Celebrating the timeless mother-daughter bond through silhouettes that span and unite generations.
              </p>
            </div>

            <div className="bg-brand-cream p-8 rounded-sm border border-[#E8DFC8]/40 space-y-4 text-center hover:shadow-md transition-shadow duration-300">
              <div className="p-3 bg-[#FAF6F0] rounded-full text-brand-gold w-fit mx-auto border border-[#E8DFC8]/40">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="font-serif text-lg text-brand-charcoal font-medium">Authentic Craft</h3>
              <p className="font-sans text-xs text-gray-500 leading-relaxed font-light">
                Honoring the depth of Indian craftsmanship with intricate hand-embroidery and local loom techniques.
              </p>
            </div>

            <div className="bg-brand-cream p-8 rounded-sm border border-[#E8DFC8]/40 space-y-4 text-center hover:shadow-md transition-shadow duration-300">
              <div className="p-3 bg-[#FAF6F0] rounded-full text-brand-gold w-fit mx-auto border border-[#E8DFC8]/40">
                <Compass className="h-5 w-5" />
              </div>
              <h3 className="font-serif text-lg text-brand-charcoal font-medium">Modern Aesthetic</h3>
              <p className="font-sans text-xs text-gray-500 leading-relaxed font-light">
                Balancing classic, graceful traditions with a clean, effortless modern finish for ultimate versatility.
              </p>
            </div>

            <div className="bg-brand-cream p-8 rounded-sm border border-[#E8DFC8]/40 space-y-4 text-center hover:shadow-md transition-shadow duration-300">
              <div className="p-3 bg-[#FAF6F0] rounded-full text-brand-gold w-fit mx-auto border border-[#E8DFC8]/40">
                <Shield className="h-5 w-5" />
              </div>
              <h3 className="font-serif text-lg text-brand-charcoal font-medium">Thoughtful Curation</h3>
              <p className="font-sans text-xs text-gray-500 leading-relaxed font-light">
                Carefully handpicked fabrics, tailored fits, and high-quality finishing that makes each piece a treasure.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Welcome / Closing Section */}
      <section className="py-24 bg-brand-cream border-t border-[#F0E6D2] text-center space-y-8">
        <div className="space-y-4 max-w-2xl mx-auto">
          <h2 className="font-serif text-3xl sm:text-5xl text-brand-charcoal font-light lowercase">
            welcome to <span className="font-normal italic text-brand-gold">vamika & bhargavi</span>
          </h2>
          <p className="font-serif text-lg sm:text-xl text-gray-700 italic font-light max-w-xl mx-auto">
            "Curated with love. Crafted with purpose. Designed to become part of your story."
          </p>
        </div>
        <div className="pt-6">
          <Link
            href="/shop"
            className="inline-block bg-brand-gold hover:bg-brand-gold-light text-white text-xs font-bold uppercase tracking-widest py-4 px-10 rounded-sm shadow-md transition-all duration-300 hover:-translate-y-0.5"
          >
            Explore our collections
          </Link>
        </div>
      </section>
    </div>
  );
}

