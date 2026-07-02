"use client";

import { usePathname } from "next/navigation";
import { Suspense } from "react";
import Header from "./Header";
import PromoBanner from "./PromoBanner";
import Footer from "./Footer";
import CartDrawer from "./CartDrawer";
import { useCart } from "@/context/CartContext";

export default function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isCartOpen, setIsCartOpen } = useCart();

  // Check if we are in admin or seller dashboard spaces
  const isDashboard = pathname.startsWith("/admin") || pathname.startsWith("/seller");

  if (isDashboard) {
    return <div className="flex-1 flex flex-col">{children}</div>;
  }

  return (
    <>
      <PromoBanner />
      <Suspense fallback={<div className="h-20 bg-brand-cream border-b border-[#FAF5EC] animate-pulse" />}>
        <Header />
      </Suspense>
      <main className="flex-1 flex flex-col">{children}</main>
      
      <Suspense fallback={<div className="h-40 bg-[#FAF6F0] animate-pulse" />}>
        <Footer />
      </Suspense>

      {/* Cart Drawer rendered at root layout level to escape header stacking context */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
