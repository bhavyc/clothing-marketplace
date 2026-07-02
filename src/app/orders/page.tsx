"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { 
  ShoppingBag, 
  Calendar, 
  MapPin, 
  CreditCard, 
  ArrowRight, 
  Package, 
  Truck, 
  CheckCircle2, 
  XCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Wallet
} from "lucide-react";
import Link from "next/link";

interface OrderItem {
  id: string;
  quantity: number;
  priceAtPurchase: number;
  selectedOptions: string | null;
  returnStatus: string;
  returnQuantity: number;
  returnReason: string | null;
  variant: {
    topSize: string | null;
    bottomSize: string | null;
    product: {
      id: string;
      title: string;
      images: string; // JSON string of image URLs
      category: string;
    };
  };
}

interface Order {
  id: string;
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
  status: string;
  trackingCompany: string | null;
  trackingNumber: string | null;
  createdAt: string;
  items: OrderItem[];
}

export default function MyOrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});
  const [ordersPage, setOrdersPage] = useState(1);
  const ORDERS_ITEMS_PER_PAGE = 3;

  // Return Modal State
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedItem, setSelectedItem] = useState<OrderItem | null>(null);
  const [returnQuantity, setReturnQuantity] = useState(1);
  const [returnReason, setReturnReason] = useState("");
  const [submittingReturn, setSubmittingReturn] = useState(false);
  const [returnError, setReturnError] = useState<string | null>(null);

  const handleInitiateReturn = (order: Order, item: OrderItem) => {
    setSelectedOrder(order);
    setSelectedItem(item);
    setReturnQuantity(1);
    setReturnReason("");
    setReturnError(null);
    setReturnModalOpen(true);
  };

  const handleSubmitReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || !selectedItem) return;
    setSubmittingReturn(true);
    setReturnError(null);

    try {
      const res = await fetch(`/api/orders/${selectedOrder.id}/return`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [
            {
              orderItemId: selectedItem.id,
              quantity: returnQuantity,
              reason: returnReason,
            },
          ],
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setReturnModalOpen(false);
        fetchOrders(); // Refresh order details
        alert("Return request submitted successfully.");
      } else {
        setReturnError(data.error || "Failed to submit return request.");
      }
    } catch (err) {
      setReturnError("A network error occurred. Please try again.");
    } finally {
      setSubmittingReturn(false);
    }
  };

  const fetchWalletBalance = async () => {
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

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(`/auth/login?callbackUrl=${encodeURIComponent("/orders")}`);
    } else if (status === "authenticated") {
      if ((session?.user as any)?.role !== "CUSTOMER") {
        router.push("/");
      } else {
        fetchOrders();
        fetchWalletBalance();
      }
    }
  }, [status, session, router]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/orders");
      const data = await res.json();
      if (res.ok && data.success) {
        setOrders(data.orders || []);
        setOrdersPage(1);
      }
    } catch (e) {
      console.error("Error loading order list:", e);
    } finally {
      setLoading(false);
    }
  };

  const toggleOrderExpand = (orderId: string) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  const getStatusBadgeClass = (orderStatus: string) => {
    switch (orderStatus) {
      case "PLACED":
        return "bg-stone-100 text-stone-800 border border-stone-200";
      case "CONFIRMED":
        return "bg-[#FAF6F0] text-brand-gold border border-brand-gold/30";
      case "SHIPPED":
        return "bg-blue-50 text-blue-800 border border-blue-200";
      case "DELIVERED":
        return "bg-emerald-50 text-emerald-800 border border-emerald-200";
      case "CANCELLED":
        return "bg-red-50 text-red-700 border border-red-200";
      case "RETURN_REQUESTED":
        return "bg-amber-50 text-amber-800 border border-amber-200";
      case "PARTIALLY_RETURNED":
        return "bg-amber-50/50 text-amber-700 border border-amber-200/50";
      case "RETURNED":
        return "bg-emerald-50 text-emerald-800 border border-emerald-200";
      default:
        return "bg-stone-50 text-stone-700 border border-stone-200";
    }
  };

  const getStatusIcon = (orderStatus: string) => {
    switch (orderStatus) {
      case "PLACED":
        return <Package className="h-4 w-4 mr-1.5" />;
      case "CONFIRMED":
        return <CheckCircle2 className="h-4 w-4 mr-1.5 text-brand-gold" />;
      case "SHIPPED":
        return <Truck className="h-4 w-4 mr-1.5 text-blue-700" />;
      case "DELIVERED":
        return <CheckCircle2 className="h-4 w-4 mr-1.5 text-emerald-700" />;
      case "CANCELLED":
        return <XCircle className="h-4 w-4 mr-1.5 text-red-600" />;
      case "RETURN_REQUESTED":
      case "PARTIALLY_RETURNED":
        return <HelpCircle className="h-4 w-4 mr-1.5 text-amber-700" />;
      case "RETURNED":
        return <CheckCircle2 className="h-4 w-4 mr-1.5 text-emerald-700" />;
      default:
        return <HelpCircle className="h-4 w-4 mr-1.5" />;
    }
  };

  const getStatusLabel = (orderStatus: string) => {
    switch (orderStatus) {
      case "PLACED":
        return "Order Placed";
      case "CONFIRMED":
        return "Confirmed";
      case "SHIPPED":
        return "Shipped";
      case "DELIVERED":
        return "Delivered";
      case "CANCELLED":
        return "Cancelled";
      case "RETURN_REQUESTED":
        return "Return Requested";
      case "PARTIALLY_RETURNED":
        return "Partially Returned";
      case "RETURNED":
        return "Returned";
      default:
        return orderStatus;
    }
  };

  const getProductImage = (imagesJson: string) => {
    try {
      const parsed = JSON.parse(imagesJson);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed[0];
      }
      return imagesJson;
    } catch {
      return imagesJson;
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center bg-brand-cream">
        <div className="animate-pulse space-y-4 text-center">
          <p className="font-serif text-lg text-brand-gold tracking-widest lowercase">
            fetching order history...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-brand-cream min-h-screen py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title Section */}
        <div className="mb-10 text-left border-b border-[#FAF5EC] pb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="font-serif text-2xl sm:text-4xl text-brand-charcoal font-semibold lowercase tracking-wide">
              my <span className="font-normal italic text-brand-gold">orders</span>
            </h1>
            <p className="font-sans text-[10px] text-gray-500 uppercase tracking-widest mt-1">
              View and track silhouettes you have ordered
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto justify-between md:justify-end">
            {/* Wallet Balance Widget */}
            <div className="bg-[#FAF6F0] border border-[#E8DFC8] rounded-md px-4 py-2 flex items-center gap-2.5 shadow-xs">
              <div className="p-2 bg-emerald-50 rounded border border-emerald-100 text-emerald-700">
                <Wallet className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[9px] font-sans uppercase tracking-widest text-stone-400 font-bold">Store Credits</p>
                <p className="text-sm font-bold text-emerald-800 font-sans mt-0.5">Rs. {walletBalance.toLocaleString()}</p>
              </div>
            </div>

            <Link
              href="/shop"
              className="font-sans text-[10px] uppercase font-bold tracking-widest text-brand-gold hover:text-brand-gold-light transition-all duration-300 flex items-center"
            >
              Go to Shop <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Link>
          </div>
        </div>

        {/* Orders Content */}
        {orders.length === 0 ? (
          <div className="bg-[#FAF6F0] rounded-lg border border-[#E8DFC8] py-16 px-6 text-center shadow-xs">
            <ShoppingBag className="h-12 w-12 text-brand-gold/40 mx-auto stroke-1 mb-4" />
            <h3 className="font-serif text-xl text-brand-charcoal">No orders yet</h3>
            <p className="font-sans text-xs text-gray-500 uppercase tracking-wider mt-2 max-w-sm mx-auto leading-relaxed">
              You haven't listed or placed any order transactions on this account. Discover our premium hand-designed couture collection.
            </p>
            <Link
              href="/shop"
              className="mt-8 inline-flex items-center justify-center rounded-md bg-brand-charcoal py-3 px-6 text-xs font-sans uppercase font-bold tracking-widest text-brand-cream shadow-md hover:bg-opacity-95 transition-all cursor-pointer"
            >
              Explore Collection
            </Link>
          </div>
        ) : (() => {
          const totalOrdersPages = Math.ceil(orders.length / ORDERS_ITEMS_PER_PAGE);
          const paginatedOrders = orders.slice(
            (ordersPage - 1) * ORDERS_ITEMS_PER_PAGE,
            ordersPage * ORDERS_ITEMS_PER_PAGE
          );

          return (
            <div className="space-y-6">
              {paginatedOrders.map((order) => {
                const isExpanded = !!expandedOrders[order.id];
                return (
                  <div 
                    key={order.id} 
                    className="bg-[#FAF6F0] rounded-lg border border-[#E8DFC8] overflow-hidden shadow-xs transition-all duration-300 hover:border-brand-gold/50"
                  >
                    {/* Order Header Summary Row */}
                    <div className="p-5 sm:p-6 grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
                      <div>
                        <p className="font-sans text-[9px] text-gray-400 uppercase tracking-widest">
                          Order Number
                        </p>
                        <p className="font-sans text-xs font-bold text-brand-charcoal uppercase tracking-wider mt-0.5">
                          {order.orderNumber}
                        </p>
                      </div>

                      <div>
                        <p className="font-sans text-[9px] text-gray-400 uppercase tracking-widest flex items-center">
                          <Calendar className="h-3 w-3 mr-1 text-gray-400" /> Date Placed
                        </p>
                        <p className="font-sans text-xs text-brand-charcoal font-semibold mt-0.5">
                          {new Date(order.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>

                      <div>
                        <p className="font-sans text-[9px] text-gray-400 uppercase tracking-widest">
                          Total Amount
                        </p>
                        <p className="font-sans text-xs font-bold text-brand-charcoal mt-0.5">
                          Rs. {order.totalAmount.toLocaleString("en-IN")}
                        </p>
                      </div>

                      <div className="flex flex-col md:items-end justify-center">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[9px] font-sans font-bold uppercase tracking-wider ${getStatusBadgeClass(order.status)}`}>
                          {getStatusIcon(order.status)}
                          {getStatusLabel(order.status)}
                        </span>
                      </div>
                    </div>

                    {/* Accordion Divider & Toggle Button */}
                    <div className="border-t border-[#FAF5EC] bg-white px-5 py-3 flex justify-between items-center">
                      <span className="font-sans text-[10px] text-stone-500 uppercase tracking-widest font-semibold">
                        {order.items.length} {order.items.length === 1 ? "Item" : "Items"} in order
                      </span>
                      <button
                        onClick={() => toggleOrderExpand(order.id)}
                        className="text-brand-gold hover:text-brand-gold-light transition-all flex items-center font-sans text-[10px] font-bold uppercase tracking-widest cursor-pointer"
                      >
                        {isExpanded ? (
                          <>Hide Details <ChevronUp className="h-4 w-4 ml-1" /></>
                        ) : (
                          <>Show Details <ChevronDown className="h-4 w-4 ml-1" /></>
                        )}
                      </button>
                    </div>

                    {/* Collapsible Details Panel */}
                    {isExpanded && (
                      <div className="p-6 border-t border-[#FAF5EC] bg-white space-y-6">
                        
                        {/* Products List */}
                        <div className="space-y-4 divide-y divide-[#FAF5EC]">
                          {order.items.map((item, index) => {
                            const imageUrl = getProductImage(item.variant.product.images);
                            return (
                              <div key={item.id} className={`flex items-start ${index > 0 ? "pt-4" : ""}`}>
                                <img
                                  src={imageUrl}
                                  alt={item.variant.product.title}
                                  className="h-20 w-16 object-cover rounded border border-[#E8DFC8] bg-brand-cream-dark"
                                />
                                <div className="ml-4 flex-1">
                                  <h4 className="font-serif text-sm font-semibold text-brand-charcoal">
                                    {item.variant.product.title}
                                  </h4>
                                  <p className="text-[10px] text-brand-gold font-sans uppercase tracking-widest mt-0.5">
                                    Category: {item.variant.product.category}
                                  </p>
                                  <div className="flex flex-wrap gap-x-3 text-[10px] text-gray-500 mt-2 uppercase tracking-wider font-semibold">
                                    {item.variant.topSize && <span>Top: {item.variant.topSize}</span>}
                                    {item.variant.bottomSize && <span>Bottom: {item.variant.bottomSize}</span>}
                                    <span>Qty: {item.quantity}</span>
                                  </div>
                                  {item.selectedOptions && (
                                    <p className="text-[10px] text-stone-500 font-sans mt-1 bg-stone-50 px-2 py-0.5 rounded border border-stone-100 inline-block">
                                      Custom Options: {item.selectedOptions}
                                    </p>
                                  )}
                                  
                                  {/* Return status badge and button */}
                                  <div className="mt-2.5 flex items-center space-x-2">
                                    {item.returnStatus && item.returnStatus !== "NONE" ? (
                                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-sans font-bold uppercase tracking-wider ${
                                        item.returnStatus === "RETURN_REQUESTED"
                                          ? "bg-amber-50 text-amber-800 border border-amber-200"
                                          : item.returnStatus === "RETURN_APPROVED"
                                          ? "bg-blue-50 text-blue-800 border border-blue-200"
                                          : item.returnStatus === "RETURNED"
                                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                          : "bg-red-50 text-red-700 border border-red-200"
                                      }`}>
                                        Return: {item.returnStatus.replace("_", " ")}
                                        {item.returnQuantity > 0 && ` (${item.returnQuantity} qty)`}
                                      </span>
                                    ) : (
                                      order.status === "DELIVERED" && (
                                        <button
                                          onClick={() => handleInitiateReturn(order, item)}
                                          className="text-[9px] font-sans font-bold uppercase tracking-wider text-brand-gold border border-brand-gold/30 hover:border-brand-gold hover:bg-brand-gold/5 py-1 px-2.5 rounded transition-all cursor-pointer"
                                        >
                                          Request Return
                                        </button>
                                      )
                                    )}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="font-sans text-xs font-bold text-brand-charcoal">
                                    Rs. {(item.priceAtPurchase * item.quantity).toLocaleString("en-IN")}
                                  </p>
                                  <p className="font-sans text-[9px] text-gray-400 uppercase tracking-widest mt-0.5">
                                    Rs. {item.priceAtPurchase.toLocaleString("en-IN")} each
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Summary, Shipping, and Payment Details Split Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-[#FAF5EC]">
                          
                          {/* Shipping Details */}
                          <div className="space-y-3">
                            <h5 className="font-serif text-xs font-bold text-brand-charcoal uppercase tracking-wider flex items-center border-b border-[#FAF5EC] pb-2">
                              <MapPin className="h-3.5 w-3.5 mr-1.5 text-brand-gold" /> Shipping Address
                            </h5>
                            <div className="font-sans text-[11px] text-stone-600 space-y-1 tracking-wide leading-relaxed">
                              <p className="font-bold text-brand-charcoal uppercase">{order.customerName}</p>
                              <p>{order.shippingAddress}</p>
                              <p>{order.city}, {order.state} - {order.pincode}</p>
                              <p className="pt-1 text-[10px] text-gray-400 font-sans tracking-wide">
                                Phone: {order.customerPhone} &bull; Email: {order.customerEmail}
                              </p>
                            </div>

                            {/* Tracking Details if Shipped */}
                            {order.status === "SHIPPED" && order.trackingNumber && (
                              <div className="bg-blue-50/50 border border-blue-100 rounded p-3 mt-4 space-y-1">
                                <p className="font-sans text-[10px] font-bold text-blue-800 uppercase tracking-widest">
                                  Shipment Tracking
                                </p>
                                <p className="font-sans text-[11px] text-stone-700">
                                  Carrier: <strong className="text-blue-900 font-bold">{order.trackingCompany || "Standard Delivery"}</strong>
                                </p>
                                <p className="font-sans text-[11px] text-stone-700">
                                  Tracking No: <strong className="text-blue-900 font-mono font-bold select-all">{order.trackingNumber}</strong>
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Payment & Order Calculation Summary */}
                          <div className="space-y-4">
                            <h5 className="font-serif text-xs font-bold text-brand-charcoal uppercase tracking-wider flex items-center border-b border-[#FAF5EC] pb-2">
                              <CreditCard className="h-3.5 w-3.5 mr-1.5 text-brand-gold" /> Order & Payment Summary
                            </h5>
                            
                            <div className="space-y-2 text-[11px] font-sans uppercase tracking-wider text-stone-600">
                              <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span className="font-semibold text-brand-charcoal">Rs. {order.subtotal.toLocaleString("en-IN")}</span>
                              </div>
                              {order.discountAmount > 0 && (
                                <div className="flex justify-between text-brand-gold font-bold">
                                  <span>Discounts</span>
                                  <span>- Rs. {order.discountAmount.toLocaleString("en-IN")}</span>
                                </div>
                              )}
                              <div className="flex justify-between">
                                <span>Delivery Fee</span>
                                <span className="text-emerald-700 font-bold">FREE</span>
                              </div>
                              <div className="border-t border-[#FAF5EC] pt-2 flex justify-between items-baseline font-bold text-brand-charcoal">
                                <span className="font-serif text-xs">Total Charged</span>
                                <span className="text-sm">Rs. {order.totalAmount.toLocaleString("en-IN")}</span>
                              </div>
                            </div>

                            {/* Payment Mode Badge */}
                            <div className="pt-2 flex gap-2 items-center">
                              <span className="font-sans text-[9px] text-gray-400 uppercase tracking-widest font-bold">Payment Option:</span>
                              <span className="font-sans text-[10px] font-bold text-brand-charcoal bg-[#FAF6F0] border border-[#E8DFC8] py-0.5 px-2 rounded">
                                {order.paymentType === "COD" ? "Cash on Delivery" : "Online Prepaid"}
                              </span>
                              <span className={`font-sans text-[10px] font-bold py-0.5 px-2 rounded ${
                                order.paymentStatus === "PAID" 
                                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                  : "bg-amber-50 text-amber-800 border border-amber-200"
                              }`}>
                                {order.paymentStatus}
                              </span>
                            </div>
                          </div>

                        </div>

                      </div>
                    )}

                  </div>
                );
              })}

              {totalOrdersPages > 1 && (
                <div className="flex justify-center items-center space-x-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setOrdersPage((p) => Math.max(1, p - 1))}
                    disabled={ordersPage <= 1}
                    className={`px-3 py-1.5 border border-[#E8DFC8] rounded-md text-[10px] font-sans font-bold uppercase tracking-widest transition-all ${
                      ordersPage <= 1
                        ? "opacity-45 cursor-not-allowed bg-[#FAF6F0] text-gray-400"
                        : "bg-white text-brand-charcoal hover:border-brand-gold hover:text-brand-gold shadow-xs"
                    }`}
                  >
                    Prev
                  </button>
                  <span className="text-[10px] font-sans text-[#A59578] font-bold uppercase tracking-widest px-3">
                    Page {ordersPage} of {totalOrdersPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setOrdersPage((p) => Math.min(totalOrdersPages, p + 1))}
                    disabled={ordersPage >= totalOrdersPages}
                    className={`px-3 py-1.5 border border-[#E8DFC8] rounded-md text-[10px] font-sans font-bold uppercase tracking-widest transition-all ${
                      ordersPage >= totalOrdersPages
                        ? "opacity-45 cursor-not-allowed bg-[#FAF6F0] text-gray-400"
                        : "bg-white text-brand-charcoal hover:border-brand-gold hover:text-brand-gold shadow-xs"
                    }`}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          );
        })()}

      </div>
      {/* Return Request Modal */}
      {returnModalOpen && selectedOrder && selectedItem && (
        <div className="fixed inset-0 bg-[#1C1917]/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[#FDFBF7] border border-[#E8DFC8] max-w-md w-full rounded-sm shadow-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-[#FAF5EC] flex justify-between items-center bg-[#FAF6F0]">
              <h3 className="font-serif text-md font-semibold text-brand-charcoal lowercase tracking-wider">
                request return
              </h3>
              <button
                type="button"
                onClick={() => setReturnModalOpen(false)}
                className="text-stone-400 hover:text-brand-charcoal transition-colors p-1 cursor-pointer"
              >
                <XCircle className="h-4 w-4" />
              </button>
            </div>
            
            <form onSubmit={handleSubmitReturn} className="p-6 space-y-4">
              {returnError && (
                <div className="bg-red-50 border-l-4 border-red-600 text-red-800 px-4 py-2.5 rounded-r text-xs font-sans tracking-wide">
                  {returnError}
                </div>
              )}
              
              <div className="flex items-start space-x-3">
                <img
                  src={getProductImage(selectedItem.variant.product.images)}
                  alt={selectedItem.variant.product.title}
                  className="h-16 w-12 object-cover rounded border border-[#E8DFC8] bg-brand-cream-dark"
                />
                <div>
                  <h4 className="font-serif text-xs font-bold text-brand-charcoal">
                    {selectedItem.variant.product.title}
                  </h4>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">
                    Rs. {selectedItem.priceAtPurchase.toLocaleString("en-IN")} each
                  </p>
                  <p className="text-[10px] text-stone-500 mt-1 uppercase tracking-wide">
                    {selectedItem.variant.topSize && `Top: ${selectedItem.variant.topSize}`} {selectedItem.variant.bottomSize && `Bottom: ${selectedItem.variant.bottomSize}`}
                  </p>
                </div>
              </div>

              {selectedItem.quantity > 1 && (
                <div>
                  <label className="block text-[10px] font-sans font-bold uppercase tracking-widest text-brand-charcoal mb-1">
                    Quantity to Return
                  </label>
                  <select
                    value={returnQuantity}
                    onChange={(e) => setReturnQuantity(parseInt(e.target.value))}
                    className="w-full bg-white border border-[#E8DFC8] rounded py-1.5 px-3 text-xs font-sans text-brand-charcoal focus:outline-none focus:border-brand-gold cursor-pointer"
                  >
                    {Array.from({ length: selectedItem.quantity }, (_, i) => i + 1).map((q) => (
                      <option key={q} value={q}>
                        {q}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-sans font-bold uppercase tracking-widest text-brand-charcoal mb-1">
                  Reason for Return
                </label>
                <textarea
                  required
                  rows={3}
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  placeholder="Please describe why you would like to return this item (e.g., size doesn't fit, want to replace with other color, fabric adjustments)..."
                  className="w-full rounded-md border border-[#E8DFC8] py-2 px-3 text-xs bg-white text-brand-charcoal focus:outline-none focus:border-brand-gold font-sans resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReturnModalOpen(false)}
                  className="flex-1 bg-white border border-[#E8DFC8] text-stone-700 py-2.5 rounded text-[10px] font-sans uppercase font-bold tracking-widest hover:bg-[#FAF6F0] transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReturn}
                  className="flex-1 bg-brand-charcoal text-brand-cream py-2.5 rounded text-[10px] font-sans uppercase font-bold tracking-widest hover:bg-opacity-95 shadow-md transition-all disabled:opacity-50 cursor-pointer"
                >
                  {submittingReturn ? "Submitting..." : "Submit Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
