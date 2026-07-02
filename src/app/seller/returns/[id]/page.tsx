"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  X,
  RefreshCw,
  Undo2,
  Scissors,
  Package,
  CheckCircle,
  Truck,
  IndianRupee,
  Phone,
  Mail,
  MapPin,
  Calendar,
  AlertTriangle
} from "lucide-react";

interface ReturnRequestDetail {
  id: string;
  orderId: string;
  orderNumber: string;
  orderDate: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  city: string;
  state: string;
  pincode: string;
  productTitle: string;
  productImage: string;
  topSize: string | null;
  bottomSize: string | null;
  quantity: number;
  priceAtPurchase: number;
  selectedOptions: string | null;
  returnStatus: string;
  returnQuantity: number;
  returnReason: string | null;
  updatedAt: string;
}

const renderSelectedOptions = (optionsStr: string | null) => {
  if (!optionsStr) return null;
  if (optionsStr === "{}") return null;
  try {
    if (optionsStr.startsWith("{") && optionsStr.endsWith("}")) {
      const parsed = JSON.parse(optionsStr);
      return Object.entries(parsed)
        .map(([k, v]) => `${k}: ${v}`)
        .join(", ");
    }
  } catch (e) {}
  return optionsStr;
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function SellerReturnDetailPage({ params }: PageProps) {
  const { id } = React.use(params);
  const { data: session, status } = useSession();
  const router = useRouter();

  const [returnRequest, setReturnRequest] = React.useState<ReturnRequestDetail | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [actionLoading, setActionLoading] = React.useState(false);
  const [message, setMessage] = React.useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchReturnDetails = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/seller/returns/${id}`);
      const data = await res.json();
      if (res.ok) {
        setReturnRequest(data.returnRequest);
      } else {
        setError(data.error || "Failed to load return request details.");
      }
    } catch (err) {
      setError("Failed to connect to the server.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  React.useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/seller/login");
    } else if (status === "authenticated") {
      if ((session.user as any).role !== "SELLER") {
        router.push("/");
      } else {
        fetchReturnDetails();
      }
    }
  }, [status, session, fetchReturnDetails, router]);

  const handleProcessReturn = async (approve: boolean, confirmReceipt?: boolean) => {
    if (!returnRequest) return;
    setActionLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/orders/${returnRequest.orderId}/refund`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemsToRefund: [{ orderItemId: returnRequest.id, approve, confirmReceipt }]
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({
          type: "success",
          text: confirmReceipt
            ? "Receipt confirmed and refund credited to customer wallet."
            : approve
              ? "Return request approved! Sizing pickup initiated."
              : "Return request rejected."
        });
        fetchReturnDetails();
      } else {
        setMessage({ type: "error", text: data.error || "Failed to process return request." });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Server connection failed." });
    } finally {
      setActionLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-brand-cream text-brand-gold font-serif">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-brand-gold border-t-transparent mb-4" />
        <p className="text-sm font-sans tracking-widest uppercase">loading return details...</p>
      </div>
    );
  }

  if (error || !returnRequest) {
    return (
      <div className="min-h-screen bg-brand-cream text-brand-charcoal flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-lg border border-[#E8DFC8] shadow-md max-w-md w-full text-center space-y-4">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto" />
          <h2 className="font-serif text-2xl font-semibold">Error Loading Return</h2>
          <p className="text-xs text-stone-600 font-sans tracking-wide leading-relaxed">
            {error || "Return request details could not be retrieved."}
          </p>
          <button
            onClick={() => router.push("/seller?tab=returns")}
            className="w-full bg-brand-charcoal text-brand-cream py-2.5 rounded text-xs font-bold uppercase tracking-widest hover:bg-opacity-95 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Define status badge styling
  let statusLabel = returnRequest.returnStatus;
  let statusClass = "bg-stone-50 text-stone-700 border-stone-200";
  if (returnRequest.returnStatus === "RETURN_REQUESTED") {
    statusLabel = "Requested (Pending Approval)";
    statusClass = "bg-amber-50 text-amber-800 border-amber-200";
  } else if (returnRequest.returnStatus === "RETURN_APPROVED") {
    statusLabel = "Approved (Pending Pickup)";
    statusClass = "bg-blue-50 text-blue-800 border-blue-200";
  } else if (returnRequest.returnStatus === "RETURNED") {
    statusLabel = "Returned & Refunded";
    statusClass = "bg-emerald-50 text-emerald-800 border-emerald-200";
  } else if (returnRequest.returnStatus === "RETURN_REJECTED") {
    statusLabel = "Rejected";
    statusClass = "bg-red-50 text-red-800 border-red-200";
  }

  return (
    <div className="min-h-screen bg-brand-cream text-brand-charcoal font-sans flex flex-col">
      {/* Header bar */}
      <header className="bg-brand-charcoal text-brand-cream border-b border-stone-800 py-5 px-6 sm:px-10 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push("/seller?tab=returns")}
            className="text-stone-300 hover:text-brand-gold p-1 transition-colors cursor-pointer"
            title="Back to Returns Log"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="font-serif text-lg tracking-widest text-brand-cream lowercase flex items-baseline gap-1">
              vamika <span className="font-serif italic text-brand-gold font-normal">&</span> bhargavi
            </h1>
            <p className="text-[9px] font-sans text-brand-gold font-bold uppercase tracking-widest mt-0.5">
              Merchant Portal
            </p>
          </div>
        </div>

        <button
          onClick={() => router.push("/seller?tab=returns")}
          className="text-xs font-bold uppercase tracking-widest text-brand-gold hover:text-brand-gold-light transition-colors border border-brand-gold/40 px-3 py-1.5 rounded"
        >
          dashboard
        </button>
      </header>

      {/* Main Container */}
      <main className="flex-1 p-6 sm:p-10 max-w-5xl w-full mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-[#E8DFC8] pb-4 gap-4">
          <div>
            <h2 className="font-serif text-3xl font-semibold tracking-wide lowercase">
              return request details
            </h2>
            <p className="font-sans text-xs text-gray-500 uppercase tracking-widest mt-1">
              Order #{returnRequest.orderNumber} • Request Log
            </p>
          </div>

          <button
            onClick={fetchReturnDetails}
            className="self-start sm:self-center text-[10px] font-sans font-bold uppercase tracking-widest text-brand-gold hover:text-brand-gold-light flex items-center gap-1"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh details
          </button>
        </div>

        {message && (
          <div className={`p-4 rounded-md text-xs font-sans tracking-wide ${
            message.type === "success"
              ? "bg-green-50 text-green-800 border-l-4 border-green-600"
              : "bg-red-50 text-red-800 border-l-4 border-red-600"
          }`}>
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column: Return Status & Core Information */}
          <div className="md:col-span-2 space-y-6">
            {/* Customer Details & Pickup Address */}
            <div className="bg-white p-6 rounded-md border border-[#E8DFC8] shadow-xs space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#A08260] border-b border-[#FAF5EC] pb-2 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-brand-gold" /> Customer & Pickup Address
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
                <div>
                  <span className="text-[9px] text-gray-400 block uppercase font-bold tracking-wider">Customer Name</span>
                  <span className="font-semibold text-brand-charcoal text-sm">{returnRequest.customerName}</span>
                </div>

                <div>
                  <span className="text-[9px] text-gray-400 block uppercase font-bold tracking-wider">Contact Phone</span>
                  <span className="font-semibold text-brand-charcoal text-sm flex items-center gap-1">
                    <Phone className="h-3 w-3 text-stone-400" /> {returnRequest.customerPhone}
                  </span>
                </div>

                <div className="sm:col-span-2">
                  <span className="text-[9px] text-gray-400 block uppercase font-bold tracking-wider">Email Address</span>
                  <span className="font-semibold text-brand-charcoal text-sm flex items-center gap-1 normal-case">
                    <Mail className="h-3 w-3 text-stone-400" /> {returnRequest.customerEmail}
                  </span>
                </div>

                <div className="sm:col-span-2 border-t border-[#FAF5EC] pt-3">
                  <span className="text-[9px] text-gray-400 block uppercase font-bold tracking-wider mb-1">Pickup Address</span>
                  <span className="font-semibold text-xs leading-relaxed uppercase text-brand-charcoal bg-[#FAF6F0] p-3 rounded block border border-dashed border-[#E8DFC8]">
                    {returnRequest.shippingAddress}<br />
                    {returnRequest.city}, {returnRequest.state} - {returnRequest.pincode}
                  </span>
                </div>
              </div>
            </div>

            {/* Product Silhouette & Sizing Selection */}
            <div className="bg-white p-6 rounded-md border border-[#E8DFC8] shadow-xs space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#A08260] border-b border-[#FAF5EC] pb-2 flex items-center gap-2">
                <Package className="h-4 w-4 text-brand-gold" /> Product & Stitching Sizing
              </h3>

              <div className="flex flex-col sm:flex-row gap-4 items-start">
                {returnRequest.productImage && (
                  <img
                    src={returnRequest.productImage}
                    alt=""
                    className="h-28 w-20 object-cover rounded border border-[#E8DFC8] bg-brand-cream-dark shadow-xs flex-shrink-0"
                  />
                )}
                <div className="space-y-3 flex-1 text-xs">
                  <h4 className="font-serif text-lg font-bold text-brand-charcoal leading-tight">
                    {returnRequest.productTitle}
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-2 bg-[#FAF6F0] p-3 rounded border border-[#E8DFC8]">
                    {returnRequest.topSize && (
                      <div>
                        <span className="text-[9px] text-gray-400 uppercase font-bold block">Top Size</span>
                        <span className="font-bold text-brand-charcoal">{returnRequest.topSize}</span>
                      </div>
                    )}
                    {returnRequest.bottomSize && (
                      <div>
                        <span className="text-[9px] text-gray-400 uppercase font-bold block">Bottom Size</span>
                        <span className="font-bold text-brand-charcoal">{returnRequest.bottomSize}</span>
                      </div>
                    )}
                    <div className="col-span-2 border-t border-[#E8DFC8] pt-1.5 mt-1">
                      <span className="text-[9px] text-gray-400 uppercase font-bold block">Purchased Price</span>
                      <span className="font-bold text-brand-charcoal">Rs. {returnRequest.priceAtPurchase.toLocaleString("en-IN")}</span>
                    </div>
                  </div>

                  {returnRequest.selectedOptions && returnRequest.selectedOptions !== "{}" && (
                    <div className="text-[11px] text-stone-600 bg-white border border-[#E8DFC8] p-2.5 rounded">
                      <span className="text-[9px] text-gray-400 uppercase font-bold block mb-0.5">Stitching Options Chosen</span>
                      <span className="italic font-medium">{renderSelectedOptions(returnRequest.selectedOptions)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Return Reason & Processing Actions */}
          <div className="space-y-6">
            {/* Status & Processing Actions card */}
            <div className="bg-white p-6 rounded-md border border-[#E8DFC8] shadow-xs space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#A08260] border-b border-[#FAF5EC] pb-2 flex items-center gap-2">
                <Undo2 className="h-4 w-4 text-brand-gold" /> Return Request Status
              </h3>

              <div className="space-y-3">
                <div>
                  <span className="text-[9px] text-gray-400 uppercase font-bold block mb-1">Current Status</span>
                  <span className={`inline-block px-3 py-1 border rounded-full text-xs font-bold tracking-wide uppercase ${statusClass}`}>
                    {statusLabel}
                  </span>
                </div>

                <div className="text-[10px] text-gray-400 space-y-1 pt-1.5 border-t border-[#FAF5EC]">
                  <div className="flex justify-between">
                    <span>Order Date:</span>
                    <span className="font-bold text-stone-600">
                      {new Date(returnRequest.orderDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Return Qty:</span>
                    <span className="font-bold text-stone-600">
                      {returnRequest.returnQuantity} of {returnRequest.quantity} item(s)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Updated:</span>
                    <span className="font-bold text-stone-600">
                      {new Date(returnRequest.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Trigger Buttons */}
              <div className="pt-4 border-t border-[#FAF5EC] space-y-2">
                {returnRequest.returnStatus === "RETURN_REQUESTED" && (
                  <div className="space-y-2">
                    <button
                      onClick={() => handleProcessReturn(true)}
                      disabled={actionLoading}
                      className="w-full bg-brand-charcoal text-brand-cream hover:bg-opacity-90 py-2.5 rounded text-xs font-bold uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                    >
                      <Check className="h-4 w-4 text-emerald-400" /> Approve Return
                    </button>
                    <button
                      onClick={() => handleProcessReturn(false)}
                      disabled={actionLoading}
                      className="w-full bg-transparent border border-red-500 text-red-600 hover:bg-red-50 py-2.5 rounded text-xs font-bold uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <X className="h-4 w-4" /> Reject Return Request
                    </button>
                  </div>
                )}

                {returnRequest.returnStatus === "RETURN_APPROVED" && (
                  <div className="space-y-2">
                    <div className="bg-[#FAF6F0] p-3 rounded border border-brand-gold/30 mb-2 flex items-start gap-1.5 text-[10px] text-stone-600 leading-normal">
                      <Truck className="h-4 w-4 text-brand-gold flex-shrink-0 mt-0.5" />
                      <span>
                        <strong>Stage 2:</strong> Wait for the customer&apos;s product to reach your warehouse. Inspect the item, then click <strong>Confirm & Refund</strong> to credit their wallet.
                      </span>
                    </div>
                    <button
                      onClick={() => handleProcessReturn(true, true)}
                      disabled={actionLoading}
                      className="w-full bg-brand-charcoal text-brand-cream hover:bg-opacity-90 py-2.5 rounded text-xs font-bold uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                    >
                      <Check className="h-4 w-4 text-emerald-400" /> Confirm Receipt & Refund
                    </button>
                    <button
                      onClick={() => handleProcessReturn(false)}
                      disabled={actionLoading}
                      className="w-full bg-transparent border border-red-500 text-red-600 hover:bg-red-50 py-2.5 rounded text-xs font-bold uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <X className="h-4 w-4" /> Reject (Inspection Failed)
                    </button>
                  </div>
                )}

                {returnRequest.returnStatus === "RETURNED" && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded text-[11px] leading-relaxed font-medium">
                    <span className="flex items-center gap-1 font-bold text-[10px] uppercase mb-1">
                      <CheckCircle className="h-4 w-4 text-emerald-600" /> Refund Processed
                    </span>
                    This return request is fully completed. The customer has been refunded to their wallet balance, and product variant inventory was automatically replenished.
                  </div>
                )}

                {returnRequest.returnStatus === "RETURN_REJECTED" && (
                  <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded text-[11px] leading-relaxed font-medium">
                    <span className="flex items-center gap-1 font-bold text-[10px] uppercase mb-1">
                      <X className="h-4 w-4 text-red-600" /> Return Rejected
                    </span>
                    This return request was marked as rejected. No money was refunded, and the order state remains intact.
                  </div>
                )}
              </div>
            </div>

            {/* Return Reason Card */}
            <div className="bg-white p-6 rounded-md border border-[#E8DFC8] shadow-xs space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#A08260] border-b border-[#FAF5EC] pb-2">
                Reason for Return
              </h3>
              <div className="bg-[#FAF6F0] p-4 rounded border border-[#E8DFC8] text-xs font-sans text-stone-700 italic leading-relaxed whitespace-normal break-words">
                &ldquo;{returnRequest.returnReason || "No explanation provided."}&rdquo;
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer copyright */}
      <footer className="bg-brand-charcoal text-[#A08260] text-[10px] tracking-wider uppercase text-center py-4 mt-auto border-t border-stone-800">
        © {new Date().getFullYear()} Vamika & Bhargavi Apparel. All rights reserved.
      </footer>
    </div>
  );
}
