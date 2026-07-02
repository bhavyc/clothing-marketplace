"use client";

import { useCart } from "@/context/CartContext";
import { X, Plus, Minus, ShoppingBag, Trash2 } from "lucide-react";
import Link from "next/link";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const {
    items,
    updateQuantity,
    removeItem,
    cartSubtotal,
    isMounted,
  } = useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#1C1917]/40 backdrop-blur-xs transition-opacity duration-500 ease-in-out"
        onClick={onClose}
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        {/* Panel */}
        <div className="w-screen max-w-md transform transition-all duration-500 ease-in-out bg-brand-cream border-l border-[#FAF5EC] shadow-2xl flex flex-col h-full">
          {/* Header */}
          <div className="px-6 py-5 border-b border-[#F0E6D2] flex items-center justify-between">
            <h2 className="font-serif text-lg text-brand-charcoal uppercase tracking-widest font-medium flex items-center">
              <ShoppingBag className="h-5 w-5 mr-2.5 text-brand-gold" />
              Shopping Bag
            </h2>
            <button
              onClick={onClose}
              className="p-1 hover:text-brand-gold transition-colors text-brand-charcoal"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto py-6 px-6 space-y-6">
            {!isMounted ? (
              <div className="h-full flex items-center justify-center">
                <p className="font-sans text-xs text-gray-500 uppercase tracking-widest">
                  Loading items...
                </p>
              </div>
            ) : items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <ShoppingBag className="h-12 w-12 text-[#E8DFC8] mb-4 stroke-1" />
                <p className="font-serif text-base text-brand-charcoal">
                  Your bag is empty
                </p>
                <p className="font-sans text-xs text-gray-400 mt-1 uppercase tracking-wider">
                  Find some beautiful designs to fill it
                </p>
                <button
                  onClick={onClose}
                  className="mt-6 px-6 py-2.5 bg-brand-charcoal text-brand-cream text-xs uppercase tracking-widest font-bold font-sans rounded-md hover:bg-opacity-90 transition-all"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="flex py-2 border-b border-[#FAF5EC] last:border-b-0"
                >
                  {/* Image */}
                  <div className="h-24 w-18 flex-shrink-0 overflow-hidden rounded-md border border-[#E8DFC8] bg-brand-cream-dark">
                    <img
                      src={item.productImage}
                      alt={item.productTitle}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="ml-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between">
                        <h3 className="font-serif text-sm font-medium text-brand-charcoal line-clamp-1">
                          {item.productTitle}
                        </h3>
                        <p className="ml-2 font-sans text-xs font-semibold text-brand-charcoal">
                          Rs. {(item.unitPrice * item.quantity).toLocaleString("en-IN")}
                        </p>
                      </div>
                      <p className="mt-0.5 text-[10px] text-brand-gold uppercase tracking-wider font-sans">
                        {item.category}
                      </p>

                      {/* Size selections */}
                      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-gray-500 font-sans">
                        {item.topSize && (
                          <span>
                            Top: <strong className="text-brand-charcoal font-semibold">{item.topSize}</strong>
                          </span>
                        )}
                        {item.bottomSize && (
                          <span>
                            Bottom: <strong className="text-brand-charcoal font-semibold">{item.bottomSize}</strong>
                          </span>
                        )}
                      </div>

                      {/* Options selections */}
                      {item.selectedOptions.length > 0 && (
                        <div className="mt-1 space-y-0.5">
                          {item.selectedOptions.map((opt) => (
                            <div
                              key={opt.id}
                              className="text-[10px] text-stone-500 font-sans italic"
                            >
                              + {opt.optionValue} (Rs. {opt.priceAdjustment.toLocaleString("en-IN")})
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Quantity Selector and Delete */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-[#E8DFC8] rounded-md bg-white">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-2 py-1 text-gray-500 hover:text-brand-gold transition-colors"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="px-2 text-xs font-sans text-brand-charcoal font-medium min-w-[20px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-2 py-1 text-gray-500 hover:text-brand-gold transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-stone-400 hover:text-red-700 transition-colors p-1"
                        title="Remove item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Sticky Checkout Panel */}
          {isMounted && items.length > 0 && (
            <div className="border-t border-[#F0E6D2] bg-brand-cream-dark px-6 py-6 space-y-4">
              <div className="flex justify-between text-sm font-sans tracking-wide text-brand-charcoal uppercase">
                <span>Subtotal</span>
                <span className="font-semibold text-base">
                  Rs. {cartSubtotal.toLocaleString("en-IN")}
                </span>
              </div>
              <p className="text-[10px] text-gray-400 font-sans tracking-wider uppercase">
                Shipping and taxes calculated at checkout.
              </p>
              
              <div className="space-y-2 mt-2">
                <Link
                  href="/checkout"
                  onClick={onClose}
                  className="flex w-full items-center justify-center rounded-md bg-brand-charcoal py-3 px-4 text-xs font-sans uppercase font-bold tracking-widest text-brand-cream shadow-md hover:bg-opacity-95 transition-all cursor-pointer"
                >
                  Proceed to Checkout
                </Link>
                
                <button
                  onClick={onClose}
                  className="flex w-full items-center justify-center py-2 text-xs font-sans uppercase tracking-widest text-brand-gold hover:text-brand-gold-light transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
