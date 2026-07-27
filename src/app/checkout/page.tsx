"use client";

import { useState, useEffect, Suspense } from "react";
import { useCart } from "@/context/CartContext";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { CreditCard, Truck, ShieldCheck, Ticket } from "lucide-react";
import Link from "next/link";

function CheckoutContent() {
  const {
    items,
    cartSubtotal,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    getDiscountAmount,
    getTotalAmount,
    clearCart,
    isMounted,
    refreshCart,
  } = useCart();
  
  const { data: session, status } = useSession();
  const router = useRouter();

  // Address State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [useWallet, setUseWallet] = useState(false);

  useEffect(() => {
    const fetchWallet = async () => {
      if (status === "authenticated") {
        try {
          const res = await fetch("/api/user/wallet");
          if (res.ok) {
            const data = await res.json();
            setWalletBalance(data.walletBalance || 0);
          }
        } catch (e) {
          console.error("Failed to load user wallet balance:", e);
        }
      }
    };
    fetchWallet();
  }, [status]);

  useEffect(() => {
    if (status === "authenticated") {
      refreshCart();
    }
  }, [status, refreshCart]);

    // Guard route & Prefill fields
    useEffect(() => {
      if (status === "unauthenticated") {
        setShowAuthModal(true);
      } else if (status === "authenticated" && session?.user) {
        if ((session.user as any).role !== "CUSTOMER") {
          router.push("/");
        } else {
          if (session.user.name && !name) setName(session.user.name);
          if (session.user.email && !email) {
            const isPlaceholder = session.user.email.startsWith("user-") && session.user.email.endsWith("@boutique.com");
            if (!isPlaceholder) {
              setEmail(session.user.email);
            }
          }
          if ((session.user as any).phone && !phone) setPhone((session.user as any).phone);
        }
      }
    }, [status, session, name, email, phone, router]);

    // Dynamically load Razorpay SDK on checkout page load
    useEffect(() => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
      return () => {
        document.body.removeChild(script);
      };
    }, []);

    // Payment Method  
    const paymentType = "PREPAID";
  
  // Coupon State
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);
  const [availableCoupons, setAvailableCoupons] = useState<any[]>([]);

  useEffect(() => {
    const fetchAvailableCoupons = async () => {
      try {
        const res = await fetch("/api/coupons");
        if (res.ok) {
          const data = await res.json();
          setAvailableCoupons(data.coupons || []);
        }
      } catch (e) {
        console.error("Failed to load active coupons for checkout:", e);
      }
    };
    fetchAvailableCoupons();
  }, []);

  const searchParams = useSearchParams();

  useEffect(() => {
    const autoCoupon = searchParams.get("coupon");
    if (autoCoupon) {
      applyCoupon(autoCoupon).then((res) => {
        if (res.success) {
          setCouponSuccess(`Coupon code "${autoCoupon}" auto-applied!`);
        } else {
          setCouponError(res.message);
        }
      });
    }
  }, [searchParams, applyCoupon]);
  
  // Order submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  if (!isMounted || status === "loading") {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-brand-cream">
        <p className="font-serif text-lg text-brand-gold tracking-widest lowercase">
          preparing checkout...
        </p>
      </div>
    );
  }

  if (status === "unauthenticated" && showAuthModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1C1917]/60 backdrop-blur-xs px-4">
        <div className="bg-brand-cream border border-[#E8DFC8] max-w-md w-full p-8 rounded-lg shadow-2xl text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex justify-center text-brand-gold">
            <ShieldCheck className="h-14 w-14 stroke-1" />
          </div>
          <div className="space-y-2">
            <h2 className="font-serif text-2xl text-brand-charcoal font-semibold lowercase tracking-wide">
              login required
            </h2>
            <p className="font-sans text-xs text-stone-500 uppercase tracking-widest leading-relaxed">
              Please sign in first to complete checkout
            </p>
          </div>
          <p className="font-sans text-[11px] text-gray-400 lowercase tracking-wider leading-relaxed">
            log in or register to securely save shipping details, apply coupons, and track your handcrafted designer order history.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              href={`/auth/login?callbackUrl=${encodeURIComponent("/checkout")}`}
              className="flex-1 inline-flex items-center justify-center bg-brand-charcoal text-brand-cream py-3 px-4 rounded text-xs font-sans uppercase font-bold tracking-widest shadow-md hover:bg-opacity-95 transition-all cursor-pointer"
            >
              Sign In / Register
            </Link>
            <Link
              href="/shop"
              className="flex-1 inline-flex items-center justify-center bg-white border border-[#E8DFC8] text-stone-700 py-3 px-4 rounded text-xs font-sans uppercase font-bold tracking-widest hover:bg-[#FAF6F0] transition-all cursor-pointer"
            >
              Back to Shop
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center bg-brand-cream text-center px-4">
        <h2 className="font-serif text-2xl text-brand-charcoal">Your bag is empty</h2>
        <p className="font-sans text-xs text-gray-500 uppercase tracking-wider mt-2">
          You must add items to your cart before checking out.
        </p>
        <Link
          href="/shop"
          className="mt-6 inline-flex items-center bg-brand-charcoal text-brand-cream px-6 py-2.5 text-xs font-sans uppercase font-bold tracking-widest rounded-md hover:bg-opacity-95 transition-all shadow-md"
        >
          Explore Catalog
        </Link>
      </div>
    );
  }

  // Coupon calculations
  const discountAmount = getDiscountAmount(paymentType);
  const totalAmount = getTotalAmount(paymentType);
  const showPrepaidWarning = false;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError(null);
    setCouponSuccess(null);

    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code.");
      return;
    }

    const res = await applyCoupon(couponCode.trim());
    if (res.success) {
      setCouponSuccess(res.message);
      setCouponCode("");
    } else {
      setCouponError(res.message);
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    setCouponSuccess(null);
    setCouponError(null);
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    // Form validation
    if (!name || !email || !phone || !address || !city || !state || !pincode) {
      setFormError("All shipping fields are required.");
      setIsSubmitting(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setFormError("Please enter a valid email address.");
      setIsSubmitting(false);
      return;
    }

    const isPlaceholderEmail = email.startsWith("user-") && email.endsWith("@boutique.com");
    if (isPlaceholderEmail) {
      setFormError("Please enter a valid personal email address for order notifications.");
      setIsSubmitting(false);
      return;
    }

    try {
      const orderData = {
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
        shippingAddress: address,
        city,
        state,
        pincode,
        paymentType,
        couponId: appliedCoupon ? appliedCoupon.id : null,
        items: items.map((item) => ({
          variantId: item.variantId,
          quantity: item.quantity,
          priceAtPurchase: item.unitPrice,
          selectedOptions: JSON.stringify(item.selectedOptions),
        })),
        useWallet,
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error || "Failed to place your order. Please try again.");
        setIsSubmitting(false);
        return;
      }

      // Check if order is fully paid via wallet
      if (data.totalAmount === 0) {
        clearCart();
        router.push(`/checkout/success?orderNumber=${data.orderNumber}`);
        return;
      }

      // Initiate Razorpay Checkout Modal
      const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_mockkey";

      const options = {
        key: keyId,
        amount: data.totalAmount * 100, // paise
        currency: "INR",
        name: "Vamika & Bhargavi",
        description: "Handcrafted Luxury Designer Wear",
        order_id: data.razorpayOrderId,
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch("/api/orders/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderNumber: data.orderNumber,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyRes.ok && verifyData.success) {
              clearCart();
              router.push(`/checkout/success?orderNumber=${data.orderNumber}`);
            } else {
              setFormError(verifyData.error || "Payment verification failed. Please contact support.");
              setIsSubmitting(false);
            }
          } catch (error) {
            console.error("Payment verification request error:", error);
            setFormError("An error occurred during payment verification.");
            setIsSubmitting(false);
          }
        },
        prefill: {
          name,
          email,
          contact: phone,
        },
        theme: {
          color: "#A08260", // brand gold
        },
        modal: {
          ondismiss: async function () {
            console.log("Razorpay payment modal closed by customer.");
            // Notify server to cancel order and restore stock
            try {
              await fetch("/api/orders/cancel", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderNumber: data.orderNumber }),
              });
            } catch (e) {
              console.error("Failed to cancel order on modal close:", e);
            }
            setFormError("Payment was cancelled. Your bag items are saved.");
            setIsSubmitting(false);
          },
        },
      };

      // Auto-approve in development mock mode if key is missing/placeholder
      if (keyId === "rzp_test_mockkey" || keyId.includes("mockkey")) {
        console.log("Auto-verifying payment in mock mode...");
        const mockPaymentId = `pay_mock_${Math.random().toString(36).substring(7)}`;
        const mockSignature = `mock_sig_${data.razorpayOrderId}_${mockPaymentId}`;
        
        const verifyRes = await fetch("/api/orders/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderNumber: data.orderNumber,
            razorpayPaymentId: mockPaymentId,
            razorpayOrderId: data.razorpayOrderId,
            razorpaySignature: mockSignature,
          }),
        });
        
        if (verifyRes.ok) {
          clearCart();
          router.push(`/checkout/success?orderNumber=${data.orderNumber}`);
          return;
        }
      }

      if (typeof (window as any).Razorpay === "undefined") {
        setFormError("Payment gateway failed to initialize. Please refresh the page and try again.");
        setIsSubmitting(false);
        return;
      }

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", async function (resp: any) {
        console.error("Razorpay payment failed:", resp.error);
        try {
          await fetch("/api/orders/cancel", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderNumber: data.orderNumber }),
          });
        } catch (e) {
          console.error("Failed to cancel order on payment fail:", e);
        }
        setFormError(`Payment failed: ${resp.error.description}`);
        setIsSubmitting(false);
      });
      rzp.open();
    } catch (err) {
      console.error("Checkout submit error:", err);
      setFormError("A server error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-brand-cream min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="mb-10 text-left border-b border-[#FAF5EC] pb-6">
          <h1 className="font-serif text-2xl sm:text-4xl text-brand-charcoal font-semibold lowercase tracking-wide">
            secure <span className="font-normal italic text-brand-gold">checkout</span>
          </h1>
        </div>

        {/* Form Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Side: Shipping Address & Payment */}
          <div className="lg:col-span-7 space-y-8">
            <form onSubmit={handlePlaceOrder} className="space-y-6">
              
              {/* Shipping Address Panel */}
              <div className="bg-[#FAF6F0] p-6 sm:p-8 rounded-md border border-[#E8DFC8] space-y-4">
                <h2 className="font-serif text-lg text-brand-charcoal font-semibold border-b border-[#E8DFC8] pb-3 lowercase tracking-wide">
                  shipping details
                </h2>

                {formError && (
                  <div className="bg-stone-100 border-l-4 border-brand-gold text-stone-800 px-4 py-3 rounded-r text-xs font-sans tracking-wide">
                    {formError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label htmlFor="fullName" className="block text-[10px] font-sans font-bold uppercase tracking-widest text-brand-charcoal">
                      Full Name <span className="text-brand-gold ml-0.5">*</span>
                    </label>
                    <input
                      id="fullName"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-1 block w-full rounded-md border border-[#E8DFC8] py-2 px-3 text-xs bg-white text-brand-charcoal focus:outline-none focus:border-brand-gold font-sans"
                      placeholder="Enter full name"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-[10px] font-sans font-bold uppercase tracking-widest text-brand-charcoal">
                      Email Address <span className="text-brand-gold ml-0.5">*</span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-1 block w-full rounded-md border border-[#E8DFC8] py-2 px-3 text-xs bg-white text-brand-charcoal focus:outline-none focus:border-brand-gold font-sans"
                      placeholder="email@example.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-[10px] font-sans font-bold uppercase tracking-widest text-brand-charcoal">
                      Phone Number <span className="text-brand-gold ml-0.5">*</span>
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="mt-1 block w-full rounded-md border border-[#E8DFC8] py-2 px-3 text-xs bg-white text-brand-charcoal focus:outline-none focus:border-brand-gold font-sans"
                      placeholder="e.g. +91 98739 59531"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="address" className="block text-[10px] font-sans font-bold uppercase tracking-widest text-brand-charcoal">
                      Street Address <span className="text-brand-gold ml-0.5">*</span>
                    </label>
                    <textarea
                      id="address"
                      required
                      rows={3}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="mt-1 block w-full rounded-md border border-[#E8DFC8] py-2 px-3 text-xs bg-white text-brand-charcoal focus:outline-none focus:border-brand-gold font-sans resize-none"
                      placeholder="Apartment, suite, unit, street name"
                    />
                  </div>

                  <div>
                    <label htmlFor="city" className="block text-[10px] font-sans font-bold uppercase tracking-widest text-brand-charcoal">
                      City <span className="text-brand-gold ml-0.5">*</span>
                    </label>
                    <input
                      id="city"
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="mt-1 block w-full rounded-md border border-[#E8DFC8] py-2 px-3 text-xs bg-white text-brand-charcoal focus:outline-none focus:border-brand-gold font-sans"
                      placeholder="City"
                    />
                  </div>

                  <div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label htmlFor="state" className="block text-[10px] font-sans font-bold uppercase tracking-widest text-brand-charcoal">
                          State <span className="text-brand-gold ml-0.5">*</span>
                        </label>
                        <input
                          id="state"
                          type="text"
                          required
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                          className="mt-1 block w-full rounded-md border border-[#E8DFC8] py-2 px-3 text-xs bg-white text-brand-charcoal focus:outline-none focus:border-brand-gold font-sans"
                          placeholder="State"
                        />
                      </div>
                      <div>
                        <label htmlFor="pincode" className="block text-[10px] font-sans font-bold uppercase tracking-widest text-brand-charcoal">
                          Pincode <span className="text-brand-gold ml-0.5">*</span>
                        </label>
                        <input
                          id="pincode"
                          type="text"
                          required
                          value={pincode}
                          onChange={(e) => setPincode(e.target.value)}
                          className="mt-1 block w-full rounded-md border border-[#E8DFC8] py-2 px-3 text-xs bg-white text-brand-charcoal focus:outline-none focus:border-brand-gold font-sans"
                          placeholder="Pincode"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            {/* Wallet / Store Credits Panel */}
            {status === "authenticated" && (
              <div className="bg-[#FAF6F0] p-6 sm:p-8 rounded-md border border-[#E8DFC8] space-y-4">
                <h2 className="font-serif text-lg text-brand-charcoal font-semibold border-b border-[#E8DFC8] pb-3 lowercase tracking-wide">
                  store credits
                </h2>
                <div className="bg-white p-4 border border-[#E8DFC8] rounded-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                  <div className="flex items-start space-x-3">
                    <input
                      id="useWallet"
                      type="checkbox"
                      disabled={walletBalance <= 0}
                      checked={useWallet && walletBalance > 0}
                      onChange={(e) => setUseWallet(e.target.checked)}
                      className="h-4 w-4 rounded border-[#E8DFC8] text-brand-gold focus:ring-brand-gold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-0.5"
                    />
                    <label htmlFor="useWallet" className={`block text-xs font-sans font-bold uppercase tracking-wider cursor-pointer leading-normal ${walletBalance <= 0 ? 'text-gray-400 cursor-not-allowed' : 'text-brand-charcoal'}`}>
                      Use Store Credits / Wallet Balance (Available: Rs. {walletBalance.toLocaleString("en-IN")})
                    </label>
                  </div>
                  {walletBalance > 0 ? (
                    <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-brand-gold bg-brand-cream-dark px-2.5 py-1 rounded shrink-0">
                      Save on checkout
                    </span>
                  ) : (
                    <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-gray-400 bg-stone-100 px-2.5 py-1 rounded shrink-0">
                      0 Balance
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Payment Details Panel (Prepaid Online Only) */}
            <div className="bg-[#FAF6F0] p-6 sm:p-8 rounded-md border border-[#E8DFC8] space-y-4">
              <h2 className="font-serif text-lg text-brand-charcoal font-semibold border-b border-[#E8DFC8] pb-3 lowercase tracking-wide">
                payment details
              </h2>

              <div className="bg-white p-4 border border-[#E8DFC8] rounded-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-[#FAF6F0] rounded text-brand-gold border border-[#E8DFC8] flex-shrink-0">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-sans font-bold uppercase tracking-wider text-brand-charcoal">
                      Razorpay Secure Online Payment
                    </h4>
                    <p className="text-[10px] font-sans text-gray-500 mt-1 lowercase tracking-wider leading-relaxed">
                      Pay securely using Credit/Debit cards, UPI (GPay, PhonePe, Paytm), Net Banking, or Wallets.
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-1.5 text-green-700 bg-green-50 px-2 py-1 rounded border border-green-200 text-[10px] font-sans font-bold uppercase tracking-wider flex-shrink-0">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  100% Secure
                </div>
              </div>
            </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center items-center rounded-md bg-brand-charcoal py-4 px-6 text-xs font-sans uppercase font-bold tracking-widest text-brand-cream shadow-md hover:bg-opacity-95 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting 
                  ? "Processing Order..." 
                  : (totalAmount - (useWallet ? Math.min(walletBalance, totalAmount) : 0)) === 0 
                  ? "Pay with Store Credits" 
                  : "Place Order Now"}
              </button>

            </form>
          </div>

          {/* Right Side: Order Summary Card */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Summary card */}
            <div className="bg-[#FAF6F0] p-6 rounded-md border border-[#E8DFC8] space-y-6">
              <h2 className="font-serif text-lg text-brand-charcoal font-semibold border-b border-[#E8DFC8] pb-3 lowercase tracking-wide">
                bag summary
              </h2>

              {/* Items List */}
              <div className="max-h-60 overflow-y-auto space-y-4 divide-y divide-[#FAF5EC] pr-1">
                {items.map((item, index) => (
                  <div key={item.id} className={`flex items-start ${index > 0 ? "pt-4" : ""}`}>
                    <img
                      src={item.productImage}
                      alt={item.productTitle}
                      className="h-16 w-12 object-cover rounded border border-[#E8DFC8] flex-shrink-0 bg-brand-cream-dark"
                    />
                    <div className="ml-3 flex-1">
                      <h3 className="font-serif text-xs font-medium text-brand-charcoal line-clamp-1">
                        {item.productTitle}
                      </h3>
                      <p className="text-[9px] text-[#A59578] font-sans uppercase tracking-widest mt-0.5">
                        Qty: {item.quantity} &bull; Rs. {item.unitPrice.toLocaleString("en-IN")}
                      </p>
                      <div className="flex flex-wrap gap-x-2 text-[10px] text-gray-400 mt-1 uppercase tracking-wide">
                        {item.topSize && <span>Top: {item.topSize}</span>}
                        {item.bottomSize && <span>Bottom: {item.bottomSize}</span>}
                      </div>
                    </div>
                    <span className="font-sans text-xs font-semibold text-brand-charcoal ml-2">
                      Rs. {(item.unitPrice * item.quantity).toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>

              {/* Coupon Box */}
              <div className="border-t border-b border-[#E8DFC8] py-4 space-y-3">
                <div className="flex items-center space-x-1.5 text-brand-gold">
                  <Ticket className="h-4 w-4" />
                  <span className="text-[10px] font-sans font-bold uppercase tracking-widest">
                    Promo Code
                  </span>
                </div>

                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-white border border-[#E8DFC8] rounded py-2 px-3">
                    <div>
                      <span className="font-sans text-xs font-bold text-brand-charcoal uppercase bg-stone-100 px-1.5 py-0.5 rounded mr-2">
                        {appliedCoupon.code}
                      </span>
                      <span className="font-sans text-[10px] text-brand-gold font-bold">
                        Saved Rs. {discountAmount.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <button
                      onClick={handleRemoveCoupon}
                      className="text-stone-400 hover:text-red-700 font-sans text-[10px] uppercase font-bold tracking-wider cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. PAY5"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1 bg-white border border-[#E8DFC8] rounded py-2 px-3 text-xs text-brand-charcoal focus:outline-none focus:border-brand-gold uppercase font-sans placeholder:normal-case"
                    />
                    <button
                      type="submit"
                      className="bg-brand-charcoal hover:bg-opacity-95 text-brand-cream py-2 px-4 rounded text-xs font-sans uppercase font-bold tracking-widest cursor-pointer"
                    >
                      Apply
                    </button>
                  </form>
                )}

                {/* Messages */}
                {couponError && (
                  <p className="text-[10px] font-sans text-red-600 font-bold uppercase tracking-wide">
                    {couponError}
                  </p>
                )}
                {couponSuccess && (
                  <p className="text-[10px] font-sans text-green-700 font-bold uppercase tracking-wide">
                    {couponSuccess}
                  </p>
                )}

                {/* Available Coupons list */}
                {!appliedCoupon && availableCoupons.length > 0 && (
                  <div className="pt-2 border-t border-[#E8DFC8]/50 space-y-2">
                    <p className="text-[9px] font-sans font-bold text-stone-400 uppercase tracking-widest">
                      Available Offers:
                    </p>
                    <div className="flex flex-col gap-1.5">
                      {availableCoupons.map((coupon) => (
                        <div
                          key={coupon.id}
                          onClick={async () => {
                            setCouponError(null);
                            setCouponSuccess(null);
                            const res = await applyCoupon(coupon.code);
                            if (res.success) {
                              setCouponSuccess(res.message);
                            } else {
                              setCouponError(res.message);
                            }
                          }}
                          className="group cursor-pointer flex items-center justify-between border border-dashed border-[#E8DFC8] hover:border-brand-gold rounded p-2 bg-[#FAF6F0]/40 hover:bg-[#FAF6F0] transition-all"
                        >
                          <div className="text-left flex-1 min-w-0 pr-2">
                            <span className="inline-block font-mono text-[9px] font-bold text-brand-charcoal bg-white border border-[#E8DFC8] group-hover:border-brand-gold group-hover:text-brand-gold px-1.5 py-0.5 rounded uppercase">
                              {coupon.code}
                            </span>
                            <p className="text-[9px] text-stone-500 mt-1 font-sans line-clamp-1">
                              {coupon.description || `Get ${coupon.discountPercent}% off on your checkout`}
                            </p>
                          </div>
                          <span className="text-[9px] text-brand-gold font-sans font-bold uppercase tracking-wider group-hover:underline flex-shrink-0">
                            Apply
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Total calculations */}
              <div className="space-y-2.5 text-xs font-sans uppercase tracking-wider text-stone-600">
                <div className="flex justify-between">
                  <span>Bag Subtotal</span>
                  <span className="font-semibold text-brand-charcoal">Rs. {cartSubtotal.toLocaleString("en-IN")}</span>
                </div>
                
                {discountAmount > 0 && (
                  <div className="flex justify-between text-brand-gold font-bold">
                    <span>Discount ({appliedCoupon?.code})</span>
                    <span>- Rs. {discountAmount.toLocaleString("en-IN")}</span>
                  </div>
                )}

                {useWallet && walletBalance > 0 && (
                  <div className="flex justify-between text-brand-gold font-bold">
                    <span>Wallet Applied</span>
                    <span>- Rs. {Math.min(walletBalance, totalAmount).toLocaleString("en-IN")}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Delivery Charges</span>
                  <span className="text-green-700 font-bold">FREE DELIVERY</span>
                </div>

                <div className="border-t border-[#E8DFC8] pt-4 flex justify-between items-baseline text-brand-charcoal uppercase">
                  <span className="font-serif text-sm font-bold">Final Payable</span>
                  <span className="font-sans text-lg font-bold text-brand-charcoal">
                    Rs. {Math.max(0, totalAmount - (useWallet ? Math.min(walletBalance, totalAmount) : 0)).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-brand-cream flex items-center justify-center font-serif text-brand-gold">
        Loading checkout...
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
