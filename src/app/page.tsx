import Link from "next/link";
import prisma from "@/lib/prisma";
import HeroCarousel from "@/components/HeroCarousel";
import CollectionCarousel from "@/components/CollectionCarousel";
import BestsellersCarousel from "@/components/BestsellersCarousel";
import { ArrowRight, Star, Truck, Scissors, ShieldCheck, Sparkles } from "lucide-react";

export const revalidate = 0; // Fetch fresh data on page load

export default async function Home() {
  let bestsellers: any[] = [];
  try {
    bestsellers = await prisma.product.findMany({
      where: {
        isBestseller: true,
      },
      include: {
        seller: {
          select: {
            shopName: true,
          },
        },
        variants: {
          select: {
            price: true,
            stock: true,
          },
        },
      },
      take: 8,
    });
  } catch (error) {
    console.error("Error fetching database products:", error);
  }

  // Fallback beautiful products if database is empty
  const hasDbProducts = bestsellers.length > 0;
  const mockProducts = [
    {
      id: "mock-1",
      title: "Aari Embroidered Velvet Pheran Set",
      description: "Stunning hand-crafted Kashmiri Aari embroidery on premium micro-velvet.",
      category: "Pheran Set",
      collection: "Aari Embroidery",
      isBestseller: true,
      tier: "LUXE",
      images: JSON.stringify(["https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80"]),
      seller: { shopName: "Kashmir Heritage" },
      variants: [{ price: 8500, stock: 10 }],
    },
    {
      id: "mock-2",
      title: "Sage Green Summer Linen Coord Set",
      description: "Minimalist linen coord set with custom collar stitching and pants.",
      category: "Kurta",
      collection: "Summer Linen",
      isBestseller: true,
      tier: "INDI",
      images: JSON.stringify(["https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=600&q=80"]),
      seller: { shopName: "Linen Loom" },
      variants: [{ price: 4200, stock: 8 }],
    },
    {
      id: "mock-3",
      title: "Crimson Anarkali Silk Set",
      description: "Exquisite raw silk Anarkali dress set with gold border and organza dupatta.",
      category: "Pheran Set",
      collection: "Luxe Festive",
      isBestseller: true,
      tier: "LUXE",
      images: JSON.stringify(["https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80"]),
      seller: { shopName: "Royal Silks" },
      variants: [{ price: 12500, stock: 4 }],
    },
    {
      id: "mock-4",
      title: "Ivory Cotton-Linen Tunic",
      description: "Comfortable and breathable casual tunic with delicate sleeve embroidery.",
      category: "Kurta",
      collection: "Summer Linen",
      isBestseller: true,
      tier: "INDI",
      images: JSON.stringify(["https://images.unsplash.com/photo-1608748010899-18f300247112?auto=format&fit=crop&w=600&q=80"]),
      seller: { shopName: "Linen Loom" },
      variants: [{ price: 3200, stock: 12 }],
    },
    {
      id: "mock-luxe-3",
      title: "Midnight Blue Velvet Tunic",
      description: "Deep midnight blue premium velvet tunic with gold tilla embroidery on neck.",
      category: "Kurta",
      collection: "Aari Embroidery",
      isBestseller: true,
      tier: "LUXE",
      images: JSON.stringify(["https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=600&q=80"]),
      seller: { shopName: "Kashmir Heritage" },
      variants: [{ price: 7200, stock: 15 }],
    },
    {
      id: "mock-luxe-4",
      title: "Mustard Silk Zari Kurta Set",
      description: "Elegant silk kurta with intricate gold zari embroidery and matching pants.",
      category: "Kurta",
      collection: "Bestsellers",
      isBestseller: true,
      tier: "LUXE",
      images: JSON.stringify(["https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80"]),
      seller: { shopName: "Royal Silks" },
      variants: [{ price: 9500, stock: 6 }],
    },
    {
      id: "mock-luxe-5",
      title: "Pashmina Hand-Embroidered Shawl",
      description: "Authentic pure Pashmina shawl with exquisite hand-needle embroidery.",
      category: "Pheran Set",
      collection: "Bestsellers",
      isBestseller: true,
      tier: "LUXE",
      images: JSON.stringify(["https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80"]),
      seller: { shopName: "Kashmir Heritage" },
      variants: [{ price: 18000, stock: 3 }],
    },
    {
      id: "mock-indi-3",
      title: "Blush Pink Casual Cotton Suit",
      description: "Lightweight breathable cotton straight suit with minimal handloom thread styling.",
      category: "Kurta",
      collection: "Bestsellers",
      isBestseller: true,
      tier: "INDI",
      images: JSON.stringify(["https://images.unsplash.com/photo-1608748010899-18f300247112?auto=format&fit=crop&w=600&q=80"]),
      seller: { shopName: "Linen Loom" },
      variants: [{ price: 3800, stock: 14 }],
    },
    {
      id: "mock-indi-4",
      title: "Indigo Dabu Print Kurta",
      description: "Classic indigo blue hand-block printed Dabu cotton kurta with pockets.",
      category: "Kurta",
      collection: "Bestsellers",
      isBestseller: true,
      tier: "INDI",
      images: JSON.stringify(["https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=600&q=80"]),
      seller: { shopName: "Indie Weaves" },
      variants: [{ price: 2900, stock: 10 }],
    },
    {
      id: "mock-indi-5",
      title: "Rust Orange Linen Salwar Set",
      description: "Vibrant rust colored organic linen set with matching flowy salwar pants.",
      category: "Salwar",
      collection: "Summer Linen",
      isBestseller: true,
      tier: "INDI",
      images: JSON.stringify(["https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80"]),
      seller: { shopName: "Linen Loom" },
      variants: [{ price: 4800, stock: 7 }],
    },
  ];

  const displayProducts = hasDbProducts
    ? bestsellers
    : mockProducts;

  // Dynamic homepage collections
  let collectionsData: any[] = [];
  try {
    const productsWithCollections = await prisma.product.findMany({
      where: {
        collection: {
          not: null,
          notIn: ["", "none", "None", "Other", "other"],
        },
      },
      select: {
        collection: true,
        images: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const collectionsMap = new Map<string, string>();
    productsWithCollections.forEach((prod) => {
      const colName = prod.collection?.trim();
      if (colName && !collectionsMap.has(colName)) {
        let firstImg = "";
        try {
          const imgs = JSON.parse(prod.images);
          if (Array.isArray(imgs) && imgs.length > 0) {
            firstImg = imgs[0];
          }
        } catch (e) {
          if (typeof prod.images === "string" && prod.images.startsWith("http")) {
            firstImg = prod.images;
          }
        }
        collectionsMap.set(
          colName,
          firstImg || "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=600&q=80"
        );
      }
    });

    collectionsData = Array.from(collectionsMap.entries()).map(([name, image]) => ({
      title: name,
      subtitle: "Curated Collection",
      image,
      link: `/shop?collection=${encodeURIComponent(name)}`,
    }));
  } catch (error) {
    console.error("Error loading dynamic collections:", error);
  }

  if (collectionsData.length === 0) {
    collectionsData = [
      {
        title: "Aari Embroidery Luxe",
        subtitle: "Traditional Artistry",
        image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=600&q=80",
        link: "/shop?collection=Aari+Embroidery",
      },
      {
        title: "Festive Couture",
        subtitle: "Handcrafted Luxury",
        image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80",
        link: "/shop?collection=Luxe+Festive",
      },
      {
        title: "Pheran Silhouette Sets",
        subtitle: "Tailored Outfits",
        image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80",
        link: "/shop?category=Pheran+Set",
      },
      {
        title: "Summer Linen Bloom",
        subtitle: "Cool & Breathable",
        image: "https://images.unsplash.com/photo-1608748010899-18f300247112?auto=format&fit=crop&w=600&q=80",
        link: "/shop?collection=Summer+Linen",
      },
      {
        title: "Artisanal Tunics",
        subtitle: "Daily Coordinate Styling",
        image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=600&q=80",
        link: "/shop?category=Kurta",
      },
    ];
  }

  return (
    <div className="bg-brand-cream min-h-screen flex flex-col">
      {/* Premium Hero Section */}
      <HeroCarousel />

      {/* Brand Value Grid */}
      <section className="bg-[#FAF8F5] py-16 border-t border-b border-[#E8DFC8]/40">
        <div className="max-w-7xl mx-auto px-6 sm:px-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 divide-y md:divide-y-0 md:divide-x divide-[#E8DFC8]/50">
            
            {/* Value 1 */}
            <div className="flex flex-col items-center text-center px-4 py-6 md:py-2 group">
              <div className="mb-4 text-brand-gold group-hover:scale-110 transition-transform duration-500">
                <Sparkles className="h-6 w-6 stroke-[1.25]" />
              </div>
              <h3 className="font-serif text-sm tracking-[0.15em] uppercase text-brand-charcoal font-medium">
                Artisanal Weaves
              </h3>
              <p className="font-sans text-[10px] text-stone-500 mt-2.5 uppercase tracking-[0.08em] leading-relaxed max-w-[280px]">
                Handloomed heritage fabrics sourced directly from local Indian weavers.
              </p>
            </div>

            {/* Value 2 */}
            <div className="flex flex-col items-center text-center px-4 py-6 md:py-2 group">
              <div className="mb-4 text-brand-gold group-hover:scale-110 transition-transform duration-500">
                <Scissors className="h-6 w-6 stroke-[1.25]" />
              </div>
              <h3 className="font-serif text-sm tracking-[0.15em] uppercase text-brand-charcoal font-medium">
                Made to Measure
              </h3>
              <p className="font-sans text-[10px] text-stone-500 mt-2.5 uppercase tracking-[0.08em] leading-relaxed max-w-[280px]">
                Stitched exactly to your size measurements for a flawless silhouette.
              </p>
            </div>

            {/* Value 3 */}
            <div className="flex flex-col items-center text-center px-4 py-6 md:py-2 group">
              <div className="mb-4 text-brand-gold group-hover:scale-110 transition-transform duration-500">
                <Star className="h-6 w-6 stroke-[1.25]" />
              </div>
              <h3 className="font-serif text-sm tracking-[0.15em] uppercase text-brand-charcoal font-medium">
                Slow Fashion
              </h3>
              <p className="font-sans text-[10px] text-stone-500 mt-2.5 uppercase tracking-[0.08em] leading-relaxed max-w-[280px]">
                Promoting ethical artisan wages and zero-waste designs.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Featured Collections / Categories */}
      <section className="py-6 overflow-hidden">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-12 lg:px-16 mb-8 sm:mb-6">
          <div className="w-full flex flex-col sm:flex-row justify-between items-center sm:items-end gap-6 sm:gap-4">
            <div className="text-center sm:text-left space-y-2 sm:space-y-1.5">
              <p className="text-[11px] text-brand-gold uppercase tracking-[0.2em] font-sans font-bold">Curated Closets</p>
              <h2 className="font-serif text-3xl sm:text-4xl text-brand-charcoal font-semibold lowercase">
                shop by <span className="font-normal italic text-brand-gold">collection</span>
              </h2>
            </div>
            <Link
              href="/shop"
              className="inline-flex items-center text-xs font-sans font-bold uppercase tracking-widest text-brand-gold hover:text-brand-gold-light transition-colors border-b border-brand-gold/30 pb-0.5 hover:border-brand-gold mt-2 sm:mt-0"
            >
              Shop All Collections
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        <CollectionCarousel collections={collectionsData} />
      </section>

      {/* Dynamic Bestsellers Shelf */}
      <section className="bg-[#FAF6F0] py-10 sm:py-20 border-t border-b border-[#E8DFC8]">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-12 lg:px-16">
          <div className="mb-10 sm:mb-12 w-full flex flex-col sm:flex-row justify-between items-center sm:items-end gap-6 sm:gap-4">
            <div className="text-center sm:text-left space-y-2 sm:space-y-3">
              <p className="text-[11px] text-brand-gold uppercase tracking-widest font-sans font-bold">Highly Coveted</p>
              <h2 className="font-serif text-3xl sm:text-4xl text-brand-charcoal font-semibold lowercase">
                the bestsellers <span className="font-normal italic text-brand-gold">shelf</span>
              </h2>
            </div>
            <div className="flex gap-4 sm:gap-6 items-center flex-wrap justify-center sm:justify-start mt-2 sm:mt-0">
              <Link
                href="/shop?collection=Bestsellers"
                className="inline-flex items-center text-xs font-sans font-bold uppercase tracking-widest text-brand-gold hover:text-brand-gold-light transition-colors border-b border-brand-gold/30 pb-0.5 hover:border-brand-gold"
              >
                Shop Bestsellers
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          <BestsellersCarousel products={displayProducts} />
        </div>
      </section>

      {/* Premium Bespoke / Custom Styling Section */}
      <section className="bg-brand-charcoal text-brand-cream py-12 sm:py-20 lg:py-28 overflow-hidden relative border-t border-stone-850">
        <div className="absolute inset-0 bg-stone-900 opacity-20 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Content Left */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-6 text-left order-2 lg:order-1">
            <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-brand-gold">
              Bespoke Services
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl lg:text-5xl text-white font-medium lowercase leading-tight">
              personal styling <span className="font-normal italic text-brand-gold">&</span> custom tailoring
            </h2>
            <div className="h-0.5 w-12 bg-brand-gold" />
            <p className="font-sans text-[11px] sm:text-xs sm:text-sm text-stone-300 uppercase tracking-widest leading-relaxed max-w-xl">
              At Vamika & Bhargavi, we believe in perfect silhouettes that fit you flawlessly. Enjoy complimentary size customisation, length adjustments, and direct styling consultations with our designers to bring your dream outfit to life.
            </p>
            <div className="pt-2 sm:pt-4 flex flex-col sm:flex-row gap-4">
              <a
                href="https://wa.me/919873959531?text=Hi!%20I%27d%20like%20to%20discuss%20a%20custom%20styling%20request%20with%20Vamika%20%26%20Bhargavi."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center bg-brand-gold text-brand-charcoal px-8 py-3.5 text-xs font-sans font-bold uppercase tracking-widest rounded-md hover:bg-brand-gold-light transition-all shadow-md cursor-pointer"
              >
                Chat with Designer
              </a>
              <Link
                href="/shop"
                className="inline-flex items-center justify-center bg-transparent border border-stone-700 text-stone-300 px-8 py-3.5 text-xs font-sans font-bold uppercase tracking-widest rounded-md hover:bg-stone-850 hover:text-white transition-all cursor-pointer"
              >
                Explore Catalog
              </Link>
            </div>
          </div>

          {/* Image Right */}
          <div className="lg:col-span-5 relative flex justify-center order-1 lg:order-2">
            <div className="relative w-full max-w-[400px] aspect-[4/3] sm:aspect-[4/3] md:aspect-[3/2] lg:aspect-[3/4] border border-stone-800 rounded-md shadow-2xl overflow-hidden bg-stone-900">
              <img
                src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=700&q=80"
                alt="Bespoke clothing styling process"
                className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700 opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/60 to-transparent" />
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
