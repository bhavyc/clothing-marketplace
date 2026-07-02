"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { CheckCircle2, ShoppingBag, ArrowRight, MapPin, CreditCard, Package } from "lucide-react";
import Link from "next/link";

interface OrderItemType {
  id: string;
  quantity: number;
  priceAtPurchase: number;
  selectedOptions: string | null;
  variant: {
    topSize: string | null;
    bottomSize: string | null;
    product: {
      title: string;
      images: string; // JSON string
      category: string;
    };
  };
}

interface OrderType {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  city: string;
  state: string;
  pincode: string;
  subtotal: number;
  discountAmount: number;
  totalAmount: number;
  paymentType: string;
  paymentStatus: string;
  items: OrderItemType[];
}

function SuccessDetails() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("orderNumber") || "KSH-XXXXX";

  const [order, setOrder] = useState<OrderType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrderDetails() {
      if (!orderNumber || orderNumber === "KSH-XXXXX") {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`/api/orders?orderNumber=${orderNumber}`);
        const data = await res.json();
        if (res.ok && data.success) {
          setOrder(data.order);
        } else {
          setError(data.error || "Failed to load order details.");
        }
      } catch (err) {
        console.error("Error fetching order details:", err);
        setError("Failed to fetch order details.");
      } finally {
        setLoading(false);
      }
    }
    fetchOrderDetails();
  }, [orderNumber]);

  if (loading) {
    return (
      <div className="flex min-h-[75vh] flex-col justify-center items-center py-12 px-4 bg-brand-cream text-center">
        <div className="max-w-md w-full bg-[#FAF6F0] px-6 py-12 shadow-lg border border-[#E8DFC8] sm:rounded-lg animate-pulse space-y-6">
          <div className="h-16 w-16 bg-[#E8DFC8] rounded-full mx-auto" />
          <div className="h-6 bg-[#E8DFC8] rounded w-1/2 mx-auto" />
          <div className="h-4 bg-[#E8DFC8] rounded w-2/3 mx-auto" />
          <div className="space-y-3 pt-4">
            <div className="h-10 bg-[#E8DFC8] rounded" />
            <div className="h-10 bg-[#E8DFC8] rounded" />
            <div className="h-20 bg-[#E8DFC8] rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[80vh] flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-brand-cream text-center">
      <div className="max-w-2xl w-full bg-[#FAF6F0] px-6 py-10 shadow-lg border border-[#E8DFC8] sm:rounded-lg sm:px-10 space-y-8">
        
        {/* Success Icon & Header */}
        <div className="space-y-4">
          <div className="flex justify-center text-brand-gold">
            <CheckCircle2 className="h-14 w-14 stroke-1 fill-brand-gold/10" />
          </div>
          <div className="space-y-2">
            <h1 className="font-serif text-3xl font-semibold tracking-wide text-brand-charcoal lowercase">
              order placed!
            </h1>
            <p className="font-sans text-[10px] text-stone-500 uppercase tracking-widest leading-relaxed">
              Thank you for shopping with Vamika & Bhargavi
            </p>
          </div>
        </div>

        {/* Order Reference Badge */}
        <div className="bg-white border border-[#E8DFC8] rounded-md py-4 px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left">
            <p className="font-sans text-[9px] text-gray-400 uppercase tracking-widest">
              Order Reference Number
            </p>
            <p className="font-sans text-lg font-bold text-brand-charcoal tracking-widest mt-0.5">
              {orderNumber}
            </p>
          </div>
          <div className="text-center sm:text-right">
            <span className="inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-xs font-sans font-bold uppercase tracking-wider text-green-700 border border-green-200">
              {order?.paymentStatus === "PAID" ? "Paid Secured" : "Payment Pending"}
            </span>
          </div>
        </div>

        {error || !order ? (
          /* Fallback view if order details fails */
          <div className="bg-white border border-[#E8DFC8] p-6 rounded-md text-left space-y-3">
            <p className="font-sans text-xs text-stone-500 leading-relaxed uppercase tracking-wider">
              A confirmation email will be sent to your inbox shortly with shipment details.
            </p>
          </div>
        ) : (
          /* Rich Order details view */
          <div className="space-y-6 text-left">
            
            {/* Ordered Items Shelf */}
            <div className="bg-white border border-[#E8DFC8] p-6 rounded-md space-y-4">
              <h3 className="font-serif text-base text-brand-charcoal font-semibold border-b border-[#FAF5EC] pb-2.5 flex items-center">
                <Package className="h-4 w-4 mr-2 text-brand-gold" />
                items ordered
              </h3>
              
              <div className="divide-y divide-[#FAF5EC] space-y-4">
                {order.items.map((item, idx) => {
                  let imgUrl = "https://images.unsplash.com/photo-1608748010899-18f300247112?auto=format&fit=crop&w=100&q=85";
                  try {
                    if (item.variant.product.images) {
                      const parsed = JSON.parse(item.variant.product.images);
                      if (Array.isArray(parsed) && parsed.length > 0) {
                        imgUrl = parsed[0];
                      }
                    }
                  } catch (e) {
                    console.error("Failed to parse product image on success page:", e);
                  }

                  return (
                    <div key={item.id} className={`flex items-start ${idx > 0 ? "pt-4" : ""}`}>
                      <img
                        src={imgUrl}
                        alt={item.variant.product.title}
                        className="h-16 w-12 object-cover rounded border border-[#E8DFC8] flex-shrink-0 bg-brand-cream-dark"
                      />
                      <div className="ml-4 flex-1">
                        <h4 className="font-serif text-sm font-medium text-brand-charcoal leading-snug">
                          {item.variant.product.title}
                        </h4>
                        <p className="text-[9px] text-[#A59578] font-sans uppercase tracking-widest mt-0.5">
                          Qty: {item.quantity} &bull; Rs. {item.priceAtPurchase.toLocaleString("en-IN")}
                        </p>
                        
                        {/* Selected options / Custom detailing */}
                        {item.selectedOptions && (
                          <p className="text-[10px] text-gray-400 font-sans tracking-wide mt-1 uppercase">
                            {item.selectedOptions}
                          </p>
                        )}
                        
                        {/* Sizes */}
                        <div className="flex gap-x-2 text-[9px] text-gray-400 mt-0.5 uppercase tracking-wider">
                          {item.variant.topSize && <span>Top: {item.variant.topSize}</span>}
                          {item.variant.bottomSize && <span>Bottom: {item.variant.bottomSize}</span>}
                        </div>
                      </div>
                      <span className="font-sans text-xs font-semibold text-brand-charcoal ml-2">
                        Rs. {(item.priceAtPurchase * item.quantity).toLocaleString("en-IN")}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Shipping details and Payment Summary side-by-side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Shipping Details */}
              <div className="bg-white border border-[#E8DFC8] p-5 rounded-md space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <h3 className="font-serif text-sm text-brand-charcoal font-semibold border-b border-[#FAF5EC] pb-2 flex items-center">
                    <MapPin className="h-3.5 w-3.5 mr-1.5 text-brand-gold" />
                    shipping address
                  </h3>
                  <div className="font-sans text-[11px] text-gray-600 space-y-1">
                    <p className="font-bold text-brand-charcoal uppercase tracking-wider">{order.customerName}</p>
                    <p className="leading-relaxed">{order.shippingAddress}</p>
                    <p className="uppercase tracking-wider">{order.city}, {order.state} - {order.pincode}</p>
                  </div>
                </div>
                <div className="border-t border-[#FAF5EC] pt-2 text-[10px] font-sans text-gray-500 space-y-0.5 uppercase tracking-wide">
                  <p>Contact: {order.customerPhone}</p>
                  <p className="lowercase text-[9px]">{order.customerEmail}</p>
                </div>
              </div>

              {/* Price Details */}
              <div className="bg-white border border-[#E8DFC8] p-5 rounded-md space-y-3">
                <h3 className="font-serif text-sm text-brand-charcoal font-semibold border-b border-[#FAF5EC] pb-2 flex items-center">
                  <CreditCard className="h-3.5 w-3.5 mr-1.5 text-brand-gold" />
                  payment details
                </h3>
                <div className="space-y-2 text-[10px] font-sans uppercase tracking-wider text-stone-600">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-medium text-brand-charcoal">Rs. {order.subtotal.toLocaleString("en-IN")}</span>
                  </div>
                  {order.discountAmount > 0 && (
                    <div className="flex justify-between text-brand-gold font-bold">
                      <span>Discount</span>
                      <span>- Rs. {order.discountAmount.toLocaleString("en-IN")}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Delivery</span>
                    <span className="text-green-700 font-bold">FREE</span>
                  </div>
                  <div className="border-t border-[#FAF5EC] pt-2 flex justify-between items-baseline text-brand-charcoal">
                    <span className="font-serif text-xs font-bold lowercase">total paid</span>
                    <span className="font-sans text-sm font-bold text-brand-charcoal">
                      Rs. {order.totalAmount.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* Handcrafted Notice */}
        <p className="font-sans text-[9px] sm:text-[10px] text-gray-500 leading-relaxed uppercase tracking-wider text-center bg-brand-cream/50 p-4 rounded border border-[#FAF5EC]">
          * Please note: Every item is customized & handcrafted by independent design houses. Delivery takes approximately 7-15 days depending on the design complexity.
        </p>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          <Link
            href="/shop"
            className="flex w-full justify-center items-center rounded bg-brand-charcoal py-3 px-4 text-xs font-sans uppercase font-bold tracking-widest text-brand-cream shadow-md hover:bg-opacity-95 transition-all cursor-pointer hover:shadow-lg"
          >
            <ShoppingBag className="h-4 w-4 mr-2" />
            Continue Shopping
          </Link>
          <Link
            href="/"
            className="flex w-full justify-center items-center py-2 text-xs font-sans uppercase font-bold tracking-widest text-brand-gold hover:text-brand-gold-light transition-colors"
          >
            Go to Homepage
            <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
          </Link>
        </div>

      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[80vh] flex items-center justify-center bg-brand-cream">
          <p className="font-serif text-lg text-brand-gold tracking-widest lowercase">
            loading order confirmation...
          </p>
        </div>
      }
    >
      <SuccessDetails />
    </Suspense>
  );
}
