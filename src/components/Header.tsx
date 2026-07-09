"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Search, User, ShoppingBag, LogOut, ChevronDown, Menu, X, Wallet } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function Header() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const displayUserLabel = (() => {
    if (!session?.user) return "";
    const phone = (session.user as any).phone;
    const email = session.user.email;
    if (email && email.startsWith("user-") && email.endsWith("@boutique.com") && phone) {
      return phone;
    }
    return email || "";
  })();
  const { cartCount, isMounted, isCartOpen, setIsCartOpen } = useCart();
  const [walletBalance, setWalletBalance] = useState<number>(0);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Dynamic navigation links
  const [categories, setCategories] = useState<string[]>([]);
  const [collections, setCollections] = useState<string[]>([]);

  useEffect(() => {
    const fetchNavigation = async () => {
      try {
        const res = await fetch("/api/navigation");
        const data = await res.json();
        if (res.ok) {
          setCategories(data.categories || []);
          setCollections(data.collections || []);
        }
      } catch (e) {
        console.error("Error loading header navigation:", e);
      }
    };
    fetchNavigation();
  }, []);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "CUSTOMER") {
      const fetchWallet = async () => {
        try {
          const res = await fetch("/api/user/wallet");
          const data = await res.json();
          if (res.ok) {
            setWalletBalance(data.walletBalance || 0);
          }
        } catch (e) {
          console.error("Error fetching wallet balance:", e);
        }
      };
      fetchWallet();
    }
  }, [status, session]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-brand-cream/80 backdrop-blur-md border-b border-[#FAF5EC]/60 shadow-xs transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col">
          
          {/* Top Row: Switcher (left), Logo (center), Actions/Utilities (right) */}
          <div className="flex items-center justify-between h-18 relative">
            
            {/* Mobile Menu Icon (Left on Mobile) */}
            <div className="relative z-20 flex items-center md:hidden">
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-brand-charcoal p-2 focus:outline-none cursor-pointer"
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>

            {/* Left Balance Spacer */}
            <div className="hidden md:block z-20 w-32" />

            {/* Center: Brand Logo (Always Centered) - Pointer events disabled on container, enabled on text to avoid overlay click blocking */}
            <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center pointer-events-none z-10">
              <Link href="/" className="pointer-events-auto font-serif text-[15px] md:text-3xl font-semibold tracking-wider md:tracking-widest text-brand-charcoal lowercase flex flex-col md:flex-row items-center md:items-baseline gap-0.5 md:gap-2 whitespace-nowrap">
                <span className="flex items-baseline gap-1 md:gap-2">
                  vamika <span className="font-serif italic text-brand-gold font-normal">&</span> bhargavi
                </span>
              </Link>
            </div>

            {/* Right: Search, Profile, and Cart */}
            <div className="relative z-20 flex items-center space-x-2.5 md:space-x-5">
              
              {/* Search Toggle */}
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="text-brand-charcoal hover:text-brand-gold transition-colors focus:outline-none p-1 cursor-pointer flex items-center"
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </button>

              {/* Profile Menu Dropdown */}
              <div className="relative hidden md:block">
                {status === "authenticated" ? (
                  <>
                    <button
                      onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                      className="text-brand-charcoal hover:text-brand-gold transition-colors focus:outline-none p-1 flex items-center cursor-pointer"
                    >
                      <User className="h-5 w-5" />
                    </button>
                    {isProfileMenuOpen && (
                      <div className="absolute right-0 mt-3 w-56 bg-[#FDFBF7] border border-[#F0E6D2] rounded shadow-lg z-50">
                        <div className="px-4 py-3 border-b border-[#FAF5EC]">
                          <p className="text-[10px] font-sans font-bold uppercase tracking-wider text-brand-gold">
                            Role: {session.user?.role}
                          </p>
                          <p className="text-xs font-semibold text-brand-charcoal truncate mt-0.5">{displayUserLabel}</p>
                          {session.user?.role === "CUSTOMER" && (
                            <p className="text-[11px] font-bold text-emerald-800 mt-2 flex items-center bg-emerald-50 px-2.5 py-1 rounded border border-emerald-100 w-fit">
                              <Wallet className="h-3.5 w-3.5 mr-1 text-emerald-700" /> Rs. {walletBalance.toLocaleString()}
                            </p>
                          )}
                        </div>
                        <div className="py-1">
                          {session.user?.role === "ADMIN" && (
                            <Link
                              href="/admin"
                              onClick={() => setIsProfileMenuOpen(false)}
                              className="block px-4 py-2 text-xs font-sans text-brand-charcoal hover:bg-[#FAF6F0]"
                            >
                              Admin Dashboard
                            </Link>
                          )}
                          {session.user?.role === "SELLER" && (
                            <Link
                              href="/seller"
                              onClick={() => setIsProfileMenuOpen(false)}
                              className="block px-4 py-2 text-xs font-sans text-brand-charcoal hover:bg-[#FAF6F0]"
                            >
                              Seller Dashboard
                            </Link>
                          )}
                          {session.user?.role === "CUSTOMER" && (
                            <Link
                              href="/orders"
                              onClick={() => setIsProfileMenuOpen(false)}
                              className="block px-4 py-2 text-xs font-sans text-brand-charcoal hover:bg-[#FAF6F0]"
                            >
                              My Orders
                            </Link>
                          )}
                          <button
                            onClick={() => {
                              setIsProfileMenuOpen(false);
                              signOut({ callbackUrl: "/" });
                            }}
                            className="flex w-full items-center px-4 py-2 text-xs font-sans text-red-600 hover:bg-[#FAF6F0] text-left cursor-pointer"
                          >
                            <LogOut className="h-3.5 w-3.5 mr-2" /> Sign Out
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <Link href="/auth/login" className="text-brand-charcoal hover:text-brand-gold transition-colors p-1 block">
                    <User className="h-5 w-5" />
                  </Link>
                )}
              </div>

              {/* Cart Trigger */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="text-brand-charcoal hover:text-brand-gold transition-colors focus:outline-none p-1 relative cursor-pointer"
                aria-label="Cart"
              >
                <ShoppingBag className="h-5 w-5" />
                {isMounted && cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-gold text-[9px] font-bold text-white">
                    {cartCount}
                  </span>
                )}
              </button>

            </div>
          </div>

          {/* Bottom Row: Navigation Links (Desktop Only) */}
          <nav className="hidden md:flex items-center justify-center space-x-10 text-[10px] font-sans tracking-[0.25em] text-brand-charcoal uppercase border-t border-[#FAF5EC]/60 py-3.5">
            <Link 
              href="/" 
              className="relative py-1 hover:text-brand-gold transition-all duration-300 font-bold group"
            >
              Home
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-gold/60 transition-all duration-300 group-hover:w-full" />
            </Link>
            
            <Link 
              href="/about" 
              className="relative py-1 hover:text-brand-gold transition-all duration-300 font-bold group"
            >
              About Us
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-gold/60 transition-all duration-300 group-hover:w-full" />
            </Link>
            
            {/* Shop Dropdown */}
            <div className="relative group">
              <Link
                href="/shop"
                className="flex items-center relative py-1 hover:text-brand-gold transition-all duration-300 font-bold cursor-pointer"
              >
                Shop <ChevronDown className="h-3.5 w-3.5 ml-0.5 text-[#A59578] group-hover:rotate-180 transition-transform duration-300" />
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-gold/60 transition-all duration-300 group-hover:w-full" />
              </Link>
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 w-48 bg-[#FDFBF7] border border-[#F0E6D2] rounded-md shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 z-50">
                <div className="py-2">
                  {categories.length === 0 ? (
                    <span className="block px-4 py-2 text-[9px] text-gray-400 font-sans uppercase tracking-widest text-center">No Categories</span>
                  ) : (
                    categories.map((cat) => (
                      <Link
                        key={cat}
                        href={`/shop?category=${encodeURIComponent(cat)}`}
                        className="block px-4 py-2.5 text-[10px] font-sans text-brand-charcoal hover:bg-[#FAF6F0] hover:text-brand-gold transition-colors uppercase tracking-widest font-bold"
                      >
                        {cat}
                      </Link>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Collections Dropdown */}
            <div className="relative group">
              <span className="flex items-center relative py-1 hover:text-brand-gold transition-all duration-300 font-bold cursor-pointer">
                Collections <ChevronDown className="h-3.5 w-3.5 ml-0.5 text-[#A59578] group-hover:rotate-180 transition-transform duration-300" />
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-gold/60 transition-all duration-300 group-hover:w-full" />
              </span>
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 w-56 bg-[#FDFBF7] border border-[#F0E6D2] rounded-md shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 z-50">
                <div className="py-2">
                  {collections.length === 0 ? (
                    <span className="block px-4 py-2 text-[9px] text-gray-400 font-sans uppercase tracking-widest text-center">No Collections</span>
                  ) : (
                    collections.map((col) => (
                      <Link
                        key={col}
                        href={`/shop?collection=${encodeURIComponent(col)}`}
                        className="block px-4 py-2.5 text-[10px] font-sans text-brand-charcoal hover:bg-[#FAF6F0] hover:text-brand-gold transition-colors uppercase tracking-widest font-bold"
                      >
                        {col}
                      </Link>
                    ))
                  )}
                </div>
              </div>
            </div>

            <Link 
              href="/shop?collection=Bestsellers" 
              className="relative py-1 hover:text-brand-gold transition-all duration-300 font-bold group"
            >
              Bestsellers
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-gold/60 transition-all duration-300 group-hover:w-full" />
            </Link>
          </nav>

        </div>
      </div>

      {/* Sliding Search Bar */}
      {isSearchOpen && (
        <div className="bg-[#FAF6F0] border-t border-[#F0E6D2] py-4">
          <div className="max-w-3xl mx-auto px-4">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search for clothes, collection, designer wear..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-[#E8DFC8] rounded-full py-2.5 pl-5 pr-12 text-sm text-brand-charcoal placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-brand-gold"
                autoFocus
              />
              <button
                type="submit"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-brand-charcoal hover:text-brand-gold"
              >
                <Search className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Mobile Navigation Drawer - constrained height & scrollable to avoid overflow cutoff on small screens */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#FDFBF7] border-t border-[#FAF5EC] py-4 px-4 space-y-3 shadow-inner max-h-[calc(100vh-4.5rem)] overflow-y-auto">
          <Link
            href="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block font-sans text-sm uppercase tracking-wider text-brand-charcoal hover:text-brand-gold py-1"
          >
            Home
          </Link>
          <Link
            href="/about"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block font-sans text-sm uppercase tracking-wider text-brand-charcoal hover:text-brand-gold py-1"
          >
            About Us
          </Link>
          <Link
            href="/shop"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block font-sans text-sm uppercase tracking-wider text-brand-charcoal hover:text-brand-gold py-1 font-bold"
          >
            Shop All
          </Link>
          
          {categories.length > 0 && (
            <div className="pl-4 space-y-2 border-l border-[#F0E6D2]">
              {categories.map((cat) => (
                <Link
                  key={cat}
                  href={`/shop?category=${encodeURIComponent(cat)}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-xs uppercase tracking-wider text-gray-500 hover:text-brand-gold"
                >
                  {cat}
                </Link>
              ))}
            </div>
          )}

          <Link
            href="/shop?collection=Bestsellers"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block font-sans text-sm uppercase tracking-wider text-brand-charcoal hover:text-brand-gold py-1"
          >
            Bestsellers
          </Link>

          {/* Mobile Profile Actions */}
          <div className="border-t border-[#FAF5EC] pt-4 mt-2">
            {status === "authenticated" ? (
              <div className="space-y-3">
                <div className="px-1 py-1">
                  <p className="text-[9px] font-sans font-bold uppercase tracking-wider text-brand-gold">
                    Role: {session?.user?.role}
                  </p>
                  <p className="text-xs font-semibold text-brand-charcoal truncate mt-0.5">{displayUserLabel}</p>
                  {session?.user?.role === "CUSTOMER" && (
                    <p className="text-[11px] font-bold text-emerald-800 mt-2 flex items-center bg-emerald-50 px-2.5 py-1 rounded border border-emerald-100 w-fit">
                      <Wallet className="h-3.5 w-3.5 mr-1 text-emerald-700" /> Rs. {walletBalance.toLocaleString()}
                    </p>
                  )}
                </div>
                {session?.user?.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block font-sans text-xs uppercase tracking-wider text-brand-charcoal hover:text-brand-gold py-1"
                  >
                    Admin Dashboard
                  </Link>
                )}
                {session?.user?.role === "SELLER" && (
                  <Link
                    href="/seller"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block font-sans text-xs uppercase tracking-wider text-brand-charcoal hover:text-brand-gold py-1"
                  >
                    Seller Dashboard
                  </Link>
                )}
                {session?.user?.role === "CUSTOMER" && (
                  <Link
                    href="/orders"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block font-sans text-xs uppercase tracking-wider text-brand-charcoal hover:text-brand-gold py-1"
                  >
                    My Orders
                  </Link>
                )}
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    signOut({ callbackUrl: "/" });
                  }}
                  className="flex items-center text-xs font-sans uppercase tracking-wider text-red-600 hover:text-red-700 py-1 text-left w-full cursor-pointer"
                >
                  <LogOut className="h-4 w-4 mr-2" /> Sign Out
                </button>
              </div>
            ) : (
              <Link
                href="/auth/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block font-sans text-sm uppercase tracking-wider text-brand-charcoal hover:text-brand-gold py-1 font-bold"
              >
                Sign In / Register
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
