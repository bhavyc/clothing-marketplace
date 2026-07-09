"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldAlert,
  Users,
  Percent,
  TrendingUp,
  UserCheck,
  Plus,
  Power,
  Trash2,
  LogOut,
  Landmark,
  Undo2,
  Check,
  X,
  RefreshCw,
  ShoppingBag,
  Wallet,
  BarChart3,
  MessageSquare,
  MapPin,
  Calendar,
  Mail,
  Phone,
  Search
} from "lucide-react";
import { signOut } from "next-auth/react";

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

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"overview" | "sellers" | "coupons" | "products" | "orders" | "returns" | "transactions" | "sales" | "campaigns" | "users">("overview");
  const [users, setUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersPage, setUsersPage] = useState(1);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [returns, setReturns] = useState<any[]>([]);
  const [returnsLoading, setReturnsLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  // WhatsApp Campaigns States
  const [campaignsList, setCampaignsList] = useState<any[]>([]);
  const [campaignsLoading, setCampaignsLoading] = useState(false);
  const [campaignsPage, setCampaignsPage] = useState(1);
  const [couponDispatches, setCouponDispatches] = useState<any[]>([]);
  const [optOutPhone, setOptOutPhone] = useState("");
  const [campaignName, setCampaignName] = useState("");
  const [campaignBannerUrl, setCampaignBannerUrl] = useState("");
  const [campaignCaptionText, setCampaignCaptionText] = useState("");
  const [campaignCouponCode, setCampaignCouponCode] = useState("");
  const [campaignSegmentTag, setCampaignSegmentTag] = useState("ABANDONED_CART");

  // Orders State
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [trackingCompany, setTrackingCompany] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");

  // Pagination States
  const [sellersPage, setSellersPage] = useState(1);
  const [productsPage, setProductsPage] = useState(1);
  const [couponsPage, setCouponsPage] = useState(1);
  const [transactionsPage, setTransactionsPage] = useState(1);
  const [salesPage, setSalesPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  // Dashboard Data
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    commissionEarned: 0,
    pendingSellers: 0,
    activeCoupons: 0,
  });
  const [sellers, setSellers] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  // Coupon Form State
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [discountPercent, setDiscountPercent] = useState("0");
  const [discountAmount, setDiscountAmount] = useState("0");
  const [minOrderValue, setMinOrderValue] = useState("0");
  const [isPrepaidOnly, setIsPrepaidOnly] = useState(true);

  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchDashboardData = async () => {
    if (!session?.user || (session.user as any).role !== "ADMIN") return;
    try {
      setLoading(true);
      const res = await fetch("/api/admin/dashboard");
      const data = await res.json();
      if (res.ok) {
        setStats(data.stats);
        setSellers(data.sellers || []);
        setCoupons(data.coupons || []);
        setProducts(data.products || []);
        setSellersPage(1);
        setProductsPage(1);
        setCouponsPage(1);
      }
    } catch (e) {
      console.error("Failed to load admin dashboard data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login");
    } else if (status === "authenticated") {
      if ((session.user as any).role !== "ADMIN") {
        router.push("/");
      } else {
        fetchDashboardData();
      }
    }
  }, [status, session]);

  // Fetch returns
  const fetchReturns = async () => {
    if (!session?.user || (session.user as any).role !== "ADMIN") return;
    try {
      setReturnsLoading(true);
      const res = await fetch("/api/admin/returns");
      const data = await res.json();
      if (res.ok) {
        setReturns(data.returns || []);
      }
    } catch (e) {
      console.error("Failed to load admin returns:", e);
    } finally {
      setReturnsLoading(false);
    }
  };

  // Fetch boutique orders for Admin
  const fetchOrders = async () => {
    if (!session?.user || (session.user as any).role !== "ADMIN") return;
    try {
      setOrdersLoading(true);
      const res = await fetch("/api/admin/orders");
      const data = await res.json();
      if (res.ok) {
        setOrders(data.orders || []);
      }
    } catch (e) {
      console.error("Error loading admin orders:", e);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: string, status: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (res.ok) {
        fetchOrders();
      } else {
        alert(data.error || "Failed to update order status.");
      }
    } catch (e) {
      console.error("Error updating status:", e);
      alert("A network error occurred.");
    }
  };

  const handleUpdateStatusSubmit = async (orderId: string, status: string) => {
    if (!trackingCompany.trim() || !trackingNumber.trim()) {
      alert("Please provide both Courier Company and Tracking Code.");
      return;
    }
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          trackingCompany: trackingCompany.trim(),
          trackingNumber: trackingNumber.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setUpdatingOrderId(null);
        setTrackingCompany("");
        setTrackingNumber("");
        fetchOrders();
      } else {
        alert(data.error || "Failed to update order status.");
      }
    } catch (e) {
      console.error("Error updating status:", e);
      alert("A network error occurred.");
    }
  };

  const fetchUsers = async () => {
    if (!session?.user || (session.user as any).role !== "ADMIN") return;
    try {
      setUsersLoading(true);
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (res.ok) {
        setUsers(data.users || []);
        setUsersPage(1);
      } else {
        alert(data.error || "Failed to load users.");
      }
    } catch (e) {
      console.error("Error loading users:", e);
    } finally {
      setUsersLoading(false);
    }
  };

  const downloadCheckoutDetailsCSV = async () => {
    setActionLoading(true);
    try {
      let ordersToExport = orders;
      if (ordersToExport.length === 0) {
        const res = await fetch("/api/admin/orders");
        const data = await res.json();
        if (res.ok) {
          ordersToExport = data.orders || [];
        } else {
          alert(data.error || "Failed to fetch checkout details for export.");
          return;
        }
      }
      
      if (ordersToExport.length === 0) {
        alert("No checkout details/orders available to download.");
        return;
      }

      // Define CSV headers
      const headers = [
        "Order Number",
        "Customer Name",
        "Customer Email",
        "Customer Phone",
        "Shipping Address",
        "City",
        "State",
        "Pincode",
        "Payment Type",
        "Payment Status",
        "Total Amount (Rs.)",
        "Wallet Paid (Rs.)",
        "Coupon Used",
        "Order Status",
        "Order Date"
      ];

      const escapeCSV = (val: any) => {
        if (val === null || val === undefined) return "";
        let str = String(val).replace(/"/g, '""');
        if (str.includes(",") || str.includes("\n") || str.includes("\r") || str.includes('"')) {
          str = `"${str}"`;
        }
        return str;
      };

      const rows = ordersToExport.map((ord) => [
        ord.orderNumber,
        ord.customerName,
        ord.customerEmail,
        ord.customerPhone,
        ord.shippingAddress,
        ord.city,
        ord.state,
        ord.pincode,
        ord.paymentType,
        ord.paymentStatus,
        ord.totalAmount,
        ord.walletPaid,
        ord.couponUsed || "None",
        ord.status,
        new Date(ord.createdAt).toLocaleString()
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map((row) => row.map(escapeCSV).join(","))
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `checkout_details_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Error exporting checkout details:", err);
      alert("An error occurred during export.");
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "users") {
      fetchUsers();
    } else if (activeTab === "returns") {
      fetchReturns();
    } else if (activeTab === "orders" || activeTab === "transactions" || activeTab === "sales") {
      fetchOrders();
    } else if (activeTab === "campaigns") {
      fetchCampaigns();
    }
  }, [activeTab, session]);

  if (status === "loading" || loading && sellers.length === 0 && coupons.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-cream text-brand-gold font-serif">
        loading admin control panel...
      </div>
    );
  }

  // Action: Approve Seller Profile
  const handleApproveSeller = async (sellerId: string) => {
    setActionLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "APPROVE_SELLER", sellerId }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: "Seller merchant profile successfully approved." });
        fetchDashboardData();
      } else {
        setMessage({ type: "error", text: data.error || "Failed to approve seller." });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Server connection failed." });
    } finally {
      setActionLoading(false);
    }
  };

  // Action: Create Promo Coupon
  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setMessage(null);

    if (!code) {
      setMessage({ type: "error", text: "Coupon code is required." });
      setActionLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "CREATE_COUPON",
          code: code.toUpperCase(),
          description,
          discountPercent: parseFloat(discountPercent) || 0,
          discountAmount: parseFloat(discountAmount) || 0,
          minOrderValue: parseFloat(minOrderValue) || 0,
          isPrepaidOnly,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: `Coupon ${code} created successfully.` });
        setCode("");
        setDescription("");
        setDiscountPercent("0");
        setDiscountAmount("0");
        setMinOrderValue("0");
        fetchDashboardData();
      } else {
        setMessage({ type: "error", text: data.error || "Failed to create coupon." });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Server connection failed." });
    } finally {
      setActionLoading(false);
    }
  };

  // Action: Toggle Coupon status
  const handleToggleCoupon = async (couponId: string) => {
    setActionLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "TOGGLE_COUPON", couponId }),
      });
      if (res.ok) {
        setMessage({ type: "success", text: "Coupon status updated." });
        fetchDashboardData();
      } else {
        setMessage({ type: "error", text: "Failed to update coupon status." });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Server connection failed." });
    } finally {
      setActionLoading(false);
    }
  };

  // Action: Delete Coupon permanently
  const handleDeleteCoupon = async (couponId: string) => {
    if (!confirm("Are you sure you want to permanently delete this coupon code? This action cannot be undone.")) {
      return;
    }
    setActionLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "DELETE_COUPON", couponId }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: "Coupon deleted permanently." });
        fetchDashboardData();
      } else {
        setMessage({ type: "error", text: data.error || "Failed to delete coupon." });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Server connection failed." });
    } finally {
      setActionLoading(false);
    }
  };

  // WhatsApp Campaign Actions
  const fetchCampaigns = async () => {
    setCampaignsLoading(true);
    try {
      const res = await fetch("/api/admin/campaigns");
      const data = await res.json();
      if (res.ok) {
        setCampaignsList(data.campaigns);
        setCouponDispatches(data.dispatches || []);
      }
    } catch (e) {
      console.error("Error fetching campaigns:", e);
    } finally {
      setCampaignsLoading(false);
    }
  };

  const handleSimulateOptOut = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!optOutPhone) return;
    setActionLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/webhooks/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: optOutPhone,
          messageText: "STOP",
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: `Phone number ${optOutPhone} unsubscribed successfully!` });
        setOptOutPhone("");
        fetchDashboardData();
        fetchCampaigns();
      } else {
        setMessage({ type: "error", text: data.error || "Failed to process opt-out." });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Webhook trigger connection failed." });
    } finally {
      setActionLoading(false);
    }
  };

  const handleTriggerReminderCron = async () => {
    setActionLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/campaigns/reminder-cron", {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: data.message || "Cron job processed successfully!" });
        fetchCampaigns();
      } else {
        setMessage({ type: "error", text: data.error || "Failed to trigger cron job." });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Cron execution connection failed." });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: campaignName,
          bannerUrl: campaignBannerUrl,
          captionText: campaignCaptionText,
          couponCode: campaignCouponCode,
          segmentTag: campaignSegmentTag,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: "Campaign created successfully!" });
        setCampaignName("");
        setCampaignBannerUrl("");
        setCampaignCaptionText("");
        setCampaignCouponCode("");
        setCampaignSegmentTag("ALL");
        fetchCampaigns();
      } else {
        setMessage({ type: "error", text: data.error || "Failed to create campaign." });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Server connection failed." });
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendCampaign = async (campaignId: string) => {
    setActionLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/campaigns/${campaignId}/send`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: data.message || "Campaign dispatched!" });
        fetchCampaigns();
      } else {
        setMessage({ type: "error", text: data.error || "Failed to dispatch campaign." });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Server connection failed." });
    } finally {
      setActionLoading(false);
    }
  };

  const handleSimulateMetaReview = async (campaignId: string, action: "APPROVE" | "REJECT") => {
    setActionLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/campaigns/${campaignId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: `Meta template review completed: ${action}!` });
        fetchCampaigns();
      } else {
        setMessage({ type: "error", text: data.error || "Failed to submit review." });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Review connection failed." });
    } finally {
      setActionLoading(false);
    }
  };

  // Action: Toggle Product Bestseller Status
  const handleToggleBestseller = async (productId: string) => {
    setActionLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "TOGGLE_BESTSELLER", productId }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: "Product bestseller status successfully toggled." });
        fetchDashboardData();
      } else {
        setMessage({ type: "error", text: data.error || "Failed to toggle bestseller status." });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Server connection failed." });
    } finally {
      setActionLoading(false);
    }
  };

  // Action: Process Return Request (Approve/Reject)
  const handleProcessReturn = async (orderId: string, orderItemId: string, approve: boolean, confirmReceipt?: boolean) => {
    setActionLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/refund`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemsToRefund: [{ orderItemId, approve, confirmReceipt }]
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({
          type: "success",
          text: approve 
            ? (confirmReceipt ? "Receipt confirmed and customer refunded!" : "Return approved! The item pickup is scheduled.")
            : "Return request rejected."
        });
        fetchReturns();
      } else {
        setMessage({ type: "error", text: data.error || "Failed to process return." });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Server connection failed." });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-cream text-brand-charcoal font-sans flex flex-col md:flex-row">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 bg-stone-900 text-brand-cream p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-stone-950">
        <div className="space-y-8">
          <div className="text-left border-b border-stone-850 pb-5">
            <h1 className="font-serif text-lg tracking-widest text-[#FAF6F0] lowercase flex items-baseline gap-1">
              vamika <span className="font-serif italic text-brand-gold font-normal">&</span> bhargavi
            </h1>
            <p className="text-[9px] font-sans text-brand-gold font-bold uppercase tracking-widest mt-1">
              Control Panel
            </p>
          </div>

          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab("overview")}
              className={`w-full flex items-center px-4 py-3 rounded text-xs font-bold uppercase tracking-widest transition-all ${
                activeTab === "overview"
                  ? "bg-brand-gold text-brand-cream"
                  : "text-stone-300 hover:bg-stone-800 hover:text-white"
              }`}
            >
              <TrendingUp className="h-4 w-4 mr-3" />
              Metrics & Stats
            </button>
            {/* <button
              onClick={() => setActiveTab("sellers")}
              className={`w-full flex items-center px-4 py-3 rounded text-xs font-bold uppercase tracking-widest transition-all ${
                activeTab === "sellers"
                  ? "bg-brand-gold text-brand-cream"
                  : "text-stone-300 hover:bg-stone-800 hover:text-white"
              }`}
            >
              <Users className="h-4 w-4 mr-3" />
              Sellers Review
              {stats.pendingSellers > 0 && (
                <span className="ml-auto bg-brand-gold text-stone-900 font-sans text-[9px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                  {stats.pendingSellers}
                </span>
              )}
            </button> */}
            <button
              onClick={() => setActiveTab("products")}
              className={`w-full flex items-center px-4 py-3 rounded text-xs font-bold uppercase tracking-widest transition-all ${
                activeTab === "products"
                  ? "bg-brand-gold text-brand-cream"
                  : "text-stone-300 hover:bg-stone-800 hover:text-white"
              }`}
            >
              <TrendingUp className="h-4 w-4 mr-3" />
              Manage Products
            </button>
            <button
              onClick={() => setActiveTab("coupons")}
              className={`w-full flex items-center px-4 py-3 rounded text-xs font-bold uppercase tracking-widest transition-all ${
                activeTab === "coupons"
                  ? "bg-brand-gold text-brand-cream"
                  : "text-stone-300 hover:bg-stone-800 hover:text-white"
              }`}
            >
              <Percent className="h-4 w-4 mr-3" />
              Promo Coupons
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`w-full flex items-center px-4 py-3 rounded text-xs font-bold uppercase tracking-widest transition-all ${
                activeTab === "orders"
                  ? "bg-brand-gold text-brand-cream"
                  : "text-stone-300 hover:bg-stone-800 hover:text-white"
              }`}
            >
              <ShoppingBag className="h-4 w-4 mr-3" />
              Boutique Orders
            </button>
            <button
              onClick={() => setActiveTab("transactions")}
              className={`w-full flex items-center px-4 py-3 rounded text-xs font-bold uppercase tracking-widest transition-all ${
                activeTab === "transactions"
                  ? "bg-brand-gold text-brand-cream"
                  : "text-stone-300 hover:bg-stone-800 hover:text-white"
              }`}
            >
              <Wallet className="h-4 w-4 mr-3" />
              Transactions Ledger
            </button>
            <button
              onClick={() => setActiveTab("sales")}
              className={`w-full flex items-center px-4 py-3 rounded text-xs font-bold uppercase tracking-widest transition-all ${
                activeTab === "sales"
                  ? "bg-brand-gold text-brand-cream"
                  : "text-stone-300 hover:bg-stone-800 hover:text-white"
              }`}
            >
              <BarChart3 className="h-4 w-4 mr-3" />
              Sales Analytics
            </button>
            <button
              onClick={() => setActiveTab("returns")}
              className={`w-full flex items-center px-4 py-3 rounded text-xs font-bold uppercase tracking-widest transition-all ${
                activeTab === "returns"
                  ? "bg-brand-gold text-brand-cream"
                  : "text-stone-300 hover:bg-stone-800 hover:text-white"
              }`}
            >
              <Undo2 className="h-4 w-4 mr-3" />
              Return Requests
            </button>
            <button
              onClick={() => setActiveTab("campaigns")}
              className={`w-full flex items-center px-4 py-3 rounded text-xs font-bold uppercase tracking-widest transition-all ${
                activeTab === "campaigns"
                  ? "bg-brand-gold text-brand-cream"
                  : "text-stone-300 hover:bg-stone-800 hover:text-white"
              }`}
            >
              <MessageSquare className="h-4 w-4 mr-3" />
              WhatsApp Campaigns
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`w-full flex items-center px-4 py-3 rounded text-xs font-bold uppercase tracking-widest transition-all ${
                activeTab === "users"
                  ? "bg-brand-gold text-brand-cream"
                  : "text-stone-300 hover:bg-stone-800 hover:text-white"
              }`}
            >
              <Users className="h-4 w-4 mr-3" />
              Manage Users
            </button>
          </nav>
        </div>

        <div className="pt-6 border-t border-stone-850 mt-8 md:mt-0">
          <p className="text-[10px] text-gray-500 font-sans tracking-wide uppercase truncate">
            Admin: {session?.user?.email}
          </p>
          <button
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="flex items-center text-xs font-bold uppercase tracking-widest text-red-400 hover:text-red-300 transition-colors mt-3 w-full"
          >
            <LogOut className="h-4 w-4 mr-3" />
            Exit Panel
          </button>
        </div>
      </aside>

      {/* Admin Panel Body */}
      <main className="flex-1 p-6 sm:p-10 max-w-5xl overflow-y-auto">
        {message && (
          <div className={`mb-6 p-4 rounded-md text-xs font-sans tracking-wide ${
            message.type === "success" 
              ? "bg-green-50 text-green-800 border-l-4 border-green-600" 
              : "bg-red-50 text-red-800 border-l-4 border-red-600"
          }`}>
            {message.text}
          </div>
        )}

        {/* Tab 1: Overview stats */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            <div className="border-b border-[#E8DFC8] pb-4">
              <h2 className="font-serif text-3xl font-semibold tracking-wide lowercase">
                platform analytics
              </h2>
              <p className="font-sans text-xs text-gray-500 uppercase tracking-widest mt-1">
                Overview of total transaction volumes, orders count, and commissions ledger
              </p>
            </div>

            {/* Metrics cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-md border border-[#E8DFC8] shadow-sm">
                <p className="text-[10px] font-sans text-gray-400 uppercase tracking-widest">Total Sales Volume</p>
                <p className="text-xl font-bold font-sans text-brand-charcoal mt-1">Rs. {stats.totalSales.toLocaleString()}</p>
              </div>

              <div className="bg-white p-6 rounded-md border border-[#E8DFC8] shadow-sm">
                <p className="text-[10px] font-sans text-gray-400 uppercase tracking-widest">Total Orders</p>
                <p className="text-xl font-bold font-sans text-brand-charcoal mt-1">{stats.totalOrders} checkouts</p>
              </div>

              <div className="bg-white p-6 rounded-md border border-[#E8DFC8] shadow-sm">
                <p className="text-[10px] font-sans text-gray-400 uppercase tracking-widest">Listed Silhouettes</p>
                <p className="text-xl font-bold font-sans text-brand-charcoal mt-1">{products.length} designs</p>
              </div>

              <div className="bg-white p-6 rounded-md border border-[#E8DFC8] shadow-sm">
                <p className="text-[10px] font-sans text-gray-400 uppercase tracking-widest">Active Coupons</p>
                <p className="text-xl font-bold font-sans text-brand-gold mt-1">{stats.activeCoupons} promos</p>
              </div>
            </div>

            {/* Sales Trend Chart */}
            <div className="bg-white p-6 rounded-md border border-[#E8DFC8] shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-[#FAF5EC] pb-4">
                <div>
                  <h3 className="font-serif text-base font-bold text-brand-charcoal lowercase tracking-wide">
                    weekly performance trend
                  </h3>
                  <p className="text-[10px] text-gray-400 font-sans uppercase tracking-widest mt-0.5">
                    sales volume and checkout activity over the last 7 days
                  </p>
                </div>
                <div className="flex items-center space-x-4 text-[10px] font-sans font-bold uppercase tracking-wider">
                  <div className="flex items-center">
                    <span className="h-2.5 w-2.5 rounded-full bg-brand-gold mr-1.5" />
                    <span>Revenue Trend</span>
                  </div>
                </div>
              </div>

              {/* Responsive SVG Chart */}
              <div className="relative w-full h-64 bg-[#FDFBF7] rounded border border-[#FAF5EC] p-4 flex flex-col justify-between">
                <div className="absolute inset-0 p-4 flex flex-col justify-between pointer-events-none">
                  {/* Grid Lines */}
                  <div className="w-full border-t border-[#FAF5EC]/80 h-0" />
                  <div className="w-full border-t border-[#FAF5EC]/80 h-0" />
                  <div className="w-full border-t border-[#FAF5EC]/80 h-0" />
                  <div className="w-full border-t border-[#FAF5EC]/80 h-0" />
                  <div className="w-full h-0" />
                </div>

                <div className="relative w-full h-48 z-10">
                  <svg className="w-full h-full" viewBox="0 0 700 200" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#A08260" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#A08260" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    
                    {/* Area path */}
                    <path
                      d="M 50 180 C 130 160, 170 120, 250 140 C 330 160, 370 70, 450 90 C 530 110, 570 50, 650 30 L 650 180 Z"
                      fill="url(#chartGrad)"
                    />
                    
                    {/* Stroke path */}
                    <path
                      d="M 50 180 C 130 160, 170 120, 250 140 C 330 160, 370 70, 450 90 C 530 110, 570 50, 650 30"
                      fill="none"
                      stroke="#A08260"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />

                    {/* Data Points */}
                    <circle cx="50" cy="180" r="4" fill="#1C1917" stroke="#A08260" strokeWidth="2" />
                    <circle cx="250" cy="140" r="4" fill="#1C1917" stroke="#A08260" strokeWidth="2" />
                    <circle cx="450" cy="90" r="4" fill="#1C1917" stroke="#A08260" strokeWidth="2" />
                    <circle cx="650" cy="30" r="4" fill="#1C1917" stroke="#A08260" strokeWidth="2" />
                  </svg>
                </div>

                {/* X-Axis labels */}
                <div className="flex justify-between text-[9px] font-sans font-bold uppercase tracking-wider text-stone-400 mt-2 px-6">
                  <span>Monday</span>
                  <span>Tuesday</span>
                  <span>Wednesday</span>
                  <span>Thursday</span>
                  <span>Friday</span>
                  <span>Saturday</span>
                  <span>Sunday</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Sellers review list */}
        {activeTab === "sellers" && (
          <div className="space-y-8">
            <div className="border-b border-[#E8DFC8] pb-4">
              <h2 className="font-serif text-3xl font-semibold tracking-wide lowercase">
                seller partner verification
              </h2>
              <p className="font-sans text-xs text-gray-500 uppercase tracking-widest mt-1">
                Review bank details, merchant store credentials and grant approval
              </p>
            </div>

            <div className="bg-white rounded-md border border-[#E8DFC8] overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-[#E8DFC8] bg-[#FAF6F0]">
                <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-brand-charcoal">
                  registration queue
                </h3>
              </div>

              {sellers.length === 0 ? (
                <div className="p-12 text-center">
                  <UserCheck className="h-10 w-10 text-[#E8DFC8] mx-auto mb-3" />
                  <p className="font-serif text-base text-stone-600">No merchant applications found.</p>
                  <p className="font-sans text-[11px] text-gray-400 mt-1 uppercase tracking-wide">
                    All seller accounts are currently verified or inactive.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-[#FAF5EC]">
                  {(() => {
                    const totalSellersPages = Math.ceil(sellers.length / ITEMS_PER_PAGE);
                    const paginatedSellers = sellers.slice(
                      (sellersPage - 1) * ITEMS_PER_PAGE,
                      sellersPage * ITEMS_PER_PAGE
                    );
                    return (
                      <>
                        {paginatedSellers.map((s) => (
                          <div key={s.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:bg-[#FAF6F0]/20 transition-colors">
                            <div className="space-y-3">
                              <div>
                                <h4 className="font-serif text-base font-semibold text-brand-charcoal">{s.shopName}</h4>
                                <p className="text-[10px] text-brand-gold uppercase tracking-wider font-sans mt-0.5">
                                  Email: {s.user?.email}
                                </p>
                              </div>
                              <p className="text-xs text-stone-500 font-sans tracking-wide uppercase leading-relaxed">
                                {s.description || "No shop description provided."}
                              </p>

                              {/* Banking Info Box */}
                              <div className="inline-flex flex-wrap gap-x-4 gap-y-1 bg-[#FAF6F0] p-2.5 rounded border border-[#E8DFC8] text-[10px] font-sans text-stone-600 uppercase tracking-wider">
                                <span className="flex items-center"><Landmark className="h-3 w-3 mr-1.5 text-[#A59578]" /> Bank: {s.bankName || "N/A"}</span>
                                <span>Account: {s.bankAccount || "N/A"}</span>
                                <span>IFSC: {s.bankIfsc || "N/A"}</span>
                              </div>
                            </div>

                            <div className="flex-shrink-0 flex items-center space-x-2">
                              {s.isApproved ? (
                                <span className="bg-emerald-50 text-emerald-700 font-sans text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded border border-emerald-200">
                                  Verified
                                </span>
                              ) : (
                                <button
                                  onClick={() => handleApproveSeller(s.id)}
                                  disabled={actionLoading}
                                  className="bg-brand-charcoal text-brand-cream py-2.5 px-5 rounded text-xs font-sans font-bold uppercase tracking-widest hover:bg-brand-gold transition-all shadow-sm cursor-pointer"
                                >
                                  Approve & Verify
                                </button>
                              )}
                            </div>
                          </div>
                        ))}

                        {totalSellersPages > 1 && (
                          <div className="flex justify-center items-center space-x-2 border-t border-[#FAF5EC] py-4 bg-[#FAF6F0]/20">
                            <button
                              type="button"
                              onClick={() => setSellersPage((p) => Math.max(1, p - 1))}
                              disabled={sellersPage <= 1}
                              className={`px-3 py-1.5 border border-[#E8DFC8] rounded-md text-[10px] font-sans font-bold uppercase tracking-widest transition-all ${
                                sellersPage <= 1
                                  ? "opacity-45 cursor-not-allowed bg-[#FAF6F0] text-gray-400"
                                  : "bg-white text-brand-charcoal hover:border-brand-gold hover:text-brand-gold shadow-xs"
                              }`}
                            >
                              Prev
                            </button>
                            <span className="text-[10px] font-sans text-gray-500 font-bold uppercase tracking-widest px-3">
                              Page {sellersPage} of {totalSellersPages}
                            </span>
                            <button
                              type="button"
                              onClick={() => setSellersPage((p) => Math.min(totalSellersPages, p + 1))}
                              disabled={sellersPage >= totalSellersPages}
                              className={`px-3 py-1.5 border border-[#E8DFC8] rounded-md text-[10px] font-sans font-bold uppercase tracking-widest transition-all ${
                                sellersPage >= totalSellersPages
                                  ? "opacity-45 cursor-not-allowed bg-[#FAF6F0] text-gray-400"
                                  : "bg-white text-brand-charcoal hover:border-brand-gold hover:text-brand-gold shadow-xs"
                              }`}
                            >
                              Next
                            </button>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Coupons creation and management */}
        {activeTab === "coupons" && (
          <div className="space-y-8">
            <div className="border-b border-[#E8DFC8] pb-4">
              <h2 className="font-serif text-3xl font-semibold tracking-wide lowercase">
                promo coupon codes
              </h2>
              <p className="font-sans text-xs text-gray-500 uppercase tracking-widest mt-1">
                Configure discount rates, minimum cart limits, and prepaid eligibility rules
              </p>
            </div>

            {/* Grid Form and List */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Form creation */}
              <div className="lg:col-span-5 bg-white p-6 rounded-md border border-[#E8DFC8] shadow-sm space-y-4">
                <h3 className="font-serif text-base font-semibold border-b border-[#E8DFC8] pb-2 lowercase tracking-wide">
                  create new code
                </h3>

                <form onSubmit={handleCreateCoupon} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-sans font-bold uppercase tracking-widest text-brand-charcoal">
                      Coupon Code
                    </label>
                    <input
                      type="text"
                      required
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="mt-1 block w-full rounded-md border border-[#E8DFC8] py-2 px-3 text-xs bg-white text-brand-charcoal focus:outline-none focus:border-brand-gold uppercase font-sans placeholder:normal-case"
                      placeholder="e.g. PAY5"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-sans font-bold uppercase tracking-widest text-brand-charcoal">
                      Description
                    </label>
                    <input
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="mt-1 block w-full rounded-md border border-[#E8DFC8] py-2 px-3 text-xs bg-white text-brand-charcoal focus:outline-none focus:border-brand-gold font-sans"
                      placeholder="e.g. 5% Prepaid Checkout Discount"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-sans font-bold uppercase tracking-widest text-brand-charcoal">
                        Discount (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={discountPercent}
                        onChange={(e) => setDiscountPercent(e.target.value)}
                        className="mt-1 block w-full rounded-md border border-[#E8DFC8] py-2 px-3 text-xs bg-white text-brand-charcoal focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-sans font-bold uppercase tracking-widest text-brand-charcoal">
                        Flat Discount (Rs.)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={discountAmount}
                        onChange={(e) => setDiscountAmount(e.target.value)}
                        className="mt-1 block w-full rounded-md border border-[#E8DFC8] py-2 px-3 text-xs bg-white text-brand-charcoal focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-sans font-bold uppercase tracking-widest text-brand-charcoal">
                      Min Order Value (Rs.)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={minOrderValue}
                      onChange={(e) => setMinOrderValue(e.target.value)}
                      className="mt-1 block w-full rounded-md border border-[#E8DFC8] py-2 px-3 text-xs bg-white text-brand-charcoal focus:outline-none"
                    />
                  </div>

                  <label className="flex items-center mt-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isPrepaidOnly}
                      onChange={(e) => setIsPrepaidOnly(e.target.checked)}
                      className="rounded border-[#E8DFC8] text-brand-gold focus:ring-brand-gold h-4 w-4"
                    />
                    <span className="ml-2 text-xs font-sans text-brand-charcoal uppercase tracking-wider">
                      Prepaid Orders Only (e.g. for PAY5)
                    </span>
                  </label>

                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="w-full flex justify-center items-center bg-brand-charcoal hover:bg-brand-gold text-brand-cream py-3 px-4 rounded text-xs font-sans uppercase font-bold tracking-widest transition-all cursor-pointer"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Save Coupon Code
                  </button>
                </form>
              </div>

              {/* Coupon list */}
              <div className="lg:col-span-7 bg-white rounded-md border border-[#E8DFC8] overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-[#E8DFC8] bg-[#FAF6F0]">
                  <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-brand-charcoal">
                    active campaigns
                  </h3>
                </div>

                {coupons.length === 0 ? (
                  <div className="p-8 text-center text-gray-400 font-sans text-xs uppercase tracking-wider">
                    No promo codes created yet.
                  </div>
                ) : (
                  <div className="divide-y divide-[#FAF5EC]">
                    {(() => {
                      const totalCouponsPages = Math.ceil(coupons.length / ITEMS_PER_PAGE);
                      const paginatedCoupons = coupons.slice(
                        (couponsPage - 1) * ITEMS_PER_PAGE,
                        couponsPage * ITEMS_PER_PAGE
                      );
                      return (
                        <>
                          {paginatedCoupons.map((c) => (
                            <div key={c.id} className="p-4 flex items-center justify-between hover:bg-[#FAF6F0]/20 transition-colors">
                              <div>
                                <div className="flex items-center">
                                  <span className="font-sans text-xs font-bold text-brand-charcoal uppercase bg-stone-100 px-1.5 py-0.5 rounded border border-[#E8DFC8]">
                                    {c.code}
                                  </span>
                                  <span className="ml-2 font-sans text-[10px] text-stone-400 uppercase tracking-widest">
                                    {c.discountPercent > 0 ? `${c.discountPercent}% Off` : `Rs. ${c.discountAmount} Off`}
                                  </span>
                                  {c.isActive ? (
                                    <span className="ml-2 bg-emerald-50 text-emerald-700 font-sans text-[8.5px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded border border-emerald-200">
                                      Active
                                    </span>
                                  ) : (
                                    <span className="ml-2 bg-stone-100 text-stone-500 font-sans text-[8.5px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded border border-stone-300">
                                      Inactive / Off
                                    </span>
                                  )}
                                  {c.isPrepaidOnly && (
                                    <span className="ml-2 bg-amber-50 text-amber-700 font-sans text-[8.5px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded border border-amber-200">
                                      Prepaid Only
                                    </span>
                                  )}
                                </div>
                                <p className="text-[10px] text-gray-500 font-sans tracking-wide uppercase mt-1">
                                  {c.description || "Promo code active."}
                                </p>
                                <p className="text-[9px] text-gray-400 font-sans mt-0.5 uppercase tracking-widest">
                                  Min Order Value: Rs. {c.minOrderValue}
                                </p>
                              </div>

                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleToggleCoupon(c.id)}
                                  className={`p-1.5 rounded transition-all cursor-pointer ${
                                    c.isActive
                                      ? "text-emerald-600 hover:bg-emerald-50"
                                      : "text-gray-400 hover:bg-gray-100"
                                  }`}
                                  title="Toggle active status"
                                >
                                  <Power className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteCoupon(c.id)}
                                  className="p-1.5 rounded transition-all cursor-pointer text-red-600 hover:bg-red-50"
                                  title="Delete Coupon Permanently"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          ))}

                          {totalCouponsPages > 1 && (
                            <div className="flex justify-center items-center space-x-2 border-t border-[#FAF5EC] py-4 bg-[#FAF6F0]/20">
                              <button
                                type="button"
                                onClick={() => setCouponsPage((p) => Math.max(1, p - 1))}
                                disabled={couponsPage <= 1}
                                className={`px-3 py-1.5 border border-[#E8DFC8] rounded-md text-[10px] font-sans font-bold uppercase tracking-widest transition-all ${
                                  couponsPage <= 1
                                    ? "opacity-45 cursor-not-allowed bg-[#FAF6F0] text-gray-400"
                                    : "bg-white text-brand-charcoal hover:border-brand-gold hover:text-brand-gold shadow-xs"
                                }`}
                              >
                                Prev
                              </button>
                              <span className="text-[10px] font-sans text-gray-500 font-bold uppercase tracking-widest px-3">
                                Page {couponsPage} of {totalCouponsPages}
                              </span>
                              <button
                                type="button"
                                onClick={() => setCouponsPage((p) => Math.min(totalCouponsPages, p + 1))}
                                disabled={couponsPage >= totalCouponsPages}
                                className={`px-3 py-1.5 border border-[#E8DFC8] rounded-md text-[10px] font-sans font-bold uppercase tracking-widest transition-all ${
                                  couponsPage >= totalCouponsPages
                                    ? "opacity-45 cursor-not-allowed bg-[#FAF6F0] text-gray-400"
                                    : "bg-white text-brand-charcoal hover:border-brand-gold hover:text-brand-gold shadow-xs"
                                }`}
                              >
                                Next
                              </button>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* Tab 4: Products and bestseller management */}
        {activeTab === "products" && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <div className="border-b border-[#E8DFC8] pb-4">
              <h2 className="font-serif text-3xl font-semibold tracking-wide lowercase">
                manage listed silhouettes
              </h2>
              <p className="font-sans text-xs text-gray-500 uppercase tracking-widest mt-1">
                Toggle products to bestsellers to showcase them prominently on the landing page
              </p>
            </div>

            <div className="bg-white rounded-md border border-[#E8DFC8] overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-[#E8DFC8] bg-[#FAF6F0]">
                <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-brand-charcoal">
                  Platform Inventory & Best Sellers
                </h3>
              </div>

              {products.length === 0 ? (
                <div className="p-8 text-center text-gray-400 font-sans text-xs uppercase tracking-wider">
                  No products have been listed by sellers yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  {(() => {
                    const totalProductsPages = Math.ceil(products.length / ITEMS_PER_PAGE);
                    const paginatedProducts = products.slice(
                      (productsPage - 1) * ITEMS_PER_PAGE,
                      productsPage * ITEMS_PER_PAGE
                    );
                    return (
                      <>
                        <table className="min-w-full divide-y divide-[#FAF5EC] font-sans text-xs">
                          <thead className="bg-[#FAF6F0]/50 uppercase tracking-widest text-[9px] font-bold text-stone-500">
                            <tr>
                              <th className="px-6 py-3 text-left">Silhouette details</th>
                              <th className="px-6 py-3 text-left">Designer / Shop</th>
                              <th className="px-6 py-3 text-left">Tier / Category</th>
                              <th className="px-6 py-3 text-center">Bestseller Status</th>
                              <th className="px-6 py-3 text-center">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#FAF5EC] bg-white text-stone-700">
                            {paginatedProducts.map((p) => {
                              let parsedImages = [];
                              try {
                                parsedImages = JSON.parse(p.images || "[]");
                              } catch (e) {
                                parsedImages = [p.images];
                              }
                              const firstImage = parsedImages[0] || "/placeholder.jpg";
                              const prices = p.variants.map((v: any) => v.price);
                              const priceDisplay = prices.length > 0 
                                ? `Rs. ${Math.min(...prices).toLocaleString("en-IN")}`
                                : "Price N/A";
                              return (
                                <tr key={p.id} className="hover:bg-[#FAF6F0]/10 transition-colors">
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                      <img
                                        src={firstImage}
                                        alt={p.title}
                                        className="h-12 w-9 object-cover rounded border border-[#E8DFC8] mr-3 bg-brand-cream-dark"
                                      />
                                      <div>
                                        <div className="font-semibold text-brand-charcoal">{p.title}</div>
                                        <div className="text-[10px] text-stone-400 mt-0.5">{priceDisplay}</div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-stone-600 font-medium">
                                    {p.seller.shopName}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap uppercase tracking-wider text-[10px]">
                                    <span className="font-bold text-brand-gold">{p.tier}</span> &bull; {p.category}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-center">
                                    {p.isBestseller ? (
                                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-brand-gold/15 text-brand-gold border border-brand-gold/20 shadow-xs">
                                        Bestseller
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-stone-100 text-stone-400 border border-stone-200">
                                        Standard
                                      </span>
                                    )}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-center">
                                    <button
                                      onClick={() => handleToggleBestseller(p.id)}
                                      disabled={actionLoading}
                                      className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer ${
                                        p.isBestseller
                                          ? "bg-stone-200 text-stone-700 hover:bg-stone-300"
                                          : "bg-brand-charcoal text-brand-cream hover:bg-brand-gold"
                                      }`}
                                    >
                                      {p.isBestseller ? "Remove bestseller" : "Mark bestseller"}
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>

                        {totalProductsPages > 1 && (
                          <div className="flex justify-center items-center space-x-2 border-t border-[#FAF5EC] py-4 bg-[#FAF6F0]/20">
                            <button
                              type="button"
                              onClick={() => setProductsPage((p) => Math.max(1, p - 1))}
                              disabled={productsPage <= 1}
                              className={`px-3 py-1.5 border border-[#E8DFC8] rounded-md text-[10px] font-sans font-bold uppercase tracking-widest transition-all ${
                                productsPage <= 1
                                  ? "opacity-45 cursor-not-allowed bg-[#FAF6F0] text-gray-400"
                                  : "bg-white text-brand-charcoal hover:border-brand-gold hover:text-brand-gold shadow-xs"
                              }`}
                            >
                              Prev
                            </button>
                            <span className="text-[10px] font-sans text-gray-500 font-bold uppercase tracking-widest px-3">
                              Page {productsPage} of {totalProductsPages}
                            </span>
                            <button
                              type="button"
                              onClick={() => setProductsPage((p) => Math.min(totalProductsPages, p + 1))}
                              disabled={productsPage >= totalProductsPages}
                              className={`px-3 py-1.5 border border-[#E8DFC8] rounded-md text-[10px] font-sans font-bold uppercase tracking-widest transition-all ${
                                productsPage >= totalProductsPages
                                  ? "opacity-45 cursor-not-allowed bg-[#FAF6F0] text-gray-400"
                                  : "bg-white text-brand-charcoal hover:border-brand-gold hover:text-brand-gold shadow-xs"
                              }`}
                            >
                              Next
                            </button>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 5: Orders Management */}
        {activeTab === "orders" && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <div className="border-b border-[#E8DFC8] pb-4">
              <h2 className="font-serif text-3xl font-semibold tracking-wide lowercase">
                boutique orders manager
              </h2>
              <p className="font-sans text-xs text-gray-500 uppercase tracking-widest mt-1">
                View customer orders and transition statuses from placed to fulfilled
              </p>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-md border border-[#E8DFC8] overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-[#E8DFC8] bg-[#FAF6F0] flex justify-between items-center">
                <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-brand-charcoal">
                  Boutique Orders List
                </h3>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={downloadCheckoutDetailsCSV}
                    className="text-[10px] font-sans font-bold uppercase tracking-widest bg-brand-charcoal text-brand-cream hover:bg-brand-gold px-3 py-1.5 rounded flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    Download Excel
                  </button>
                  <button
                    onClick={fetchOrders}
                    disabled={ordersLoading}
                    className="text-[10px] font-sans font-bold uppercase tracking-widest text-brand-gold hover:text-brand-gold-light flex items-center gap-1 disabled:opacity-50"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${ordersLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                </div>
              </div>

              {ordersLoading ? (
                <div className="p-12 text-center flex flex-col items-center justify-center space-y-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand-gold border-t-transparent" />
                  <p className="font-serif text-sm text-stone-600">Loading orders history...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="p-12 text-center">
                  <ShoppingBag className="h-10 w-10 text-[#E8DFC8] mx-auto mb-3" />
                  <p className="font-serif text-base text-stone-600">No boutique orders found.</p>
                  <p className="font-sans text-[11px] text-gray-400 mt-1 uppercase tracking-wide">
                    Customer orders placed on the store will appear here.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-sans">
                    <thead className="bg-[#FAF6F0] border-b border-[#E8DFC8] text-gray-500 uppercase tracking-wider text-[10px] font-bold">
                      <tr>
                        <th className="px-6 py-3">Order Info</th>
                        <th className="px-6 py-3">Customer Details</th>
                        <th className="px-6 py-3">Ordered Items</th>
                        <th className="px-6 py-3">Total Value</th>
                        <th className="px-6 py-3">Delivery Status</th>
                        <th className="px-6 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#FAF5EC] text-brand-charcoal bg-white">
                      {orders.map((ord) => {
                        let statusClass = "bg-stone-50 text-stone-700 border-stone-200";
                        if (ord.status === "PLACED") statusClass = "bg-orange-50 text-orange-800 border-orange-200";
                        else if (ord.status === "CONFIRMED") statusClass = "bg-blue-50 text-blue-800 border-blue-200";
                        else if (ord.status === "SHIPPED") statusClass = "bg-purple-50 text-purple-800 border-purple-200";
                        else if (ord.status === "DELIVERED") statusClass = "bg-emerald-50 text-emerald-800 border-emerald-200";
                        else if (ord.status === "CANCELLED") statusClass = "bg-red-50 text-red-800 border-red-200";

                        const isUpdating = updatingOrderId === ord.id;

                        return (
                          <tr key={ord.id} className="hover:bg-[#FAF6F0]/40 transition-colors align-top">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="font-serif text-sm font-semibold text-brand-gold">#{ord.orderNumber}</div>
                              <div className="text-[9px] text-gray-400 mt-1 uppercase">
                                {new Date(ord.createdAt).toLocaleDateString(undefined, {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </div>
                              <div className="text-[9px] text-gray-400 mt-0.5 font-bold">
                                {ord.paymentType} ({ord.paymentStatus})
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="font-semibold text-xs text-brand-charcoal">{ord.customerName}</div>
                              <div className="text-[10px] text-stone-500 mt-0.5">{ord.customerEmail}</div>
                              <div className="text-[10px] text-stone-500">{ord.customerPhone}</div>
                              <div className="text-[9px] text-gray-400 mt-1.5 uppercase max-w-[200px] whitespace-normal break-words">
                                {ord.shippingAddress}, {ord.city}, {ord.state} - {ord.pincode}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="space-y-3">
                                {ord.items.map((item: any) => {
                                  let parsedImages = [];
                                  try {
                                    parsedImages = JSON.parse(item.variant.product.images || "[]");
                                  } catch (e) {
                                    parsedImages = [item.variant.product.images];
                                  }
                                  const img = parsedImages[0] || "/placeholder.jpg";
                                  return (
                                    <div key={item.id} className="flex items-center space-x-2">
                                      <img src={img} alt="" className="h-8 w-6 object-cover rounded border border-[#E8DFC8]" />
                                      <div>
                                        <div className="font-medium text-[11px] leading-tight">{item.variant.product.title}</div>
                                        <div className="text-[9px] text-gray-400">
                                          Qty: {item.quantity} | Size: {item.variant.topSize}{item.variant.bottomSize ? `/${item.variant.bottomSize}` : ""}
                                        </div>
                                        <div className="text-[8px] text-brand-gold uppercase font-bold tracking-wider">
                                          Seller: {item.variant.product.seller?.shopName || "Unknown"}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="font-bold text-xs">Rs. {ord.totalAmount.toLocaleString("en-IN")}</div>
                              {ord.walletPaid > 0 && (
                                <div className="text-[9px] text-emerald-700 italic mt-0.5">
                                  Paid with Credits: Rs. {ord.walletPaid.toLocaleString("en-IN")}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <div className="space-y-1">
                                <span className={`inline-block px-2 py-0.5 border rounded-full text-[9px] font-bold uppercase tracking-wider ${statusClass}`}>
                                  {ord.status}
                                </span>
                                {ord.status === "SHIPPED" && ord.trackingNumber && (
                                  <div className="text-[9px] text-gray-400 leading-tight">
                                    {ord.trackingCompany} ({ord.trackingNumber})
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              {isUpdating ? (
                                <div className="space-y-2 max-w-[200px] ml-auto text-left bg-[#FAF6F0] p-2.5 rounded border border-[#E8DFC8]">
                                  <div>
                                    <label className="block text-[8px] font-sans text-gray-500 uppercase tracking-widest font-bold font-sans">Courier Company</label>
                                    <input
                                      type="text"
                                      placeholder="e.g. Delhivery"
                                      value={trackingCompany}
                                      onChange={(e) => setTrackingCompany(e.target.value)}
                                      className="mt-1 block w-full bg-white border border-[#E8DFC8] rounded py-1 px-1.5 text-[10px] font-sans text-brand-charcoal"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[8px] font-sans text-gray-500 uppercase tracking-widest font-bold font-sans">Tracking Code</label>
                                    <input
                                      type="text"
                                      placeholder="e.g. 123456789"
                                      value={trackingNumber}
                                      onChange={(e) => setTrackingNumber(e.target.value)}
                                      className="mt-1 block w-full bg-white border border-[#E8DFC8] rounded py-1 px-1.5 text-[10px] font-sans text-brand-charcoal"
                                    />
                                  </div>
                                  <div className="flex space-x-1.5 font-sans">
                                    <button
                                      onClick={() => handleUpdateStatusSubmit(ord.id, "SHIPPED")}
                                      className="flex-1 bg-brand-charcoal text-brand-cream text-[9px] font-bold py-1.5 px-2 rounded uppercase tracking-wider text-center"
                                    >
                                      Submit
                                    </button>
                                    <button
                                      onClick={() => setUpdatingOrderId(null)}
                                      className="bg-transparent border border-gray-400 text-stone-600 text-[9px] font-bold py-1.5 px-2 rounded uppercase tracking-wider text-center"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex flex-col space-y-1.5 items-end font-sans">
                                  {ord.status === "PLACED" && (
                                    <>
                                      <button
                                        onClick={() => handleStatusUpdate(ord.id, "CONFIRMED")}
                                        className="bg-brand-gold text-brand-cream text-[10px] font-bold px-3 py-1.5 rounded uppercase tracking-widest hover:bg-opacity-90 cursor-pointer"
                                      >
                                        Confirm Order
                                      </button>
                                      <button
                                        onClick={() => handleStatusUpdate(ord.id, "CANCELLED")}
                                        className="text-red-600 hover:text-red-800 text-[10px] font-bold uppercase tracking-widest cursor-pointer"
                                      >
                                        Cancel
                                      </button>
                                    </>
                                  )}
                                  {ord.status === "CONFIRMED" && (
                                    <button
                                      onClick={() => {
                                        setUpdatingOrderId(ord.id);
                                        setTrackingCompany("");
                                        setTrackingNumber("");
                                      }}
                                      className="bg-purple-600 text-white text-[10px] font-bold px-3 py-1.5 rounded uppercase tracking-widest hover:bg-purple-700 cursor-pointer"
                                    >
                                      Ship Order
                                    </button>
                                  )}
                                  {ord.status === "SHIPPED" && (
                                    <button
                                      onClick={() => handleStatusUpdate(ord.id, "DELIVERED")}
                                      className="bg-emerald-600 text-white text-[10px] font-bold px-3 py-1.5 rounded uppercase tracking-widest hover:bg-emerald-700 cursor-pointer"
                                    >
                                      Mark Delivered
                                    </button>
                                  )}
                                  {ord.status === "DELIVERED" && (
                                    <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-widest flex items-center">
                                      <Check className="h-3.5 w-3.5 mr-1" /> Fulfilled
                                    </span>
                                  )}
                                  {ord.status === "CANCELLED" && (
                                    <span className="text-[10px] text-red-600 font-bold uppercase tracking-widest">
                                      Cancelled
                                    </span>
                                  )}
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 5: Return Requests */}
        {activeTab === "returns" && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <div className="border-b border-[#E8DFC8] pb-4">
              <h2 className="font-serif text-3xl font-semibold tracking-wide lowercase">
                customer return requests
              </h2>
              <p className="font-sans text-xs text-gray-500 uppercase tracking-widest mt-1">
                Approve return requests to credit customer store credit wallets, or reject requests
              </p>
            </div>

            <div className="bg-white rounded-md border border-[#E8DFC8] overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-[#E8DFC8] bg-[#FAF6F0] flex justify-between items-center">
                <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-brand-charcoal">
                  Pending & Historical Returns
                </h3>
                <button
                  onClick={fetchReturns}
                  disabled={returnsLoading}
                  className="text-[10px] font-sans font-bold uppercase tracking-widest text-brand-gold hover:text-brand-gold-light flex items-center gap-1 disabled:opacity-50"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${returnsLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>

              {returnsLoading ? (
                <div className="p-12 text-center flex flex-col items-center justify-center space-y-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand-gold border-t-transparent" />
                  <p className="font-serif text-sm text-stone-600">Loading return logs...</p>
                </div>
              ) : returns.length === 0 ? (
                <div className="p-12 text-center">
                  <Undo2 className="h-10 w-10 text-[#E8DFC8] mx-auto mb-3" />
                  <p className="font-serif text-base text-stone-600">No return requests found.</p>
                  <p className="font-sans text-[11px] text-gray-400 mt-1 uppercase tracking-wide">
                    Return requests requested by buyers will appear here.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-sans">
                    <thead className="bg-[#FAF6F0] border-b border-[#E8DFC8] text-gray-500 uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="px-6 py-3">Order</th>
                        <th className="px-6 py-3">Customer</th>
                        <th className="px-6 py-3">Silhouette</th>
                        <th className="px-6 py-3 text-center">Qty</th>
                        <th className="px-6 py-3">Reason</th>
                        <th className="px-6 py-3 text-center">Status / Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#FAF5EC] text-brand-charcoal">
                      {returns.map((ret) => {
                        let statusLabel = ret.returnStatus;
                        let statusClass = "bg-stone-100 text-stone-700 border-stone-200";
                        
                        if (ret.returnStatus === "RETURN_REQUESTED") {
                          statusLabel = "Requested";
                          statusClass = "bg-amber-50 text-amber-800 border-amber-200";
                        } else if (ret.returnStatus === "RETURN_APPROVED") {
                          statusLabel = "Approved (Pending Pickup)";
                          statusClass = "bg-blue-50 text-blue-800 border-blue-200";
                        } else if (ret.returnStatus === "RETURNED") {
                          statusLabel = "Returned & Refunded";
                          statusClass = "bg-emerald-50 text-emerald-800 border-emerald-200";
                        } else if (ret.returnStatus === "RETURN_REJECTED") {
                          statusLabel = "Rejected";
                          statusClass = "bg-red-50 text-red-800 border-red-200";
                        }

                        return (
                          <tr key={ret.id} className="hover:bg-[#FAF6F0]/40 transition-colors">
                            <td className="px-6 py-4 font-medium">
                              <div className="font-serif text-sm text-brand-gold">#{ret.orderNumber}</div>
                              <div className="text-[9px] text-gray-400 mt-0.5">
                                {new Date(ret.orderDate).toLocaleDateString(undefined, {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </div>
                            </td>
                            <td className="px-6 py-4 font-medium">
                              <div className="text-brand-charcoal">{ret.customerName}</div>
                              <div className="text-[9px] text-stone-400 normal-case lowercase">{ret.customerEmail}</div>
                            </td>
                            <td className="px-6 py-4 font-medium flex items-center space-x-3">
                              {ret.productImage && (
                                <img
                                  src={ret.productImage}
                                  alt=""
                                  className="h-10 w-8 object-cover rounded border border-[#E8DFC8] bg-brand-cream-dark"
                                />
                              )}
                              <div>
                                <div className="font-serif text-sm">{ret.productTitle}</div>
                                <div className="text-[9px] text-stone-400 mt-0.5">
                                  Size: {ret.topSize}{ret.bottomSize ? `/${ret.bottomSize}` : ''}
                                  {ret.selectedOptions && ret.selectedOptions !== "{}" && (
                                    <span className="italic block max-w-[150px] truncate font-sans text-gray-500" title={renderSelectedOptions(ret.selectedOptions) || undefined}>
                                      {renderSelectedOptions(ret.selectedOptions)}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center font-semibold">
                              {ret.returnQuantity} <span className="text-gray-400 font-normal">of {ret.quantity}</span>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-[11px] text-stone-600 max-w-[200px] whitespace-normal break-words leading-relaxed">
                                {ret.returnReason || "No reason provided"}
                              </p>
                            </td>
                            <td className="px-6 py-4 text-center">
                              {ret.returnStatus === "RETURN_REQUESTED" ? (
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => handleProcessReturn(ret.orderId, ret.id, true)}
                                    disabled={actionLoading}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white p-1.5 rounded transition-all flex items-center gap-1 font-sans font-bold uppercase text-[9px] tracking-wider cursor-pointer"
                                    title="Approve Return Request"
                                  >
                                    <Check className="h-3 w-3" /> Approve Return
                                  </button>
                                  <button
                                    onClick={() => handleProcessReturn(ret.orderId, ret.id, false)}
                                    disabled={actionLoading}
                                    className="bg-red-600 hover:bg-red-700 text-white p-1.5 rounded transition-all flex items-center gap-1 font-sans font-bold uppercase text-[9px] tracking-wider cursor-pointer"
                                    title="Reject Return Request"
                                  >
                                    <X className="h-3 w-3" /> Reject
                                  </button>
                                </div>
                              ) : ret.returnStatus === "RETURN_APPROVED" ? (
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => handleProcessReturn(ret.orderId, ret.id, true, true)}
                                    disabled={actionLoading}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white p-1.5 rounded transition-all flex items-center gap-1 font-sans font-bold uppercase text-[9px] tracking-wider cursor-pointer"
                                    title="Confirm Item Received & Refund to Wallet"
                                  >
                                    <Check className="h-3 w-3" /> Confirm & Refund
                                  </button>
                                  <button
                                    onClick={() => handleProcessReturn(ret.orderId, ret.id, false)}
                                    disabled={actionLoading}
                                    className="bg-red-600 hover:bg-red-700 text-white p-1.5 rounded transition-all flex items-center gap-1 font-sans font-bold uppercase text-[9px] tracking-wider cursor-pointer"
                                    title="Reject Pickup/Inspection"
                                  >
                                    <X className="h-3 w-3" /> Reject
                                  </button>
                                </div>
                              ) : (
                                <span className={`px-2 py-0.5 border rounded-full text-[10px] font-bold tracking-wide uppercase ${statusClass}`}>
                                  {statusLabel}
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 7: Transactions Ledger */}
        {activeTab === "transactions" && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <div className="border-b border-[#E8DFC8] pb-4">
              <h2 className="font-serif text-3xl font-semibold tracking-wide lowercase">
                transaction ledger
              </h2>
              <p className="font-sans text-xs text-gray-500 uppercase tracking-widest mt-1">
                View online payments, wallet credit deductions, and cash transactions status
              </p>
            </div>

            {/* Transactions Table */}
            <div className="bg-white rounded-md border border-[#E8DFC8] overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-[#E8DFC8] bg-[#FAF6F0] flex justify-between items-center">
                <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-brand-charcoal">
                  Platform Transactions Log
                </h3>
                <button
                  onClick={fetchOrders}
                  disabled={ordersLoading}
                  className="text-[10px] font-sans font-bold uppercase tracking-widest text-brand-gold hover:text-brand-gold-light flex items-center gap-1 disabled:opacity-50"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${ordersLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>

              {ordersLoading ? (
                <div className="p-12 text-center flex flex-col items-center justify-center space-y-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand-gold border-t-transparent" />
                  <p className="font-serif text-sm text-stone-600">Loading transaction ledger...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="p-12 text-center">
                  <Landmark className="h-10 w-10 text-[#E8DFC8] mx-auto mb-3" />
                  <p className="font-serif text-base text-stone-600">No transactions recorded yet.</p>
                  <p className="font-sans text-[11px] text-gray-400 mt-1 uppercase tracking-wide">
                    Successful or pending checkouts will compile ledger details here.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  {(() => {
                    const totalTransactionsPages = Math.ceil(orders.length / ITEMS_PER_PAGE);
                    const paginatedTransactions = orders.slice(
                      (transactionsPage - 1) * ITEMS_PER_PAGE,
                      transactionsPage * ITEMS_PER_PAGE
                    );
                    return (
                      <>
                        <table className="w-full min-w-[950px] text-left text-xs font-sans">
                          <thead className="bg-[#FAF6F0] border-b border-[#E8DFC8] text-gray-500 uppercase tracking-wider text-[10px] font-bold">
                            <tr>
                              <th className="px-6 py-3">Date</th>
                              <th className="px-6 py-3">Reference Order</th>
                              <th className="px-6 py-3">Customer Info</th>
                              <th className="px-6 py-3">Payment Method</th>
                              <th className="px-6 py-3">Gateway Reference ID</th>
                              <th className="px-6 py-3">Amount</th>
                              <th className="px-6 py-3">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#FAF5EC] text-brand-charcoal bg-white">
                            {paginatedTransactions.map((ord) => {
                              let statusClass = "bg-stone-50 text-stone-700 border-stone-200";
                              if (ord.paymentStatus === "PAID") statusClass = "bg-emerald-50 text-emerald-800 border-emerald-200";
                              else if (ord.paymentStatus === "PENDING") statusClass = "bg-amber-50 text-amber-800 border-amber-200";
                              else if (ord.paymentStatus === "FAILED") statusClass = "bg-red-50 text-red-800 border-red-200";

                              const returnedItems = ord.items.filter((item: any) => item.returnStatus === "RETURNED");
                              const totalRefunded = returnedItems.reduce((sum: number, item: any) => sum + (item.returnQuantity * item.priceAtPurchase), 0);

                              return (
                                <tr key={ord.id} className="hover:bg-[#FAF6F0]/40 transition-colors">
                                  <td className="px-6 py-4 whitespace-nowrap text-stone-500">
                                    {new Date(ord.createdAt).toLocaleString(undefined, {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap font-serif text-sm font-semibold text-brand-gold">
                                    #{ord.orderNumber}
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="font-semibold text-xs">{ord.customerName}</div>
                                    <div className="text-[10px] text-stone-500 mt-0.5">{ord.customerPhone}</div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap uppercase font-semibold">
                                    {ord.paymentType === "COD" ? "Cash On Delivery" : "Online Prepaid"}
                                  </td>
                                  <td className="px-6 py-4 font-mono text-[11px] text-stone-500">
                                    {ord.paymentId ? ord.paymentId : (ord.paymentType === "COD" ? "N/A (COD Ledger)" : "Pending online flow")}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap font-bold text-xs">
                                    <div className="text-brand-charcoal">Rs. {ord.totalAmount.toLocaleString("en-IN")}</div>
                                    {ord.walletPaid > 0 && (
                                      <div className="text-[9px] text-emerald-700 font-sans mt-0.5">
                                        Credits: Rs. {ord.walletPaid.toLocaleString("en-IN")}
                                      </div>
                                    )}
                                    {totalRefunded > 0 && (
                                      <div className="text-[9px] text-red-600 font-sans mt-1 bg-red-50 px-1.5 py-0.5 rounded border border-red-100 inline-block font-bold">
                                        Refunded: Rs. {totalRefunded.toLocaleString("en-IN")} (Wallet)
                                      </div>
                                    )}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap space-y-1">
                                    <div>
                                      <span className={`inline-block px-2 py-0.5 border rounded-full text-[9px] font-bold uppercase tracking-wider ${statusClass}`}>
                                        {ord.paymentStatus}
                                      </span>
                                    </div>
                                    {totalRefunded > 0 && (
                                      <div>
                                        <span className="inline-block px-2 py-0.5 border border-red-200 bg-red-50 text-red-800 rounded-full text-[9px] font-bold uppercase tracking-wider">
                                          Refunded
                                        </span>
                                      </div>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>

                        {totalTransactionsPages > 1 && (
                          <div className="flex justify-between items-center space-x-2 border-t border-[#FAF5EC] p-4 bg-[#FAF6F0]/20 font-sans">
                            <button
                              onClick={() => setTransactionsPage((p) => Math.max(1, p - 1))}
                              disabled={transactionsPage <= 1}
                              className={`px-3 py-1.5 border border-[#E8DFC8] rounded-md text-[10px] font-bold uppercase tracking-widest transition-all ${
                                transactionsPage <= 1
                                  ? "opacity-45 cursor-not-allowed bg-[#FAF6F0] text-gray-400"
                                  : "bg-white text-brand-charcoal hover:border-brand-gold hover:text-brand-gold shadow-xs cursor-pointer"
                              }`}
                            >
                              Previous
                            </button>
                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                              Page {transactionsPage} of {totalTransactionsPages}
                            </span>
                            <button
                              onClick={() => setTransactionsPage((p) => Math.min(totalTransactionsPages, p + 1))}
                              disabled={transactionsPage >= totalTransactionsPages}
                              className={`px-3 py-1.5 border border-[#E8DFC8] rounded-md text-[10px] font-bold uppercase tracking-widest transition-all ${
                                transactionsPage >= totalTransactionsPages
                                  ? "opacity-45 cursor-not-allowed bg-[#FAF6F0] text-gray-400"
                                  : "bg-white text-brand-charcoal hover:border-brand-gold hover:text-brand-gold shadow-xs cursor-pointer"
                              }`}
                            >
                              Next
                            </button>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 8: Sales Analytics */}
        {activeTab === "sales" && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <div className="border-b border-[#E8DFC8] pb-4">
              <h2 className="font-serif text-3xl font-semibold tracking-wide lowercase">
                sales analytics & performance
              </h2>
              <p className="font-sans text-xs text-gray-500 uppercase tracking-widest mt-1">
                Detailed breakdown of items sold, revenue collected, and boutique partner earnings
              </p>
            </div>

            {/* Sales Stats Panel */}
            {(() => {
              const paidOrders = orders.filter((o) => o.paymentStatus === "PAID" || o.status === "DELIVERED" || o.status === "SHIPPED");
              const totalSalesVolume = paidOrders.reduce((sum, o) => sum + (o.totalAmount + o.walletPaid), 0);
              const totalCommission = paidOrders.reduce((sum, o) => sum + ((o.totalAmount + o.walletPaid) * 0.1), 0);
              
              const productSalesMap: Record<string, { productTitle: string; sellerName: string; quantity: number; revenue: number; price: number; image: string }> = {};
              const boutiqueSalesMap: Record<string, { shopName: string; itemsCount: number; totalRevenue: number; commission: number }> = {};

              paidOrders.forEach((ord) => {
                ord.items.forEach((item: any) => {
                  const product = item.variant?.product;
                  const shopName = product?.seller?.shopName || "Unknown Boutique";
                  const price = item.priceAtPurchase;
                  const qty = item.quantity;
                  const rev = price * qty;
                  
                  if (product) {
                    let parsedImages = [];
                    try {
                      parsedImages = JSON.parse(product.images || "[]");
                    } catch (e) {
                      parsedImages = [product.images];
                    }
                    const img = parsedImages[0] || "/placeholder.jpg";

                    if (productSalesMap[product.id]) {
                      productSalesMap[product.id].quantity += qty;
                      productSalesMap[product.id].revenue += rev;
                    } else {
                      productSalesMap[product.id] = {
                        productTitle: product.title,
                        sellerName: shopName,
                        quantity: qty,
                        revenue: rev,
                        price,
                        image: img
                      };
                    }
                  }

                  if (boutiqueSalesMap[shopName]) {
                    boutiqueSalesMap[shopName].itemsCount += qty;
                    boutiqueSalesMap[shopName].totalRevenue += rev;
                    boutiqueSalesMap[shopName].commission += rev * 0.10;
                  } else {
                    boutiqueSalesMap[shopName] = {
                      shopName,
                      itemsCount: qty,
                      totalRevenue: rev,
                      commission: rev * 0.10
                    };
                  }
                });
              });

              const sortedProducts = Object.values(productSalesMap).sort((a, b) => b.quantity - a.quantity);
              const sortedBoutiques = Object.values(boutiqueSalesMap).sort((a, b) => b.totalRevenue - a.totalRevenue);
              const uniqueBoutiquesCount = sortedBoutiques.length;
              const totalItemsShipped = sortedProducts.reduce((sum, p) => sum + p.quantity, 0);

              return (
                <>
                  {/* Summary Metric Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-5 rounded-md border border-[#E8DFC8] shadow-sm">
                      <p className="text-[10px] font-sans text-gray-400 uppercase tracking-widest">Gross Sales Revenue</p>
                      <p className="text-xl font-bold font-sans text-brand-charcoal mt-1">Rs. {totalSalesVolume.toLocaleString("en-IN")}</p>
                      <p className="text-[9px] text-emerald-700 mt-1 uppercase font-bold tracking-wider">paid checkouts</p>
                    </div>
                    <div className="bg-white p-5 rounded-md border border-[#E8DFC8] shadow-sm">
                      <p className="text-[10px] font-sans text-gray-400 uppercase tracking-widest">Total Shipped Items</p>
                      <p className="text-xl font-bold font-sans text-brand-charcoal mt-1">{totalItemsShipped} units</p>
                      <p className="text-[9px] text-stone-500 mt-1 uppercase font-bold tracking-wider">designs ordered</p>
                    </div>
                    <div className="bg-white p-5 rounded-md border border-[#E8DFC8] shadow-sm">
                      <p className="text-[10px] font-sans text-gray-400 uppercase tracking-widest">Selling Boutiques</p>
                      <p className="text-xl font-bold font-sans text-brand-charcoal mt-1">{uniqueBoutiquesCount} active</p>
                      <p className="text-[9px] text-stone-500 mt-1 uppercase font-bold tracking-wider">partner accounts</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Product Sales Leaderboard */}
                    <div className="bg-white rounded-md border border-[#E8DFC8] overflow-hidden shadow-sm">
                      <div className="px-6 py-4 border-b border-[#E8DFC8] bg-[#FAF6F0]">
                        <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-brand-charcoal">
                          Top Selling Products
                        </h3>
                      </div>
                      {sortedProducts.length === 0 ? (
                        <div className="p-8 text-center text-stone-500 font-serif text-xs">
                          No product sales recorded yet.
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs font-sans">
                            <thead className="bg-[#FAF6F0] border-b border-[#E8DFC8] text-gray-500 uppercase tracking-wider text-[10px] font-bold">
                              <tr>
                                <th className="px-6 py-3">Product</th>
                                <th className="px-6 py-3 text-center">Qty Sold</th>
                                <th className="px-6 py-3">Unit Price</th>
                                <th className="px-6 py-3 text-right">Revenue</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#FAF5EC] text-brand-charcoal bg-white">
                              {sortedProducts.slice(0, 5).map((p, index) => (
                                <tr key={index} className="hover:bg-[#FAF6F0]/40 transition-colors">
                                  <td className="px-6 py-4 flex items-center space-x-3">
                                    <img src={p.image} alt="" className="h-8 w-6 object-cover rounded border border-[#E8DFC8]" />
                                    <div>
                                      <div className="font-serif text-sm font-semibold">{p.productTitle}</div>
                                      <div className="text-[9px] text-gray-400 font-bold uppercase">{p.sellerName}</div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 text-center font-bold text-stone-600">{p.quantity}</td>
                                  <td className="px-6 py-4">Rs. {p.price.toLocaleString("en-IN")}</td>
                                  <td className="px-6 py-4 text-right font-bold">Rs. {p.revenue.toLocaleString("en-IN")}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                    {/* Boutique earnings ledger */}
                    <div className="bg-white rounded-md border border-[#E8DFC8] overflow-hidden shadow-sm">
                      <div className="px-6 py-4 border-b border-[#E8DFC8] bg-[#FAF6F0]">
                        <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-brand-charcoal">
                          Boutique Revenue Share
                        </h3>
                      </div>
                      {sortedBoutiques.length === 0 ? (
                        <div className="p-8 text-center text-stone-500 font-serif text-xs">
                          No boutique partner sales recorded yet.
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs font-sans">
                            <thead className="bg-[#FAF6F0] border-b border-[#E8DFC8] text-gray-500 uppercase tracking-wider text-[10px] font-bold">
                              <tr>
                                <th className="px-6 py-3">Boutique Name</th>
                                <th className="px-6 py-3 text-center">Units Sold</th>
                                <th className="px-6 py-3 text-right">Sales Volume</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#FAF5EC] text-brand-charcoal bg-white">
                              {sortedBoutiques.slice(0, 5).map((b, index) => (
                                <tr key={index} className="hover:bg-[#FAF6F0]/40 transition-colors">
                                  <td className="px-6 py-4 font-serif text-sm font-semibold text-brand-gold">{b.shopName}</td>
                                  <td className="px-6 py-4 text-center font-bold text-stone-600">{b.itemsCount}</td>
                                  <td className="px-6 py-4 text-right font-bold">Rs. {b.totalRevenue.toLocaleString("en-IN")}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {activeTab === "campaigns" && (
          <div className="space-y-6">
            <div className="border-b border-[#E8DFC8] pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-xl tracking-wider text-brand-charcoal lowercase">
                  whatsapp marketing campaigns
                </h2>
                <p className="font-sans text-xs text-gray-500 uppercase tracking-widest mt-1">
                  Configure promotional broadcasts, template variables, and monitor delivery analytics
                </p>
              </div>
              <button
                type="button"
                onClick={handleTriggerReminderCron}
                disabled={actionLoading}
                className="bg-brand-charcoal hover:bg-brand-gold text-brand-cream py-2.5 px-4 rounded text-xs font-sans uppercase font-bold tracking-widest transition-all cursor-pointer disabled:opacity-50"
              >
                Simulate Daily Cron (Reminder Job)
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left column: Campaign form & Mock Opt-out */}
              <div className="lg:col-span-5 space-y-6">
                {/* Campaign Creation Form */}
                <div className="bg-white p-6 rounded-md border border-[#E8DFC8] shadow-sm">
                  <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-brand-charcoal mb-4 border-b border-[#FAF5EC] pb-2">
                    Create Broadcast Campaign
                  </h3>

                  <form onSubmit={handleCreateCampaign} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-sans font-bold uppercase tracking-widest text-brand-charcoal">
                        Campaign Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 67 Sale Launch"
                        value={campaignName}
                        onChange={(e) => setCampaignName(e.target.value)}
                        className="mt-1 block w-full rounded-md border border-[#E8DFC8] py-2 px-3 text-xs bg-white text-brand-charcoal focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-sans font-bold uppercase tracking-widest text-brand-charcoal">
                        Campaign Banner Image
                      </label>
                      <div className="mt-1 flex flex-col gap-2">
                        {/* Upload button */}
                        <label className="flex items-center gap-2 cursor-pointer rounded-md border border-dashed border-[#C4A76C] bg-[#FAF6EE] py-3 px-4 hover:bg-[#F0E8D4] transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C4A76C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                          <span className="text-xs font-sans text-brand-charcoal">
                            {campaignBannerUrl ? "Change Image" : "Upload Banner Image"}
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const formData = new FormData();
                              formData.append("file", file);
                              try {
                                setCampaignBannerUrl("uploading...");
                                const res = await fetch("/api/admin/upload", {
                                  method: "POST",
                                  body: formData,
                                });
                                const data = await res.json();
                                if (data.url) {
                                  setCampaignBannerUrl(data.url);
                                } else {
                                  alert("Upload failed: " + (data.error || "Unknown error"));
                                  setCampaignBannerUrl("");
                                }
                              } catch (err) {
                                alert("Upload error. Please try again.");
                                setCampaignBannerUrl("");
                              }
                            }}
                          />
                        </label>
                        {/* Preview */}
                        {campaignBannerUrl && campaignBannerUrl !== "uploading..." && (
                          <div className="relative rounded-md overflow-hidden border border-[#E8DFC8]">
                            <img src={campaignBannerUrl} alt="Banner preview" className="w-full h-32 object-cover" />
                            <button
                              type="button"
                              onClick={() => setCampaignBannerUrl("")}
                              className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                            >×</button>
                          </div>
                        )}
                        {campaignBannerUrl === "uploading..." && (
                          <p className="text-[10px] text-[#C4A76C] font-sans animate-pulse">Uploading image to cloud...</p>
                        )}
                        {/* Fallback: paste URL manually */}
                        <input
                          type="url"
                          placeholder="Or paste image URL directly..."
                          value={campaignBannerUrl === "uploading..." ? "" : campaignBannerUrl}
                          onChange={(e) => setCampaignBannerUrl(e.target.value)}
                          className="block w-full rounded-md border border-[#E8DFC8] py-2 px-3 text-xs bg-white text-brand-charcoal focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-sans font-bold uppercase tracking-widest text-brand-charcoal">
                        Caption Text (Body Variable)
                      </label>
                      <textarea
                        placeholder="7% off on orders above 3000..."
                        rows={3}
                        value={campaignCaptionText}
                        onChange={(e) => setCampaignCaptionText(e.target.value)}
                        className="mt-1 block w-full rounded-md border border-[#E8DFC8] py-2 px-3 text-xs bg-white text-brand-charcoal focus:outline-none"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-sans font-bold uppercase tracking-widest text-brand-charcoal">
                          Coupon Code
                        </label>
                        <select
                          value={campaignCouponCode}
                          onChange={(e) => setCampaignCouponCode(e.target.value)}
                          className="mt-1 block w-full rounded-md border border-[#E8DFC8] py-2 px-3 text-xs bg-white text-brand-charcoal focus:outline-none cursor-pointer font-sans"
                          required
                        >
                          <option value="">Select a coupon...</option>
                          {coupons.map((c) => (
                            <option key={c.id} value={c.code}>
                              {c.code} ({c.discountPercent > 0 ? `${c.discountPercent}%` : `Rs. ${c.discountAmount}`} off)
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-sans font-bold uppercase tracking-widest text-brand-charcoal">
                          Target Segment
                        </label>
                         <select
                          value={campaignSegmentTag}
                          onChange={(e) => setCampaignSegmentTag(e.target.value)}
                          className="mt-1 block w-full rounded-md border border-[#E8DFC8] py-2 px-3 text-xs bg-white text-brand-charcoal focus:outline-none cursor-pointer"
                        >
                          <option value="ABANDONED_CART">Abandoned Carts (Users with items in cart)</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={actionLoading}
                      className="w-full flex justify-center items-center bg-brand-charcoal hover:bg-brand-gold text-brand-cream py-3 px-4 rounded text-xs font-sans uppercase font-bold tracking-widest transition-all cursor-pointer disabled:opacity-50"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Save & Approve Campaign
                    </button>
                  </form>
                </div>

                {/* Simulate Opt-out Webhook */}
                <div className="bg-white p-6 rounded-md border border-[#E8DFC8] shadow-sm">
                  <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-brand-charcoal mb-4 border-b border-[#FAF5EC] pb-2">
                    Simulate User STOP (Opt-Out Webhook)
                  </h3>
                  <form onSubmit={handleSimulateOptOut} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-sans font-bold uppercase tracking-widest text-brand-charcoal">
                        Opt-out Phone (+91...)
                      </label>
                      <input
                        type="text"
                        placeholder="+919876543210"
                        value={optOutPhone}
                        onChange={(e) => setOptOutPhone(e.target.value)}
                        className="mt-1 block w-full rounded-md border border-[#E8DFC8] py-2 px-3 text-xs bg-white text-brand-charcoal focus:outline-none"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={actionLoading}
                      className="w-full flex justify-center items-center bg-red-800 hover:bg-red-950 text-white py-3 px-4 rounded text-xs font-sans uppercase font-bold tracking-widest transition-all cursor-pointer"
                    >
                      Simulate STOP webhook
                    </button>
                  </form>
                </div>
              </div>

              {/* Right column: Campaigns List */}
              <div className="lg:col-span-7 bg-white rounded-md border border-[#E8DFC8] overflow-hidden shadow-sm self-start">
                <div className="px-6 py-4 border-b border-[#E8DFC8] bg-[#FAF6F0]">
                  <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-brand-charcoal">
                    active templates & broadcasts
                  </h3>
                </div>

                {campaignsLoading ? (
                  <div className="p-12 text-center text-xs font-sans text-stone-500 uppercase tracking-widest">
                    <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-brand-gold" />
                    loading campaign reports...
                  </div>
                ) : campaignsList.length === 0 ? (
                  <div className="p-12 text-center text-stone-500 font-sans text-xs uppercase tracking-wider">
                    No marketing campaigns created yet.
                  </div>
                ) : (
                  <div className="divide-y divide-[#FAF5EC]">
                    {(() => {
                      const totalCampPages = Math.ceil(campaignsList.length / ITEMS_PER_PAGE);
                      const paginatedCamps = campaignsList.slice(
                        (campaignsPage - 1) * ITEMS_PER_PAGE,
                        campaignsPage * ITEMS_PER_PAGE
                      );
                      return (
                        <>
                          {paginatedCamps.map((camp) => (
                            <div key={camp.id} className="p-5 flex flex-col md:flex-row md:items-start justify-between gap-4 hover:bg-[#FAF6F0]/20 transition-colors">
                              <div className="flex gap-4 items-start">
                                <img src={camp.bannerUrl} alt="" className="h-16 w-16 object-cover rounded border border-[#E8DFC8]" />
                                <div className="space-y-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="font-serif text-sm font-semibold text-brand-charcoal">{camp.name}</span>
                                    <span className="bg-stone-100 text-brand-charcoal font-sans text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border border-[#E8DFC8]">
                                      {camp.couponCode}
                                    </span>
                                    <span className="bg-stone-900 text-[#FAF6F0] font-sans text-[8px] font-bold uppercase px-1.5 py-0.5 rounded">
                                      {camp.segmentTag}
                                    </span>
                                    {camp.status === "PENDING" && (
                                      <span className="bg-amber-50 text-amber-700 font-sans text-[8px] font-bold uppercase px-1.5 py-0.5 rounded border border-amber-200">
                                        Pending Review
                                      </span>
                                    )}
                                    {camp.status === "APPROVED" && (
                                      <span className="bg-emerald-50 text-emerald-700 font-sans text-[8px] font-bold uppercase px-1.5 py-0.5 rounded border border-emerald-200">
                                        Approved: {camp.templateName}
                                      </span>
                                    )}
                                    {camp.status === "REJECTED" && (
                                      <span className="bg-red-50 text-red-700 font-sans text-[8px] font-bold uppercase px-1.5 py-0.5 rounded border border-red-200">
                                        Rejected by Meta
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[10px] text-stone-600 font-sans italic">"{camp.captionText}"</p>
                                  {camp.status === "REJECTED" && camp.rejectReason && (
                                    <p className="text-[9px] text-red-600 font-sans font-bold leading-tight">
                                      Rejection Reason: {camp.rejectReason}
                                    </p>
                                  )}

                                  {/* Meta Template Review Simulator Panel */}
                                  {camp.status !== "APPROVED" && (
                                    <div className="flex items-center space-x-2 pt-1">
                                      <span className="text-[8px] font-sans font-bold uppercase text-stone-400">Meta Simulator:</span>
                                      <button
                                        type="button"
                                        onClick={() => handleSimulateMetaReview(camp.id, "APPROVE")}
                                        disabled={actionLoading}
                                        className="text-[8px] font-sans font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                                      >
                                        Approve Template
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleSimulateMetaReview(camp.id, "REJECT")}
                                        disabled={actionLoading}
                                        className="text-[8px] font-sans font-bold uppercase px-1.5 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-colors"
                                      >
                                        Reject Template
                                      </button>
                                    </div>
                                  )}
                                  
                                  {/* Delivery stats metrics */}
                                  <div className="pt-2 flex flex-wrap gap-x-4 gap-y-1">
                                    <span className="text-[9px] font-sans text-stone-400 font-bold uppercase tracking-wider">
                                      Dispatched: <strong className="text-stone-700">{camp.stats.sent}</strong>
                                    </span>
                                    <span className="text-[9px] font-sans text-stone-400 font-bold uppercase tracking-wider">
                                      Delivered: <strong className="text-emerald-700">{camp.stats.delivered}</strong>
                                    </span>
                                    <span className="text-[9px] font-sans text-stone-400 font-bold uppercase tracking-wider">
                                      Read (Open): <strong className="text-blue-700">{camp.stats.read}</strong>
                                    </span>
                                    <span className="text-[9px] font-sans text-stone-400 font-bold uppercase tracking-wider">
                                      CTR: <strong className="text-brand-gold">{camp.stats.ctr}%</strong>
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleSendCampaign(camp.id)}
                                disabled={actionLoading || camp.status !== "APPROVED"}
                                className={`self-center md:self-start font-sans text-[10px] font-bold uppercase tracking-widest py-2 px-3.5 rounded transition-all cursor-pointer disabled:opacity-50 ${
                                  camp.status === "APPROVED"
                                    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                                    : "bg-stone-100 text-stone-400 border border-stone-200 cursor-not-allowed"
                                }`}
                                title={camp.status !== "APPROVED" ? "Templates must be approved by Meta before broadcasting" : undefined}
                              >
                                Send Broadcast
                              </button>
                            </div>
                          ))}

                          {totalCampPages > 1 && (
                            <div className="flex justify-center items-center space-x-2 border-t border-[#FAF5EC] py-4 bg-[#FAF6F0]/20">
                              <button
                                type="button"
                                onClick={() => setCampaignsPage((p) => Math.max(1, p - 1))}
                                disabled={campaignsPage <= 1}
                                className="px-2.5 py-1 text-[10px] font-sans font-bold uppercase tracking-widest text-[#B5A47C] bg-white border border-[#E8DFC8] rounded disabled:opacity-30 cursor-pointer"
                              >
                                Prev
                              </button>
                              <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-stone-500">
                                Page {campaignsPage} of {totalCampPages}
                              </span>
                              <button
                                type="button"
                                onClick={() => setCampaignsPage((p) => Math.min(totalCampPages, p + 1))}
                                disabled={campaignsPage >= totalCampPages}
                                className="px-2.5 py-1 text-[10px] font-sans font-bold uppercase tracking-widest text-[#B5A47C] bg-white border border-[#E8DFC8] rounded disabled:opacity-30 cursor-pointer"
                              >
                                Next
                              </button>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>

            {/* Coupon Sent & Delivery Ledger (Non-Converters Tracking) */}
            <div className="bg-white rounded-md border border-[#E8DFC8] overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-[#E8DFC8] bg-[#FAF6F0]">
                <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-brand-charcoal">
                  Coupon Sent & Delivery Ledger (Non-Converters Tracking)
                </h3>
              </div>
              {couponDispatches.length === 0 ? (
                <div className="p-8 text-center text-stone-500 font-serif text-xs">
                  No coupon dispatch logs found. Send a campaign to track user logs.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-sans">
                    <thead className="bg-[#FAF6F0] border-b border-[#E8DFC8] text-gray-500 uppercase tracking-wider text-[10px] font-bold">
                      <tr>
                        <th className="px-6 py-3">User Mobile</th>
                        <th className="px-6 py-3">Coupon Code</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3 text-center">Reminders Sent</th>
                        <th className="px-6 py-3 text-center">Marketing Opt-In</th>
                        <th className="px-6 py-3 text-right">Dispatched At</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#FAF5EC] text-brand-charcoal bg-white">
                      {couponDispatches.slice(0, 10).map((disp, index) => (
                        <tr key={index} className="hover:bg-[#FAF6F0]/40 transition-colors">
                          <td className="px-6 py-4 font-bold text-stone-600">{disp.user.phone || "No Phone"}</td>
                          <td className="px-6 py-4">
                            <span className="bg-stone-100 px-1.5 py-0.5 rounded border border-[#E8DFC8] font-bold text-brand-charcoal">
                              {disp.coupon.code}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {disp.used ? (
                              <span className="bg-emerald-50 text-emerald-700 font-bold uppercase text-[9px] tracking-wider px-2 py-0.5 rounded border border-emerald-200">
                                Converted (Used)
                              </span>
                            ) : (
                              <span className="bg-amber-50 text-amber-700 font-bold uppercase text-[9px] tracking-wider px-2 py-0.5 rounded border border-amber-200">
                                Pending
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-center font-bold">{disp.reminderCount} / 2</td>
                          <td className="px-6 py-4 text-center">
                            {disp.user.optInWhatsApp ? (
                              <span className="text-emerald-700 font-bold uppercase text-[9px]">Yes</span>
                            ) : (
                              <span className="text-red-700 font-bold uppercase text-[9px]">Opted-Out</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right text-gray-400">
                            {new Date(disp.sentAt).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab: Users Management */}
        {activeTab === "users" && (() => {
          const filteredUsers = users.filter((u) => {
            const latestOrder = u.orders?.[0];
            const nameStr = (latestOrder?.customerName || u.name || "").toLowerCase();
            const emailStr = (latestOrder?.customerEmail || u.email || "").toLowerCase();
            const phoneStr = (latestOrder?.customerPhone || u.phone || "").toLowerCase();
            const q = userSearchQuery.toLowerCase();
            return nameStr.includes(q) || emailStr.includes(q) || phoneStr.includes(q);
          });

          return (
            <div className="space-y-8 animate-in fade-in duration-200">
              <div className="border-b border-[#E8DFC8] pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="font-serif text-3xl font-semibold tracking-wide lowercase">
                    registered users list
                  </h2>
                  <p className="font-sans text-xs text-gray-500 uppercase tracking-widest mt-1">
                    View profiles, wallet credit balances, account roles, and marketing permissions
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={downloadCheckoutDetailsCSV}
                    className="text-[10px] font-sans font-bold uppercase tracking-widest bg-brand-charcoal text-brand-cream hover:bg-brand-gold px-4 py-2.5 rounded flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                  >
                    Download Checkout Excel
                  </button>
                  <button
                    onClick={fetchUsers}
                    disabled={usersLoading}
                    className="text-[10px] font-sans font-bold uppercase tracking-widest text-[#B5A47C] bg-white border border-[#E8DFC8] px-4 py-2 rounded flex items-center gap-1.5 transition-all hover:bg-[#FAF6F0]/35 disabled:opacity-50 cursor-pointer shadow-xs"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${usersLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                </div>
              </div>

              {/* Metrics cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-white p-5 rounded-md border border-[#E8DFC8] shadow-sm flex items-center space-x-4">
                  <div className="p-3 bg-[#FAF6F0] rounded border border-[#E8DFC8] text-brand-gold">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-sans text-stone-400 uppercase tracking-widest font-bold">Total Customers</p>
                    <p className="text-lg font-bold font-sans text-brand-charcoal mt-0.5">{users.length}</p>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-md border border-[#E8DFC8] shadow-sm flex items-center space-x-4">
                  <div className="p-3 bg-[#FAF6F0] rounded border border-[#E8DFC8] text-emerald-700">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-sans text-stone-400 uppercase tracking-widest font-bold">WhatsApp Opt-in</p>
                    <p className="text-lg font-bold font-sans text-brand-charcoal mt-0.5">
                      {users.length > 0 
                        ? `${Math.round((users.filter(u => u.optInWhatsApp).length / users.length) * 100)}%` 
                        : "0%"}
                    </p>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-md border border-[#E8DFC8] shadow-sm flex items-center space-x-4">
                  <div className="p-3 bg-[#FAF6F0] rounded border border-[#E8DFC8] text-brand-charcoal">
                    <Wallet className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-sans text-stone-400 uppercase tracking-widest font-bold">Total Wallet Balances</p>
                    <p className="text-lg font-bold font-sans text-brand-charcoal mt-0.5">
                      Rs. {users.reduce((acc, u) => acc + u.walletBalance, 0).toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-[#FAF6F0]/20 p-4 rounded-md border border-[#E8DFC8] shadow-sm">
                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
                  <input
                    type="text"
                    placeholder="Search by name, email, phone..."
                    value={userSearchQuery}
                    onChange={(e) => {
                      setUserSearchQuery(e.target.value);
                      setUsersPage(1);
                    }}
                    className="pl-9 pr-4 py-2 w-full rounded-md border border-[#E8DFC8] text-xs font-sans placeholder:text-stone-400 focus:outline-none focus:border-brand-gold bg-white transition-all shadow-xs"
                  />
                </div>
                <div className="text-[10px] text-stone-400 font-sans uppercase tracking-widest font-bold">
                  Showing {filteredUsers.length} of {users.length} Customer Accounts
                </div>
              </div>

              {/* Users Table */}
              <div className="bg-white rounded-md border border-[#E8DFC8] overflow-hidden shadow-sm">
                {usersLoading ? (
                  <div className="p-24 text-center flex flex-col items-center justify-center space-y-2">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand-gold border-t-transparent" />
                    <p className="font-serif text-sm text-stone-600">Loading user accounts...</p>
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="p-20 text-center">
                    <Users className="h-10 w-10 text-[#E8DFC8] mx-auto mb-3" />
                    <p className="font-serif text-base text-stone-600">No customers found.</p>
                    <p className="font-sans text-[11px] text-stone-400 mt-1 uppercase tracking-wide">
                      Try adjusting your search filters or check back later.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    {(() => {
                      const totalUsersPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
                      const paginatedUsers = filteredUsers.slice(
                        (usersPage - 1) * ITEMS_PER_PAGE,
                        usersPage * ITEMS_PER_PAGE
                      );
                      return (
                        <>
                          <table className="w-full text-left text-xs font-sans">
                            <thead className="bg-[#FAF6F0] border-b border-[#E8DFC8] text-gray-500 uppercase tracking-wider text-[10px] font-bold">
                              <tr>
                                <th className="px-6 py-4">Joined Date</th>
                                <th className="px-6 py-4">Customer Details</th>
                                <th className="px-6 py-4">Shipping Address (Checkout)</th>
                                <th className="px-6 py-4">Wallet Balance</th>
                                <th className="px-6 py-4 text-right">WhatsApp Opt-in</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#FAF5EC] text-brand-charcoal bg-white">
                              {paginatedUsers.map((u) => {
                                const latestOrder = u.orders?.[0];
                                const displayName = latestOrder?.customerName || u.name || "Unnamed";
                                const displayEmail = latestOrder?.customerEmail || u.email;
                                const displayPhone = latestOrder?.customerPhone || u.phone || "N/A";

                                let roleBadgeClass = "bg-stone-100 text-stone-700 border-stone-200";
                                if (u.role === "ADMIN") roleBadgeClass = "bg-red-50 text-red-800 border-red-200";
                                else if (u.role === "SELLER") roleBadgeClass = "bg-amber-50 text-amber-800 border-amber-200";

                                return (
                                  <tr key={u.id} className="hover:bg-[#FAF6F0]/20 transition-colors align-top">
                                    <td className="px-6 py-4 whitespace-nowrap text-stone-500 align-top pt-5">
                                      <div className="flex items-center gap-1.5">
                                        <Calendar className="h-3.5 w-3.5 text-[#A59578] flex-shrink-0" />
                                        <span>
                                          {new Date(u.createdAt).toLocaleDateString(undefined, {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                          })}
                                        </span>
                                      </div>
                                    </td>
                                    <td className="px-6 py-4">
                                      <div className="flex items-start space-x-3">
                                        <div className="h-9 w-9 rounded-full bg-[#FAF6F0] border border-[#E8DFC8] flex items-center justify-center flex-shrink-0 text-brand-gold font-serif font-bold text-xs uppercase shadow-2xs">
                                          {displayName.split(" ").map((w: string) => w[0]).join("").slice(0, 2) || "U"}
                                        </div>
                                        <div className="space-y-1">
                                          <div className="font-serif text-sm font-bold text-brand-charcoal leading-none flex items-center gap-1.5">
                                            {displayName}
                                            <span className={`inline-block px-1 py-0.5 border rounded text-[7.5px] font-sans font-bold uppercase tracking-wider ${roleBadgeClass}`}>
                                              {u.role}
                                            </span>
                                          </div>
                                          <div className="text-[10px] text-stone-500 flex items-center gap-1 pt-0.5">
                                            <Mail className="h-3 w-3 text-[#A59578] flex-shrink-0" />
                                            <span>{displayEmail}</span>
                                          </div>
                                          <div className="text-[10px] text-stone-500 flex items-center gap-1">
                                            <Phone className="h-3 w-3 text-[#A59578] flex-shrink-0" />
                                            <span>{displayPhone}</span>
                                          </div>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 max-w-[280px]">
                                      {latestOrder ? (
                                        <div className="bg-[#FAF6F0]/40 p-2.5 rounded border border-[#FAF5EC] text-[11px] text-stone-600 font-sans tracking-wide leading-relaxed flex items-start gap-1.5">
                                          <MapPin className="h-3.5 w-3.5 text-brand-gold mt-0.5 flex-shrink-0" />
                                          <span>
                                            {latestOrder.shippingAddress}, {latestOrder.city}, {latestOrder.state} - <strong className="text-brand-charcoal">{latestOrder.pincode}</strong>
                                          </span>
                                        </div>
                                      ) : (
                                        <div className="inline-flex items-center gap-1.5 text-stone-400 italic text-[10px] bg-stone-50 border border-stone-100 py-1.5 px-2.5 rounded">
                                          <MapPin className="h-3.5 w-3.5 text-stone-300 flex-shrink-0" />
                                          <span>No checkout address filled yet</span>
                                        </div>
                                      )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap align-top pt-5">
                                      <div className="flex items-center gap-1.5 font-bold text-xs text-brand-charcoal">
                                        <Wallet className="h-3.5 w-3.5 text-[#A59578] flex-shrink-0" />
                                        <span>Rs. {u.walletBalance.toLocaleString("en-IN")}</span>
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right align-top pt-5">
                                      {u.optInWhatsApp ? (
                                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 font-sans text-[8px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border border-emerald-100">
                                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
                                          Opted In
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center gap-1 bg-stone-50 text-stone-400 font-sans text-[8px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border border-stone-200">
                                          <span className="h-1.5 w-1.5 rounded-full bg-stone-300" />
                                          Opted Out
                                        </span>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>

                          {totalUsersPages > 1 && (
                            <div className="flex justify-center items-center space-x-2 border-t border-[#FAF5EC] py-4 bg-[#FAF6F0]/20">
                              <button
                                type="button"
                                onClick={() => setUsersPage((p) => Math.max(1, p - 1))}
                                disabled={usersPage <= 1}
                                className={`px-3 py-1.5 border border-[#E8DFC8] rounded-md text-[10px] font-sans font-bold uppercase tracking-widest transition-all ${
                                  usersPage <= 1
                                    ? "opacity-45 cursor-not-allowed bg-[#FAF6F0] text-gray-400"
                                    : "bg-white text-brand-charcoal hover:border-brand-gold hover:text-brand-gold shadow-xs"
                                }`}
                              >
                                Prev
                              </button>
                              <span className="text-[10px] font-sans text-gray-500 font-bold uppercase tracking-widest px-3">
                                Page {usersPage} of {totalUsersPages}
                              </span>
                              <button
                                type="button"
                                onClick={() => setUsersPage((p) => Math.min(totalUsersPages, p + 1))}
                                disabled={usersPage >= totalUsersPages}
                                className={`px-3 py-1.5 border border-[#E8DFC8] rounded-md text-[10px] font-sans font-bold uppercase tracking-widest transition-all ${
                                  usersPage >= totalUsersPages
                                    ? "opacity-45 cursor-not-allowed bg-[#FAF6F0] text-gray-400"
                                    : "bg-white text-brand-charcoal hover:border-brand-gold hover:text-brand-gold shadow-xs"
                                }`}
                              >
                                Next
                              </button>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>
          );
        })()}
      </main>
    </div>
  );
}
