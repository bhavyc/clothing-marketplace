import prisma from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
import SortSelector from "@/components/SortSelector";
import Link from "next/link";
import { SlidersHorizontal, ArrowUpDown } from "lucide-react";

export const revalidate = 0; // Dynamic rendering on request

interface SearchParams {
  search?: string;
  category?: string;
  collection?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
  mode?: string;
  page?: string;
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const search = params.search || "";
  const category = params.category || "";
  const collection = params.collection || "";
  let minPrice = params.minPrice ? parseFloat(params.minPrice) : 0;
  if (isNaN(minPrice)) minPrice = 0;
  let maxPrice = params.maxPrice ? parseFloat(params.maxPrice) : 999999;
  if (isNaN(maxPrice)) maxPrice = 999999;
  const sort = params.sort || "newest";
  const mode = params.mode === "INDI" ? "INDI" : "LUXE";
  const page = params.page || "1";

  let dbProducts: any[] = [];
  let categories: string[] = [];
  let collections: string[] = [];

  try {
    // 1. Fetch filter facets from DB filtered by mode
    const allProducts = await prisma.product.findMany({
      where: { tier: mode },
      select: { category: true, collection: true },
    });
    
    categories = Array.from(new Set(allProducts.map((p) => p.category).filter(Boolean)));
    collections = Array.from(new Set(allProducts.map((p) => p.collection).filter(Boolean))) as string[];

    // 2. Build Prisma Query filters
    const whereClause: any = {
      tier: mode,
    };

    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { category: { contains: search, mode: "insensitive" } },
      ];
    }

    if (category) {
      whereClause.category = category;
    }

    if (collection) {
      if (collection === "Bestsellers") {
        whereClause.isBestseller = true;
      } else if (collection === "Luxe Festive") {
        whereClause.collection = { in: ["Luxe Festive", "Sale"] };
      } else if (collection === "Indi Casuals") {
        whereClause.collection = { in: ["Indi Casuals", "Summer Linen"] };
      } else {
        whereClause.collection = collection;
      }
    }

    // Since variants prices are nested, we can filter them in JavaScript or database
    dbProducts = await prisma.product.findMany({
      where: whereClause,
      include: {
        seller: {
          select: { shopName: true },
        },
        variants: {
          select: { price: true, stock: true },
        },
      },
    });

    // Filter by price range locally to handle dynamic size variants easily
    dbProducts = dbProducts.filter((product) => {
      const prices = product.variants.map((v: any) => v.price);
      if (prices.length === 0) return false;
      const startingPrice = Math.min(...prices);
      return startingPrice >= minPrice && startingPrice <= maxPrice;
    });

    // Apply sorting
    if (sort === "price-asc") {
      dbProducts.sort((a, b) => {
        const aMin = Math.min(...a.variants.map((v: any) => v.price));
        const bMin = Math.min(...b.variants.map((v: any) => v.price));
        return aMin - bMin;
      });
    } else if (sort === "price-desc") {
      dbProducts.sort((a, b) => {
        const aMin = Math.min(...a.variants.map((v: any) => v.price));
        const bMin = Math.min(...b.variants.map((v: any) => v.price));
        return bMin - aMin;
      });
    } else {
      // default newest
      dbProducts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
  } catch (error) {
    console.error("Prisma error fetching shop products:", error);
  }

  // Curated Fallbacks if database has no products yet
  const hasDbProducts = dbProducts.length > 0;
  
  if (categories.length === 0) {
    categories = mode === "LUXE" ? ["Pheran Set", "Salwar"] : ["Kurta", "Salwar"];
  }
  if (collections.length === 0) {
    collections = mode === "LUXE" ? ["Aari Embroidery", "Luxe Festive"] : ["Summer Linen", "Bestsellers"];
  }

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
      createdAt: new Date(),
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
      createdAt: new Date(),
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
      createdAt: new Date(),
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
      createdAt: new Date(),
    },
  ];

  // If no DB products are matched and user has NO filter overrides, show mock products.
  // If user has filters and nothing is matched, show zero results.
  const hasFiltersApplied = search || category || collection || minPrice > 0 || maxPrice < 999999;
  const productsToDisplay = hasDbProducts 
    ? dbProducts 
    : (hasFiltersApplied ? [] : mockProducts.filter((p) => p.tier === mode));

  const ITEMS_PER_PAGE = 6;
  const parsedPage = parseInt(page);
  const currentPage = isNaN(parsedPage) ? 1 : Math.max(1, parsedPage);
  const totalItems = productsToDisplay.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const paginatedProducts = productsToDisplay.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Helper to build URL with query params
  const getFilterUrl = (newParams: Partial<SearchParams>) => {
    const nextParams = {
      search,
      category,
      collection,
      minPrice: minPrice > 0 ? minPrice.toString() : "",
      maxPrice: maxPrice < 999999 ? maxPrice.toString() : "",
      sort,
      mode,
      page: "1", // reset page to 1 by default on other filter updates
      ...newParams,
    };

    const searchStr = new URLSearchParams(
      Object.entries(nextParams).filter(([_, val]) => val !== "") as [string, string][]
    ).toString();
    return `/shop?${searchStr}`;
  };

  return (
    <div className="bg-brand-cream min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="text-left mb-10 border-b border-[#FAF5EC] pb-6">
          <h1 className="font-serif text-4xl text-brand-charcoal font-semibold lowercase tracking-wide">
            the <span className="font-normal italic text-brand-gold">catalog</span>
          </h1>
          <p className="font-sans text-[11px] text-gray-500 uppercase tracking-widest mt-1">
            {productsToDisplay.length} exquisite silhouette{productsToDisplay.length === 1 ? "" : "s"} found
          </p>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Collapsible Mobile Filters */}
          <div className="lg:hidden col-span-1">
            <details className="group bg-[#FAF6F0] rounded-md border border-[#E8DFC8] overflow-hidden">
              <summary className="flex items-center justify-between p-4 cursor-pointer font-sans text-xs font-bold uppercase tracking-wider text-brand-charcoal select-none">
                <span className="flex items-center">
                  <SlidersHorizontal className="h-4 w-4 mr-2 text-brand-gold" />
                  Filter Catalog
                </span>
                <span className="text-brand-gold group-open:hidden font-sans font-bold">+ Expand</span>
                <span className="text-brand-gold hidden group-open:inline font-sans font-bold">- Collapse</span>
              </summary>
              <div className="p-6 pt-2 space-y-6 border-t border-[#FAF5EC]">
                {/* Clear All on mobile if filters are active */}
                {hasFiltersApplied && (
                  <div className="flex justify-end border-b border-[#FAF5EC] pb-3">
                    <Link
                      href={`/shop?mode=${mode}`}
                      className="font-sans text-[10px] uppercase tracking-widest text-brand-gold font-semibold hover:text-brand-gold-light"
                    >
                      Clear All Filters
                    </Link>
                  </div>
                )}

                {/* Keyword Search */}
                <div className="space-y-2">
                  <h3 className="font-sans text-[10px] font-bold uppercase tracking-wider text-brand-charcoal">
                    Search Keyword
                  </h3>
                  <form action="/shop" method="GET" className="relative">
                    <input
                      type="text"
                      name="search"
                      placeholder="Type keyword..."
                      defaultValue={search}
                      className="w-full bg-white border border-[#E8DFC8] rounded-md py-1.5 px-3 text-xs text-brand-charcoal placeholder:text-gray-400 focus:outline-none focus:border-brand-gold font-sans"
                    />
                    <input type="hidden" name="mode" value={mode} />
                  </form>
                </div>

                {/* Categories */}
                <div className="space-y-2.5">
                  <h3 className="font-sans text-[10px] font-bold uppercase tracking-wider text-brand-charcoal">
                    Category
                  </h3>
                  <div className="flex flex-col space-y-1.5">
                    <Link
                      href={getFilterUrl({ category: "" })}
                      className={`text-xs font-sans uppercase tracking-wider transition-colors ${
                        !category ? "text-brand-gold font-bold" : "text-gray-600 hover:text-brand-charcoal"
                      }`}
                    >
                      All Categories
                    </Link>
                    {categories.map((cat) => (
                      <Link
                        key={cat}
                        href={getFilterUrl({ category: cat })}
                        className={`text-xs font-sans uppercase tracking-wider transition-colors ${
                          category === cat ? "text-brand-gold font-bold" : "text-gray-600 hover:text-brand-charcoal"
                        }`}
                      >
                        {cat}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Collections */}
                <div className="space-y-2.5">
                  <h3 className="font-sans text-[10px] font-bold uppercase tracking-wider text-brand-charcoal">
                    Collections
                  </h3>
                  <div className="flex flex-col space-y-1.5">
                    <Link
                      href={getFilterUrl({ collection: "" })}
                      className={`text-xs font-sans uppercase tracking-wider transition-colors ${
                        !collection ? "text-brand-gold font-bold" : "text-gray-600 hover:text-brand-charcoal"
                      }`}
                    >
                      All Collections
                    </Link>
                    {collections.map((col) => (
                      <Link
                        key={col}
                        href={getFilterUrl({ collection: col })}
                        className={`text-xs font-sans uppercase tracking-wider transition-colors ${
                          collection === col ? "text-brand-gold font-bold" : "text-gray-600 hover:text-brand-charcoal"
                        }`}
                      >
                        {col}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Price Thresholds */}
                <div className="space-y-2.5">
                  <h3 className="font-sans text-[10px] font-bold uppercase tracking-wider text-brand-charcoal">
                    Starting Price
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href={getFilterUrl({ maxPrice: "5000" })}
                      className="px-2 py-1.5 bg-white border border-[#E8DFC8] rounded text-[10px] font-sans font-medium text-center hover:border-brand-gold hover:text-brand-gold text-brand-charcoal transition-colors block"
                    >
                      Under Rs. 5K
                    </Link>
                    <Link
                      href={getFilterUrl({ minPrice: "5000", maxPrice: "10000" })}
                      className="px-2 py-1.5 bg-white border border-[#E8DFC8] rounded text-[10px] font-sans font-medium text-center hover:border-brand-gold hover:text-brand-gold text-brand-charcoal transition-colors block"
                    >
                      Rs. 5K - 10K
                    </Link>
                    <Link
                      href={getFilterUrl({ minPrice: "10000" })}
                      className="px-2 py-1.5 bg-white border border-[#E8DFC8] rounded text-[10px] font-sans font-medium text-center hover:border-brand-gold hover:text-brand-gold text-brand-charcoal transition-colors block"
                    >
                      Above Rs. 10K
                    </Link>
                    <Link
                      href={getFilterUrl({ minPrice: "", maxPrice: "" })}
                      className="px-2 py-1.5 bg-white border border-[#E8DFC8] rounded text-[10px] font-sans font-medium text-center hover:border-brand-gold hover:text-brand-gold text-brand-charcoal transition-colors block"
                    >
                      Any Price
                    </Link>
                  </div>
                </div>
              </div>
            </details>
          </div>

          {/* Filter Sidebar (Desktop) */}
          <aside className="hidden lg:block lg:col-span-3 space-y-8 bg-[#FAF6F0] p-6 rounded-md border border-[#E8DFC8]">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8DFC8]">
              <h2 className="font-sans text-xs font-bold uppercase tracking-wider text-brand-charcoal flex items-center">
                <SlidersHorizontal className="h-4 w-4 mr-2 text-brand-gold" />
                Filters
              </h2>
              {hasFiltersApplied && (
                <Link
                  href={`/shop?mode=${mode}`}
                  className="font-sans text-[10px] uppercase tracking-widest text-brand-gold font-semibold hover:text-brand-gold-light"
                >
                  Clear All
                </Link>
              )}
            </div>

            {/* Keyword Search */}
            <div className="space-y-2">
              <h3 className="font-sans text-[10px] font-bold uppercase tracking-wider text-brand-charcoal">
                Search Keyword
              </h3>
              <form action="/shop" method="GET" className="relative">
                <input
                  type="text"
                  name="search"
                  placeholder="Type keyword..."
                  defaultValue={search}
                  className="w-full bg-white border border-[#E8DFC8] rounded-md py-1.5 px-3 text-xs text-brand-charcoal placeholder:text-gray-400 focus:outline-none focus:border-brand-gold font-sans"
                />
                <input type="hidden" name="mode" value={mode} />
              </form>
            </div>

            {/* Categories */}
            <div className="space-y-2.5">
              <h3 className="font-sans text-[10px] font-bold uppercase tracking-wider text-brand-charcoal">
                Category
              </h3>
              <div className="flex flex-col space-y-1.5">
                <Link
                  href={getFilterUrl({ category: "" })}
                  className={`text-xs font-sans uppercase tracking-wider transition-colors ${
                    !category ? "text-brand-gold font-bold" : "text-gray-600 hover:text-brand-charcoal"
                  }`}
                >
                  All Categories
                </Link>
                {categories.map((cat) => (
                  <Link
                    key={cat}
                    href={getFilterUrl({ category: cat })}
                    className={`text-xs font-sans uppercase tracking-wider transition-colors ${
                      category === cat ? "text-brand-gold font-bold" : "text-gray-600 hover:text-brand-charcoal"
                    }`}
                  >
                    {cat}
                  </Link>
                ))}
              </div>
            </div>

            {/* Collections */}
            <div className="space-y-2.5">
              <h3 className="font-sans text-[10px] font-bold uppercase tracking-wider text-brand-charcoal">
                Collections
              </h3>
              <div className="flex flex-col space-y-1.5">
                <Link
                  href={getFilterUrl({ collection: "" })}
                  className={`text-xs font-sans uppercase tracking-wider transition-colors ${
                    !collection ? "text-brand-gold font-bold" : "text-gray-600 hover:text-brand-charcoal"
                  }`}
                >
                  All Collections
                </Link>
                {collections.map((col) => (
                  <Link
                    key={col}
                    href={getFilterUrl({ collection: col })}
                    className={`text-xs font-sans uppercase tracking-wider transition-colors ${
                      collection === col ? "text-brand-gold font-bold" : "text-gray-600 hover:text-brand-charcoal"
                    }`}
                  >
                    {col}
                  </Link>
                ))}
              </div>
            </div>

            {/* Price Thresholds */}
            <div className="space-y-2.5">
              <h3 className="font-sans text-[10px] font-bold uppercase tracking-wider text-brand-charcoal">
                Starting Price
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href={getFilterUrl({ maxPrice: "5000" })}
                  className="px-2 py-1.5 bg-white border border-[#E8DFC8] rounded text-[10px] font-sans font-medium text-center hover:border-brand-gold hover:text-brand-gold text-brand-charcoal transition-colors block"
                >
                  Under Rs. 5K
                </Link>
                <Link
                  href={getFilterUrl({ minPrice: "5000", maxPrice: "10000" })}
                  className="px-2 py-1.5 bg-white border border-[#E8DFC8] rounded text-[10px] font-sans font-medium text-center hover:border-brand-gold hover:text-brand-gold text-brand-charcoal transition-colors block"
                >
                  Rs. 5K - 10K
                </Link>
                <Link
                  href={getFilterUrl({ minPrice: "10000" })}
                  className="px-2 py-1.5 bg-white border border-[#E8DFC8] rounded text-[10px] font-sans font-medium text-center hover:border-brand-gold hover:text-brand-gold text-brand-charcoal transition-colors block"
                >
                  Above Rs. 10K
                </Link>
                <Link
                  href={getFilterUrl({ minPrice: "", maxPrice: "" })}
                  className="px-2 py-1.5 bg-white border border-[#E8DFC8] rounded text-[10px] font-sans font-medium text-center hover:border-brand-gold hover:text-brand-gold text-brand-charcoal transition-colors block"
                >
                  Any Price
                </Link>
              </div>
            </div>
          </aside>

          {/* Product Grid Content */}
          <main className="lg:col-span-9 space-y-6">
            
            {/* Sort Controls */}
            <div className="flex justify-between items-center bg-[#FAF6F0] p-4 rounded-md border border-[#E8DFC8]">
              <div className="text-xs text-gray-500 font-sans tracking-wide">
                Showing <strong className="text-brand-charcoal">{productsToDisplay.length}</strong> results
              </div>
              <div className="flex items-center space-x-2">
                <ArrowUpDown className="h-3.5 w-3.5 text-brand-gold" />
                <span className="text-xs font-sans text-brand-charcoal uppercase tracking-wider font-semibold">Sort:</span>
                <SortSelector defaultValue={sort} />
              </div>
            </div>

            {/* Catalog Grid */}
            {productsToDisplay.length === 0 ? (
              <div className="text-center py-20 bg-white border border-[#FAF5EC] rounded-md">
                <p className="font-serif text-lg text-brand-charcoal">No items match your filters.</p>
                <p className="font-sans text-xs text-gray-400 uppercase tracking-widest mt-1">Try resetting search keywords or categories.</p>
                <Link
                  href={`/shop?mode=${mode}`}
                  className="mt-6 inline-flex items-center bg-brand-charcoal text-brand-cream px-6 py-2.5 text-xs font-sans uppercase font-bold tracking-widest rounded-md hover:bg-opacity-95 transition-all cursor-pointer"
                >
                  Reset All Filters
                </Link>
              </div>
            ) : (
              <div className="space-y-10">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 lg:gap-8">
                  {paginatedProducts.map((p) => (
                    <ProductCard key={p.id} product={p as any} />
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center space-x-2 border-t border-[#FAF5EC] pt-8">
                    <Link
                      href={getFilterUrl({ page: String(currentPage - 1) })}
                      className={`px-4 py-2 border border-[#E8DFC8] rounded-md text-[10px] font-sans font-bold uppercase tracking-widest transition-all ${
                        currentPage <= 1
                          ? "pointer-events-none opacity-40 bg-stone-100 text-gray-400"
                          : "bg-white text-brand-charcoal hover:border-brand-gold hover:text-brand-gold shadow-xs"
                      }`}
                    >
                      Prev
                    </Link>
                    <span className="text-[10px] font-sans text-gray-500 font-bold uppercase tracking-widest px-4">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Link
                      href={getFilterUrl({ page: String(currentPage + 1) })}
                      className={`px-4 py-2 border border-[#E8DFC8] rounded-md text-[10px] font-sans font-bold uppercase tracking-widest transition-all ${
                        currentPage >= totalPages
                          ? "pointer-events-none opacity-40 bg-stone-100 text-gray-400"
                          : "bg-white text-brand-charcoal hover:border-brand-gold hover:text-brand-gold shadow-xs"
                      }`}
                    >
                      Next
                    </Link>
                  </div>
                )}
              </div>
            )}
          </main>

        </div>
      </div>
    </div>
  );
}
